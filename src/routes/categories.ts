import { Router } from "express";
import pg from "pg";
import { pool } from "../db.js";
import type { Category } from "../types.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res) => {
  const result = await pool.query<Category>(
    "SELECT * FROM categories ORDER BY id",
  );
  res.json(result.rows);
});

categoriesRouter.post("/", async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: "name and type are required" });
  }

  try {
    const results = await pool.query<Category>(
      "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *",
      [name, type],
    );
    res.status(201).json(results.rows[0]);
  } catch (err) {
    if (err instanceof pg.DatabaseError && err.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    if (err instanceof pg.DatabaseError && err.code === "23514") {
      return res
        .status(400)
        .json({ message: "type must be income or expense" });
    }
    throw err;
  }
});
