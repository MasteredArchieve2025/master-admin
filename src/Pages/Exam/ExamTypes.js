import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { EXAM_TYPE_API, UPLOAD_API } from "../../api/api";

const ExamTypes = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    image: "",
  });

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(`${EXAM_TYPE_API}/category/${categoryId}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load exam types");
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) loadData();
  }, [categoryId, loadData]);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);

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
      setForm((prev) => ({ ...prev, image: url }));
      alert("Image uploaded!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Exam type name required");
    }

    try {
      const payload = { ...form, categoryId: Number(categoryId) };

      if (editingId) {
        await axios.put(`${EXAM_TYPE_API}/${editingId}`, payload);
      } else {
        await axios.post(EXAM_TYPE_API, payload);
      }

      reset();
      loadData();
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
      image: t.image || "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this exam type?")) return;

    try {
      await axios.delete(`${EXAM_TYPE_API}/${id}`);
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
      <h3>Exam Types</h3>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Exam Type Name"
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
            <img src={form.image} alt="type" width="60" className="mt-2" />
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary">
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
                No exam types found
              </td>
            </tr>
          )}

          {list.map((t) => (
            <tr key={t.id} style={{ cursor: "pointer" }}>
              <td>
                {t.image && <img src={t.image} width="40" alt="type" />}
              </td>
              <td>{t.name}</td>
              <td>{t.shortDescription}</td>
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
                  className="btn btn-info btn-sm"
                  onClick={() => navigate(`/exam-types/${t.id}/select`)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamTypes;