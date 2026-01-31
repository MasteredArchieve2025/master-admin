import React, { useEffect, useState } from "react";

const API_BASE_URL = "https://master-backend-18ik.onrender.com/api";
const UPLOAD_API = "https://master-backend-18ik.onrender.com/api/upload";

const AdvertisementCRMPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const [form, setForm] = useState({
    page_name: "",
    images: [],
    youtube_urls: [],
  });

  const [youtubeInput, setYoutubeInput] = useState("");

  // ================= FETCH =================
  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/advertisements/all`);
      const data = await res.json();
      setAds(data.data || []);
    } catch {
      alert("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // ================= IMAGE UPLOAD =================
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(UPLOAD_API, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      const url =
        data?.files?.[0]?.url || 
        data?.files?.[0] || 
        data?.url || 
        data?.fileUrl;

      if (!url) throw new Error("Upload failed");

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ================= YOUTUBE =================
  const addYoutube = () => {
    let url = youtubeInput.trim();
    if (!url) return;

    if (url.includes("watch?v=")) {
      url = `https://www.youtube.com/embed/${url.split("v=")[1].split("&")[0]}`;
    } else if (url.includes("youtu.be/")) {
      url = `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
    }

    if (!url.includes("embed")) {
      alert("Invalid YouTube URL");
      return;
    }

    setForm((prev) => ({
      ...prev,
      youtube_urls: [...prev.youtube_urls, url],
    }));
    setYoutubeInput("");
  };

  const removeImage = (i) =>
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, idx) => idx !== i),
    }));

  const removeVideo = (i) =>
    setForm((p) => ({
      ...p,
      youtube_urls: p.youtube_urls.filter((_, idx) => idx !== i),
    }));

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.page_name) {
      alert("Page name required");
      return;
    }

    if (form.images.length === 0 && form.youtube_urls.length === 0) {
      alert("Add at least one image or video");
      return;
    }

    try {
      setLoading(true);
      await fetch(`${API_BASE_URL}/advertisements`, {
        method: editingAd ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      resetForm();
      fetchAds();
    } catch {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ page_name: "", images: [], youtube_urls: [] });
    setEditingAd(null);
    setShowForm(false);
  };

  // ================= ACTIONS =================
  const editAd = (ad) => {
    setEditingAd(ad);
    setForm({
      page_name: ad.page_name,
      images: ad.images || [],
      youtube_urls: ad.youtube_urls || []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAd = async (page) => {
    if (!window.confirm("Delete this advertisement?")) return;
    await fetch(`${API_BASE_URL}/advertisements/${page}`, {
      method: "DELETE",
    });
    fetchAds();
  };

  const copyApi = (page) => {
    navigator.clipboard.writeText(
      `${API_BASE_URL}/advertisements?page=${page}`
    );
    alert("API copied");
  };

  // ================= UI =================
  return (
    <div className="container-fluid py-4">
      <div className="card shadow border-0">
        {/* HEADER */}
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Advertisement Management</h4>
            <small className="text-muted">
              Banner & YouTube Advertisement Control
            </small>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close" : "Create Advertisement"}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="card-body border-bottom bg-light">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Page Name *</label>
                <input
                  className="form-control"
                  value={form.page_name}
                  onChange={(e) =>
                    setForm({ ...form, page_name: e.target.value })
                  }
                  placeholder="e.g., home, colleges"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Upload Banner</label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control"
                    onChange={uploadImage}
                    disabled={uploading}
                    accept="image/*"
                  />
                  {uploading && (
                    <span className="input-group-text">
                      <div className="spinner-border spinner-border-sm"></div>
                    </span>
                  )}
                </div>
                {uploading && <small className="text-muted">Uploading...</small>}
              </div>

              <div className="col-md-4">
                <label className="form-label">YouTube URL</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="Enter YouTube URL"
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={addYoutube}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* IMAGES PREVIEW */}
              {form.images.length > 0 && (
                <div className="col-12">
                  <label className="form-label">Uploaded Images ({form.images.length})</label>
                  <div className="d-flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="position-relative">
                        <img
                          src={img}
                          alt={`Banner ${i + 1}`}
                          width="120"
                          height="80"
                          className="rounded border"
                          style={{ objectFit: "cover", cursor: "pointer" }}
                          onClick={() => window.open(img, '_blank')}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                          style={{ width: "24px", height: "24px", fontSize: "12px", padding: "0" }}
                          onClick={() => removeImage(i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YOUTUBE URLS PREVIEW */}
              {form.youtube_urls.length > 0 && (
                <div className="col-12">
                  <label className="form-label">YouTube Videos ({form.youtube_urls.length})</label>
                  <div className="list-group">
                    {form.youtube_urls.map((url, i) => (
                      <div key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <i className="fab fa-youtube text-danger me-2"></i>
                          <small>{url}</small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => window.open(url, '_blank')}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeVideo(i)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-12 d-flex gap-2">
                <button 
                  className="btn btn-success px-4"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingAd ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE */}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">All Advertisements</h5>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchAds}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-5 border rounded">
              <i className="fas fa-ad fa-3x text-muted mb-3"></i>
              <h5>No Advertisements Found</h5>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                Create First Advertisement
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Page</th>
                    <th>Images</th>
                    <th>Videos</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id}>
                      <td>
                        <span className="badge bg-secondary">#{ad.id}</span>
                      </td>
                      <td className="fw-semibold">
                        {ad.page_name}
                        <div>
                          <small className="text-muted">
                            <code>/api/advertisements?page={ad.page_name}</code>
                          </small>
                        </div>
                      </td>
                      <td>
                        {ad.images && ad.images.length > 0 ? (
                          <div className="d-flex align-items-center">
                            <div className="d-flex flex-wrap gap-1">
                              {ad.images.slice(0, 2).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt=""
                                  width="40"
                                  height="30"
                                  className="rounded border"
                                  style={{ objectFit: "cover" }}
                                />
                              ))}
                            </div>
                            {ad.images.length > 2 && (
                              <span className="badge bg-info ms-2">
                                +{ad.images.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="badge bg-light text-dark">No images</span>
                        )}
                      </td>
                      <td>
                        {ad.youtube_urls && ad.youtube_urls.length > 0 ? (
                          <span className="badge bg-danger">
                            {ad.youtube_urls.length} video{ad.youtube_urls.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="badge bg-light text-dark">No videos</span>
                        )}
                      </td>
                      <td>
                        <small>
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => editAd(ad)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => deleteAd(ad.page_name)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => copyApi(ad.page_name)}
                        >
                          Copy API
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="card-footer text-center bg-light">
          <small className="text-muted">
            {/* <i className="fas fa-link me-1"></i>
            API Base: {API_BASE_URL} | 
            <i className="fas fa-upload ms-3 me-1"></i>
            Upload API: {UPLOAD_API} |  */}
            <i className="fas fa-clock ms-3 me-1"></i>
            Total: {ads.length} ads
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementCRMPage;