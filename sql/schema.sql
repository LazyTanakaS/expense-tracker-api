CREATE TABLE categories (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT NOT NULL DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO categories (name, type) VALUES 
    ('Bills', 'expense'),
    ('Food', 'expense'),
    ('Salary', 'income'),
    ('Shopping', 'expense'),
    ('Taxi', 'expense'),
    ('Fuel', 'expense'),
    ('Entertainment', 'expense'),
    ('Subscriptions', 'expense'),
    ('Side Job', 'income'),
    ('Debt repayment', 'income');