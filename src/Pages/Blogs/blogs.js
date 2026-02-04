import React, { useEffect, useState } from "react";
import axios from "axios";

export const BLOG_API =
  "https://master-backend-18ik.onrender.com/api/blogs";
export const UPLOAD_API =
  "https://master-backend-18ik.onrender.com/api/upload";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    type: "",
    category: "",
    image: "",
    mainImage: "",
    readTime: "",
    author: "",
    authorRole: "",
    authorBio: "",
    authorImage: "",
    publishStatus: "",
  });

  /* ================= LOAD BLOGS ================= */
  const getBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BLOG_API);
      setBlogs(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load blogs ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogs();
  }, []);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      setImageUploading(true);

      const res = await axios.post(UPLOAD_API, fd);

      const url =
        res.data?.url ||
        res.data?.fileUrl ||
        res.data?.data?.url ||
        res.data?.files?.[0]?.url;

      if (!url) throw new Error("No URL returned");

      setForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed ❌");
    } finally {
      setImageUploading(false);
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.type || !form.publishStatus) {
      alert("Title, Type & Publish Status are required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(`${BLOG_API}/${editingId}`, form);
        alert("Blog updated ✅");
      } else {
        await axios.post(BLOG_API, form);
        alert("Blog created ✅");
      }

      resetForm();
      getBlogs();
    } catch (err) {
      console.error(err);
      alert("Save failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      content: "",
      type: "",
      category: "",
      image: "",
      mainImage: "",
      readTime: "",
      author: "",
      authorRole: "",
      authorBio: "",
      authorImage: "",
      publishStatus: "",
    });
    setEditingId(null);
  };

  /* ================= EDIT ================= */
  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title || "",
      description: b.description || "",
      content: b.content || "",
      type: b.type || "",
      category: b.category || "",
      image: b.image || "",
      mainImage: b.mainImage || "",
      readTime: b.readTime || "",
      author: b.author || "",
      authorRole: b.authorRole || "",
      authorBio: b.authorBio || "",
      authorImage: b.authorImage || "",
      publishStatus: b.publishStatus || "",
    });
  };

  /* ================= DELETE ================= */
  const deleteBlog = async (id) => {
    if (!window.confirm("Delete this blog?")) return;

    try {
      await axios.delete(`${BLOG_API}/${id}`);
      alert("Blog deleted ✅");
      
      getBlogs();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Blogs & News</h3>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-6">
          <input className="form-control" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        </div>

        <div className="col-md-3">
          <select className="form-select" name="type" value={form.type} onChange={handleChange}>
            <option value="">Select Type</option>
            <option value="BLOG">BLOG</option>
            <option value="NEWS">NEWS</option>
          </select>
        </div>

        <div className="col-md-3">
          <select className="form-select" name="publishStatus" value={form.publishStatus} onChange={handleChange}>
            <option value="">Publish Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>

        <div className="col-md-6">
          <input className="form-control" name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <input className="form-control" name="readTime" placeholder="Read Time" value={form.readTime} onChange={handleChange} />
        </div>

        <div className="col-md-12">
          <textarea className="form-control" rows="2" name="description" placeholder="Short Description" value={form.description} onChange={handleChange} />
        </div>

        <div className="col-md-12">
          <textarea className="form-control" rows="4" name="content" placeholder="Full Content" value={form.content} onChange={handleChange} />
        </div>

        {/* THUMBNAIL IMAGE */}
        <div className="col-md-4">
          <label className="form-label fw-bold">
            Thumbnail Image
            <small className="text-muted d-block">
              Used in blog list & cards
            </small>
          </label>
          <input type="file" className="form-control" onChange={(e) => uploadImage(e, "image")} />
          {form.image && <img src={form.image} width="80" className="mt-2 border rounded" alt="" />}
        </div>

        {/* MAIN IMAGE */}
        <div className="col-md-4">
          <label className="form-label fw-bold">
            Main Banner Image
            <small className="text-muted d-block">
              Shown on blog detail page
            </small>
          </label>
          <input type="file" className="form-control" onChange={(e) => uploadImage(e, "mainImage")} />
          {form.mainImage && <img src={form.mainImage} width="80" className="mt-2 border rounded" alt="" />}
        </div>

        {/* AUTHOR IMAGE */}
        <div className="col-md-4">
          <label className="form-label fw-bold">
            Author Profile Image
            <small className="text-muted d-block">
              Shown near author name
            </small>
          </label>
          <input type="file" className="form-control" onChange={(e) => uploadImage(e, "authorImage")} />
          {form.authorImage && <img src={form.authorImage} width="80" className="mt-2 border rounded" alt="" />}
        </div>

        <div className="col-md-12">
          <input className="form-control" name="author" placeholder="Author Name" value={form.author} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <input className="form-control" name="authorRole" placeholder="Author Role" value={form.authorRole} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <input className="form-control" name="authorBio" placeholder="Author Bio" value={form.authorBio} onChange={handleChange} />
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary" disabled={loading || imageUploading}>
            {editingId ? "Update Blog" : "Add Blog"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th width="160">Action</th>
          </tr>
        </thead>
        <tbody>
          {blogs.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">No blogs found</td>
            </tr>
          )}

          {blogs.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.title}</td>
              <td>{b.type}</td>
              <td>{b.publishStatus}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(b)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteBlog(b.id)}>
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

export default Blogs;
