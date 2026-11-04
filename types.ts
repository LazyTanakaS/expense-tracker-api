export type Transaction = {
  id: number;
  amount: string;
  type: "income" | "expense";
  category_id: number | null;
  category?: string;
  description: string;
  date: string;
};

export type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};
