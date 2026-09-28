const express = require("express");
const db = require("../db");

const router = express.Router();

// GET: list all customers
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: add a new customer
router.post("/", async (req, res) => {
  try {
    const { name, company, email, phone } = req.body;

    // Simple check: name must not be empty
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO customers (name, company, email, phone) VALUES (?, ?, ?, ?)",
      [name, company, email, phone]
    );

    res.status(201).json({ id: result.insertId, message: "Customer added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;