import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { SKILL_TYPE_API, SKILL_CATEGORY_API, UPLOAD_API } from "../../api/api";

const SkillTypes = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    image: ""
  });

  const loadData = useCallback(async () => {
    try {
      const categoryRes = await axios.get(`${SKILL_CATEGORY_API}/${categoryId}`);
      setCategoryName(categoryRes.data.name);

      const res = await axios.get(`${SKILL_TYPE_API}/category/${categoryId}`);
      setList(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load skill types");
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      loadData();
    }
  }, [categoryId, loadData]);

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
      alert("Image uploaded!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Type name required");
    }

    try {
      const payload = {
        ...form,
        categoryId: Number(categoryId)
      };

      if (editingId) {
        await axios.put(`${SKILL_TYPE_API}/${editingId}`, payload);
      } else {
        await axios.post(SKILL_TYPE_API, payload);
      }

      reset();
      loadData();
      alert(editingId ? "Type updated!" : "Type added!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed");
    }
  };

  const edit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "",
      shortDescription: t.shortDescription || "",
      image: t.image || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this skill type?")) return;

    try {
      await axios.delete(`${SKILL_TYPE_API}/${id}`);
      loadData();
      alert("Deleted!");
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Skill Types</h3>
          <p className="text-muted mb-0">Category: <strong>{categoryName}</strong></p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate("/extra-skill-categories")}
        >
          ← Back to Categories
        </button>
      </div>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Skill Type Name *"
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
                id="typeImage"
                disabled={uploading}
              />
              <label htmlFor="typeImage" className="btn btn-outline-secondary mb-0">
                {uploading ? "..." : "Upload"}
              </label>
            </div>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" width="60" className="mt-2" />
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary" disabled={uploading}>
            {editingId ? "Update Type" : "Add Type"}
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
                No skill types found. Add your first type above.
              </td>
            </tr>
          )}

          {list.map((t) => (
            <tr key={t.id}>
              <td>
                {t.image ? (
                  <img src={t.image} width="40" alt={t.name} className="img-thumbnail" />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-cube text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <div>
                  <strong>{t.name}</strong>
                </div>
              </td>
              <td>{t.shortDescription || "-"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(t)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => remove(t.id)}
                >
                  Delete
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate(`/extra-skill-types/${t.id}/institutions`)}
                >
                  View Institutions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillTypes;