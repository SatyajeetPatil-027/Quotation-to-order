const express = require("express");
const db = require("../db");

const router = express.Router();

// ---------- GET: list all quotations ----------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.*, c.name AS customer_name
       FROM quotations q
       JOIN customers c ON q.customer_id = c.id
       ORDER BY q.id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- GET: one quotation with its items ----------
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [quotes] = await db.query(
      `SELECT q.*, c.name AS customer_name
       FROM quotations q
       JOIN customers c ON q.customer_id = c.id
       WHERE q.id = ?`,
      [id]
    );

    if (quotes.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const [items] = await db.query(
      "SELECT * FROM quotation_items WHERE quotation_id = ?",
      [id]
    );

    res.json({ ...quotes[0], items: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- POST: create a new quotation (Draft) ----------
router.post("/", async (req, res) => {
  try {
    const { customer_id, discount_percent, created_by, items } = req.body;
    const discount = Number(discount_percent) || 0;

    // 1. VALIDATE the input
    if (!customer_id) {
      return res.status(400).json({ message: "Customer is required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Add at least one product" });
    }
    if (discount < 0 || discount > 100) {
      return res.status(400).json({ message: "Discount must be between 0 and 100" });
    }
    if (created_by !== "Salesperson" && created_by !== "Manager") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [customers] = await db.query("SELECT id FROM customers WHERE id = ?", [customer_id]);
    if (customers.length === 0) {
      return res.status(400).json({ message: "Customer not found" });
    }

    // 2. Look up each product's real price and add up the subtotal
    let subtotal = 0;
    const lines = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a whole number, 1 or more" });
      }

      const [products] = await db.query("SELECT * FROM products WHERE id = ?", [item.product_id]);
      if (products.length === 0) {
        return res.status(400).json({ message: "Product not found: " + item.product_id });
      }

      const product = products[0];
      const price = Number(product.price); // DECIMAL comes back as text, so convert

      subtotal = subtotal + price * quantity;
      lines.push({ product_id: product.id, name: product.name, price: price, quantity: quantity });
    }

    // 3. Do the maths (rounded to 2 decimal places)
    const discountAmount = Math.round(subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount;

    // 4. Save the quotation as a Draft
    const [result] = await db.query(
      `INSERT INTO quotations
        (customer_id, discount_percent, subtotal, discount_amount, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'Draft', ?)`,
      [customer_id, discount, subtotal, discountAmount, totalAmount, created_by]
    );
    const quotationId = result.insertId;

    // 5. Save each product line
    for (const line of lines) {
      await db.query(
        `INSERT INTO quotation_items (quotation_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [quotationId, line.product_id, line.name, line.price, line.quantity]
      );
    }

    // 6. RESPOND
    res.status(201).json({
      id: quotationId,
      subtotal: subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      status: "Draft",
      message: "Quotation created as Draft",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- POST: submit a Draft (RULE 1: the 10% rule) ----------
router.post("/:id/submit", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM quotations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const quote = rows[0];

    if (quote.status !== "Draft") {
      return res.status(400).json({ message: "Only a Draft quotation can be submitted" });
    }

    // RULE 1: discount above 10% needs manager approval
    let newStatus;
    if (Number(quote.discount_percent) > 10) {
      newStatus = "Pending Approval";
    } else {
      newStatus = "Approved";
    }

    await db.query("UPDATE quotations SET status = ? WHERE id = ?", [newStatus, id]);

    res.json({ status: newStatus, message: "Quotation submitted. Status: " + newStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Helper: check the current status, then change it ----------
async function changeStatus(req, res, requiredStatus, newStatus) {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM quotations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const quote = rows[0];

    if (quote.status !== requiredStatus) {
      return res.status(400).json({
        message: `Quotation must be "${requiredStatus}", but it is "${quote.status}"`,
      });
    }

    await db.query("UPDATE quotations SET status = ? WHERE id = ?", [newStatus, id]);
    res.json({ status: newStatus, message: "Status changed to " + newStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ---------- APPROVE (Manager only) ----------
router.post("/:id/approve", (req, res) => {
  if (req.body.role !== "Manager") {
    return res.status(403).json({ message: "Only a Manager can approve" });
  }
  changeStatus(req, res, "Pending Approval", "Approved");
});

// ---------- SEND ----------
router.post("/:id/send", (req, res) => {
  changeStatus(req, res, "Approved", "Sent");
});

// ---------- ACCEPT (customer said yes) ----------
router.post("/:id/accept", (req, res) => {
  changeStatus(req, res, "Sent", "Accepted");
});

// ---------- REJECT ----------
router.post("/:id/reject", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM quotations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const quote = rows[0];

    if (quote.status === "Pending Approval") {
      // The Manager is saying no to a big discount
      if (req.body.role !== "Manager") {
        return res.status(403).json({ message: "Only a Manager can reject a pending quotation" });
      }
    } else if (quote.status !== "Sent") {
      // Otherwise it must be Sent (the customer said no)
      return res.status(400).json({
        message: "Only a Pending Approval or Sent quotation can be rejected",
      });
    }

    await db.query("UPDATE quotations SET status = 'Rejected' WHERE id = ?", [id]);
    res.json({ status: "Rejected", message: "Quotation rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- CONVERT TO ORDER (Rules 2 and 3) ----------
router.post("/:id/convert", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM quotations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const quote = rows[0];

    // RULE 2: only an Accepted quotation can become an order
    if (quote.status !== "Accepted") {
      if (quote.status === "Converted to Order") {
        return res.status(400).json({ message: "This quotation already has an order" });
      }
      return res.status(400).json({
        message: "Only an Accepted quotation can be converted to an order",
      });
    }

    // RULE 3: one quotation creates only one order
    const [existing] = await db.query("SELECT id FROM orders WHERE quotation_id = ?", [id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "This quotation already has an order" });
    }

    // Create the order
    const [result] = await db.query(
      "INSERT INTO orders (quotation_id, customer_id, total_amount) VALUES (?, ?, ?)",
      [id, quote.customer_id, quote.total_amount]
    );

    // Update the quotation's status
    await db.query("UPDATE quotations SET status = 'Converted to Order' WHERE id = ?", [id]);

    res.status(201).json({
      order_id: result.insertId,
      message: "Order created from quotation",
    });
  } catch (error) {
    // Safety net: MySQL's UNIQUE rule on orders.quotation_id
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "This quotation already has an order" });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;