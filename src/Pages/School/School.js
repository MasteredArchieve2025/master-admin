import React from "react";
import { useNavigate } from "react-router-dom";

const School = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4 fw-bold">
        Education Management
      </h3>

      <div className="row justify-content-center">

        {/* VIEW SCHOOLS */}
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="display-4 text-primary mb-3">
                <i className="fas fa-school"></i>
              </div>

              <h5 className="fw-bold mb-2">View Schools</h5>
              <p className="text-muted mb-4">
                Manage all schools data
              </p>

              <button
                className="btn btn-primary mt-auto"
                onClick={() => navigate("/schools-data")}
              >
                View Schools
              </button>
            </div>
          </div>
        </div>

        {/* VIEW TUITIONS */}
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="display-4 text-success mb-3">
                <i className="fas fa-book"></i>
              </div>

              <h5 className="fw-bold mb-2">View Tuitions</h5>
              <p className="text-muted mb-4">
                Manage all tuition centers
              </p>

              <button
                className="btn btn-success mt-auto"
                onClick={() => navigate("/tuitions-data")}
              >
                View Tuitions
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default School;
