import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const API = "https://master-backend-18ik.onrender.com/api/advertisements";
const UPLOAD_API = "https://master-backend-18ik.onrender.com/api/upload";

const Advertisement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category: "",
    page1id: "",
    page2id: "",
    page3id: "",
  });

  const [imageUrl, setImageUrl] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [newYoutubeLink, setNewYoutubeLink] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ---------- INIT ----------
  useEffect(() => {
    const modalElement = document.getElementById("adsModal");
    modalRef.current = new Modal(modalElement, {
      backdrop: "static",
      keyboard: false,
    });
    getAds();
  }, []);

  // ---------- GET ALL ----------
  const getAds = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/all`);
      setAds(res.data?.resultData || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
      alert("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UPLOAD ----------
  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();
    
    try {
      const fd = new FormData();
      for (let f of files) fd.append("file", f);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minutes timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        signal: abortControllerRef.current.signal,
      });

      console.log("UPLOAD RESPONSE", res.data);

      // Extract URLs from response
      let uploadedUrls = [];
      if (res.data.files && Array.isArray(res.data.files)) {
        uploadedUrls = res.data.files.map(fileData => {
          if (typeof fileData === 'string') {
            return fileData;
          } else if (typeof fileData === 'object') {
            return fileData.url || 
                   fileData.fileUrl || 
                   fileData.file || 
                   fileData.imageUrl ||
                   fileData.path ||
                   fileData.filename;
          }
          return fileData;
        });
      }

      // Ensure URLs are complete
      uploadedUrls = uploadedUrls.map(url => {
        if (url && !url.startsWith('http')) {
          const baseUrl = UPLOAD_API.replace('/api/upload', '');
          return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return url;
      });

      // Add delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      return uploadedUrls;
    } catch (error) {
      console.error("Upload error:", error);
      
      if (axios.isCancel(error)) {
        throw new Error("Upload cancelled");
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("Upload timeout. Please try again with smaller files or check your connection.");
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ---------- CANCEL UPLOAD ----------
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      alert("Upload cancelled");
    }
  };

  // ---------- OPEN ADD ----------
  const openAdd = () => {
    setEditingId(null);
    setForm({ category: "", page1id: "", page2id: "", page3id: "" });
    setImageUrl([]);
    setYoutubeLinks([]);
    setNewYoutubeLink("");
    setSuccess(false);
    modalRef.current.show();
  };

  // ---------- OPEN EDIT ----------
  const startEdit = (ad) => {
    setEditingId(ad.id);
    setForm({
      category: ad.category || "",
      page1id: ad.page1id || "",
      page2id: ad.page2id || "",
      page3id: ad.page3id || "",
    });
    setImageUrl(ad.imageUrl || []);
    setYoutubeLinks(ad.youtubeLinks || []);
    setNewYoutubeLink("");
    setSuccess(false);
    modalRef.current.show();
  };

  // ---------- SAVE ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!form.category.trim()) {
        alert("Category is required");
        return;
      }

      const payload = { ...form, imageUrl, youtubeLinks };

      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        alert("Advertisement updated successfully!");
      } else {
        await axios.post(API, payload);
        alert("Advertisement added successfully!");
      }

      modalRef.current.hide();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      getAds();
    } catch (error) {
      console.error("Save error:", error);
      alert(`Save failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // ---------- DELETE ----------
  const deleteAd = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?")) return;
    
    try {
      await axios.delete(`${API}/${id}`);
      getAds();
      alert("Advertisement deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete advertisement");
    }
  };

  // ---------- IMAGE CHANGE ----------
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (!files || !files.length) return;

    // Validate file sizes
    const maxSize = 2 * 1024 * 1024; // 2MB per file
    const tooLargeFiles = files.filter(file => file.size > maxSize);
    
    if (tooLargeFiles.length > 0) {
      alert(`Some files are too large! Maximum size is 2MB per file.\n\nLarge files: ${tooLargeFiles.map(f => f.name).join(', ')}`);
      e.target.value = "";
      return;
    }

    try {
      const uploaded = await uploadFiles(files);
      setImageUrl(uploaded);
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
      e.target.value = "";
    }
  };

  // ---------- TRIGGER FILE INPUT ----------
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ---------- CATEGORY FILTER ----------
  const categories = ["all", ...new Set(ads.map(a => a.category).filter(Boolean))];

  const filteredAds =
    selectedCategory === "all"
      ? ads
      : ads.filter(a => a.category === selectedCategory);

  // ---------- REMOVE IMAGE ----------
  const removeImage = (index) => {
    const newImages = [...imageUrl];
    newImages.splice(index, 1);
    setImageUrl(newImages);
  };

  // ---------- REMOVE YOUTUBE LINK ----------
  const removeYoutubeLink = (index) => {
    const newLinks = [...youtubeLinks];
    newLinks.splice(index, 1);
    setYoutubeLinks(newLinks);
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h3>Advertisement Management</h3>
        <button className="btn btn-primary" onClick={openAdd} disabled={loading}>
          + Add Advertisement
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Advertisement saved successfully!
          <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
        </div>
      )}

      {/* CATEGORY FILTERS */}
      <div className="mb-4">
        <label className="form-label mb-2 fw-bold">Filter by Category:</label>
        <div className="d-flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedCategory(cat)}
              disabled={loading}
            >
              {cat === "all" ? "All Ads" : cat} 
              <span className="badge bg-light text-dark ms-1">
                {cat === "all" ? ads.length : ads.filter(x => x.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading advertisements...</p>
        </div>
      )}

      {/* ADS GRID */}
      {!loading && (
        <div className="row">
          {filteredAds.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info text-center">
                No advertisements found. Click "Add Advertisement" to create one.
              </div>
            </div>
          ) : (
            filteredAds.map(ad => (
              <div className="col-md-4 mb-4" key={ad.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge bg-primary fs-6">{ad.category || "No Category"}</span>
                      <span className="text-muted small">ID: {ad.id}</span>
                    </div>

                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Page Flow:</h6>
                      <div className="d-flex align-items-center flex-wrap">
                        {[ad.page1id, ad.page2id, ad.page3id]
                          .filter(Boolean)
                          .map((page, index, arr) => (
                            <div key={index} className="d-flex align-items-center me-2 mb-1">
                              <span className="badge bg-secondary">{page}</span>
                              {index < arr.length - 1 && (
                                <span className="mx-1">
                                  <i className="bi bi-arrow-right"></i>
                                </span>
                              )}
                            </div>
                          ))}
                        {!ad.page1id && !ad.page2id && !ad.page3id && (
                          <span className="text-muted">No pages configured</span>
                        )}
                      </div>
                    </div>

                    {ad.imageUrl?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold mb-2">Images ({ad.imageUrl.length}):</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {ad.imageUrl.map((img, i) => (
                            <img 
                              key={i} 
                              src={img} 
                              width={70} 
                              height={70} 
                              className="rounded border" 
                              alt={`Ad ${i + 1}`}
                              style={{objectFit: 'cover'}}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/70?text=Image+Error";
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {ad.youtubeLinks?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold mb-2">YouTube Links ({ad.youtubeLinks.length}):</h6>
                        <div className="small">
                          {ad.youtubeLinks.slice(0, 2).map((y, i) => (
                            <div key={i} className="text-truncate" title={y}>
                              <i className="bi bi-youtube text-danger me-1"></i>
                              {y}
                            </div>
                          ))}
                          {ad.youtubeLinks.length > 2 && (
                            <div className="text-muted">
                              +{ad.youtubeLinks.length - 2} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between mt-3">
                      <button 
                        className="btn btn-warning btn-sm" 
                        onClick={() => startEdit(ad)}
                        disabled={loading}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => deleteAd(ad.id)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL */}
      <div className="modal fade" id="adsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {editingId ? "Edit Advertisement" : "New Advertisement"}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                disabled={uploading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {/* UPLOAD PROGRESS */}
                {uploading && (
                  <div className="alert alert-warning mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading images... ({uploadProgress}%)
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={cancelUpload}
                      >
                        Cancel Upload
                      </button>
                    </div>
                    <div className="progress mt-2" style={{height: '10px'}}>
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                        role="progressbar" 
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="row">
                  {/* CATEGORY */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Category *</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter category (e.g., Banner, Sidebar, Popup)"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Advertisement ID</label>
                    <input 
                      className="form-control bg-light" 
                      value={editingId || "New Advertisement"}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* PAGES */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold">Page Flow (Optional)</label>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <input 
                          className="form-control" 
                          placeholder="Page 1 ID"
                          value={form.page1id}
                          onChange={e => setForm({ ...form, page1id: e.target.value })}
                          disabled={uploading}
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          className="form-control" 
                          placeholder="Page 2 ID"
                          value={form.page2id}
                          onChange={e => setForm({ ...form, page2id: e.target.value })}
                          disabled={uploading}
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          className="form-control" 
                          placeholder="Page 3 ID"
                          value={form.page3id}
                          onChange={e => setForm({ ...form, page3id: e.target.value })}
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    <small className="text-muted">Enter page IDs in sequence for navigation flow (optional)</small>
                  </div>

                  {/* IMAGES UPLOAD - FIXED VERSION */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold">Advertisement Images</label>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="d-none"
                      onChange={handleImageChange}
                      disabled={uploading}
                      accept="image/*"
                    />
                    
                    {/* Clickable upload area */}
                    <div 
                      className={`upload-box border rounded p-4 text-center mb-3 ${uploading ? 'border-warning' : 'border-primary'}`}
                      style={{
                        backgroundColor: uploading ? '#fff3cd' : '#f8f9fa',
                        borderStyle: 'dashed',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                      }}
                      onClick={uploading ? undefined : triggerFileInput}
                    >
                      {uploading ? (
                        <div>
                          <div className="spinner-border text-warning mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                            <span className="visually-hidden">Uploading...</span>
                          </div>
                          <div className="fw-bold text-warning mb-2">Uploading Images...</div>
                          <div className="progress mb-3" style={{height: '15px'}}>
                            <div 
                              className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                              role="progressbar" 
                              style={{width: `${uploadProgress}%`}}
                            >
                              {uploadProgress}%
                            </div>
                          </div>
                          <div className="small text-muted">
                            Please wait while files are uploaded...
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3">
                            <i className="bi bi-cloud-arrow-up-fill fs-1 text-primary"></i>
                          </div>
                          <div className="fw-bold mb-2">Click here to upload images</div>
                          <div className="small text-muted mb-2">PNG, JPG, GIF up to 2MB each</div>
                          <div className="small text-muted">You can select multiple images</div>
                          <div className="mt-3">
                            <button 
                              type="button" 
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerFileInput();
                              }}
                            >
                              <i className="bi bi-folder2-open me-1"></i> Browse Files
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* IMAGE PREVIEWS */}
                    {imageUrl.length > 0 && (
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold mb-0">Uploaded Images ({imageUrl.length}):</h6>
                          {imageUrl.length > 0 && !uploading && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm("Remove all images?")) {
                                  setImageUrl([]);
                                }
                              }}
                            >
                              <i className="bi bi-trash me-1"></i> Clear All
                            </button>
                          )}
                        </div>
                        <div className="d-flex flex-wrap gap-3">
                          {imageUrl.map((img, i) => (
                            <div key={i} className="position-relative image-preview-card">
                              <img 
                                src={img} 
                                width={100} 
                                height={100} 
                                className="rounded border p-1 shadow-sm" 
                                alt={`Ad Image ${i + 1}`}
                                style={{objectFit: 'cover'}}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/100?text=Image+Error";
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                style={{
                                  transform: 'translate(30%, -30%)',
                                  width: '24px',
                                  height: '24px',
                                  padding: 0,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(i);
                                }}
                                disabled={uploading}
                              >
                                ×
                              </button>
                              <div className="text-center small mt-1">Image {i + 1}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YOUTUBE LINKS */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold">YouTube Links (Optional)</label>
                    <div className="input-group mb-3">
                      <input
                        className="form-control"
                        placeholder="Enter YouTube URL (e.g., https://youtube.com/watch?v=...)"
                        value={newYoutubeLink}
                        onChange={e => setNewYoutubeLink(e.target.value)}
                        disabled={uploading}
                        type="url"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          if (!newYoutubeLink.trim()) {
                            alert("Please enter a YouTube URL");
                            return;
                          }
                          if (!newYoutubeLink.includes('youtube.com') && !newYoutubeLink.includes('youtu.be')) {
                            if (!window.confirm("This doesn't look like a YouTube URL. Add anyway?")) {
                              return;
                            }
                          }
                          setYoutubeLinks([...youtubeLinks, newYoutubeLink.trim()]);
                          setNewYoutubeLink("");
                        }}
                        disabled={uploading}
                      >
                        <i className="bi bi-plus-circle me-1"></i> Add Link
                      </button>
                    </div>
                    <small className="text-muted d-block mb-2">
                      Add YouTube video URLs for this advertisement (optional)
                    </small>

                    {/* YOUTUBE LINKS LIST */}
                    {youtubeLinks.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold mb-0">YouTube Links ({youtubeLinks.length}):</h6>
                          {youtubeLinks.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm("Remove all YouTube links?")) {
                                  setYoutubeLinks([]);
                                }
                              }}
                              disabled={uploading}
                            >
                              <i className="bi bi-trash me-1"></i> Clear All
                            </button>
                          )}
                        </div>
                        <div className="list-group">
                          {youtubeLinks.map((link, i) => (
                            <div key={i} className="list-group-item d-flex justify-content-between align-items-center py-2">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-youtube text-danger me-3 fs-5"></i>
                                <div className="text-truncate" style={{maxWidth: '400px'}} title={link}>
                                  {link}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeYoutubeLink(i)}
                                disabled={uploading}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  data-bs-dismiss="modal"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary" 
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Uploading...
                    </>
                  ) : editingId ? (
                    "Update Advertisement"
                  ) : (
                    "Save Advertisement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .upload-box {
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .upload-box:not(.border-warning):hover {
          background-color: #e9ecef !important;
          border-color: #0d6efd !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .image-preview-card {
          transition: transform 0.2s ease;
        }
        
        .image-preview-card:hover {
          transform: scale(1.05);
        }
        
        .modal-dialog-scrollable .modal-body {
          overflow-y: auto;
        }
        
        .progress-bar-animated {
          animation: progress-bar-stripes 1s linear infinite;
        }
        
        @keyframes progress-bar-stripes {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
        
        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .form-control:disabled {
          cursor: not-allowed;
          background-color: #e9ecef;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default Advertisement;