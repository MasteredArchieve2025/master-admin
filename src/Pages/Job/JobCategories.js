import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { JOB_CATEGORY_API, UPLOAD_API } from "../../api/api";

const JobCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: 1
  });

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(JOB_CATEGORY_API);
      // Handle both array response and object with data property
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setList(data);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load job categories");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadImage = async (e) => {
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

      const url = res.data?.url || res.data?.imageUrl || res.data?.data?.url || res.data?.files?.[0]?.url;
      if (!url) throw new Error("No image URL");

      setForm((prev) => ({ ...prev, image: url }));
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Category name required");
    }

    try {
      if (editingId) {
        await axios.put(`${JOB_CATEGORY_API}/${editingId}`, form);
      } else {
        await axios.post(JOB_CATEGORY_API, form);
      }

      reset();
      loadData();
      alert(editingId ? "Job category updated!" : "Job category added!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      description: c.description || "",
      image: c.image || "",
      sortOrder: c.sortOrder || 1
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${JOB_CATEGORY_API}/${id}`);
      loadData();
      alert("Deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const reset = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      sortOrder: 1
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Job Categories</h3>
      <p className="text-muted">e.g., IT & Software, Healthcare, Finance, Education</p>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Category Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Description (comma separated)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Sort Order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="col-md-4">
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <div className="position-relative">
              <input
                type="file"
                accept="image/*"
                className="position-absolute opacity-0 w-100 h-100"
                onChange={uploadImage}
                id="jobCategoryImage"
                disabled={uploading}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="jobCategoryImage" className="btn btn-outline-secondary mb-0">
                {uploading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Upload
                  </span>
                ) : "Upload"}
              </label>
            </div>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" width="60" height="60" className="mt-2 rounded" style={{ objectFit: 'cover' }} />
          )}
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={uploading}>
            {editingId ? "Update Category" : "Add Category"}
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
            <th>Description</th>
            <th width="80">Sort Order</th>
            <th width="250">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted py-4">
                No job categories found. Add your first category above.
              </td>
            </tr>
          )}

          {list.map((c) => (
            <tr key={c.id}>
              <td>
                {c.image ? (
                  <img 
                    src={c.image} 
                    width="40" 
                    height="40" 
                    alt={c.name} 
                    className="img-thumbnail rounded"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-briefcase text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <strong>{c.name}</strong>
              </td>
              <td>{c.description || "-"}</td>
              <td className="text-center">{c.sortOrder || "-"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(c)}
                >
                  <i className="fas fa-edit me-1"></i>Edit
                </button>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => remove(c.id)}
                >
                  <i className="fas fa-trash me-1"></i>Delete
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => navigate(`/job-categories/${c.id}/details`)}
                >
                  <i className="fas fa-list me-1"></i>View Jobs
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobCategories;