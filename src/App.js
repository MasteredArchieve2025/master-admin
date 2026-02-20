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

// 📝 EXAM MODULE
import ExamCategories from "./Pages/Exam/ExamCategories";
import ExamTypes from "./Pages/Exam/ExamTypes";
import ExamSelect from "./Pages/Exam/ExamSelect";
import ExamDetails from "./Pages/Exam/ExamDetails";
import Institutions from "./Pages/Exam/Institutions";

// 🎨 EXTRA SKILL MODULE (with correct file names)
import ExtraSkillCategories from "./Pages/ExtraSkill/ExtraSkillCategories";
import ExtraSkillTypes from "./Pages/ExtraSkill/ExtraSkillTypes";
import ExtraSkillInstitutions from "./Pages/ExtraSkill/ExtraSkillInstitutions";

// Course Module
import CourseCategories from "./Pages/Course/CourseCategories";
import CourseItems from "./Pages/Course/CourseItems";
import CourseProviders from "./Pages/Course/CourseProviders";

// Other Modules

import IQ from "./Pages/IQ/IQCRM";
import OnlineTutorials from "./Pages/OnlineTutorials/OnlineTutorials";
import TopRated from "./Pages/TopRated/TopRated";
import Blogs from "./Pages/Blogs/blogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>

          {/* ==========================
              DEFAULT ROUTE
             ========================== */}
          <Route index element={<Navigate to="/dashboard" />} />

          {/* ==========================
              DASHBOARD
             ========================== */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* ==========================
              ADVERTISEMENT
             ========================== */}
          <Route path="advertisement" element={<Advertisement />} />

          {/* ==========================
              SCHOOLS MODULE
             ========================== */}
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
              EXAM MODULE
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
              EXTRA SKILL MODULE
             ========================== */}
          {/* 1️⃣ Extra Skill Categories */}
          <Route path="extra-skill-categories" element={<ExtraSkillCategories />} />

          {/* 2️⃣ Extra Skill Types */}
          <Route
            path="extra-skill-categories/:categoryId/types"
            element={<ExtraSkillTypes />}
          />

          {/* 3️⃣ Extra Skill Institutions */}
          <Route
            path="extra-skill-types/:typeId/institutions"
            element={<ExtraSkillInstitutions />}
          />

          {/* ==========================
              COURSE MODULE
             ========================== */}
        
          <Route path="course-categories" element={<CourseCategories />} /> 
       
          <Route path="course-categories/:categoryId/items" element={<CourseItems />} />
              
          <Route path="course-items/:itemId/providers"  element={<CourseProviders />} />
            
           
         

          {/* ==========================
              IQ MODULE
             ========================== */}
          <Route path="iq/*" element={<IQ />} />

          {/* ==========================
              BLOGS MODULE
             ========================== */}
          <Route path="blogs" element={<Blogs />} />

          {/* ==========================
              OTHER MODULES
             ========================== */}
          <Route path="online-tutorials" element={<OnlineTutorials />} />
          <Route path="top-rated" element={<TopRated />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;