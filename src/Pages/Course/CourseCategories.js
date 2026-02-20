import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { COURSE_CATEGORY_API, UPLOAD_API } from "../../api/api";

const CourseCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: ""
  });

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(COURSE_CATEGORY_API);
      console.log("Categories response:", res.data);
      
      // Handle different response structures
      let categoriesData = [];
      if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (res.data?.categories && Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      }
      
      setList(categoriesData);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load categories: " + (err.response?.data?.message || err.message));
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

      console.log("Upload response:", res.data);

      // Handle upload response
      let url = null;
      if (res.data?.success && res.data?.data?.url) {
        url = res.data.data.url;
      } else if (res.data?.url) {
        url = res.data.url;
      } else if (res.data?.data?.url) {
        url = res.data.data.url;
      }

      if (!url) throw new Error("No image URL");

      setForm((prev) => ({ ...prev, image: url }));
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Category name is required");
    }

    try {
      const payload = {
        name: form.name.trim(),
        image: form.image || null,
        description: form.description || null,
      };

      console.log("Saving payload:", payload);

      if (editingId) {
        await axios.put(`${COURSE_CATEGORY_API}/${editingId}`, payload);
        alert("Category updated successfully!");
      } else {
        await axios.post(COURSE_CATEGORY_API, payload);
        alert("Category added successfully!");
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (c) => {
    console.log("Editing category:", c);
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      description: c.description || "",
      image: c.image || ""
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`${COURSE_CATEGORY_API}/${id}`);
      loadData();
      alert("Category deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const reset = () => {
    setForm({
      name: "",
      description: "",
      image: "",
    });
    setEditingId(null);
  };

  const handleViewItems = (categoryId) => {
    console.log("Navigating to items for category:", categoryId);
    navigate(`/course-categories/${categoryId}/items`);
  };

  return (
    <div className="container mt-4">
      <h3>Course Categories</h3>
      <p className="text-muted">e.g., Web Development, Data Science, Digital Marketing, Design</p>

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
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="categoryImage" className="btn btn-outline-secondary mb-0" style={{ minWidth: '80px' }}>
                {uploading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    ...
                  </span>
                ) : "Upload"}
              </label>
            </div>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" width="60" className="mt-2 img-thumbnail" />
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
            <th width="280">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No course categories found. Add your first category above.
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
                    className="img-thumbnail"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=Error';
                    }}
                  />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                       style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-book text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <div>
                  <strong>{c.name}</strong>
                </div>
              </td>
              <td>{c.description || "-"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(c)}
                  title="Edit Category"
                  style={{ minWidth: "60px" }}
                >
                  <i className="fas fa-edit me-1"></i> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => remove(c.id)}
                  title="Delete Category"
                  style={{ minWidth: "70px" }}
                >
                  <i className="fas fa-trash me-1"></i> Delete
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleViewItems(c.id)}
                  title="View Course Items"
                  style={{ minWidth: "70px" }}
                >
                  <i className="fas fa-list me-1"></i> Items
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseCategories;