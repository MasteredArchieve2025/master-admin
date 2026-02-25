import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CATEGORY_API, UPLOAD_API } from "../../api/api";

const CollegeCategories = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    categoryName: "",
    categoryImage: "",
    description: "",
  });

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(CATEGORY_API);

      // Handle different response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data?.categories && Array.isArray(res.data.categories)) {
        data = res.data.categories;
      }

      // Filter out items with placeholder images (optional)
      data = data.filter(item => !item.categoryImage?.includes('example.com'));
      
      setList(data);
    } catch (err) {
      console.error("Category load failed", err);
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e) => {
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

      // Handle different response formats
      const url = res.data?.url || 
                  res.data?.data?.url || 
                  res.data?.fileUrl || 
                  res.data?.path;

      if (!url) throw new Error("No image URL received from server");

      setForm((prev) => ({ ...prev, categoryImage: url }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Image upload failed", err);
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.categoryName.trim()) {
      return setError("Category name is required");
    }

    try {
      setLoading(true);
      let response;

      const payload = {
        categoryName: form.categoryName.trim(),
        description: form.description.trim() || "No description",
        categoryImage: form.categoryImage.trim() || "https://via.placeholder.com/150",
      };

      if (editingId) {
        // Make sure we're using the correct ID field
        const id = editingId.id || editingId;
        response = await axios.put(`${CATEGORY_API}/${id}`, payload);
      } else {
        response = await axios.post(CATEGORY_API, payload);
      }

      console.log("Save response:", response.data);
      
      setSuccess(editingId ? "Category updated successfully!" : "Category added successfully!");
      reset();
      await loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save failed", err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       "Failed to save category";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const edit = (category) => {
    // Store the entire category object or just the ID
    setEditingId(category.id || category._id);
    setForm({
      categoryName: category.categoryName || "",
      categoryImage: category.categoryImage || "",
      description: category.description || "",
    });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      setLoading(true);
      setError("");
      
      await axios.delete(`${CATEGORY_API}/${id}`);
      setSuccess("Category deleted successfully!");
      await loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({
      categoryName: "",
      categoryImage: "",
      description: "",
    });
    setEditingId(null);
    setError("");
  };

  // Navigate to degrees page - FIXED NAVIGATION
  const navigateToDegrees = (category) => {
    const id = category.id || category._id;
    if (id) {
      // This matches your route: "college-categories/:categoryId/degrees"
      navigate(`/college-categories/${id}/degrees`);
    }
  };

  return (
    <div className="container mt-4">
      <h3>College Categories</h3>
      
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
      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <label className="form-label">Category Name *</label>
          <input
            className="form-control"
            placeholder="Enter category name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Category Image</label>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              onChange={uploadImage}
              accept="image/*"
              disabled={loading}
            />
          </div>
          {form.categoryImage && (
            <div className="mt-2">
              <img
                src={form.categoryImage}
                alt="category preview"
                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
              />
              <small className="text-muted ms-2">Image uploaded</small>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">Description</label>
          <input
            className="form-control"
            placeholder="Enter description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="col-md-12">
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
              editingId ? "Update Category" : "Add Category"
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
      </form>

      {/* ================= TABLE ================= */}
      <h4>Categories List ({list.length})</h4>
      
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
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th width="200">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No categories found. Add your first category above.
                  </td>
                </tr>
              ) : (
                list.map((category, index) => (
                  <tr 
                    key={category.id || category._id || index}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigateToDegrees(category)}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {category.categoryImage ? (
                        <img 
                          src={category.categoryImage} 
                          width="40" 
                          height="40" 
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                          alt={category.categoryName}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>
                      <strong>{category.categoryName}</strong>
                    </td>
                    <td>{category.description || "-"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => edit(category)}
                        disabled={loading}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(category.id || category._id)}
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

export default CollegeCategories;