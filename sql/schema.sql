CREATE TABLE categories (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id)
);

