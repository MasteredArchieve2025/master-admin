import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { COLLEGE_API, UPLOAD_API } from "../../api/api";

const Colleges = () => {
  const { degreeId: degreeIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryId = Number(location.state?.categoryId);
  const degreeId = Number(location.state?.degreeId || degreeIdFromUrl);

  const [colleges, setColleges] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    name: "",
    shortName: "",
    ownership: "Private",
    collegeStatus: "Autonomous",
    affiliatedUniversity: "Anna University",
    address: "",
    city: "",
    state: "",
    aboutCollege: "",
    academics: "",
    departments: "",
    facilities: "",
    placementInfo: "",
    admissionInfo: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    mapLink: "",
    logo: "",
    collegeImage: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD ================= */
  const loadColleges = useCallback(async () => {
    if (!degreeId) return;

    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(COLLEGE_API);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data?.colleges && Array.isArray(res.data.colleges)) {
        data = res.data.colleges;
      }

      // Filter by degreeId
      const filtered = data.filter((c) => Number(c.degreeId) === degreeId);
      setColleges(filtered);
    } catch (err) {
      console.error("Error loading colleges:", err);
      setError(err.response?.data?.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [degreeId]);

  useEffect(() => {
    if (degreeId) {
      loadColleges();
    }
  }, [degreeId, loadColleges]);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const url = res.data?.url || 
                  res.data?.data?.url || 
                  res.data?.fileUrl || 
                  res.data?.path;

      if (url) {
        setForm((p) => ({ ...p, [field]: url }));
        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("No image URL received from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const requiredFields = {
      name: "College Name",
      shortName: "Short Name",
      city: "City",
      state: "State",
    };

    const missingFields = Object.keys(requiredFields)
      .filter((key) => !form[key]?.trim())
      .map((key) => requiredFields[key]);

    if (missingFields.length > 0) {
      return setError(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!categoryId || !degreeId) {
      return setError("Category and Degree are required");
    }

    try {
      setLoading(true);

      // Process comma-separated fields
      const departments = form.departments
        ? form.departments.split(",").map(d => d.trim()).filter(d => d)
        : ["CSE", "ECE", "EEE", "Mechanical"];

      const facilities = form.facilities
        ? form.facilities.split(",").map(f => f.trim()).filter(f => f)
        : ["Library", "Hostel", "Transport"];

      const payload = {
        name: form.name.trim(),
        shortName: form.shortName.trim(),
        categoryId: Number(categoryId),
        degreeId: Number(degreeId),
        ownership: form.ownership || "Private",
        collegeStatus: form.collegeStatus || "Autonomous",
        affiliatedUniversity: form.affiliatedUniversity.trim() || "Anna University",
        address: form.address.trim() || "Address not specified",
        city: form.city.trim(),
        state: form.state.trim(),
        aboutCollege: form.aboutCollege.trim() || "About college information",
        academics: form.academics.trim() || "Academics information",
        departments: departments,
        facilities: facilities,
        placementInfo: form.placementInfo.trim() || "Placement information",
        admissionInfo: form.admissionInfo.trim() || "Admission information",
        phone: form.phone.trim().replace(/\D/g, "") || "0000000000",
        whatsapp: form.whatsapp.trim().replace(/\D/g, "") || "0000000000",
        email: form.email.trim() || "info@college.com",
        website: form.website.trim() || "https://college.com",
        mapLink: form.mapLink.trim() || "https://maps.google.com",
        logo: form.logo.trim() || "https://via.placeholder.com/100",
        collegeImage: form.collegeImage.trim() || "https://via.placeholder.com/300",
      };

      console.log("Submitting payload:", payload);

      let response;
      if (editingId) {
        const id = editingId.id || editingId;
        response = await axios.put(`${COLLEGE_API}/${id}`, payload);
      } else {
        response = await axios.post(COLLEGE_API, payload);
      }

      console.log("Server response:", response.data);

      setSuccess(editingId ? "College updated successfully!" : "College added successfully!");
      setForm(emptyForm);
      setEditingId(null);
      await loadColleges();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       "Failed to save college";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const edit = (college) => {
    setEditingId(college.id || college._id);
    setForm({
      ...emptyForm,
      name: college.name || "",
      shortName: college.shortName || "",
      ownership: college.ownership || "Private",
      collegeStatus: college.collegeStatus || "Autonomous",
      affiliatedUniversity: college.affiliatedUniversity || "",
      address: college.address || "",
      city: college.city || "",
      state: college.state || "",
      aboutCollege: college.aboutCollege || "",
      academics: college.academics || "",
      departments: Array.isArray(college.departments) ? college.departments.join(", ") : college.departments || "",
      facilities: Array.isArray(college.facilities) ? college.facilities.join(", ") : college.facilities || "",
      placementInfo: college.placementInfo || "",
      admissionInfo: college.admissionInfo || "",
      phone: college.phone || "",
      whatsapp: college.whatsapp || "",
      email: college.email || "",
      website: college.website || "",
      mapLink: college.mapLink || "",
      logo: college.logo || "",
      collegeImage: college.collegeImage || "",
    });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) return;

    try {
      setLoading(true);
      setError("");
      
      await axios.delete(`${COLLEGE_API}/${id}`);
      setSuccess("College deleted successfully!");
      await loadColleges();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete college");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Colleges Management</h3>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="alert alert-info">
        <strong>Category ID:</strong> {categoryId} | <strong>Degree ID:</strong> {degreeId}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          {editingId ? "Edit College" : "Add New College"}
        </div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">College Name *</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Short Name *</label>
                <input
                  className="form-control"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Ownership</label>
                <select
                  className="form-control"
                  value={form.ownership}
                  onChange={(e) => setForm({ ...form, ownership: e.target.value })}
                  disabled={loading}
                >
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Semi-Government">Semi-Government</option>
                  <option value="Autonomous">Autonomous</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">College Status</label>
                <select
                  className="form-control"
                  value={form.collegeStatus}
                  onChange={(e) => setForm({ ...form, collegeStatus: e.target.value })}
                  disabled={loading}
                >
                  <option value="Autonomous">Autonomous</option>
                  <option value="Affiliated">Affiliated</option>
                  <option value="Deemed University">Deemed University</option>
                  <option value="Private University">Private University</option>
                  <option value="Government University">Government University</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Affiliated University</label>
                <input
                  className="form-control"
                  value={form.affiliatedUniversity}
                  onChange={(e) => setForm({ ...form, affiliatedUniversity: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">City *</label>
                <input
                  className="form-control"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">State *</label>
                <input
                  className="form-control"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Phone (10 digits)</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength="10"
                  pattern="[0-9]*"
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">WhatsApp (10 digits)</label>
                <input
                  className="form-control"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  maxLength="10"
                  pattern="[0-9]*"
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Website</label>
                <input
                  className="form-control"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Map Link</label>
                <input
                  className="form-control"
                  type="url"
                  value={form.mapLink}
                  onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">About College</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.aboutCollege}
                  onChange={(e) => setForm({ ...form, aboutCollege: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Academics</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.academics}
                  onChange={(e) => setForm({ ...form, academics: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Departments (comma-separated)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.departments}
                  onChange={(e) => setForm({ ...form, departments: e.target.value })}
                  placeholder="CSE, ECE, EEE, Mechanical"
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Facilities (comma-separated)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.facilities}
                  onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                  placeholder="Library, Hostel, Transport"
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Placement Information</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.placementInfo}
                  onChange={(e) => setForm({ ...form, placementInfo: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Admission Information</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.admissionInfo}
                  onChange={(e) => setForm({ ...form, admissionInfo: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Logo URL</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    disabled={loading}
                  />
                  <label className="input-group-text" style={{ cursor: "pointer" }}>
                    <input
                      type="file"
                      className="d-none"
                      onChange={(e) => uploadImage(e, "logo")}
                      accept="image/*"
                      disabled={loading}
                    />
                    Upload
                  </label>
                </div>
                {form.logo && (
                  <img 
                    src={form.logo} 
                    alt="Logo preview" 
                    style={{ width: "60px", height: "60px", objectFit: "contain", marginTop: "8px" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
                  />
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">College Image URL</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={form.collegeImage}
                    onChange={(e) => setForm({ ...form, collegeImage: e.target.value })}
                    disabled={loading}
                  />
                  <label className="input-group-text" style={{ cursor: "pointer" }}>
                    <input
                      type="file"
                      className="d-none"
                      onChange={(e) => uploadImage(e, "collegeImage")}
                      accept="image/*"
                      disabled={loading}
                    />
                    Upload
                  </label>
                </div>
                {form.collegeImage && (
                  <img 
                    src={form.collegeImage} 
                    alt="College preview" 
                    style={{ width: "60px", height: "60px", objectFit: "cover", marginTop: "8px" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
                  />
                )}
              </div>

              <div className="col-12">
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingId ? "Update College" : "Add College"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={reset}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <h4>Colleges List ({colleges.length})</h4>

      {loading && !editingId ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Short Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Status</th>
                <th width="200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No colleges found for this degree. Add your first college above.
                  </td>
                </tr>
              ) : (
                colleges.map((college, index) => (
                  <tr key={college.id || college._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      {college.logo ? (
                        <img 
                          src={college.logo} 
                          alt="Logo" 
                          style={{ width: "40px", height: "40px", objectFit: "contain" }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                        />
                      ) : (
                        <span className="text-muted">No logo</span>
                      )}
                    </td>
                    <td>
                      <strong>{college.name}</strong>
                    </td>
                    <td>{college.shortName || "-"}</td>
                    <td>{college.city}</td>
                    <td>{college.phone || "-"}</td>
                    <td>
                      <span className="badge bg-info">{college.collegeStatus || "N/A"}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => edit(college)}
                        disabled={loading}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(college.id || college._id)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Colleges;