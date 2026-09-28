const express = require("express");
const cors = require("cors");
const db = require("./db");
const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const quotationRoutes = require("./routes/quotations");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Hello! Quotation server is running.");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "Database connected!", result: rows[0].result });
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});