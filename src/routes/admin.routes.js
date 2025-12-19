const express = require("express");
const pool = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);
router.use(isAdmin); // Semua route admin protected

// GET all users (untuk admin lihat daftar client)
router.get("/users", async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, approved FROM users"
  );
  res.json(result.rows);
});

// GET user by id
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT id, name, email, role, approved FROM users WHERE id=$1",
    [id]
  );
  if (!result.rows.length)
    return res.status(404).json({ message: "User not found" });
  res.json(result.rows[0]);
});

// PUT approve user
router.put("/users/:id/approve", async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE users SET approved=true WHERE id=$1", [id]);
  res.json({ message: "User approved" });
});

// DELETE user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
  res.json({ message: "User deleted" });
});

// GET all orders (sudah ada, improved join)
router.get("/orders", async (req, res) => {
  const result = await pool.query(
    `SELECT o.*, u.name as client_name, p.name as product_name
     FROM orders o
     JOIN users u ON o.client_id = u.id
     JOIN products p ON o.product_id = p.id`
  );
  res.json(result.rows);
});

module.exports = router;
