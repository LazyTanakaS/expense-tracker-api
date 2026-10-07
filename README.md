# expense-tracker-api

A simple API for adding and viewing expense transactions. It saves data in PostgreSQL.

## Stack

- Node.js
- Express 5
- PostgreSQL 17
- `pg` to connect to PostgreSQL

## Requirements

- Node.js 20.6 or newer (needed for the `--env-file` option used to start the app)
- PostgreSQL 17

## Setup

1. Clone the repository and open its folder:

   ```sh
   git clone <repository-url>
   cd expense-tracker-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create the database:

   ```sh
   createdb expense_tracker
   ```

4. Create the database tables:

   ```sh
   psql -d expense_tracker -f sql/schema.sql
   ```

5. Copy the example settings into `.env`. Change `DATABASE_URL` if needed:

   ```sh
   cp .env.example .env
   ```

6. Start the API:

   ```sh
   npm start
   ```

The API runs at `http://localhost:3000`.

## API

| Method | Path | Description | Response statuses |
| --- | --- | --- | --- |
| GET | `/transactions` | Gets all transactions. | `200` success, `500` server error |
| POST | `/transactions` | Adds a transaction. `amount` and `type` are required; `category_id` is optional. | `201` created, `400` missing data or unknown category, `500` server error |

Example POST body:

```json
{
  "amount": "12.50",
  "type": "expense",
  "category_id": null
}
```

## Example

Add a transaction:

```sh
curl -i -X POST http://localhost:3000/transactions \
  -H 'Content-Type: application/json' \
  -d '{"amount":"12.50","type":"expense"}'
```

Example response (`201 Created`):

```json
{
  "id": 1,
  "amount": "12.50",
  "type": "expense",
  "category_id": null
}
```

Get all transactions:

```sh
curl -i http://localhost:3000/transactions
```

Example response (`200 OK`):

```json
[
  {
    "id": 1,
    "amount": "12.50",
    "type": "expense",
    "category_id": null
  }
]
```

## Notes

- The database stores `amount` as `NUMERIC(12, 2)`. The `pg` library returns it as a string to keep the exact value.
- If a transaction uses a category ID that does not exist, the API returns `400 Bad Request`.

## Status

Implemented:

- View transactions
- Add transactions
- Database tables for transactions and categories

Planned:

- Update transactions (`PUT`)
- Delete transactions (`DELETE`)
- Request validation
- Connect a frontend