import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { DEGREE_API } from "../../api/api";

const Degrees = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [degrees, setDegrees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    categoryId,
    description: "",
  });

  /* ================= LOAD ================= */
  const loadDegrees = async () => {
    try {
      const res = await axios.get(DEGREE_API);

      const allDegrees = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.degrees || [];

      // ✅ filter by categoryId (frontend)
      const filtered = allDegrees.filter(
        (d) => String(d.categoryId) === String(categoryId)
      );

      setDegrees(filtered);
      setError("");
    } catch (err) {
      console.error("Degree load failed", err);
      setError("Failed to load degrees");
    }
  };

  useEffect(() => {
    if (categoryId) loadDegrees();
  }, [categoryId]);

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Degree name required");
    }

    try {
      if (editingId) {
        await axios.put(`${DEGREE_API}/${editingId}`, form);
      } else {
        await axios.post(DEGREE_API, form);
      }

      reset();
      loadDegrees();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed");
    }
  };

  /* ================= EDIT ================= */
  const edit = (d) => {
    setEditingId(d.id || d._id);
    setForm({
      name: d.name || "",
      categoryId,
      description: d.description || "",
    });
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Delete degree?")) return;

    try {
      await axios.delete(`${DEGREE_API}/${id}`);
      loadDegrees();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const reset = () => {
    setForm({ name: "", categoryId, description: "" });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Degrees</h3>

      {error && <p className="text-danger">{error}</p>}

      {/* ================= FORM ================= */}
      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Degree Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary">
            {editingId ? "Update Degree" : "Add Degree"}
          </button>
        </div>
      </form>

      {/* ================= TABLE ================= */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Degree</th>
            <th width="180">Action</th>
          </tr>
        </thead>
        <tbody>
          {degrees.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center text-muted">
                No degrees found for this category
              </td>
            </tr>
          )}

          {degrees.map((d) => (
            <tr
              key={d.id || d._id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/degrees/${d.id || d._id}/colleges`, {
                  state: {
                    categoryId: categoryId,
                    degreeId: d.id || d._id,
                  },
                })
              }
            >
              <td>{d.name}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(d)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(d.id || d._id)}
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

export default Degrees;
