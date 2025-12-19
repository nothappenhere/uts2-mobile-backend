const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { z } = require("zod");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "CLIENT"]),
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    // Cek email unique
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length)
      return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1,$2,$3,$4)`,
      [name, email, hash, role]
    );

    res.json({ message: "Register success, waiting approval" });
  } catch (err) {
    next(err); 
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (!result.rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = result.rows[0];

    if (user.role === "CLIENT" && !user.approved)
      return res.status(403).json({ message: "Not approved yet" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, userId: user.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
