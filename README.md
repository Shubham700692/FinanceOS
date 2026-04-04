# FinanceOS — Finance Dashboard System

A full-stack finance dashboard with role-based access control, real-time analytics, budget tracking, anomaly detection, and a complete audit trail.

---

## Project Structure

```
zorvyn-assignment/
├── backend/          ← Node.js + Express + SQLite API
└── frontend/         ← React + Vite + Tailwind dashboard
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run seed        # Creates demo users + 60 sample records
npm start           # Runs on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # Runs on http://localhost:5173
```

Open [http://localhost:5173](https://financeos-1.onrender.com) in your browser.

---

## Demo Credentials

| Role    | Email                     | Password      | Access |
|---------|---------------------------|---------------|--------|
| Admin   | admin@financeos.dev       | Admin@123     | Full access — users, records, budgets, audit |
| Analyst | analyst@financeos.dev     | Analyst@123   | Records CRUD + insights |
| Viewer  | viewer@financeos.dev      | Viewer@123    | Read-only dashboard |

---

## Tech Stack

### Backend
| Layer       | Technology |
|-------------|-----------|
| Runtime     | Node.js v18+ |
| Framework   | Express.js |
| Database    | SQLite via `better-sqlite3` |
| Auth        | JWT (access + refresh token rotation) |
| Validation  | Zod |
| Security    | bcryptjs, express-rate-limit, CORS |

### Frontend
| Layer       | Technology |
|-------------|-----------|
| Framework   | React 18 + Vite |
| Routing     | React Router v6 |
| Styling     | Tailwind CSS |
| Charts      | Recharts |
| HTTP        | Axios (with auto token refresh) |
| Icons       | Lucide React |

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth
| Method | Endpoint             | Access | Description |
|--------|----------------------|--------|-------------|
| POST   | /auth/register       | Public | Register new user |
| POST   | /auth/login          | Public | Login, returns JWT pair |
| POST   | /auth/refresh        | Public | Rotate refresh token |
| POST   | /auth/logout         | Auth   | Invalidate refresh token |
| GET    | /auth/me             | Auth   | Current user info |

### Records
| Method | Endpoint        | Access   | Description |
|--------|-----------------|----------|-------------|
| GET    | /records        | Viewer+  | List with filters + pagination |
| GET    | /records/:id    | Viewer+  | Get single record |
| POST   | /records        | Analyst+ | Create record |
| PATCH  | /records/:id    | Analyst+ | Update record |
| DELETE | /records/:id    | Analyst+ | Soft delete |

**Query params for GET /records:**
`type`, `category`, `from`, `to`, `search`, `tags`, `page`, `limit`, `sortBy`, `order`

### Dashboard
| Method | Endpoint                    | Access   | Description |
|--------|-----------------------------|----------|-------------|
| GET    | /dashboard/summary          | Viewer+  | Income, expense, net, savings rate |
| GET    | /dashboard/categories       | Viewer+  | Breakdown by category + % share |
| GET    | /dashboard/trends/monthly   | Viewer+  | Monthly income vs expense |
| GET    | /dashboard/trends/weekly    | Viewer+  | Weekly trends |
| GET    | /dashboard/activity         | Viewer+  | Recent transactions feed |
| GET    | /dashboard/insights         | Analyst+ | Anomaly detection + spending patterns |
| GET    | /dashboard/budget-analysis  | Viewer+  | Budget vs actual comparison |

### Users (Admin only)
| Method | Endpoint       | Description |
|--------|----------------|-------------|
| GET    | /users         | List users with filters |
| GET    | /users/stats   | User counts by role |
| GET    | /users/:id     | Get user |
| PATCH  | /users/:id     | Update role/status |
| DELETE | /users/:id     | Deactivate user |
| POST   | /users/change-password | Change own password |

### Budgets
| Method | Endpoint           | Access  | Description |
|--------|--------------------|---------|-------------|
| GET    | /budgets           | Viewer+ | List all budgets |
| PUT    | /budgets           | Admin   | Create or update budget |
| DELETE | /budgets/:category | Admin   | Remove budget |

### Audit
| Method | Endpoint    | Access | Description |
|--------|-------------|--------|-------------|
| GET    | /audit-logs | Admin  | Full audit trail with filters |

---

## Role Permissions

| Feature              | Viewer | Analyst | Admin |
|----------------------|--------|---------|-------|
| View dashboard       | ✅     | ✅      | ✅    |
| View records         | ✅     | ✅      | ✅    |
| Create/edit records  | ❌     | ✅      | ✅    |
| Delete records       | ❌     | ✅      | ✅    |
| Spending insights    | ❌     | ✅      | ✅    |
| Manage users         | ❌     | ❌      | ✅    |
| Manage budgets       | ❌     | ❌      | ✅    |
| View audit logs      | ❌     | ❌      | ✅    |

---

## Creative Additions (beyond requirements)

1. **Anomaly Detection** — Compares current month's spending per category against a 6-month rolling average. Flags categories with >50% deviation as anomalies.

2. **Full Audit Trail** — Every create, update, delete action is automatically logged with user ID, IP address, old/new values, and timestamp. Zero effort from controllers — handled entirely in middleware.

3. **JWT Refresh Token Rotation** — Access tokens expire in 15 minutes. Refresh tokens rotate on every use (one-time use) and are stored as SHA-256 hashes, never plaintext.

4. **Budget vs Actual** — Monthly budget tracking with utilization percentages and on_track / warning / over_budget status per category.

5. **Soft Deletes** — Records are never permanently deleted. Soft-deleted records preserve the audit history and can be recovered.

6. **Rate Limiting** — 200 req/15min globally, tighter 20 req/15min on auth endpoints to prevent brute force.

7. **Self-protection Guards** — Users cannot change their own role, deactivate their own account, or delete themselves, even as admin.

---

## Assumptions Made

- Currency is INR (Indian Rupees) — easily configurable in `frontend/src/utils/index.js`
- Soft delete is preferred over hard delete for financial records to maintain data integrity
- Analysts can only edit/delete their own records; admins can edit/delete any record
- Budget limits are per category per month (not per user)
- The `insights` endpoint requires at minimum 1 month of expense data to be meaningful

---

## Environment Variables (Backend)

Copy `.env.example` to `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-strong-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ALLOWED_ORIGINS=http://localhost:5173
```
