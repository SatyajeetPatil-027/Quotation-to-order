import { useState, useEffect } from "react";
import { API } from "../api";

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(API + "/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      return;
    }

    setMessage("Product added!");
    setForm({ name: "", price: "" });
    loadProducts();
  }

  return (
    <div>
      <h2>Products</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product name *" value={form.name} onChange={handleChange} />
        <input name="price" type="number" placeholder="Price *" value={form.price} onChange={handleChange} />
        <button type="submit">Add Product</button>
      </form>

      {message && <p className="message">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;