# MarketTatylu Orders (MVC demo)

This repository contains a minimal MVC-style backend (Express + MongoDB/Mongoose) and a small Vite/React frontend to exercise business-rule endpoints for the **Order** collection defined in `database.md`.

## Project layout

- controllers/ — server-side controllers (business actions for Orders)
- models/ — Mongoose models (Order, User, Sequence)
- views/ — frontend (Vite/React) served as static files after build
- database.md — original collection reference

## Server

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `FRONTEND_ORIGIN`.
2. Install and run the server:
   ```bash
   npm install
   npm run dev:server
   ```
3. Business action endpoints (public):
   - GET /orders/stats/average — average order value
   - GET /orders/stats/top-products?limit=5 — most sold products
   - GET /orders/stats/top-customers?limit=5 — highest-spending customers
   - GET /orders/stats/sales-by-day?days=7 — last N days revenue
   - GET /orders/stats/high-value?min=100 — orders above min value
   - GET /orders/stats/monthly-summary?months=6 — revenue/orders per month

Legacy order action endpoints (place/pay/ship/cancel/get) have been removed from the project.
4. Deploy: set env vars on Railway/Render (`MONGODB_URI`, `PORT`, `FRONTEND_ORIGIN`). Entrypoint: `npm start`.

## Frontend

1. Copy `views/.env.example` to `views/.env` and set `VITE_API_BASE_URL` if your backend is on another host (leave empty to use same origin).
2. Install and run the frontend:
   ```bash
   cd views
   npm install
   npm run dev
   ```
3. Build for production:
   ```bash
   cd views
   npm run build
   ```
4. When the server is started it serves `views/dist`.

The frontend contains an interactive dashboard (Stats) that calls the server's business-rule endpoints:
- Average order value: `GET /orders/stats/average`
- Top products: `GET /orders/stats/top-products?limit=5`
- Top customers: `GET /orders/stats/top-customers?limit=5`
- Sales by day: `GET /orders/stats/sales-by-day?days=7`
- High value orders: `GET /orders/stats/high-value?min=100`
- Monthly summary: `GET /orders/stats/monthly-summary?months=6`

## Notes

- The backend requires a valid `User` document (from the `users` collection) for `userId` validation.
- `Order.id` is sequential and human-friendly via the `Sequence` model. Status transitions enforce business rules (pending → paid → shipped, or pending → cancelled).
- CORS is open by default; tighten with `FRONTEND_ORIGIN` in production.

---

## Deploying online (Atlas + Vercel + Railway/Render)

1) MongoDB Atlas / connection string
- The project includes a connection string example in `database.md`. Since you already have an Atlas cluster, set your existing connection string as the `MONGODB_URI` environment variable or secret in your deployment service (Railway/Render/Vercel) or in a local `.env` file. Ensure the Atlas user has the required network access and permissions and URL-encode special characters in the password (e.g., `@` → `%40`). Do not commit real credentials to git.

2) Push the repo to GitHub
- Create a repository and push all files. Keep `.env` out of git (we added `.gitignore`).

3) Deploy the server (Railway or Render)
- Create a new project and connect your GitHub repo.
- Set build command: `npm run client:build` (this builds `views/dist`) and start command: `npm start`.
- Set environment variables in the service dashboard:
  - `MONGODB_URI` = your Atlas connection string
  - `PORT` = 4000 (or leave default)
  - `FRONTEND_ORIGIN` = the URL of your frontend (set to allow CORS)
- Deploy. The server will serve the built frontend from `views/dist`.

4) Deploy the frontend (Vercel) — optional if serving from the server
- Create a Vercel project and link to GitHub repo, or import the `views` folder only.
- Set env var `VITE_API_BASE_URL` to your backend URL (e.g., `https://your-backend.onrender.com`) or leave empty to use same origin.
- Build command: `npm run build` and output directory `dist`.

5) Seed a test user (local or remote)
- Locally (with `MONGODB_URI` set): `npm run seed` will create a dev user `dev+admin@example.com` and print its `_id`.
- Use the printed `_id` as `userId` when placing orders from the frontend.

Notes
- Do not commit real credentials. Use service secrets or environment variables in the host dashboard.
- For production, tighten IP access, use TLS, and rotate credentials regularly.
- If you want, I can add a simple health-check or a small CI workflow that builds the client and deploys the server.
