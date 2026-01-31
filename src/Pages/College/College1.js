import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SUB_API = "https://master-backend-18ik.onrender.com/api/college-subcategories/subcategory";
const UPLOAD_API = "https://master-backend-18ik.onrender.com/api/upload";

const College1 = () => {
  const { id } = useParams(); // categoryId
  const navigate = useNavigate();

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: ""
  });

  // ================= LOAD =================
  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(SUB_API);
      const filtered = res.data.data.filter(s => s.categoryId == id);
      setSubs(filtered);
    } catch (err) {
      alert("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [id]);

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

      setForm(prev => ({ ...prev, image: fileUrl }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      alert("Subcategory name required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(`${SUB_API}/${editingId}`, {
          ...form,
          categoryId: id
        });
        alert("Subcategory updated");
      } else {
        await axios.post(SUB_API, {
          ...form,
          categoryId: id
        });
        alert("Subcategory added");
      }

      setForm({ name: "", description: "", image: "" });
      setEditingId(null);
      loadSubcategories();
    } catch (err) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || "",
      image: s.image
    });
  };

  // ================= DELETE =================
  const deleteSub = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    await axios.delete(`${SUB_API}/${id}`);
    loadSubcategories();
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/college")}>
        ← Back to Categories
      </button>

      <h3>Sub Categories</h3>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Subcategory Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <input type="file" className="form-control" onChange={handleImageUpload} />
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

        {form.image && (
          <div className="col-md-12">
            <img src={form.image} width="100" alt="preview" />
          </div>
        )}

        <div className="col-md-12">
          <button className="btn btn-primary">
            {editingId ? "Update Subcategory" : "Add Subcategory"}
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
            {subs.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td><img src={s.image} width="50" /></td>
                <td>{s.name}</td>
                <td>{s.description}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(s)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteSub(s.id)}>
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

export default College1;
