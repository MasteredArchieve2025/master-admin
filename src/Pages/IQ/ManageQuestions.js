import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Papa from "papaparse";

const BASE_URL = "https://master-backend-18ik.onrender.com/api";

const emptyQuestion = {
  question_text: "",
  question_type: "logical",
  difficulty: "medium",
  options: ["", "", "", ""],
  correct_answer: 0,
  explanation: "",
};

const ManageQuestions = () => {
  const { testId } = useParams();
  const fileRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuestion);

  // BULK STATES
  const [bulkQuestions, setBulkQuestions] = useState([]);
  const [showBulk, setShowBulk] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ================= FETCH QUESTIONS =================
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/iq/admin/tests/${testId}/questions`
      );
      setQuestions(res.data?.data?.questions || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ================= ADD / EDIT =================
  const openAdd = () => {
    setForm({ ...emptyQuestion });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (q) => {
    setForm({
      question_text: q.question_text || "",
      question_type: q.question_type || "logical",
      difficulty: q.difficulty || "medium",
      options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
      correct_answer:
        typeof q.correct_answer === "number" ? q.correct_answer : 0,
      explanation: q.explanation || "",
    });
    setEditingId(q.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.options];
      updated[index] = value;
      return { ...prev, options: updated };
    });
  };

  const saveQuestion = async () => {
    try {
      if (editingId) {
        await axios.put(
          `${BASE_URL}/iq/admin/questions/${editingId}`,
          form
        );
      } else {
        await axios.post(
          `${BASE_URL}/iq/admin/tests/${testId}/questions`,
          { questions: [form] }
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm({ ...emptyQuestion });
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await axios.delete(`${BASE_URL}/iq/admin/questions/${id}`);
    fetchQuestions();
  };

  // ================= BULK UPLOAD (CSV FIXED) =================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload CSV file only");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (res) => {
        console.log("RAW CSV DATA:", res.data);

        const rows = res.data.slice(1);

        const parsed = rows.map((row, index) => {
          const question = {
            question_text: row[0]?.toString().trim() || "",
            options: [
              row[1]?.toString().trim() || "",
              row[2]?.toString().trim() || "",
              row[3]?.toString().trim() || "",
              row[4]?.toString().trim() || "",
            ],
            correct_answer: parseInt(row[5]) || 0,
            question_type: row[6]?.toString().trim() || "logical",
            difficulty: row[7]?.toString().trim() || "medium",
            explanation: row[8]?.toString().trim() || "",
            isValid:
              row[0]?.toString().trim() &&
              row[1]?.toString().trim() &&
              row[2]?.toString().trim() &&
              row[3]?.toString().trim() &&
              row[4]?.toString().trim() &&
              row[5] !== undefined &&
              row[5] !== "" &&
              !isNaN(parseInt(row[5])),
          };

          console.log(`Row ${index}:`, question);
          return question;
        });

        setBulkQuestions(parsed);
        setShowBulk(true);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Error parsing CSV file");
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  };

  const handleBulkClose = () => {
    setShowBulk(false);
    setBulkQuestions([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveBulk = async () => {
    const valid = bulkQuestions.filter((q) => q.isValid);
    if (!valid.length) {
      alert("No valid rows");
      return;
    }

    try {
      setUploading(true);
      await axios.post(
        `${BASE_URL}/iq/admin/tests/${testId}/questions`,
        { questions: valid }
      );
      handleBulkClose();
      fetchQuestions();
      alert(`Successfully uploaded ${valid.length} questions`);
    } catch (err) {
      console.error("Bulk upload error:", err);
      alert("Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h3>Manage Questions</h3>
        <div className="d-flex gap-2">
          <label className="btn btn-outline-primary mb-0">
            Bulk Upload (CSV)
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleFile}
            />
          </label>
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Question
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Correct</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No questions added
                </td>
              </tr>
            ) : (
              questions.map((q, i) => (
                <tr key={q.id}>
                  <td>{i + 1}</td>
                  <td>{q.question_text}</td>
                  <td>{q.question_type}</td>
                  <td>{q.difficulty}</td>
                  <td>{["A", "B", "C", "D"][q.correct_answer]}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => openEdit(q)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteQuestion(q.id)}
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

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal show fade d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingId ? "Edit Question" : "Add Question"}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <textarea
                  className="form-control mb-2"
                  name="question_text"
                  placeholder="Question"
                  value={form.question_text}
                  onChange={handleChange}
                />

                <div className="row mb-2">
                  <div className="col">
                    <select
                      className="form-select"
                      name="question_type"
                      value={form.question_type}
                      onChange={handleChange}
                    >
                      <option value="numerical">Numerical</option>
                      <option value="verbal">Verbal</option>
                      <option value="logical">Logical</option>
                      <option value="spatial">Spatial</option>
                    </select>
                  </div>
                  <div className="col">
                    <select
                      className="form-select"
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {form.options.map((opt, i) => (
                  <input
                    key={i}
                    className="form-control mb-2"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                ))}

                <select
                  className="form-select mb-2"
                  value={form.correct_answer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      correct_answer: Number(e.target.value),
                    }))
                  }
                >
                  <option value={0}>Correct: A</option>
                  <option value={1}>Correct: B</option>
                  <option value={2}>Correct: C</option>
                  <option value={3}>Correct: D</option>
                </select>

                <textarea
                  className="form-control"
                  name="explanation"
                  placeholder="Explanation (optional)"
                  value={form.explanation}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveQuestion}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPLOAD PREVIEW MODAL */}
      {showBulk && (
        <div className="modal show fade d-block">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5>
                  Bulk Upload Preview (
                  {bulkQuestions.filter((q) => q.isValid).length} valid
                  questions)
                </h5>
                <button className="btn-close" onClick={handleBulkClose} />
              </div>

              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Option 1</th>
                      <th>Option 2</th>
                      <th>Option 3</th>
                      <th>Option 4</th>
                      <th>Correct</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkQuestions.map((q, i) => (
                      <tr key={i} className={q.isValid ? "" : "table-warning"}>
                        <td>{i + 1}</td>
                        <td>
                          {q.question_text || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {q.options[0] || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {q.options[1] || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {q.options[2] || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {q.options[3] || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {q.correct_answer + 1 || (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>{q.isValid ? "✅ Valid" : "❌ Invalid"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleBulkClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveBulk}
                  disabled={
                    uploading ||
                    bulkQuestions.filter((q) => q.isValid).length === 0
                  }
                >
                  {uploading
                    ? "Uploading..."
                    : `Upload ${bulkQuestions.filter((q) => q.isValid).length} Valid Questions`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;