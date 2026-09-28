const express = require("express");
const db = require("../db");

const router = express.Router();

// All the statuses, so that even a status with 0 quotations is shown
const allStatuses = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Sent",
  "Accepted",
  "Converted to Order",
  "Rejected",
];

router.get("/", async (req, res) => {
  try {
    // 1. Count the quotations in each status
    const [rows] = await db.query(
      "SELECT status, COUNT(*) AS count FROM quotations GROUP BY status"
    );

    // 2. Start every status at 0
    const statusCounts = {};
    for (const status of allStatuses) {
      statusCounts[status] = 0;
    }

    // 3. Fill in the real counts from the database
    let totalQuotations = 0;
    for (const row of rows) {
      statusCounts[row.status] = Number(row.count);
      totalQuotations = totalQuotations + Number(row.count);
    }

    // 4. Total order value and number of orders
    const [orderRows] = await db.query(
      "SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total FROM orders"
    );

    // 5. RESPOND
    res.json({
      statusCounts: statusCounts,
      totalQuotations: totalQuotations,
      totalOrders: Number(orderRows[0].count),
      totalOrderValue: Number(orderRows[0].total),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;