const express = require("express");
const pool = require("../db");
const { z } = require("zod");
const { verifyToken, isAdmin } = require("../middleware/auth"); // isAdmin di admin.routes

const router = express.Router();
router.use(verifyToken);

const orderSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  shipping_cost: z.number().nonnegative(),
});

router.post("/", async (req, res, next) => {
  try {
    const { product_id, quantity, shipping_cost } = orderSchema.parse(req.body);
    const client_id = req.user.id;

    if (req.user.role !== "CLIENT")
      return res.status(403).json({ message: "Client only" });

    const product = await pool.query("SELECT price FROM products WHERE id=$1", [
      product_id,
    ]);
    if (!product.rows.length)
      return res.status(404).json({ message: "Product not found" });

    const price = product.rows[0].price;
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    const total = subtotal + tax + shipping_cost;

    const result = await pool.query(
      `INSERT INTO orders
        (client_id, product_id, quantity, subtotal, tax, shipping_cost, total_price)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [client_id, product_id, quantity, subtotal, tax, shipping_cost, total]
    );

    res.json({ message: "Order submitted", orderId: result.rows[0].id, total });
  } catch (err) {
    next(err);
  }
});

// GET order by id (client or admin)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM orders WHERE id=$1", [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: "Order not found" });

    const order = result.rows[0];
    if (req.user.role !== "ADMIN" && order.client_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// GET my orders (hanya milik client yang login)
router.get("/", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `SELECT o.*, p.name as product_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT update status (admin only, approve/reject/update shipping)
router.put("/:id/status", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const statusSchema = z.object({
      status: z.enum(["APPROVED", "REJECTED", "SHIPPED", "DELIVERED"]),
    });
    const { status } = statusSchema.parse(req.body);
    const { id } = req.params;

    await pool.query("UPDATE orders SET status=$1 WHERE id=$2", [status, id]);
    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// DELETE order (admin or owner)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await pool.query("SELECT client_id FROM orders WHERE id=$1", [
      id,
    ]);
    if (!order.rows.length)
      return res.status(404).json({ message: "Order not found" });

    if (req.user.role !== "ADMIN" && order.rows[0].client_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.query("DELETE FROM orders WHERE id=$1", [id]);
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
