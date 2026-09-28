import { useState, useEffect } from "react";
import { API } from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);

  // Ask the server for the list of orders
  useEffect(() => {
    async function loadOrders() {
      const res = await fetch(API + "/orders");
      const data = await res.json();
      setOrders(data);
    }
    loadOrders();
  }, []);

  return (
    <div>
      <h2>Orders</h2>

      {orders.length === 0 && (
        <p>No orders yet. Accept a quotation and click "Convert to Order".</p>
      )}

      <table>
        <thead>
          <tr>
            <th>Order No.</th>
            <th>From Quotation</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>O-{o.id}</td>
              <td>Q-{o.quotation_id}</td>
              <td>{o.customer_name}</td>
              <td>₹{Number(o.total_amount).toLocaleString("en-IN")}</td>
              <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;