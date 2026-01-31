import { useState } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import axios from "axios";

const BASE_URL = "https://master-backend-18ik.onrender.com/api";

const BulkUploadQuestions = () => {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    alert("File selected: " + file.name);

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (res) => {
        console.log("RAW CSV:", res.data);

        const rows = res.data.slice(1);

        const mapped = rows.map((r) => ({
          question_text: r[0],
          options: [r[1], r[2], r[3], r[4]],
          correct_answer: Number(r[5]),
          question_type: "logical",
          difficulty: "medium",
          explanation: "",
        }));

        setQuestions(mapped);
      },
    });
  };

  const saveAll = async () => {
    if (!questions.length) {
      alert("No questions");
      return;
    }

    await axios.post(
      `${BASE_URL}/iq/admin/tests/${testId}/questions`,
      { questions }
    );

    alert("Uploaded successfully");
    setQuestions([]);
  };

  return (
    <div className="container-fluid">
      <h3>Bulk Upload Questions (CSV)</h3>

      <input
        type="file"
        accept=".csv"
        className="form-control mb-3"
        onChange={handleFileUpload}
      />

      {questions.length > 0 && (
        <>
          <table className="table table-bordered">
            <tbody>
              {questions.map((q, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{q.question_text}</td>
                  <td>{q.correct_answer}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-success" onClick={saveAll}>
            Save All
          </button>
        </>
      )}
    </div>
  );
};

export default BulkUploadQuestions;
