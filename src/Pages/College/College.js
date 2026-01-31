import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CATEGORY_API = "https://master-backend-18ik.onrender.com/api/college-categories/category";
const UPLOAD_API = "https://master-backend-18ik.onrender.com/api/upload";

const College = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    categoryName: "",
    categoryImage: "",
    description: ""
  });

  // ================= LOAD =================
  const getCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data.data);
    } catch (err) {
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // ================= FORM =================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);

      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const fileUrl =
        res.data?.files?.[0]?.url ||
        res.data?.files?.[0] ||
        res.data?.url ||
        res.data?.fileUrl;

      if (!fileUrl) throw new Error("Upload failed");

      setForm((prev) => ({ ...prev, categoryImage: fileUrl }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryName) {
      alert("Category Name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(`${CATEGORY_API}/${editingId}`, form);
        alert("Category updated");
      } else {
        await axios.post(CATEGORY_API, form);
        alert("Category added");
      }

      setForm({ categoryName: "", categoryImage: "", description: "" });
      setEditingId(null);
      getCategories();
    } catch (err) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      categoryName: c.categoryName,
      categoryImage: c.categoryImage,
      description: c.description || ""
    });
  };

  // ================= DELETE =================
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await axios.delete(`${CATEGORY_API}/${id}`);
    getCategories();
  };

  return (
    <div className="container mt-4">
      <h3>College Categories</h3>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Category Name"
            name="categoryName"
            value={form.categoryName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <input
            type="file"
            className="form-control"
            onChange={handleImageUpload}
          />
          {imageUploading && <small>Uploading image...</small>}
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {form.categoryImage && (
          <div className="col-md-12">
            <img src={form.categoryImage} width="100" alt="preview" />
          </div>
        )}

        <div className="col-md-12">
          <button className="btn btn-primary">
            {editingId ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr
                key={c.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/college/${c.id}`)}
              >
                <td>{c.id}</td>
                <td>
                  <img src={c.categoryImage} width="50" />
                </td>
                <td>{c.categoryName}</td>
                <td>{c.description}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(c);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(c.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default College;
