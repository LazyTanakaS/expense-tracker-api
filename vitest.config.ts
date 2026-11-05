import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgres://localhost:5432/expense_tracker_test",
    },
    fileParallelism: false,
  },
});
