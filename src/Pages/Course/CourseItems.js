import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  COURSE_ITEM_API,
  COURSE_CATEGORY_API,
  UPLOAD_API,
} from "../../api/api";

const S3_BASE = "https://master-education-images.s3.amazonaws.com/";

const CourseItems = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [form, setForm] = useState({
    name: "",
    image: "",
    description: "",
    sortOrder: "",
  });

  /* ================= LOAD DATA ================= */
  const loadData = useCallback(async () => {
    try {
      // Load category name
      try {
        const catRes = await axios.get(`${COURSE_CATEGORY_API}/${categoryId}`);
        console.log("Category response:", catRes.data);
        
        // Handle different response structures for category
        let categoryData = null;
        if (catRes.data?.data) {
          categoryData = catRes.data.data;
        } else if (catRes.data) {
          categoryData = catRes.data;
        }
        
        setCategoryName(categoryData?.name || "Category");
      } catch (err) {
        console.error("Failed to load category:", err);
        setCategoryName("Category");
      }

      // Load course items
      const res = await axios.get(`${COURSE_ITEM_API}/by-category/${categoryId}`);
      console.log("Items response:", res.data);
      
      // Handle different response structures for items
      let itemsData = [];
      if (Array.isArray(res.data)) {
        itemsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        itemsData = res.data.items;
      }
      
      setList(itemsData);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load course items: " + (err.response?.data?.message || err.message));
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) loadData();
  }, [categoryId, loadData]);

  /* ================= IMAGE URL HELPER ================= */
  const getFullImageUrl = (image) => {
    if (!image) return null;
    // If it's already a full URL, return as is
    if (image.startsWith('http')) return image;
    // Otherwise, prepend the S3 base URL
    return `${S3_BASE}${image}`;
  };

  /* ================= IMAGE UPLOAD ================= */
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

      // Store the full URL in the form
      setForm((prev) => ({ ...prev, image: url }));
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Item name is required");
    }

    try {
      const payload = {
        name: form.name.trim(),
        categoryId: Number(categoryId),
        image: form.image || null,
        description: form.description || null,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      };

      console.log("Saving payload:", payload);

      if (editingId) {
        await axios.put(`${COURSE_ITEM_API}/${editingId}`, payload);
        alert("Item updated successfully!");
      } else {
        await axios.post(COURSE_ITEM_API, payload);
        alert("Item added successfully!");
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  /* ================= EDIT ================= */
  const edit = (item) => {
    console.log("Editing item:", item);
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      // Store the full URL in the form when editing
      image: getFullImageUrl(item.image) || "",
      description: item.description || "",
      sortOrder: item.sortOrder || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${COURSE_ITEM_API}/${id}`);
      loadData();
      alert("Item deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  /* ================= RESET ================= */
  const reset = () => {
    setForm({
      name: "",
      image: "",
      description: "",
      sortOrder: "",
    });
    setEditingId(null);
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Course Items</h3>
          <p className="text-muted mb-0">
            Category: <strong>{categoryName}</strong>
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/course-categories")}
        >
          ← Back to Categories
        </button>
      </div>

      {/* FORM */}
      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Item Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Sort Order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>

        <div className="col-md-3">
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
                id="itemImage"
                disabled={uploading}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="itemImage" className="btn btn-outline-secondary mb-0" style={{ minWidth: '80px' }}>
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
            <img 
              src={form.image} 
              alt="preview" 
              width="60" 
              className="mt-2 img-thumbnail"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/60?text=Error';
              }}
            />
          )}
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={uploading}>
            {editingId ? "Update Item" : "Add Item"}
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

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th width="80">Image</th>
            <th>Name</th>
            <th>Description</th>
            <th width="80">Sort</th>
            <th width="280">Actions</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No items found. Add your first item above.
              </td>
            </tr>
          ) : (
            list.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img 
                      src={getFullImageUrl(item.image)} 
                      width="40" 
                      height="40" 
                      alt={item.name} 
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
                      <i className="fas fa-file text-muted"></i>
                    </div>
                  )}
                </td>
                <td>
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td>{item.description || "-"}</td>
                <td>
                  <span className="badge bg-secondary">
                    {item.sortOrder || 0}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => edit(item)}
                    title="Edit Item"
                    style={{ minWidth: "60px" }}
                  >
                    <i className="fas fa-edit me-1"></i> Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => remove(item.id)}
                    title="Delete Item"
                    style={{ minWidth: "70px" }}
                  >
                    <i className="fas fa-trash me-1"></i> Delete
                  </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/course-items/${item.id}/providers`)}
                    title="View Providers"
                    style={{ minWidth: "70px" }}
                  >
                    <i className="fas fa-users me-1"></i> Providers
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseItems;