import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamSelect = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Select Option</h3>

      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Exam Details</h5>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/exam-types/${typeId}/details`)}
              >
                Manage Details
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Institutions</h5>
              <button
                className="btn btn-success"
                onClick={() => navigate(`/exam-types/${typeId}/institutions`)}
              >
                Manage Institutions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSelect;