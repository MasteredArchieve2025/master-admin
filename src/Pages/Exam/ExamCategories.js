import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EXAM_CATEGORY_API, UPLOAD_API } from "../../api/api";

const ExamCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    image: "",
  });

  const loadData = async () => {
    try {
      const res = await axios.get(EXAM_CATEGORY_API);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file); // Use "file"

      const res = await axios.post(UPLOAD_API, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url =
        res.data?.url || 
        res.data?.imageUrl || 
        res.data?.data?.url || 
        res.data?.files?.[0]?.url ||
        res.data?.fileUrl;

      if (!url) throw new Error("No image URL");

      setForm({ ...form, image: url });
      alert("Image uploaded!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed: " + (err.response?.data?.message || "Check console"));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Category name required");
    }

    try {
      if (editingId) {
        await axios.put(`${EXAM_CATEGORY_API}/${editingId}`, form);
      } else {
        await axios.post(EXAM_CATEGORY_API, form);
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed");
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      shortDescription: c.shortDescription || "",
      image: c.image || "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${EXAM_CATEGORY_API}/${id}`);
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const reset = () => {
    setForm({
      name: "",
      shortDescription: "",
      image: "",
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Exam Categories</h3>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <input type="file" className="form-control" onChange={uploadImage} />
          {form.image && (
            <img src={form.image} alt="category" width="60" className="mt-2" />
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary">
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
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th width="180">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No categories found
              </td>
            </tr>
          )}

          {list.map((c) => (
            <tr key={c.id} style={{ cursor: "pointer" }}>
              <td>
                {c.image && (
                  <img src={c.image} width="40" alt="category" />
                )}
              </td>
              <td>{c.name}</td>
              <td>{c.shortDescription}</td>
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
                  onClick={() => navigate(`/exam-categories/${c.id}/types`)}
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

export default ExamCategories;