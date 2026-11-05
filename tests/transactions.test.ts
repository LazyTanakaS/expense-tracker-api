import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { pool } from "../src/db.js";

beforeEach(async () => {
  await pool.query("TRUNCATE transactions RESTART IDENTITY");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /transactions", () => {
  it("creates a transaction and returns 201", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({ amount: "12.50", type: "expense" });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe("12.50");
  });

  it("returns 400 when amount is not a number", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({ amount: "abc", type: "expense" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("amount must be a number");
  });
});

describe("DELETE /transactions/:id", () => {
  it("delete an existing transaction and returns 204", async () => {
    const created = await request(app)
      .post("/transactions")
      .send({ amount: "5.00", type: "expense" });

    const res = await request(app).delete(`/transactions/${created.body.id}`);

    expect(res.status).toBe(204);

    const list = await request(app).get("/transactions");
    expect(list.body).toHaveLength(0);
  });

  it("returns 404 when the transaction does not exist", async () => {
    const res = await request(app).delete("/transactions/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Transaction not found");
  });
});

describe("PUT /transactions/:id", () => {
  it("updates an existing transaction and returns it", async () => {
    const created = await request(app)
      .post("/transactions")
      .send({ amount: "20.00", type: "expense" });

    const res = await request(app)
      .put(`/transactions/${created.body.id}`)
      .send({ amount: "15.10", type: "income", description: "salary bonus" });

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe("15.10");
    expect(res.body.type).toBe("income");
    expect(res.body.description).toBe("salary bonus");
  });

  it("returns 404 when the transaction does not exist", async () => {
    const res = await request(app)
      .put("/transactions/999")
      .send({ amount: "1.00", type: "expense" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Transaction not found");
  });
});
