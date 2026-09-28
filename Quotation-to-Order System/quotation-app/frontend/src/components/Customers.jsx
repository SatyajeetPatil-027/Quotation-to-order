import { useState, useEffect } from "react";
import { API } from "../api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  // Ask the server for the list of customers
  async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();
    setCustomers(data);
  }

  // Run once when this screen opens
  useEffect(() => {
    loadCustomers();
  }, []);

  // Runs every time the user types in any box
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Runs when the user clicks "Add Customer"
  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing

    const res = await fetch(API + "/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message); // show the server's error
      return;
    }

    setMessage("Customer added!");
    setForm({ name: "", company: "", email: "", phone: "" }); // clear the boxes
    loadCustomers(); // refresh the table
  }

  return (
    <div>
      <h2>Customers</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name *" value={form.name} onChange={handleChange} />
        <input name="company" placeholder="Company" value={form.company} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <button type="submit">Add Customer</button>
      </form>

      {message && <p className="message">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.company}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;