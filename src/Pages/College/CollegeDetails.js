import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { COLLEGE_API, UPLOAD_API } from "../../api/api";

const Colleges = () => {
  const { degreeId: degreeIdFromUrl } = useParams();
  const location = useLocation();

  const categoryId = Number(location.state?.categoryId);
  const degreeId = Number(location.state?.degreeId || degreeIdFromUrl);

  const [colleges, setColleges] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    name: "",
    shortName: "",
    ownership: "",
    collegeStatus: "",
    affiliatedUniversity: "",
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
  const loadColleges = async () => {
    try {
      setLoading(true);
      const res = await axios.get(COLLEGE_API);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setColleges(
        data.filter((c) => Number(c.degreeId) === degreeId)
      );
    } catch (err) {
      console.error("Error loading colleges:", err);
      setError("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (degreeId) {
      loadColleges();
    }
  }, [degreeId]);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd);
      const url =
        res.data?.url ||
        res.data?.data?.url ||
        res.data?.files?.[0]?.url;

      if (url) {
        setForm((p) => ({ ...p, [field]: url }));
        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image");
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
      state: "State"
    };

    const missingFields = Object.keys(requiredFields)
      .filter(key => !form[key]?.trim())
      .map(key => requiredFields[key]);

    if (missingFields.length > 0) {
      return setError(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!categoryId || !degreeId) {
      return setError("Category and Degree are required");
    }

    // Create payload EXACTLY like Postman
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      categoryId: categoryId,
      degreeId: degreeId,
      ownership: (form.ownership.trim() || "Private").replace("PARIVATE", "PRIVATE"), // Fix typo
      collegeStatus: form.collegeStatus.trim() || "Autonomous", // Add default
      affiliatedUniversity: form.affiliatedUniversity.trim() || "Anna University", // Add default
      address: form.address.trim() || "Address not specified",
      city: form.city.trim(),
      state: form.state.trim(),
      aboutCollege: form.aboutCollege.trim() || "About college information",
      academics: form.academics.trim() || "Academics information",
      placementInfo: form.placementInfo.trim() || "Placement information",
      admissionInfo: form.admissionInfo.trim() || "Admission information",
      phone: form.phone.trim() ? form.phone.trim().replace(/\D/g, '') : "0000000000",
      whatsapp: form.whatsapp.trim() ? form.whatsapp.trim().replace(/\D/g, '') : "0000000000",
      email: form.email.trim() || "info@college.com",
      website: form.website.trim() || "https://college.com",
      mapLink: form.mapLink.trim() || "https://maps.google.com",
      logo: form.logo.trim() || "https://example.com/logo.png",
      collegeImage: form.collegeImage.trim() || "https://example.com/college.png",
    };

    // Handle arrays
    if (form.departments?.trim()) {
      payload.departments = form.departments.split(",")
        .map(d => d.trim())
        .filter(d => d !== "");
    } else {
      payload.departments = ["CSE", "ECE", "EEE", "Mechanical"];
    }

    if (form.facilities?.trim()) {
      payload.facilities = form.facilities.split(",")
        .map(f => f.trim())
        .filter(f => f !== "");
    } else {
      payload.facilities = ["Library", "Hostel", "Transport"];
    }

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));

    try {
      setLoading(true);
      let response;
      
      if (editingId) {
        response = await axios.put(`${COLLEGE_API}/${editingId}`, payload);
      } else {
        response = await axios.post(COLLEGE_API, payload);
      }

      console.log("Server response:", response.data);
      
      setForm(emptyForm);
      setEditingId(null);
      setSuccess(editingId ? "College updated successfully!" : "College added successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
      
      await loadColleges();
    } catch (err) {
      console.error("FULL ERROR DETAILS:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      
      // Try to get detailed error
      const errorData = err.response?.data;
      let errorMessage = "Server error while saving college";
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          const errors = errorData.errors;
          errorMessage = Array.isArray(errors) 
            ? errors.map(e => `${e.path || e.field}: ${e.message || e.msg}`).join(', ')
            : JSON.stringify(errors);
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      setError(`Error: ${errorMessage}`);
      
      // Also log to console for debugging
      console.error("Error message:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TEST WITH MINIMAL PAYLOAD ================= */
  const testMinimalPayload = async () => {
    const minimalPayload = {
      name: "Test College",
      shortName: "TC",
      categoryId: 1,
      degreeId: 1,
      ownership: "Private",
      collegeStatus: "Autonomous",
      affiliatedUniversity: "Anna University",
      address: "Test Address",
      city: "Test City",
      state: "Test State",
      aboutCollege: "Test about",
      academics: "Test academics",
      departments: ["CSE"],
      facilities: ["Library"],
      placementInfo: "Test placement",
      admissionInfo: "Test admission",
      phone: "9876543210",
      whatsapp: "9876543210",
      email: "test@college.com",
      website: "https://test.com",
      mapLink: "https://maps.google.com",
      logo: "https://example.com/logo.png",
      collegeImage: "https://example.com/college.png"
    };

    console.log("Testing with minimal payload:", minimalPayload);
    setError("");
    setSuccess("Testing...");

    try {
      setLoading(true);
      const response = await axios.post(COLLEGE_API, minimalPayload);
      console.log("Minimal test success:", response.data);
      setSuccess("Minimal payload test successful! " + JSON.stringify(response.data));
      await loadColleges();
    } catch (err) {
      console.error("Minimal test failed:", err.response?.data || err.message);
      setError(`Minimal test failed: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      ...emptyForm, // Reset first
      ...c,
      departments: Array.isArray(c.departments) ? c.departments.join(", ") : c.departments || "",
      facilities: Array.isArray(c.facilities) ? c.facilities.join(", ") : c.facilities || "",
    });
  };

  /* ================= REMOVE ================= */
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${COLLEGE_API}/${id}`);
      await loadColleges();
      setSuccess("College deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete college");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CANCEL EDIT ================= */
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  return (
    <div className="container mt-4">
      <h3>{editingId ? "Update College" : "Add College"}</h3>
      <p className="text-muted">Category ID: {categoryId} | Degree ID: {degreeId}</p>

      <div className="mb-3">
        <button 
          className="btn btn-info btn-sm me-2"
          onClick={testMinimalPayload}
          disabled={loading}
        >
          Test with Minimal Payload
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error Details:</strong> 
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', margin: '10px 0' }}>
            {error}
          </pre>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          <strong>Success!</strong> {success}
        </div>
      )}

      <form className="row g-3 mb-4" onSubmit={submit}>
        {/* Required Fields */}
        <div className="col-md-6">
          <label className="form-label">
            College Name <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="College Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Short Name <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="Short Name"
            value={form.shortName}
            onChange={(e) => setForm({ ...form, shortName: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            City <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            State <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          />
        </div>

        {/* Important fields that were missing */}
        <div className="col-md-6">
          <label className="form-label">Ownership *</label>
          <select
            className="form-control"
            value={form.ownership}
            onChange={(e) => setForm({ ...form, ownership: e.target.value })}
            required
          >
            <option value="">Select Ownership</option>
            <option value="Private">Private</option>
            <option value="Government">Government</option>
            <option value="Semi-Government">Semi-Government</option>
            <option value="Autonomous">Autonomous</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">College Status *</label>
          <select
            className="form-control"
            value={form.collegeStatus}
            onChange={(e) => setForm({ ...form, collegeStatus: e.target.value })}
            required
          >
            <option value="">Select Status</option>
            <option value="Autonomous">Autonomous</option>
            <option value="Affiliated">Affiliated</option>
            <option value="Deemed University">Deemed University</option>
            <option value="Private University">Private University</option>
            <option value="Government University">Government University</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Affiliated University *</label>
          <input
            className="form-control"
            placeholder="Affiliated University"
            value={form.affiliatedUniversity}
            onChange={(e) => setForm({ ...form, affiliatedUniversity: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Address *</label>
          <input
            className="form-control"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        {/* Other Fields */}
        <div className="col-md-6">
          <label className="form-label">Phone *</label>
          <input
            className="form-control"
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            pattern="[0-9]{10}"
            title="10 digit phone number"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">WhatsApp *</label>
          <input
            className="form-control"
            placeholder="WhatsApp (10 digits)"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            required
            pattern="[0-9]{10}"
            title="10 digit WhatsApp number"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email *</label>
          <input
            className="form-control"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Website *</label>
          <input
            className="form-control"
            placeholder="Website URL"
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Map Link *</label>
          <input
            className="form-control"
            placeholder="Map Link URL"
            type="url"
            value={form.mapLink}
            onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
            required
          />
        </div>

        {/* Text Areas */}
        {[
          { key: 'aboutCollege', label: 'About College *', rows: 3 },
          { key: 'academics', label: 'Academics *', rows: 3 },
          { key: 'departments', label: 'Departments * (comma-separated)', rows: 2 },
          { key: 'facilities', label: 'Facilities * (comma-separated)', rows: 2 },
          { key: 'placementInfo', label: 'Placement Information *', rows: 3 },
          { key: 'admissionInfo', label: 'Admission Information *', rows: 3 },
        ].map(({ key, label, rows }) => (
          <div className="col-md-12" key={key}>
            <label className="form-label">{label}</label>
            <textarea
              className="form-control"
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={rows}
              required
            />
          </div>
        ))}

        {/* File Uploads */}
        <div className="col-md-6">
          <label className="form-label">Logo URL *</label>
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Logo URL"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              required
            />
            <label className="input-group-text">
              <input 
                type="file" 
                className="d-none" 
                onChange={(e) => uploadImage(e, "logo")}
                accept="image/*"
              />
              Upload
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">College Image URL *</label>
          <div className="input-group">
            <input
              className="form-control"
              placeholder="College Image URL"
              value={form.collegeImage}
              onChange={(e) => setForm({ ...form, collegeImage: e.target.value })}
              required
            />
            <label className="input-group-text">
              <input
                type="file"
                className="d-none"
                onChange={(e) => uploadImage(e, "collegeImage")}
                accept="image/*"
              />
              Upload
            </label>
          </div>
        </div>

        <div className="col-md-12">
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                editingId ? "Update College" : "Add College"
              )}
            </button>
            {editingId && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={cancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <hr />

      <h4>Colleges List ({colleges.length})</h4>
      
      {loading && !editingId ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : colleges.length === 0 ? (
        <div className="alert alert-info">No colleges found for this degree</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Status</th>
                <th>City</th>
                <th>Phone</th>
                <th width="180">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c, index) => (
                <tr key={c.id}>
                  <td>{index + 1}</td>
                  <td>
                    {c.logo ? (
                      <img 
                        src={c.logo} 
                        alt="Logo" 
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                    ) : 'No logo'}
                  </td>
                  <td>{c.name}</td>
                  <td>{c.collegeStatus || 'N/A'}</td>
                  <td>{c.city}</td>
                  <td>{c.phone || '-'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => edit(c)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(c.id)}
                        disabled={loading}
                      >
                        Delete
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
  );
};

export default Colleges;