import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./layouts/DashboardLayout";

// Dashboard
import Dashboard from "./Pages/Dashboard/Dashboard";

// Advertisement
import Advertisement from "./Pages/Advertisement/AdvertisementCRMPage";

// Schools
import School from "./Pages/School/School";
import SchoolsDataEntry from "./Pages/School/SchoolsDataEntry";
import TuitionsDataEntry from "./Pages/School/TuitionsDataEntry";

// 🎓 COLLEGE MODULE
import CollegeCategories from "./Pages/College/CollegeCategory";
import Degree from "./Pages/College/Degree";
import CollegeDetails from "./Pages/College/CollegeDetails";

// 📝 EXAM MODULE (NEW)
import ExamCategories from "./Pages/Exam/ExamCategories";
import ExamTypes from "./Pages/Exam/ExamTypes";
import ExamSelect from "./Pages/Exam/ExamSelect";
import ExamDetails from "./Pages/Exam/ExamDetails";
import Institutions from "./Pages/Exam/Institutions";

// Other Modules
import Course from "./Pages/Course/Course";
import IQ from "./Pages/IQ/IQCRM";
import ExtraSkill from "./Pages/ExtraSkill/ExtraSkill";
import OnlineTutorials from "./Pages/OnlineTutorials/OnlineTutorials";
import TopRated from "./Pages/TopRated/TopRated";
import Blogs from "./Pages/Blogs/blogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>

          {/* Default */}
          <Route index element={<Navigate to="/dashboard" />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Advertisement */}
          <Route path="advertisement" element={<Advertisement />} />

          {/* Schools */}
          <Route path="school" element={<School />} />
          <Route path="schools-data" element={<SchoolsDataEntry />} />
          <Route path="tuitions-data" element={<TuitionsDataEntry />} />

          {/* ==========================
              COLLEGE MODULE
             ========================== */}

          <Route path="college-categories" element={<CollegeCategories />} />
          <Route
            path="college-categories/:categoryId/degrees"
            element={<Degree />}
          />
          <Route
            path="degrees/:degreeId/colleges"
            element={<CollegeDetails />}
          />

          {/* ==========================
              EXAM MODULE (NEW)
             ========================== */}

          {/* 1️⃣ Exam Categories */}
          <Route path="exam-categories" element={<ExamCategories />} />

          {/* 2️⃣ Exam Types */}
          <Route
            path="exam-categories/:categoryId/types"
            element={<ExamTypes />}
          />

          {/* 3️⃣ Select Page */}
          <Route
            path="exam-types/:typeId/select"
            element={<ExamSelect />}
          />

          {/* 4️⃣ Exam Details */}
          <Route
            path="exam-types/:typeId/details"
            element={<ExamDetails />}
          />

          {/* 5️⃣ Institutions */}
          <Route
            path="exam-types/:typeId/institutions"
            element={<Institutions />}
          />

          {/* ==========================
              OTHER MODULES
             ========================== */}

          <Route path="course" element={<Course />} />

          {/* IQ MODULE */}
          <Route path="iq/*" element={<IQ />} />

          {/* BLOGS */}
          <Route path="blogs" element={<Blogs />} />

          <Route path="extra-skill" element={<ExtraSkill />} />
          <Route path="online-tutorials" element={<OnlineTutorials />} />
          <Route path="top-rated" element={<TopRated />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
