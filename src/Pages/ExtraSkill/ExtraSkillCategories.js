import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SKILL_CATEGORY_API, UPLOAD_API } from "../../api/api";

const SkillCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    image: ""
  });

  const loadData = async () => {
    try {
      const res = await axios.get(SKILL_CATEGORY_API);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setList(data);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load skill categories");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      setForm({ ...form, image: url });
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
        await axios.put(`${SKILL_CATEGORY_API}/${editingId}`, form);
      } else {
        await axios.post(SKILL_CATEGORY_API, form);
      }

      reset();
      loadData();
      alert(editingId ? "Category updated!" : "Category added!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      shortDescription: c.shortDescription || "",
      image: c.image || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${SKILL_CATEGORY_API}/${id}`);
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
      shortDescription: "",
      image: ""
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Skill Categories</h3>
      <p className="text-muted">e.g., Fine Arts, Programming, Sports, Music</p>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Category Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Short Description"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
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
                id="categoryImage"
                disabled={uploading}
              />
              <label htmlFor="categoryImage" className="btn btn-outline-secondary mb-0">
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
            <img src={form.image} alt="preview" width="60" className="mt-2" />
          )}
        </div>

        <div className="col-md-12">
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
            <th width="200">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No skill categories found. Add your first category above.
              </td>
            </tr>
          )}

          {list.map((c) => (
            <tr key={c.id}>
              <td>
                {c.image ? (
                  <img src={c.image} width="40" alt={c.name} className="img-thumbnail" />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-tag text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <div>
                  <strong>{c.name}</strong>
                </div>
              </td>
              <td>{c.shortDescription || "-"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => remove(c.id)}
                >
                  Delete
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => navigate(`/extra-skill-categories/${c.id}/types`)}
                >
                  View Types
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillCategories;