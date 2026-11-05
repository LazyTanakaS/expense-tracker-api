import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { pool } from "../src/db.js";

beforeEach(async () => {
  await pool.query("TRUNCATE categories RESTART IDENTITY CASCADE");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /categories", () => {
  it("creates a category and returns 201", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ name: "Food", type: "expense" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Food");
  });

  it("returns 409 when the name already exists", async () => {
    await request(app)
      .post("/categories")
      .send({ name: "Food", type: "expense" });

    const res = await request(app)
      .post("/categories")
      .send({ name: "Food", type: "expense" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Category already exists");
  });

  it("returns 400 when type is not income or expense", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ name: "Food", type: "bills" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("type must be income or expense");
  });
});
