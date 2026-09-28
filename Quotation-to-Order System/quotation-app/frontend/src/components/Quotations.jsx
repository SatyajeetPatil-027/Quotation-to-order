import { useState, useEffect } from "react";
import { API } from "../api";

// One color for each status
const statusColors = {
  "Draft": "#6c757d",
  "Pending Approval": "#e67e22",
  "Approved": "#2e86de",
  "Sent": "#8e44ad",
  "Accepted": "#16a085",
  "Converted to Order": "#27ae60",
  "Rejected": "#c0392b",
};

function Quotations({ role }) {
  const [quotations, setQuotations] = useState([]);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Ask the server for the list of quotations
  async function loadQuotations() {
    const res = await fetch(API + "/quotations");
    const data = await res.json();
    setQuotations(data);
  }

  // Run once when this screen opens
  useEffect(() => {
    loadQuotations();
  }, []);

  // Called when any action button is clicked
  async function doAction(id, action) {
    const res = await fetch(API + "/quotations/" + id + "/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role }), // send the selected role
    });
    const data = await res.json();

    // Show the server's message (green if OK, red if error)
    setMessage({ text: data.message, isError: !res.ok });

    loadQuotations(); // refresh the table
  }

  return (
    <div>
      <h2>Quotations</h2>

      {message.text && (
        <p className={message.isError ? "message error" : "message"}>{message.text}</p>
      )}

      {quotations.length === 0 && <p>No quotations yet.</p>}

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Customer</th>
            <th>Discount</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={q.id}>
              <td>Q-{q.id}</td>
              <td>{q.customer_name}</td>
              <td>{Number(q.discount_percent)}%</td>
              <td>₹{Number(q.total_amount).toLocaleString("en-IN")}</td>
              <td>
                <span className="badge" style={{ background: statusColors[q.status] }}>
                  {q.status}
                </span>
              </td>
              <td>
                {q.status === "Draft" && (
                  <button onClick={() => doAction(q.id, "submit")}>Submit</button>
                )}

                {q.status === "Pending Approval" && role === "Manager" && (
                  <>
                    <button onClick={() => doAction(q.id, "approve")}>Approve</button>
                    <button onClick={() => doAction(q.id, "reject")}>Reject</button>
                  </>
                )}

                {q.status === "Pending Approval" && role !== "Manager" && (
                  <span className="waiting">Waiting for Manager</span>
                )}

                {q.status === "Approved" && (
                  <button onClick={() => doAction(q.id, "send")}>Send</button>
                )}

                {q.status === "Sent" && (
                  <>
                    <button onClick={() => doAction(q.id, "accept")}>Accept</button>
                    <button onClick={() => doAction(q.id, "reject")}>Reject</button>
                  </>
                )}

                {q.status === "Accepted" && (
                  <button onClick={() => doAction(q.id, "convert")}>Convert to Order</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Quotations;