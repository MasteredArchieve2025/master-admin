import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const BASE_URL = "https://master-backend-18ik.onrender.com/api";

const ResultsTable = () => {
  const [results, setResults] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [testId, setTestId] = useState("all");
  const [performance, setPerformance] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const [resultsRes, testsRes] = await Promise.all([
        axios.get(`${BASE_URL}/iq/admin/results`),
        axios.get(`${BASE_URL}/iq/admin/tests`)
      ]);

      setResults(resultsRes.data.data || []);
      setTests(testsRes.data.data || []);
    } catch (err) {
      console.error("RESULT FETCH ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTERED DATA =================
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (testId !== "all" && r.test_title !== testId) return false;
      if (performance !== "all" && r.performance_level !== performance)
        return false;

      if (search) {
        const s = search.toLowerCase();
        if (
          !r.user_name?.toLowerCase().includes(s) &&
          !r.user_email?.toLowerCase().includes(s)
        )
          return false;
      }

      return true;
    });
  }, [results, testId, performance, search]);

  // ================= ANALYTICS =================
  const analytics = useMemo(() => {
    if (!filteredResults.length) {
      return {
        attempts: 0,
        avgScore: 0,
        avgIQ: 0,
      };
    }

    const totalScore = filteredResults.reduce(
      (sum, r) => sum + r.total_score,
      0
    );
    const totalIQ = filteredResults.reduce(
      (sum, r) => sum + r.iq_score,
      0
    );

    return {
      attempts: filteredResults.length,
      avgScore: Math.round(totalScore / filteredResults.length),
      avgIQ: Math.round(totalIQ / filteredResults.length),
    };
  }, [filteredResults]);

  return (
    <div className="container-fluid">
      <h3 className="mb-4">IQ Test Results</h3>

      {/* ================= FILTER BAR ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <select
                className="form-select"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              >
                <option value="all">All Tests</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
              >
                <option value="all">All Performance</option>
                <option value="Exceptional">Exceptional</option>
                <option value="Excellent">Excellent</option>
                <option value="Above Average">Above Average</option>
                <option value="Average">Average</option>
                <option value="Below Average">Below Average</option>
              </select>
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search by user name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Attempts</h6>
              <h4>{analytics.attempts}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Average Score</h6>
              <h4>{analytics.avgScore}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Average IQ</h6>
              <h4>{analytics.avgIQ}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body p-0">
          {loading && <div className="p-4">Loading results...</div>}

          {!loading && (
            <table className="table table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>IQ</th>
                  <th>Performance</th>
                  <th>Time (sec)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No results found
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.user_name}</td>
                      <td>{r.user_email}</td>
                      <td>{r.test_title}</td>
                      <td>
                        {r.total_score}/{r.max_score}
                      </td>
                      <td>{r.iq_score}</td>
                      <td>
                        <span className="badge bg-info">
                          {r.performance_level}
                        </span>
                      </td>
                      <td>{r.time_taken}</td>
                      <td>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
