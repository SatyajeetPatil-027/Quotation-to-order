const express = require("express");
const db = require("../db");

const router = express.Router();

// GET: list all orders (with customer name)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.name AS customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ORDER BY o.id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;