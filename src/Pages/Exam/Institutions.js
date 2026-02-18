import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { INSTITUTION_API, UPLOAD_API } from "../../api/api";

const Institutions = () => {
  const { typeId } = useParams();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    institutionName: "",
    institutionImage: "",
    category: "",
    shortDescription: "",
    rating: "",
    result: "",
    location: "",
    subjectsOffered: "",
    teachingMode: "",
    about: "",
    mapLink: "",
    mobileNumber: "",
    whatsappNumber: "",
    gallery: []
  });

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(`${INSTITUTION_API}/type/${typeId}`);
      setList(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load institutions");
    }
  }, [typeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", res.data);

      const url =
        res.data?.url ||
        res.data?.imageUrl ||
        res.data?.data?.url ||
        res.data?.files?.[0]?.url ||
        res.data?.fileUrl;

      if (!url) {
        console.error("No URL in response:", res.data);
        throw new Error("No image URL in response");
      }

      if (field === "gallery") {
        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
        alert("Gallery image uploaded!");
      } else {
        setForm((prev) => ({ ...prev, [field]: url }));
        alert("Main image uploaded!");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error details:", err.response?.data);
      alert("Image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.institutionName.trim() || !form.location.trim()) {
      return alert("Name and location required");
    }

    try {
      const payload = {
        typeId: Number(typeId),
        institutionName: form.institutionName,
        institutionImage: form.institutionImage,
        category: form.category.split(",").map(c => c.trim()).filter(c => c),
        shortDescription: form.shortDescription,
        rating: parseFloat(form.rating) || 0,
        result: form.result,
        location: form.location,
        subjectsOffered: form.subjectsOffered.split(",").map(s => s.trim()).filter(s => s),
        teachingMode: form.teachingMode.split(",").map(m => m.trim()).filter(m => m),
        about: form.about,
        mapLink: form.mapLink,
        mobileNumber: form.mobileNumber,
        whatsappNumber: form.whatsappNumber,
        gallery: form.gallery
      };

      console.log("Submitting payload:", payload);

      if (editingId) {
        await axios.put(`${INSTITUTION_API}/${editingId}`, payload);
      } else {
        await axios.post(INSTITUTION_API, payload);
      }

      reset();
      loadData();
      alert("Institution saved successfully!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (i) => {
    setEditingId(i.id);
    setForm({
      institutionName: i.institutionName || "",
      institutionImage: i.institutionImage || "",
      category: Array.isArray(i.category) ? i.category.join(", ") : "",
      shortDescription: i.shortDescription || "",
      rating: i.rating || "",
      result: i.result || "",
      location: i.location || "",
      subjectsOffered: Array.isArray(i.subjectsOffered) ? i.subjectsOffered.join(", ") : "",
      teachingMode: Array.isArray(i.teachingMode) ? i.teachingMode.join(", ") : "",
      about: i.about || "",
      mapLink: i.mapLink || "",
      mobileNumber: i.mobileNumber || "",
      whatsappNumber: i.whatsappNumber || "",
      gallery: Array.isArray(i.gallery) ? i.gallery : []
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this institution?")) return;

    try {
      await axios.delete(`${INSTITUTION_API}/${id}`);
      loadData();
      alert("Deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const removeGalleryImage = (index) => {
    if (window.confirm("Remove this gallery image?")) {
      const newGallery = [...form.gallery];
      newGallery.splice(index, 1);
      setForm({ ...form, gallery: newGallery });
    }
  };

  const reset = () => {
    setForm({
      institutionName: "",
      institutionImage: "",
      category: "",
      shortDescription: "",
      rating: "",
      result: "",
      location: "",
      subjectsOffered: "",
      teachingMode: "",
      about: "",
      mapLink: "",
      mobileNumber: "",
      whatsappNumber: "",
      gallery: []
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Institutions</h3>

      <form onSubmit={submit} className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Institution Name *"
            value={form.institutionName}
            onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Location *"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Category (comma separated)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Rating (0-5)"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Subjects Offered (comma separated)"
            value={form.subjectsOffered}
            onChange={(e) => setForm({ ...form, subjectsOffered: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Teaching Mode (comma separated)"
            value={form.teachingMode}
            onChange={(e) => setForm({ ...form, teachingMode: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Result/Achievements"
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Mobile Number"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="WhatsApp Number"
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Google Maps Link"
            value={form.mapLink}
            onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <input
            className="form-control"
            placeholder="Short Description"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <textarea
            className="form-control"
            placeholder="About"
            rows="3"
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <div className="row">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Institution Image URL"
                value={form.institutionImage}
                onChange={(e) => setForm({ ...form, institutionImage: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <input
                type="file"
                className="form-control"
                onChange={(e) => uploadImage(e, "institutionImage")}
                disabled={uploading}
              />
            </div>
          </div>
          {form.institutionImage && (
            <div className="mt-2">
              <img src={form.institutionImage} alt="institution" width="80" className="img-thumbnail" />
            </div>
          )}
        </div>

        <div className="col-md-12">
          <div className="mb-2">
            <label className="form-label">Gallery Images</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => uploadImage(e, "gallery")}
              disabled={uploading}
              multiple
            />
            {uploading && (
              <div className="mt-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Uploading...</span>
                </div>
                <span className="ms-2">Uploading...</span>
              </div>
            )}
          </div>
          {form.gallery.length > 0 && (
            <div className="mb-3">
              <p className="small text-muted">Gallery Images ({form.gallery.length})</p>
              <div className="row g-2">
                {form.gallery.map((url, index) => (
                  <div key={index} className="col-3 col-md-2">
                    <div className="position-relative border rounded p-1">
                      <img
                        src={url}
                        alt={`gallery-${index}`}
                        className="img-fluid rounded"
                        style={{ height: "80px", width: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                        onClick={() => removeGalleryImage(index)}
                        style={{ transform: "translate(30%, -30%)", padding: "2px 6px" }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary" disabled={uploading}>
            {editingId ? "Update Institution" : "Add Institution"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={reset}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th width="80">Image</th>
            <th>Name</th>
            <th>Location</th>
            <th>Rating</th>
            <th>Contact</th>
            <th>Gallery</th>
            <th width="150">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No institutions found
              </td>
            </tr>
          )}

          {list.map((i) => (
            <tr key={i.id}>
              <td>
                {i.institutionImage ? (
                  <img src={i.institutionImage} width="40" alt="institution" className="img-thumbnail" />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-university text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <div>
                  <strong>{i.institutionName}</strong>
                  {i.shortDescription && (
                    <div className="small text-muted">{i.shortDescription}</div>
                  )}
                </div>
              </td>
              <td>{i.location}</td>
              <td>
                {i.rating ? (
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-star me-1"></i>
                    {i.rating}
                  </span>
                ) : "-"}
              </td>
              <td>{i.mobileNumber || "-"}</td>
              <td>
                {i.gallery && i.gallery.length > 0 ? (
                  <span className="badge bg-info">{i.gallery.length}</span>
                ) : "-"}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(i)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(i.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Institutions;