import React, { useState, useEffect } from "react";
import { tuitionService } from "../../services/tuitionService";

const UPLOAD_API = "https://master-backend-18ik.onrender.com/api/upload";

const TuitionsDataEntry = () => {
  const [tuitions, setTuitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTuition, setEditingTuition] = useState(null);
  
  const [formData, setFormData] = useState({
    tuitionName: "", tuitionImage: "", category: [], shortDescription: "",
    rating: 0.0, result: "", location: "", subjectsOffered: [], teachingMode: [],
    about: "", mapLink: "", mobileNumber: "", whatsappNumber: "", gallery: []
  });
  
  const [tempInput, setTempInput] = useState({
    category: "", subjectsOffered: "", teachingMode: ""
  });

  useEffect(() => { fetchTuitions(); }, []);

  const fetchTuitions = async () => {
    setLoading(true);
    try {
      const response = await tuitionService.getAllTuitions();
      setTuitions((response.data || []).map(t => ({ 
        ...t, 
        rating: parseFloat(t.rating) || 0.0 
      })));
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? parseFloat(value) || 0.0 : value
    }));
  };

  // FIXED UPLOAD FUNCTION
  const handleImageUpload = async (e, field = "tuitionImage") => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert("Please select a valid image file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(UPLOAD_API, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      const fileUrl =
        result?.files?.[0]?.url ||
        result?.files?.[0] ||
        result?.url ||
        result?.fileUrl;

      if (!fileUrl) {
        console.error("Upload response:", result);
        throw new Error("Could not extract image URL");
      }

      console.log("Upload successful, URL:", fileUrl);
      
      if (field === "gallery") {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, fileUrl]
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: fileUrl }));
      }
      
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addToArray = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setTempInput(prev => ({ ...prev, [field]: "" }));
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      tuitionName: "", tuitionImage: "", category: [], shortDescription: "",
      rating: 0.0, result: "", location: "", subjectsOffered: [], teachingMode: [],
      about: "", mapLink: "", mobileNumber: "", whatsappNumber: "", gallery: []
    });
    setTempInput({ category: "", subjectsOffered: "", teachingMode: "" });
    setEditingTuition(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tuitionName || !formData.location || !formData.mobileNumber) {
      alert("Tuition name, location, and mobile number are required!");
      return;
    }

    setLoading(true);
    try {
      const tuitionData = { ...formData };
      if (editingTuition) {
        await tuitionService.updateTuition(editingTuition.id, tuitionData);
        alert("Tuition updated!");
      } else {
        await tuitionService.createTuition(tuitionData);
        alert("Tuition created!");
      }
      resetForm();
      fetchTuitions();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tuition) => {
    setEditingTuition(tuition);
    setFormData({
      tuitionName: tuition.tuitionName || "",
      tuitionImage: tuition.tuitionImage || "",
      category: tuition.category || [],
      shortDescription: tuition.shortDescription || "",
      rating: parseFloat(tuition.rating) || 0.0,
      result: tuition.result || "",
      location: tuition.location || "",
      subjectsOffered: tuition.subjectsOffered || [],
      teachingMode: tuition.teachingMode || [],
      about: tuition.about || "",
      mapLink: tuition.mapLink || "",
      mobileNumber: tuition.mobileNumber || "",
      whatsappNumber: tuition.whatsappNumber || "",
      gallery: tuition.gallery || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this tuition?")) {
      setLoading(true);
      try {
        await tuitionService.deleteTuition(id);
        alert("Tuition deleted!");
        fetchTuitions();
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas ${
          i < Math.floor(numRating) ? "fa-star" :
          i === Math.floor(numRating) && numRating % 1 >= 0.5 ? "fa-star-half-alt" :
          "far fa-star"
        } text-warning me-1`}
      />
    ));
  };

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-success">
            <i className="fas fa-chalkboard-teacher me-2"></i>
            Tuitions Management
          </h3>
          <p className="text-muted mb-0">Manage all tuition centers</p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`fas ${showForm ? "fa-times" : "fa-plus"} me-1`}></i>
            {showForm ? "Close Form" : "Add Tuition"}
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchTuitions}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-bold">
              <i className={`fas ${editingTuition ? "fa-edit" : "fa-plus-circle"} me-2`}></i>
              {editingTuition ? "Edit Tuition" : "Add New Tuition"}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Basic Info */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tuition Name *</label>
                  <input type="text" className="form-control" name="tuitionName" 
                    value={formData.tuitionName} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Location *</label>
                  <input type="text" className="form-control" name="location" 
                    value={formData.location} onChange={handleInputChange} required />
                </div>

                {/* Contact Info */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Mobile *</label>
                  <input type="tel" className="form-control" name="mobileNumber" 
                    value={formData.mobileNumber} onChange={handleInputChange} required 
                    pattern="[0-9]{10}" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">WhatsApp</label>
                  <input type="tel" className="form-control" name="whatsappNumber" 
                    value={formData.whatsappNumber} onChange={handleInputChange} 
                    pattern="[0-9]{10}" />
                </div>

                {/* Rating & Image */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Rating (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" className="form-control" 
                    name="rating" value={formData.rating} onChange={handleInputChange} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold">Tuition Image</label>
                  <div className="input-group">
                    <input type="text" className="form-control" 
                      value={formData.tuitionImage} 
                      onChange={(e) => setFormData(prev => ({...prev, tuitionImage: e.target.value}))}
                      placeholder="Image URL or upload" />
                    <label className="btn btn-outline-success">
                      {uploading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <>
                          <i className="fas fa-upload me-1"></i> Upload
                        </>
                      )}
                      <input type="file" className="d-none" accept="image/*" 
                        onChange={(e) => handleImageUpload(e, "tuitionImage")} disabled={uploading} />
                    </label>
                  </div>
                  {formData.tuitionImage && (
                    <img src={formData.tuitionImage} alt="Tuition" className="img-thumbnail mt-2" 
                      style={{width: 60, height: 60, objectFit: 'cover'}} />
                  )}
                </div>

                {/* Short Description */}
                <div className="col-12">
                  <label className="form-label fw-bold">Short Description</label>
                  <textarea className="form-control" name="shortDescription" rows="2" 
                    value={formData.shortDescription} onChange={handleInputChange} />
                </div>

                {/* Category */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Category</label>
                  <div className="input-group">
                    <input type="text" className="form-control" 
                      value={tempInput.category} 
                      onChange={(e) => setTempInput(prev => ({...prev, category: e.target.value}))}
                      placeholder="e.g., Class 12" />
                    <button type="button" className="btn btn-primary"
                      onClick={() => addToArray('category', tempInput.category)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.category.map((cat, idx) => (
                      <span key={idx} className="badge bg-primary">
                        {cat}
                        <button type="button" className="ms-1 btn-close btn-close-white" 
                          style={{fontSize: '0.5rem'}} 
                          onClick={() => removeFromArray('category', idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Subjects Offered</label>
                  <div className="input-group">
                    <input type="text" className="form-control" 
                      value={tempInput.subjectsOffered} 
                      onChange={(e) => setTempInput(prev => ({...prev, subjectsOffered: e.target.value}))}
                      placeholder="e.g., Physics" />
                    <button type="button" className="btn btn-success"
                      onClick={() => addToArray('subjectsOffered', tempInput.subjectsOffered)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.subjectsOffered.map((subject, idx) => (
                      <span key={idx} className="badge bg-success">
                        {subject}
                        <button type="button" className="ms-1 btn-close btn-close-white" 
                          style={{fontSize: '0.5rem'}} 
                          onClick={() => removeFromArray('subjectsOffered', idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Teaching Mode</label>
                  <div className="input-group">
                    <input type="text" className="form-control" 
                      value={tempInput.teachingMode} 
                      onChange={(e) => setTempInput(prev => ({...prev, teachingMode: e.target.value}))}
                      placeholder="e.g., Offline" />
                    <button type="button" className="btn btn-info"
                      onClick={() => addToArray('teachingMode', tempInput.teachingMode)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.teachingMode.map((mode, idx) => (
                      <span key={idx} className="badge bg-info">
                        {mode}
                        <button type="button" className="ms-1 btn-close btn-close-white" 
                          style={{fontSize: '0.5rem'}} 
                          onClick={() => removeFromArray('teachingMode', idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gallery */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Gallery Images</label>
                  <div className="input-group">
                    <input type="file" className="form-control" accept="image/*" 
                      onChange={(e) => handleImageUpload(e, "gallery")} disabled={uploading} />
                    <span className="input-group-text">
                      {uploading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="fas fa-images"></i>
                      )}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.gallery.map((img, idx) => (
                      <span key={idx} className="badge bg-secondary">
                        <i className="fas fa-image me-1"></i>Image {idx+1}
                        <button type="button" className="ms-1 btn-close btn-close-white" 
                          style={{fontSize: '0.5rem'}} 
                          onClick={() => removeFromArray('gallery', idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Map Link & Result */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Map Link</label>
                  <input type="text" className="form-control" name="mapLink" 
                    value={formData.mapLink} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Result/Performance</label>
                  <input type="text" className="form-control" name="result" 
                    value={formData.result} onChange={handleInputChange} />
                </div>

                {/* About */}
                <div className="col-12">
                  <label className="form-label fw-bold">About Tuition</label>
                  <textarea className="form-control" name="about" rows="3" 
                    value={formData.about} onChange={handleInputChange} />
                </div>

                {/* Buttons */}
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" 
                      disabled={loading || uploading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : editingTuition ? "Update Tuition" : "Create Tuition"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tuitions List */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2 text-success"></i>
            Tuitions List <span className="badge bg-success ms-1">{tuitions.length}</span>
          </h5>
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Total: {tuitions.length} tuitions
          </small>
        </div>
        <div className="card-body p-0">
          {loading && !showForm ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success"></div>
              <p className="mt-2">Loading tuitions...</p>
            </div>
          ) : tuitions.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-chalkboard-teacher fa-3x text-muted mb-3"></i>
              <h5>No Tuitions Found</h5>
              <button className="btn btn-success mt-2" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus me-1"></i>Add First Tuition
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tuition Center</th>
                    <th className="d-none d-md-table-cell">Location</th>
                    <th>Rating</th>
                    <th className="d-none d-sm-table-cell">Contact</th>
                    <th style={{ minWidth: '140px' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tuitions.map((tuition) => (
                    <tr key={tuition.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {tuition.tuitionImage && (
                            <img src={tuition.tuitionImage} alt="" className="rounded-circle me-2" 
                              style={{width: 40, height: 40, objectFit: 'cover'}} />
                          )}
                          <div>
                            <strong className="d-block">{tuition.tuitionName}</strong>
                            <small className="text-muted d-md-none">{tuition.location}</small>
                            {tuition.shortDescription && (
                              <small className="text-muted d-block">
                                {tuition.shortDescription.substring(0, 40)}...
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <small>{tuition.location}</small>
                        {tuition.mapLink && (
                          <a href={tuition.mapLink} target="_blank" rel="noopener noreferrer" 
                            className="d-block text-success small">
                            <i className="fas fa-map-marker-alt me-1"></i>View Map
                          </a>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {renderStars(tuition.rating)}
                          <span className="ms-1 fw-bold">{parseFloat(tuition.rating || 0).toFixed(1)}</span>
                        </div>
                        {tuition.result && (
                          <small className="text-success">
                            <i className="fas fa-trophy me-1"></i>{tuition.result}
                          </small>
                        )}
                      </td>
                      <td className="d-none d-sm-table-cell">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="fas fa-phone text-primary me-1"></i>
                            <small>{tuition.mobileNumber}</small>
                          </div>
                          {tuition.whatsappNumber && (
                            <div className="d-flex align-items-center">
                              <i className="fab fa-whatsapp text-success me-1"></i>
                              <small>{tuition.whatsappNumber}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-outline-success" 
                            onClick={() => handleEdit(tuition)} title="Edit">
                            <i className="fas fa-edit me-1"></i>Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDelete(tuition.id)} title="Delete">
                            <i className="fas fa-trash me-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer text-center py-2">
          <small className="text-muted">
            <i className="fas fa-database me-1"></i>
            Last Updated: {new Date().toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default TuitionsDataEntry;