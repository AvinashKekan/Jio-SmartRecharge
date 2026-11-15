# Jio SmartRecharge — Full-Stack Plan Clarity & Discovery Platform

A full-stack recharge discovery, comparison, and recommendation platform inspired by Jio's ecosystem. Built with **vanilla HTML5/CSS3/JavaScript**, a **Node.js + Express + TypeScript** REST API, and **PostgreSQL 16 + Prisma ORM** to surface **Cost Per Day (`₹/day`)**, **Cost per GB**, and **30-day monthly cost** upfront across **Prepaid**, **Postpaid**, **JioFiber**, and **JioAirFiber** plans.

---

## Why This Matters (Indian CX at Jio's Scale)

- **49.89 Crore Active Jio Users:** Nearly every Jio wireless connection (99.07% active ratio) is used daily across urban and rural India ([FoneArena / TRAI](https://www.fonearena.com/blog/488465/indias-telecom-subscriber-base-june-2026.html)), out of **54.24 crore** total customers ([Goodreturns](https://www.goodreturns.in/news/jio-platforms-sept-2026-profit-rises-on-subscriber-growth-and-5g-011-1544307.html)).
- **30+ Crore 5G Users & Heavy Data Demand:** Over half of Jio's base is on True 5G, averaging **44.2 GB/month** (~1.47 GB/day) per user ([Goodreturns](https://www.goodreturns.in/news/jio-platforms-sept-2026-profit-rises-on-subscriber-growth-and-5g-011-1544307.html)).
- **12 vs. 13 Recharges a Year:** Comparing 20-day, 24-day, 28-day, 84-day, and 365-day packs in your head creates friction—highlighted by TRAI's September 2026 30-day validity rules ([Cashify](https://www.cashify.in/news/trai-30-day-recharge-rule-no-more-13-recharges-a-year-users-can-recharge-12-times)) and **1.68 crore** monthly porting (MNP) requests nationwide ([PIB / TRAI](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2328945)).

**Core Differentiator:** Every plan card displays **Cost Per Day (`₹/day`)**, **Monthly Cost (30 days)**, and **Cost per GB** right at first glance—helping customers pick the right plan in seconds without mental math.

---

## Key Features

- **All Jio Services in One Place:** Browse Prepaid Mobile, Postpaid, JioFiber, JioAirFiber, True 5G, Entertainment, Data Packs, and International Roaming.
- **Transparent Value Metrics:** Automatic calculation of daily cost, cost per GB, total data, and 30-day equivalent.
- **Personal Plan Finder:** Weighted recommendation engine (`POST /api/v1/recommendations`) scoring plans across data fit (35%), budget fit (25%), validity match (20%), 5G support (10%), and voice/SMS fit (10%).
- **Side-by-Side Comparison:** Compare up to 3 plans across all pricing and data metrics (`POST /api/v1/plans/compare`).
- **Authenticated Checkout & History:** `HttpOnly` JWT cookie sessions, strict 10-digit Indian mobile validation, and PostgreSQL-persisted recharge history.

---

## Engineering Highlights (Jio SDE I · 87405934)

| Area | Implementation |
| :--- | :--- |
| **Frontend (`client/`)** | Zero-framework HTML5, CSS3 Grid/Flexbox, and vanilla ES6+ using Fetch API (`credentials: 'include'`), `Intl.NumberFormat('en-IN')`, and XSS-safe HTML escaping (`esc()`). |
| **Backend (`server/`)** | Modular Express + TypeScript REST API (`/auth`, `/plans`, `/plans/compare`, `/recommendations`, `/recharges`) with Helmet, strict CORS, rate limiting, and centralized Zod error handling. |
| **Databases & SQL** | PostgreSQL 16 + Prisma ORM relational schema (`User`, `PlanCategory`, `RechargePlan`, `CustomerPreference`, `RechargeTransaction`) with foreign keys, unique constraints, and composite indexes. |
| **Security** | `bcryptjs` password hashing (cost 12), `HttpOnly` JWT cookies, parameterized Prisma queries, environment schema validation (`env.ts`), and 30 KB JSON payload limits. |
| **Testing & SDLC Docs** | Vitest unit tests (`calculations.test.ts`) for pricing/ranking edge cases, plus full SDLC documentation (`PRD-SRS.md`, `architecture.md`, `openapi.yaml`, `recommendation-engine.md`, `test-plan.md`). |

---

## API Endpoints (`/api/v1`)

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health check |
| `POST` | `/auth/register`, `/auth/login`, `/auth/logout` | Account creation & `HttpOnly` JWT session management |
| `GET` | `/auth/me` | Fetch authenticated user profile |
| `GET` | `/plans`, `/plans/categories`, `/plans/:id` | Search, filter, sort, and inspect plans |
| `POST` | `/plans/compare` | Compare up to 3 plans with calculated metrics |
| `POST` | `/recommendations` | Rank plans by daily data, budget, validity, and 5G |
| `POST` | `/recharges/simulate` | Persist a simulated recharge transaction (authenticated) |
| `GET` | `/recharges/history` | Retrieve user's saved recharge history (authenticated) |

---

## Project Structure

```text
SmartRecharge-Complete/
├── client/                  # Vanilla HTML5, CSS3, JS frontend
│   ├── assets/jio-logo.png
│   ├── app.js
│   ├── config.js
│   ├── index.html
│   └── styles.css
├── server/                  # Express + TypeScript + Prisma API
│   ├── prisma/              # schema.prisma & seed.ts
│   └── src/
│       ├── config/          # Zod-validated env.ts
│       ├── middleware/      # auth.ts & errors.ts
│       ├── modules/         # auth, plans, compare, recharge, recommendations
│       └── utils/           # calculations.ts & calculations.test.ts
├── docs/                    # PRD-SRS, architecture, OpenAPI, test plan
├── docker-compose.yml       # PostgreSQL 16 service
├── .env.example
└── package.json
```

---

## Local Setup & Run

### Prerequisites
- Node.js 20+ and npm 10+
- Docker Desktop (or PostgreSQL 16 running locally)

### Steps

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET` (minimum 32 characters).
2. Start PostgreSQL:
   ```bash
   docker compose up -d db
   ```
3. Install dependencies, run migrations, and seed the catalogue:
   ```bash
   npm install
   npm run db:generate
   npm run db:migrate -- --name init
   npm run db:seed
   ```
4. Start both the API (`http://localhost:4000`) and frontend (`http://localhost:5173`):
   ```bash
   npm run dev
   ```
5. Build TypeScript and run tests:
   ```bash
   npm run build
   npm test
   ```

---

## Disclaimer

*Independent portfolio demo inspired by Jio. Catalogue entries and checkout flows are illustrative simulations only—no real operator connection or payment processing is performed.*
