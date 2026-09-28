const express = require("express");
const db = require("../db");

const router = express.Router();

// GET: list all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: add a new product
router.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!price || Number(price) <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const [result] = await db.query(
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [name, Number(price)]
    );

    res.status(201).json({ id: result.insertId, message: "Product added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;