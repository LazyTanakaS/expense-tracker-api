# expense-tracker-api

![CI](https://github.com/LazyTanakaS/expense-tracker-api/actions/workflows/ci.yml/badge.svg)

A simple API for creating, viewing, updating, and deleting expense transactions. It saves data in PostgreSQL.

## Stack

- Node.js
- TypeScript
- Express 5
- PostgreSQL 17
- `pg` to connect to PostgreSQL
- Vitest and Supertest for tests

## Requirements

- Node.js 24
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

   The file also creates ten starter categories.

5. Copy the example settings into `.env`. Change `DATABASE_URL` if needed:

   ```sh
   cp .env.example .env
   ```

6. Start the API in development:

   ```sh
   npm run dev
   ```

   For production, build and start the API:

   ```sh
   npm run build && npm start
   ```

The API runs at `http://localhost:3000`.

## Run with Docker

Requires Docker Desktop.

```sh
docker compose up --build
```

The API runs at `http://localhost:3000`. The database is created from `sql/schema.sql` on first start. In Docker Compose, use `db` as the database host because `localhost` refers to the API container itself. To reset the database:

```sh
docker compose down -v
```

## Testing

Integration tests use Vitest and Supertest with a real PostgreSQL database. Create a separate test database and apply the schema:

```sh
createdb expense_tracker_test
psql -d expense_tracker_test -f sql/schema.sql
```

Run the tests with:

```sh
npm test
```

Tests clear tables, so `DATABASE_URL` must point to `expense_tracker_test`, not your working database. If `DATABASE_URL` is set in your shell, the tests use it instead of the test database default. GitHub Actions runs the same build and tests with PostgreSQL.

## API

| Method | Path | Description | Response statuses |
| --- | --- | --- | --- |
| GET | `/transactions` | Gets all transactions. | `200` success, `500` server error |
| POST | `/transactions` | Adds a transaction. `amount` and `type` are required; `category_id` and `description` are optional; `date` is optional and defaults to the current date. | `201` created, `400` missing data, invalid date, or unknown category, `500` server error |
| PUT | `/transactions/:id` | Updates a transaction. `amount` and `type` are required; `category_id` and `description` are optional; `date` is optional and defaults to the current date. | `200` success, `400` invalid input, invalid date, or unknown category, `404` transaction not found, `500` server error |
| DELETE | `/transactions/:id` | Deletes a transaction. | `204` deleted, `400` invalid ID, `404` transaction not found, `500` server error |
| GET | `/categories` | Gets all categories. | `200` success, `500` server error |
| POST | `/categories` | Adds a category. `name` and `type` are required; `type` must be `income` or `expense`. | `201` created, `400` missing data or invalid type, `409` category already exists, `500` server error |

Example POST body:

```json
{
  "amount": "12.50",
  "type": "expense",
  "category_id": 2,
  "description": "Lunch",
  "date": "2026-10-27"
}
```

## Examples

Add a transaction:

```sh
curl -i -X POST http://localhost:3000/transactions \
  -H 'Content-Type: application/json' \
  -d '{"amount":"12.50","type":"expense","category_id":2,"description":"Lunch","date":"2026-10-27"}'
```

Example response (`201 Created`):

```json
{
  "id": 1,
  "amount": "12.50",
  "type": "expense",
  "category_id": 2,
  "description": "Lunch",
  "date": "2026-10-27"
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
    "category_id": 2,
    "description": "Lunch",
    "date": "2026-10-27",
    "category": "Food"
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
- The API returns `400` with these messages: `id must be an integer` (PUT), `id must be a number` (DELETE), `amount must be a number` (POST/PUT), `amount and type are required` (POST/PUT), `This category does not exist` (POST/PUT), `date is invalid` (POST/PUT), `name and type are required` (POST `/categories`), or `type must be income or expense` (POST `/categories`).
- Creating a category with a name that already exists returns `409 Conflict` with `Category already exists`.
- Unexpected errors return `500` with a JSON body; details go to the server log.

## Project structure

- `src/server.ts` — starts the API
- `src/app.ts` — Express app, middleware, routes, and error handler
- `src/db.ts` — PostgreSQL connection
- `src/types.ts` and `src/validation.ts` — shared types and validation
- `src/routes/` — transaction and category routes
- `tests/` — integration tests
- `vitest.config.ts` — test configuration and default test database
- `sql/schema.sql` — database schema and starter categories
- `Dockerfile` and `compose.yaml` — API and database containers
- `.github/workflows/ci.yml` — GitHub Actions CI

## Status

Implemented:

- View, add, update, and delete transactions
- Validate IDs in PUT/DELETE and numeric amounts in POST/PUT
- PostgreSQL schema for transactions and categories, including ten starter categories
- Integration tests (Vitest, Supertest) and CI on GitHub Actions

Planned:

- Connect a frontend