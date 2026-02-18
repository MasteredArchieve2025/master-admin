import React, { useState, useEffect, useCallback } from "react";
import { schoolService } from "../../services/schoolService";

const SchoolsDataEntry = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const [formData, setFormData] = useState({
    schoolName: "", category: [], schoolLogo: "", rating: 0.0,
    result: "", classes: [], classesOffered: [], teachingMode: [],
    location: "", mapLink: "", about: "", mobileNumber: "",
    whatsappNumber: "", gallery: []
  });

  const [tempInput, setTempInput] = useState({
    category: "", teachingMode: "", classesOffered: ""
  });

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const response = await schoolService.getAllSchools();
      setSchools((response.data || []).map(s => ({ ...s, rating: parseFloat(s.rating) || 0.0 })));
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? parseFloat(value) || 0.0 : value
    }));
  };

  const handleImageUpload = async (e, field = "schoolLogo") => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("https://master-backend-18ik.onrender.com/api/upload", {
        method: "POST",
        body: fd,
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
        throw new Error("Could not extract image URL from response");
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
      schoolName: "", category: [], schoolLogo: "", rating: 0.0,
      result: "", classes: [], classesOffered: [], teachingMode: [],
      location: "", mapLink: "", about: "", mobileNumber: "",
      whatsappNumber: "", gallery: []
    });
    setTempInput({ category: "", teachingMode: "", classesOffered: "" });
    setEditingSchool(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.location || !formData.mobileNumber) {
      alert("School name, location, and mobile number are required!");
      return;
    }

    setLoading(true);
    try {
      const schoolData = { ...formData };
      if (editingSchool) {
        await schoolService.updateSchool(editingSchool.id, schoolData);
        alert("School updated successfully!");
      } else {
        await schoolService.createSchool(schoolData);
        alert("School created successfully!");
      }
      resetForm();
      fetchSchools();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      schoolName: school.schoolName || "",
      category: school.category || [],
      schoolLogo: school.schoolLogo || "",
      rating: parseFloat(school.rating) || 0.0,
      result: school.result || "",
      classes: school.classes || [],
      classesOffered: school.classesOffered || [],
      teachingMode: school.teachingMode || [],
      location: school.location || "",
      mapLink: school.mapLink || "",
      about: school.about || "",
      mobileNumber: school.mobileNumber || "",
      whatsappNumber: school.whatsappNumber || "",
      gallery: school.gallery || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      setLoading(true);
      try {
        await schoolService.deleteSchool(id);
        alert("School deleted successfully!");
        fetchSchools();
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
          <h3 className="fw-bold text-primary">
            <i className="fas fa-school me-2"></i>
            Schools Management
          </h3>
          <p className="text-muted mb-0">Manage all school information</p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`fas ${showForm ? "fa-times" : "fa-plus"} me-1`}></i>
            {showForm ? "Close Form" : "Add School"}
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchSchools}
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
              <i className={`fas ${editingSchool ? "fa-edit" : "fa-plus-circle"} me-2`}></i>
              {editingSchool ? "Edit School" : "Add New School"}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Basic Info */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">School Name *</label>
                  <input type="text" className="form-control" name="schoolName"
                    value={formData.schoolName} onChange={handleInputChange} required />
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
                    pattern="[0-9]{10}" placeholder="10 digit number" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">WhatsApp</label>
                  <input type="tel" className="form-control" name="whatsappNumber"
                    value={formData.whatsappNumber} onChange={handleInputChange}
                    pattern="[0-9]{10}" placeholder="Optional" />
                </div>

                {/* Rating & Logo */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Rating (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" className="form-control"
                    name="rating" value={formData.rating} onChange={handleInputChange} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold">School Logo</label>
                  <div className="input-group">
                    <input type="text" className="form-control"
                      value={formData.schoolLogo}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolLogo: e.target.value }))}
                      placeholder="Image URL or upload" />
                    <label className="btn btn-outline-primary">
                      {uploading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <><i className="fas fa-upload me-1"></i> Upload</>
                      )}
                      <input type="file" className="d-none" accept="image/*"
                        onChange={(e) => handleImageUpload(e, "schoolLogo")} disabled={uploading} />
                    </label>
                  </div>
                  {formData.schoolLogo && (
                    <div className="mt-2">
                      <img src={formData.schoolLogo} alt="Logo" className="img-thumbnail"
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            "<span class='badge bg-info'>Image URL Provided</span>";
                        }} />
                    </div>
                  )}
                </div>

                {/* Category Input */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Category</label>
                  <div className="input-group">
                    <input type="text" className="form-control"
                      value={tempInput.category}
                      onChange={(e) => setTempInput(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., CBSE" />
                    <button type="button" className="btn btn-primary"
                      onClick={() => addToArray("category", tempInput.category)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.category.map((cat, idx) => (
                      <span key={idx} className="badge bg-primary">
                        {cat}
                        <button type="button" className="ms-1 btn-close btn-close-white"
                          style={{ fontSize: "0.5rem" }}
                          onClick={() => removeFromArray("category", idx)} />
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
                      onChange={(e) => setTempInput(prev => ({ ...prev, teachingMode: e.target.value }))}
                      placeholder="e.g., Offline" />
                    <button type="button" className="btn btn-success"
                      onClick={() => addToArray("teachingMode", tempInput.teachingMode)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.teachingMode.map((mode, idx) => (
                      <span key={idx} className="badge bg-success">
                        {mode}
                        <button type="button" className="ms-1 btn-close btn-close-white"
                          style={{ fontSize: "0.5rem" }}
                          onClick={() => removeFromArray("teachingMode", idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Classes Offered */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Classes Offered</label>
                  <div className="input-group">
                    <input type="text" className="form-control"
                      value={tempInput.classesOffered}
                      onChange={(e) => setTempInput(prev => ({ ...prev, classesOffered: e.target.value }))}
                      placeholder="e.g., Swimming" />
                    <button type="button" className="btn btn-info"
                      onClick={() => addToArray("classesOffered", tempInput.classesOffered)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {formData.classesOffered.map((item, idx) => (
                      <span key={idx} className="badge bg-info">
                        {item}
                        <button type="button" className="ms-1 btn-close btn-close-white"
                          style={{ fontSize: "0.5rem" }}
                          onClick={() => removeFromArray("classesOffered", idx)} />
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
                        <i className="fas fa-image me-1"></i>Image {idx + 1}
                        <button type="button" className="ms-1 btn-close btn-close-white"
                          style={{ fontSize: "0.5rem" }}
                          onClick={() => removeFromArray("gallery", idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Map Link & Result */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Map Link</label>
                  <input type="text" className="form-control" name="mapLink"
                    value={formData.mapLink} onChange={handleInputChange}
                    placeholder="Google Maps URL" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Result/Performance</label>
                  <input type="text" className="form-control" name="result"
                    value={formData.result} onChange={handleInputChange}
                    placeholder="e.g., 95% pass rate" />
                </div>

                {/* About */}
                <div className="col-12">
                  <label className="form-label fw-bold">About School</label>
                  <textarea className="form-control" name="about" rows="3"
                    value={formData.about} onChange={handleInputChange}
                    placeholder="Describe the school..." />
                </div>

                {/* Buttons */}
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary"
                      disabled={loading || uploading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : editingSchool ? "Update School" : "Create School"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2 text-primary"></i>
            Schools List <span className="badge bg-primary ms-1">{schools.length}</span>
          </h5>
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Total: {schools.length} schools
          </small>
        </div>
        <div className="card-body p-0">
          {loading && !showForm ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2">Loading schools...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-school fa-3x text-muted mb-3"></i>
              <h5>No Schools Found</h5>
              <button className="btn btn-primary mt-2" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus me-1"></i>Add First School
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>School</th>
                    <th className="d-none d-md-table-cell">Location</th>
                    <th>Rating</th>
                    <th className="d-none d-sm-table-cell">Contact</th>
                    <th style={{ minWidth: "140px" }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {school.schoolLogo && (
                            <img src={school.schoolLogo} alt="" className="rounded-circle me-2"
                              style={{ width: 40, height: 40, objectFit: "cover" }} />
                          )}
                          <div>
                            <strong className="d-block">{school.schoolName}</strong>
                            <small className="text-muted d-md-none">{school.location}</small>
                            {school.result && (
                              <small className="text-success">
                                <i className="fas fa-trophy me-1"></i>{school.result}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <small>{school.location}</small>
                        {school.mapLink && (
                          <a href={school.mapLink} target="_blank" rel="noopener noreferrer"
                            className="d-block text-primary small">
                            <i className="fas fa-map-marker-alt me-1"></i>View Map
                          </a>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {renderStars(school.rating)}
                          <span className="ms-1 fw-bold">{parseFloat(school.rating || 0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="d-none d-sm-table-cell">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="fas fa-phone text-primary me-1"></i>
                            <small>{school.mobileNumber}</small>
                          </div>
                          {school.whatsappNumber && (
                            <div className="d-flex align-items-center">
                              <i className="fab fa-whatsapp text-success me-1"></i>
                              <small>{school.whatsappNumber}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(school)} title="Edit">
                            <i className="fas fa-edit me-1"></i>Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(school.id)} title="Delete">
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

export default SchoolsDataEntry;