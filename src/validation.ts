import type { TransactionInput } from "./types.js";

export function validateTransaction({ amount, type }: TransactionInput) {
  if (!amount || !type) return "amount and type are required";
  if (Number.isNaN(Number(amount))) return "amount must be a number";
  return null;
}
