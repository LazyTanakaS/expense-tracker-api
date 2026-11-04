import { Router } from "express";
import pg from "pg";
import { pool } from "../db.js";
import type { Transaction } from "../types.js";
import { validateTransaction } from "../validation.js";

export const transactionsRouter = Router();

transactionsRouter.get("/", async (req, res) => {
  const result = await pool.query<Transaction>(`SELECT t.id,
       t.amount,
       t.type,
       t.category_id,
       t.description,
       to_char(t.date, 'YYYY-MM-DD') AS date,
       c.name AS category
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.id;`);
  res.json(result.rows);
});

transactionsRouter.post("/", async (req, res) => {
  const { amount, type, category_id, description = "", date } = req.body;
  const error = validateTransaction(req.body);

  if (error) return res.status(400).json({ message: error });

  try {
    const result = await pool.query(
      `INSERT INTO transactions (amount, type, category_id, description, date) VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) 
      RETURNING id, amount, type, category_id, description, to_char(date, 'YYYY-MM-DD') AS date`,
      [amount, type, category_id, description, date],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof pg.DatabaseError && err.code === "23503") {
      return res.status(400).json({ message: "This category does not exist" });
    }

    if (err instanceof pg.DatabaseError && err.code === "22007") {
      return res.status(400).json({ message: "date is invalid" });
    }
    throw err;
  }
});

transactionsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(204).send();
  } catch (err) {
    if (err instanceof pg.DatabaseError && err.code === "22P02") {
      return res.status(400).json({ message: "id must be a number" });
    }
    throw err;
  }
});

transactionsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, type, category_id, description = "", date } = req.body;
  const error = validateTransaction(req.body);

  if (error) return res.status(400).json({ message: error });

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: "id must be an integer" });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions SET amount = $1, type = $2, category_id = $3, description = $5, date = COALESCE($6, CURRENT_DATE) WHERE id = $4 
        RETURNING id, amount, type, category_id, description, to_char(date, 'YYYY-MM-DD') AS date`,
      [amount, type, category_id, id, description, date],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof pg.DatabaseError && err.code === "22P02") {
      return res.status(400).json({ message: "id must be a number" });
    }

    if (err instanceof pg.DatabaseError && err.code === "22007") {
      return res.status(400).json({ message: "date is invalid" });
    }
    if (err instanceof pg.DatabaseError && err.code === "23503") {
      return res.status(400).json({ message: "This category does not exist" });
    }
    throw err;
  }
});
