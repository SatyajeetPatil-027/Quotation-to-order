import { useState, useEffect } from "react";
import { API } from "../api";

function NewQuotation({ role, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Load customers and products for the dropdowns
  useEffect(() => {
    async function loadData() {
      const custRes = await fetch(API + "/customers");
      setCustomers(await custRes.json());

      const prodRes = await fetch(API + "/products");
      setProducts(await prodRes.json());
    }
    loadData();
  }, []);

  // ----- Working with the list of product lines -----
  function addItem() {
    setItems([...items, { product_id: "", quantity: 1 }]);
  }

  function removeItem(index) {
    setItems(items.filter((item, i) => i !== index));
  }

  function changeItem(index, field, value) {
    const newItems = [...items];                            // 1. Copy
    newItems[index] = { ...newItems[index], [field]: value }; // 2. Change
    setItems(newItems);                                     // 3. Set
  }

  // ----- Live calculation (just a preview) -----
  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === Number(item.product_id));
    if (product) {
      subtotal = subtotal + Number(product.price) * Number(item.quantity || 0);
    }
  }
  const discountAmount = (subtotal * Number(discount || 0)) / 100;
  const total = subtotal - discountAmount;
  const needsApproval = Number(discount) > 10;

  // ----- Save -----
  async function handleSave() {
    if (!customerId) {
      setMessage({ text: "Please select a customer", isError: true });
      return;
    }
    for (const item of items) {
      if (!item.product_id) {
        setMessage({ text: "Please select a product for every line", isError: true });
        return;
      }
    }

    const res = await fetch(API + "/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        discount_percent: Number(discount) || 0,
        created_by: role,
        items: items,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage({ text: data.message, isError: true });
      return;
    }

    onSaved(); // go back to the Quotations list
  }

  return (
    <div>
      <h2>New Quotation</h2>

      <div className="form-row">
        <label>Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">-- Select customer --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.company ? " - " + c.company : ""}
            </option>
          ))}
        </select>
      </div>

      <h3>Items</h3>

      {items.map((item, index) => {
        const product = products.find((p) => p.id === Number(item.product_id));
        const lineTotal = product ? Number(product.price) * Number(item.quantity || 0) : 0;

        return (
          <div className="item-row" key={index}>
            <select
              value={item.product_id}
              onChange={(e) => changeItem(index, "product_id", e.target.value)}
            >
              <option value="">-- Select product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{Number(p.price).toLocaleString("en-IN")})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => changeItem(index, "quantity", e.target.value)}
            />

            <span className="line-total">₹{lineTotal.toLocaleString("en-IN")}</span>

            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)}>
                Remove
              </button>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addItem}>+ Add another product</button>

      <div className="form-row">
        <label>Discount (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        {needsApproval && (
          <span className="warning">Above 10%: Manager approval will be needed</span>
        )}
      </div>

      <div className="totals">
        <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
        <p>Discount: - ₹{discountAmount.toLocaleString("en-IN")}</p>
        <p><strong>Total: ₹{total.toLocaleString("en-IN")}</strong></p>
      </div>

      <button onClick={handleSave}>Save as Draft</button>

      {message.text && (
        <p className={message.isError ? "message error" : "message"}>{message.text}</p>
      )}
    </div>
  );
}

export default NewQuotation;