import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CATEGORY_API, UPLOAD_API } from "../../api/api";

const CollegeCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    categoryName: "",
    categoryImage: "",
    description: "",
  });

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      const res = await axios.get(CATEGORY_API);

      // ✅ handle all backend response formats
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.categories || [];

      setList(data);
    } catch (err) {
      console.error("Category load failed", err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd);
      const url =
        res.data?.url || res.data?.data?.url || res.data?.files?.[0]?.url;

      if (!url) throw new Error("No image URL");

      setForm((prev) => ({ ...prev, categoryImage: url }));
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Image upload failed");
    }
  };

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.categoryName.trim()) {
      return alert("Category name required");
    }

    try {
      if (editingId) {
        await axios.put(`${CATEGORY_API}/${editingId}`, form);
      } else {
        await axios.post(CATEGORY_API, form);
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed");
    }
  };

  /* ================= EDIT ================= */
  const edit = (c) => {
    setEditingId(c._id);
    setForm({
      categoryName: c.categoryName || "",
      categoryImage: c.categoryImage || "",
      description: c.description || "",
    });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${CATEGORY_API}/${id}`);
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const reset = () => {
    setForm({
      categoryName: "",
      categoryImage: "",
      description: "",
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>College Categories</h3>

      {/* ================= FORM ================= */}
      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Category Name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input type="file" className="form-control" onChange={uploadImage} />
          {form.categoryImage && (
            <img
              src={form.categoryImage}
              alt="category"
              width="60"
              className="mt-2"
            />
          )}
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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

      {/* ================= TABLE ================= */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th width="180">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No categories found
              </td>
            </tr>
          )}

          {list.map((c) => (
            <tr
              key={c._id || c.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/college-categories/${c._id || c.id}/degrees`)
              }
            >
              <td>
                {c.categoryImage && (
                  <img src={c.categoryImage} width="40" alt="category" />
                )}
              </td>
              <td>{c.categoryName}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(c._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CollegeCategories;
