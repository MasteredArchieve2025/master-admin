import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Advertisement from "./Pages/Advertisement/AdvertisementCRMPage";
import School from "./Pages/School/School";
import SchoolsDataEntry from "./Pages/School/SchoolsDataEntry";
import TuitionsDataEntry from "./Pages/School/TuitionsDataEntry";
import College from "./Pages/College/College";
import College1 from "./Pages/College/College1";
import Course from "./Pages/Course/Course";
import Exam from "./Pages/Exam/Exam";
import IQ from "./Pages/IQ/IQCRM";
import ExtraSkill from "./Pages/ExtraSkill/ExtraSkill";
import OnlineTutorials from "./Pages/OnlineTutorials/OnlineTutorials";
import TopRated from "./Pages/TopRated/TopRated";
import Blogs from "./Pages/Blogs/blogs";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DASHBOARD LAYOUT (Sidebar lives here) */}
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

          {/* Colleges */}
          <Route path="college" element={<College />} />
          <Route path="college/:id" element={<College1 />} />

          {/* Other Pages */}
          <Route path="course" element={<Course />} />
          <Route path="exam" element={<Exam />} />

          {/* IQ MODULE (IMPORTANT) */}
          <Route path="iq/*" element={<IQ />} />

          {/* BLOGS */}
          <Route path="blogs" element={<Blogs />} />

          {/* EXTRA SKILL AND ONLINE TUTORIALS */}  
          

          <Route path="extra-skill" element={<ExtraSkill />} />
          <Route path="online-tutorials" element={<OnlineTutorials />} />
          <Route path="top-rated" element={<TopRated />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
