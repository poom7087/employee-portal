# People Portal

A full-stack employee profile portal built with Go, Fiber, MongoDB, React, TypeScript, and Vite. The backend follows a hexagonal layout: domain and ports are independent from MongoDB and HTTP adapters.

## Requirements

- Go 1.22+
- Node.js 20.19+ or 22.12+
- MongoDB 7+ (local MongoDB works with Compass)

## Start MongoDB

```sh
docker compose up -d mongodb
```

Or point `MONGODB_URI` at an existing MongoDB server. Compass can connect to `mongodb://localhost:27017`.

## Run locally

Terminal 1:

```sh
cd backend
go run ./cmd/api
```

Terminal 2:

```sh
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API listens on `:8080`; Vite proxies `/api` and `/uploads` to it. On first start the API inserts a sample employee profile. Configure values with `backend/.env` (copy `.env.example`); skill options, history retention, port, and upload location are configurable.

## API

- `GET /api/v1/profile`
- `PUT /api/v1/profile` (contact info and skills only; name is server-controlled)
- `POST /api/v1/profile/photo` (multipart field `photo`)
- `GET /api/v1/profile/history`
- `GET /api/v1/config/skills`
- `GET /health`

Profile edits are recorded as field-level history entries. Entries older than `HISTORY_RETENTION_DAYS` are removed when new history is written and filtered from history reads.

The assignment does not require authentication, so this starter is intentionally a single-profile demo. Add authentication and per-user access before deploying publicly. Photo files are stored locally and profile metadata/history live in MongoDB.
