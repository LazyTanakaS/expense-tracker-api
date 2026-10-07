import { pool } from "./db.js";
import express from "express";

const app = express();
app.use(express.json());

app.get("/transactions", async (req, res) => {
  const result = await pool.query("SELECT * FROM transactions ORDER BY id");
  res.json(result.rows);
});

app.post("/transactions", async (req, res) => {
  const { amount, type, category_id } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: "amount and type are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO transactions (amount, type, category_id) VALUES ($1, $2, $3) RETURNING *",
      [amount, type, category_id],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "This category does not exist" });
    }
    throw err;
  }
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
