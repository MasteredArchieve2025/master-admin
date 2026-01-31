import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://master-backend-18ik.onrender.com/api";

const emptyForm = {
  title: "",
  description: "",
  instructions: "",
  total_questions: 30,
  time_limit: 45, // minutes (UI)
  points_per_question: 2,
  difficulty_level: "medium",
};

const IQQuestionsManagement = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTests();
  }, []);

  // ================= FETCH TESTS =================
  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${BASE_URL}/iq/admin/tests`);
      setTests(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load IQ tests");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN ADD MODAL =================
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  // ================= OPEN EDIT MODAL =================
  const openEditModal = (test) => {
    setForm({
      title: test.title,
      description: test.description || "",
      instructions: test.instructions || "",
      total_questions: test.total_questions,
      time_limit: test.time_limit / 60, // seconds → minutes
      points_per_question: test.points_per_question,
      difficulty_level: test.difficulty_level,
    });
    setEditingId(test.id);
    setShowModal(true);
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE TEST =================
  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        time_limit: Number(form.time_limit) * 60, // minutes → seconds
      };

      if (editingId) {
        await axios.put(
          `${BASE_URL}/iq/admin/tests/${editingId}`,
          payload
        );
      } else {
        await axios.post(`${BASE_URL}/iq/admin/tests`, payload);
      }

      setShowModal(false);
      fetchTests();
    } catch (err) {
      console.error(err);
      alert("Failed to save test");
    }
  };

  return (
    <div className="container-fluid">
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">IQ Questions Management</h3>

        <div className="d-flex gap-2">
          {/* RESULTS BUTTON */}
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/iq/results")}
          >
            Results
          </button>

          {/* ADD TEST BUTTON */}
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Test
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body p-0">
          {loading && <div className="p-4">Loading...</div>}

          {error && (
            <div className="alert alert-danger m-3">{error}</div>
          )}

          {!loading && !error && (
            <table className="table table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Time</th>
                  <th>Points</th>
                  <th style={{ width: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No IQ tests found
                    </td>
                  </tr>
                ) : (
                  tests.map((test, i) => (
                    <tr key={test.id}>
                      <td>{i + 1}</td>
                      <td>{test.title}</td>
                      <td className="text-capitalize">
                        {test.difficulty_level}
                      </td>
                      <td>{test.total_questions}</td>
                      <td>{test.time_limit / 60} mins</td>
                      <td>{test.points_per_question}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {/* MANAGE QUESTIONS */}
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              navigate(
                                `/iq/tests/${test.id}/questions`
                              )
                            }
                          >
                            Manage Questions
                          </button>

                          {/* EDIT TEST */}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openEditModal(test)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Edit IQ Test" : "Add IQ Test"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  name="title"
                  placeholder="Test Title"
                  value={form.title}
                  onChange={handleChange}
                />

                <textarea
                  className="form-control mb-2"
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                />

                <textarea
                  className="form-control mb-2"
                  name="instructions"
                  placeholder="Instructions"
                  value={form.instructions}
                  onChange={handleChange}
                />

                <div className="row">
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      name="total_questions"
                      placeholder="Total Questions"
                      value={form.total_questions}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      name="time_limit"
                      placeholder="Time (minutes)"
                      value={form.time_limit}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      name="points_per_question"
                      placeholder="Points per question"
                      value={form.points_per_question}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <select
                      className="form-select"
                      name="difficulty_level"
                      value={form.difficulty_level}
                      onChange={handleChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IQQuestionsManagement;
