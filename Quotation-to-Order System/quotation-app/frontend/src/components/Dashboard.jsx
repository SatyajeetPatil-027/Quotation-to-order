import { useState, useEffect } from "react";
import { API } from "../api";

// Same colors as the Quotations screen
const statusColors = {
  "Draft": "#6c757d",
  "Pending Approval": "#e67e22",
  "Approved": "#2e86de",
  "Sent": "#8e44ad",
  "Accepted": "#16a085",
  "Converted to Order": "#27ae60",
  "Rejected": "#c0392b",
};

function Dashboard() {
  const [data, setData] = useState(null); // null means "not loaded yet"

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch(API + "/dashboard");
      const result = await res.json();
      setData(result);
    }
    loadDashboard();
  }, []);

  // Show this until the data arrives
  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="cards">
        <div className="card big">
          <div className="card-number">
            ₹{data.totalOrderValue.toLocaleString("en-IN")}
          </div>
          <div className="card-label">Total Order Value</div>
        </div>

        <div className="card big">
          <div className="card-number">{data.totalOrders}</div>
          <div className="card-label">Total Orders</div>
        </div>

        <div className="card big">
          <div className="card-number">{data.totalQuotations}</div>
          <div className="card-label">Total Quotations</div>
        </div>
      </div>

      <h3>Quotations by Status</h3>

      <div className="cards">
        {Object.keys(data.statusCounts).map((status) => (
          <div
            className="card"
            key={status}
            style={{ borderTop: "4px solid " + statusColors[status] }}
          >
            <div className="card-number">{data.statusCounts[status]}</div>
            <div className="card-label">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;