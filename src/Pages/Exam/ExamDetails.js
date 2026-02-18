import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { EXAM_DETAILS_API, UPLOAD_API } from "../../api/api";

const ExamDetails = () => {
  const { typeId } = useParams();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    board: "",
    year: "",
    duration: "",
    totalMarks: "",
    subjects: "",
    detailedSyllabus: "",
    examPatternDuration: "",
    examPatternTotalMarks: "",
    examPatternPassingMark: "",
    questionTypes: "",
    importantDates: "",
    image: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(EXAM_DETAILS_API);
      const allData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const filtered = allData.filter(item => item.typeId === Number(typeId));
      setList(filtered);
    } catch (err) {
      console.error("Load failed", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [typeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      return alert("Exam name required");
    }

    try {
      const payload = {
        typeId: Number(typeId),
        name: form.name,
        shortDescription: form.shortDescription,
        board: form.board,
        year: form.year,
        duration: form.duration,
        totalMarks: Number(form.totalMarks) || 0,
        subjects: form.subjects.split(",").map(s => s.trim()).filter(s => s),
        detailedSyllabus: form.detailedSyllabus,
        examPattern: {
          duration: form.examPatternDuration,
          totalMarks: Number(form.examPatternTotalMarks) || 0,
          passingMark: Number(form.examPatternPassingMark) || 0
        },
        questionTypes: form.questionTypes.split(",").map(q => q.trim()).filter(q => q),
        importantDates: form.importantDates,
        image: form.image
      };

      if (editingId) {
        await axios.put(`${EXAM_DETAILS_API}/${editingId}`, payload);
      } else {
        await axios.post(EXAM_DETAILS_API, payload);
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (d) => {
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      shortDescription: d.shortDescription || "",
      board: d.board || "",
      year: d.year || "",
      duration: d.duration || "",
      totalMarks: d.totalMarks || "",
      subjects: Array.isArray(d.subjects) ? d.subjects.join(", ") : (d.subjects || ""),
      detailedSyllabus: d.detailedSyllabus || "",
      examPatternDuration: d.examPattern?.duration || "",
      examPatternTotalMarks: d.examPattern?.totalMarks || "",
      examPatternPassingMark: d.examPattern?.passingMark || "",
      questionTypes: Array.isArray(d.questionTypes) ? d.questionTypes.join(", ") : (d.questionTypes || ""),
      importantDates: d.importantDates || "",
      image: d.image || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this exam detail?")) return;

    try {
      await axios.delete(`${EXAM_DETAILS_API}/${id}`);
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
      board: "",
      year: "",
      duration: "",
      totalMarks: "",
      subjects: "",
      detailedSyllabus: "",
      examPatternDuration: "",
      examPatternTotalMarks: "",
      examPatternPassingMark: "",
      questionTypes: "",
      importantDates: "",
      image: ""
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Exam Details</h3>

      <form className="row g-3 mb-4" onSubmit={submit}>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Exam Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Board/Authority"
            value={form.board}
            onChange={(e) => setForm({ ...form, board: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            type="number"
            className="form-control"
            placeholder="Total Marks"
            value={form.totalMarks}
            onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Subjects (comma separated)"
            value={form.subjects}
            onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Question Types (comma separated)"
            value={form.questionTypes}
            onChange={(e) => setForm({ ...form, questionTypes: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Exam Pattern Duration"
            value={form.examPatternDuration}
            onChange={(e) => setForm({ ...form, examPatternDuration: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            type="number"
            className="form-control"
            placeholder="Pattern Total Marks"
            value={form.examPatternTotalMarks}
            onChange={(e) => setForm({ ...form, examPatternTotalMarks: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            type="number"
            className="form-control"
            placeholder="Passing Marks"
            value={form.examPatternPassingMark}
            onChange={(e) => setForm({ ...form, examPatternPassingMark: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <input
            className="form-control"
            placeholder="Short Description"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <textarea
            className="form-control"
            placeholder="Detailed Syllabus"
            rows="3"
            value={form.detailedSyllabus}
            onChange={(e) => setForm({ ...form, detailedSyllabus: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <textarea
            className="form-control"
            placeholder="Important Dates"
            rows="2"
            value={form.importantDates}
            onChange={(e) => setForm({ ...form, importantDates: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <div className="row">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <input type="file" className="form-control" onChange={uploadImage} />
            </div>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" width="80" className="mt-2" />
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary">
            {editingId ? "Update Details" : "Add Details"}
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

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading exam details...</p>
        </div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th width="80">Image</th>
              <th>Name</th>
              <th>Board</th>
              <th>Year</th>
              <th>Total Marks</th>
              <th width="120">Action</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No exam details found. Add your first exam detail above.
                </td>
              </tr>
            ) : (
              list.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.image && <img src={d.image} width="40" alt="exam" />}
                  </td>
                  <td>{d.name}</td>
                  <td>{d.board}</td>
                  <td>{d.year}</td>
                  <td>{d.totalMarks}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => edit(d)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(d.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExamDetails;