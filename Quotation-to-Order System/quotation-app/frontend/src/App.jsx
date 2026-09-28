import { useState } from "react";
import Customers from "./components/Customers";
import Products from "./components/Products";
import Quotations from "./components/Quotations";
import NewQuotation from "./components/NewQuotation";
import Orders from "./components/Orders";
import Dashboard from "./components/Dashboard";

function App() {
  const [role, setRole] = useState("Salesperson");
  const [page, setPage] = useState("dashboard");

  return (
    <div className="container">
      <header>
        <h1>Quotation-to-Order System</h1>
        <div>
          Role:{" "}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Salesperson</option>
            <option>Manager</option>
          </select>
        </div>
      </header>

      <nav>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("quotations")}>Quotations</button>
        <button onClick={() => setPage("new")}>+ New Quotation</button>
        <button onClick={() => setPage("orders")}>Orders</button>
        <button onClick={() => setPage("customers")}>Customers</button>
        <button onClick={() => setPage("products")}>Products</button>
      </nav>

      {page === "dashboard" && <Dashboard />}
      {page === "quotations" && <Quotations role={role} />}
      {page === "new" && <NewQuotation role={role} onSaved={() => setPage("quotations")} />}
      {page === "orders" && <Orders />}
      {page === "customers" && <Customers />}
      {page === "products" && <Products />}
    </div>
  );
}

export default App;