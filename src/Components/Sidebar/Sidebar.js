import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaSchool,
  FaUniversity,
  FaBook,
  FaClipboardList,
  FaBrain,
  FaTools,
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

        <NavLink to="/dashboard">
          <FaClipboardList /> Dashboard
        </NavLink>

        <NavLink to="/advertisement">
          <FaTools /> Advertisement
        </NavLink>

        <NavLink to="/school">
          <FaSchool /> School
        </NavLink>

        <NavLink to="/college-categories">
          <FaUniversity /> College
        </NavLink>

        <NavLink to="/course-categories">
          <FaBook /> Course
        </NavLink>

        <NavLink to="/exam-categories">
          <FaLayerGroup /> Exam
        </NavLink>

        <NavLink to="/job-categories">
          <FaLayerGroup /> Jobs
        </NavLink>

        <NavLink to="/blogs">
          <FaClipboardList /> Blogs
        </NavLink>

        <NavLink to="/iq">
          <FaBrain /> IQ
        </NavLink>

        <NavLink to="/extra-skill-categories">
          <FaTools /> Extra Skill
        </NavLink>

      </nav>
    </div>
  );
};

export default Sidebar;