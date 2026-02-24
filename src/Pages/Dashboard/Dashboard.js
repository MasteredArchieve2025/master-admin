import React from "react";

const cardStyle = {
  flex: 1,
  minWidth: 220,
  background: "#ffffff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const Dashboard = () => {
  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: "20px 40px",
          fontSize: 22,
          fontWeight: "bold",
          letterSpacing: 1,
        }}
      >
        Master Archieve – Dashboard
      </div>

      <div style={{ padding: 40 }}>

        {/* TOP CARDS */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={cardStyle}>
            <h3>Total Entries</h3>
            <h1>120</h1>
          </div>

          <div style={cardStyle}>
            <h3>Today Entries</h3>
            <h1>08</h1>
          </div>

          <div style={cardStyle}>
            <h3>Pending</h3>
            <h1>05</h1>
          </div>

          <div style={cardStyle}>
            <h3>Completed</h3>
            <h1>115</h1>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Quick Actions</h3>

          <div style={{ display: "flex", gap: 15, marginTop: 15, flexWrap: "wrap" }}>
            <button style={btn}>➕ New Entry</button>
            <button style={btn}>📂 View Entries</button>
            <button style={btn}>📊 Reports</button>
          </div>
        </div>

        {/* RECENT ENTRIES TABLE */}
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Recent Entries</h3>

          <table width="100%" style={{ marginTop: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>Date</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={td}>#001</td>
                <td style={td}>Document File</td>
                <td style={td}>24 Feb 2026</td>
                <td style={{ ...td, color: "green" }}>Completed</td>
              </tr>

              <tr>
                <td style={td}>#002</td>
                <td style={td}>User Records</td>
                <td style={td}>24 Feb 2026</td>
                <td style={{ ...td, color: "orange" }}>Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const btn = {
  padding: "12px 20px",
  borderRadius: 8,
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const th = { padding: 12 };
const td = { padding: 12, borderTop: "1px solid #eee" };

export default Dashboard;