# expense-tracker-api

A simple API for creating, viewing, updating, and deleting expense transactions. It saves data in PostgreSQL.

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

6. Start the API. The `start` script loads `.env` with Node's `--env-file` option:

   ```sh
   npm start
   ```

The API runs at `http://localhost:3000`.

## API

| Method | Path | Description | Response statuses |
| --- | --- | --- | --- |
| GET | `/transactions` | Gets all transactions. | `200` success, `500` server error |
| POST | `/transactions` | Adds a transaction. `amount` and `type` are required; `category_id` is optional. | `201` created, `400` missing data or unknown category, `500` server error |
| PUT | `/transactions/:id` | Updates a transaction. `amount` and `type` are required; `category_id` is optional. | `200` success, `400` invalid input or unknown category, `404` transaction not found, `500` server error |
| DELETE | `/transactions/:id` | Deletes a transaction. | `204` deleted, `400` invalid ID, `404` transaction not found, `500` server error |

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

Delete a transaction:

```sh
curl -i -X DELETE http://localhost:3000/transactions/1
```

Example response (`204 No Content`):

```text
HTTP/1.1 204 No Content
```

## Notes

- The database stores `amount` as `NUMERIC(12, 2)`. The `pg` library returns it as a string to keep the exact value.
- If a transaction uses a category ID that does not exist, the API returns `400 Bad Request`.
- `amount` must not be `0`; zero is rejected with `amount and type are required`.
- The API returns `400` with these messages: `id must be an integer` (PUT), `id must be a number` (DELETE), `amount must be a number` (PUT), `amount and type are required` (POST/PUT), or `This category does not exist` (POST/PUT).

## Status

Implemented:

- View, add, update, and delete transactions
- Validate IDs in PUT/DELETE and numeric amounts in PUT; POST checks only that `amount` and `type` are present
- Database tables for transactions and categories

Planned:

- Validate numeric amounts in POST
- Connect a frontend