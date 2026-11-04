import express, { type ErrorRequestHandler } from "express";
import { categoriesRouter } from "./routes/categories.js";
import { transactionsRouter } from "./routes/transactions.js";

export const app = express();

app.use(express.json());
app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(req.method, req.url, err);
  res.status(500).json({ message: "Internal server error" });
};

app.use(errorHandler);
