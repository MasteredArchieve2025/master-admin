import { Routes, Route, Navigate } from "react-router-dom";

import IQQuestionsManagement from "./IQQuestionsManagement";
import ManageQuestions from "./ManageQuestions";
import BulkUploadQuestions from "./BulkUploadQuestions"; // 👈 THIS FILE
import ResultsTable from "./ResultsTable";

const IQCRM = () => {
  return (
    <Routes>
      {/* default */}
      <Route index element={<Navigate to="tests" />} />

      {/* TEST LIST */}
      <Route path="tests" element={<IQQuestionsManagement />} />

      {/* MANAGE QUESTIONS (THIS WAS MISSING / WRONG) */}
      <Route path="tests/:testId/questions" element={<ManageQuestions />} />

      <Route
        path="/iq/tests/:testId/bulk-upload"
        element={<BulkUploadQuestions />}
      />

      <Route path="results" element={<ResultsTable />} />
    </Routes>
  );
};

export default IQCRM;
