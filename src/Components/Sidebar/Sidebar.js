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

        <NavLink to="/college">
          <FaUniversity /> College
        </NavLink>

        <NavLink to="/course">
          <FaBook /> Course
        </NavLink>

        <NavLink to="/exam">
          <FaClipboardList /> Exam
        </NavLink>

        <NavLink to="/blogs">
          <FaClipboardList /> Blogs
        </NavLink>

        <NavLink to="/iq">
          <FaBrain /> IQ
        </NavLink>

        <NavLink to="/extra-skill">
          <FaTools /> Extra Skill
        </NavLink>

        <NavLink to="/online-tutorials">
          <FaVideo /> Online Tutorials
        </NavLink>

        <NavLink to="/top-rated">
          <FaStar /> Top Rated
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
