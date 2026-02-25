import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { DEGREE_API } from "../../api/api";

const Degrees = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [degrees, setDegrees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  /* ================= LOAD ================= */
  const loadDegrees = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(DEGREE_API);

      // Handle different response formats
      let allDegrees = [];
      if (Array.isArray(res.data)) {
        allDegrees = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        allDegrees = res.data.data;
      } else if (res.data?.degrees && Array.isArray(res.data.degrees)) {
        allDegrees = res.data.degrees;
      }

      // Filter by categoryId
      const filtered = allDegrees.filter(
        (d) => String(d.categoryId) === String(categoryId)
      );

      setDegrees(filtered);
    } catch (err) {
      console.error("Degree load failed", err);
      setError(err.response?.data?.message || "Failed to load degrees");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      loadDegrees();
    }
  }, [categoryId, loadDegrees]);

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      return setError("Degree name is required");
    }

    if (!categoryId) {
      return setError("Category ID is missing");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || "No description",
        categoryId: Number(categoryId),
      };

      let response;
      if (editingId) {
        // Make sure we're using the correct ID
        const id = editingId.id || editingId;
        response = await axios.put(`${DEGREE_API}/${id}`, payload);
      } else {
        response = await axios.post(DEGREE_API, payload);
      }

      console.log("Save response:", response.data);
      
      setSuccess(editingId ? "Degree updated successfully!" : "Degree added successfully!");
      reset();
      await loadDegrees();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save failed", err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       "Failed to save degree";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const edit = (degree) => {
    setEditingId(degree.id || degree._id);
    setForm({
      name: degree.name || "",
      description: degree.description || "",
    });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this degree?")) return;

    try {
      setLoading(true);
      setError("");
      
      await axios.delete(`${DEGREE_API}/${id}`);
      setSuccess("Degree deleted successfully!");
      await loadDegrees();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.message || "Failed to delete degree");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setError("");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Degrees Management</h3>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/college-categories')}
        >
          ← Back to Categories
        </button>
      </div>

      <div className="alert alert-info">
        <strong>Category ID:</strong> {categoryId}
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
          {editingId ? "Edit Degree" : "Add New Degree"}
        </div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Degree Name *</label>
                <input
                  className="form-control"
                  placeholder="e.g., B.E, B.Tech, B.Sc"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Description</label>
                <input
                  className="form-control"
                  placeholder="Brief description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={loading}
                />
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
                    editingId ? "Update Degree" : "Add Degree"
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
      <h4>Degrees List ({degrees.length})</h4>

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
                <th>Degree Name</th>
                <th>Description</th>
                <th>Category ID</th>
                <th width="200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {degrees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No degrees found for this category. Add your first degree above.
                  </td>
                </tr>
              ) : (
                degrees.map((degree, index) => (
                  <tr 
                    key={degree.id || degree._id || index}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const degreeId = degree.id || degree._id;
                      if (degreeId) {
                        navigate(`/degrees/${degreeId}/colleges`, {
                          state: {
                            categoryId: categoryId,
                            degreeId: degreeId,
                          },
                        });
                      }
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <strong>{degree.name}</strong>
                    </td>
                    <td>{degree.description || "-"}</td>
                    <td>
                      <span className="badge bg-info">{degree.categoryId}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => edit(degree)}
                        disabled={loading}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(degree.id || degree._id)}
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

export default Degrees;