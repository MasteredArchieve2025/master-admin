import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaSchool,
  FaUniversity,
  FaBook,
  FaClipboardList,
  FaBrain,
  FaTools,
  FaVideo,
  FaStar,
  FaLayerGroup,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Master Archive
      </div>

      <nav className="sidebar-menu">

        {/* Dashboard */}
        <NavLink to="/dashboard">
          <FaClipboardList /> Dashboard
        </NavLink>

        {/* Advertisement */}
        <NavLink to="/advertisement">
          <FaTools /> Advertisement
        </NavLink>

        {/* School */}
        <NavLink to="/school">
          <FaSchool /> School
        </NavLink>

        {/* College Module */}
        <NavLink to="/college-categories">
          <FaUniversity /> College
        </NavLink>

        {/* Course */}
        <NavLink to="/course">
          <FaBook /> Course
        </NavLink>

        {/* ✅ UPDATED EXAM MODULE */}
        <NavLink to="/exam-categories">
          <FaLayerGroup /> Exam
        </NavLink>

        {/* Blogs */}
        <NavLink to="/blogs">
          <FaClipboardList /> Blogs
        </NavLink>

        {/* IQ */}
        <NavLink to="/iq">
          <FaBrain /> IQ
        </NavLink>

        {/* Extra Skill */}
        <NavLink to="/extra-skill">
          <FaTools /> Extra Skill
        </NavLink>

        {/* Online Tutorials */}
        <NavLink to="/online-tutorials">
          <FaVideo /> Online Tutorials
        </NavLink>

        {/* Top Rated */}
        <NavLink to="/top-rated">
          <FaStar /> Top Rated
        </NavLink>

      </nav>
    </div>
  );
};

export default Sidebar;
