import { pool } from "./db.js";
import express from "express";

const app = express();
app.use(express.json());

app.get("/categories", async (req, res) => {
  const result = await pool.query("SELECT * FROM categories ORDER BY id");
  res.json(result.rows);
});

app.get("/transactions", async (req, res) => {
  const result = await pool.query(`SELECT t.id,
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

app.post("/transactions", async (req, res) => {
  const { amount, type, category_id, description = "", date } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: "amount and type are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (amount, type, category_id, description, date) VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) 
      RETURNING id, amount, type, category_id, description, to_char(date, 'YYYY-MM-DD') AS date`,
      [amount, type, category_id, description, date],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "This category does not exist" });
    }

    if (err.code === "22007") {
      return res.status(400).json({ message: "date is invalid" });
    }
    throw err;
  }
});

app.post("/categories", async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "name and type are required" });
  }

  try {
    const results = await pool.query(
      "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *",
      [name, type],
    );
    res.status(201).json(results.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    if (err.code === "23514") {
      return res
        .status(400)
        .json({ message: "type must be income or expense" });
    }
    throw err;
  }
});

app.delete("/transactions/:id", async (req, res) => {
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
    if (err.code === "22P02") {
      return res.status(400).json({ message: "id must be a number" });
    }
    throw err;
  }
});

app.put("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, type, category_id, description = "", date } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: "amount and type are required" });
  }

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: "id must be an integer" });
  }

  if (Number.isNaN(Number(amount))) {
    return res.status(400).json({ message: "amount must be a number" });
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
    if (err.code === "22P02") {
      return res.status(400).json({ message: "id must be a number" });
    }

    if (err.code === "22007") {
      return res.status(400).json({ message: "date is invalid" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ message: "This category does not exist" });
    }
    throw err;
  }
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
