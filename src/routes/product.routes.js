const express = require("express");
const pool = require("../db");
const { z } = require("zod");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all products (public)
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, price, unit FROM products ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET product by id (public)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, price, unit FROM products WHERE id=$1",
      [id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST new product (admin only)
router.post("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const productSchema = z.object({
      name: z.string().min(3),
      price: z.number().positive(),
      unit: z.string().min(1),
    });
    const { name, price, unit } = productSchema.parse(req.body);

    await pool.query(
      "INSERT INTO products (name, price, unit) VALUES ($1,$2,$3)",
      [name, price, unit]
    );

    res.json({ message: "Product added" });
  } catch (err) {
    next(err);
  }
});

// PUT update product (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const productSchema = z.object({
      name: z.string().min(3).optional(),
      price: z.number().positive().optional(),
      unit: z.string().min(1).optional(),
    });
    const data = productSchema.parse(req.body);
    const { id } = req.params;

    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key}=$${index}`);
      values.push(value);
      index++;
    }

    if (!updates.length)
      return res.status(400).json({ message: "No updates provided" });

    values.push(id);
    await pool.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id=$${index}`,
      values
    );

    res.json({ message: "Product updated" });
  } catch (err) {
    next(err);
  }
});

// DELETE product (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
