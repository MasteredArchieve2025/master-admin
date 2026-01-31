import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#f5f6fa",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
