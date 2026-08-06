# 🍽️ Restaurant & Café QR Menu Platform

A modern, full-stack QR Code menu and ordering platform for restaurants, cafés and tea rooms — built with FastAPI, React and PostgreSQL, and validated end-to-end on real devices over a local network.

The application provides dedicated, role-based interfaces:

- 👤 **Customer** – Scan a QR code, browse the menu, order, track order status in real time, and leave a review — no account required.
- 👨‍🍳 **Employee** – Manage incoming orders in real time from a unified dashboard.
- 👨‍💼 **Administrator / Manager** – Manage menu, categories, tables (with QR generation), and staff accounts.
- 🌐 **Super Administrator** – Reserved for future multi-restaurant platform management.

---

# 🚀 Technology Stack

## Frontend
- React + Vite + TypeScript
- Tailwind CSS v4
- Zustand (state management, persisted sessions)
- React Router
- WebSocket (native)

## Backend
- FastAPI
- SQLAlchemy + Alembic (migrations)
- Pydantic Settings

## Database
- PostgreSQL

## Authentication & Security
- JWT Authentication (HS256)
- Passlib (bcrypt password hashing)
- Role-Based Access Control (RBAC)
- CORS restricted to known frontend origins

## Realtime
- WebSocket broadcasting (order lifecycle events)
- Automatic reconnection with exponential backoff

---

# 👥 User Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Reserved for future global platform administration |
| **Admin / Manager** | Manages a single restaurant (menu, tables, staff) |
| **Employee** | Handles customer orders (view, advance status) |
| **Customer** | Temporary QR session, no account required |

Employees and Admins share a **single login and dashboard interface** — available tabs and actions are conditionally rendered based on the JWT role.

---

# 🔐 Authentication Model

The application uses **two completely different authentication mechanisms**, by design.

## 1. Customer Authentication (QR Session)

Customers do not create an account. After scanning the QR code on a table:

- A temporary session is created (name, optional phone number)
- Linked to the restaurant and table via a cryptographically random `table_token`
- No password required
- Session persisted client-side in `sessionStorage`, expires automatically after 3 hours

Stored in: `client_sessions`

## 2. Staff Authentication (JWT)

Employees, Managers and Super Admins authenticate via:

```
POST /api/v1/auth/login
```

The backend returns a signed JWT containing user id, role, and expiration. Sent on every protected request via:

```http
Authorization: Bearer <JWT>
```

## Comparison

| | QR Session | JWT |
|---|---|---|
| Used by | Customer | Employee / Admin |
| Requires account | ❌ No | ✅ Yes |
| Password | ❌ No | ✅ Yes |
| Lifetime | 3h (client-enforced) | 24h (server-enforced) |

---

# 📂 Project Structure

```text
restaurant-qr-menu/
│
├── frontend/
│   └── src/
│       ├── app/router/          # Routes, auth guard
│       ├── pages/                # customer/, dashboard/
│       ├── features/
│       │   ├── customer/         # cart, session, order flow
│       │   ├── dashboard/        # orders/menu/tables/users tabs
│       │   └── auth/             # JWT store
│       ├── shared/hooks/         # useOrdersSocket (reconnecting WS)
│       └── services/             # axios client, JWT decode
│
├── backend/
│   ├── app/
│   │   ├── api/v1/               # auth, client_sessions, menu,
│   │   │                         # orders, staff_orders, admin, reviews
│   │   ├── core/                 # config, deps (RBAC), security (JWT/bcrypt)
│   │   ├── db/, models/, schemas/
│   │   ├── ws/                   # order_ws_manager (broadcast)
│   │   └── tests/                # pytest suite
│   └── alembic/
│
├── infra/
├── docker-compose.yml
└── .env.example
```

---

# ⚙️ Local Installation

## 1. Environment Variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set a strong random `SECRET_KEY` in `backend/.env`. Never commit `.env` files.

## 2. Start PostgreSQL

```bash
docker compose up -d db
```

## 3. Backend

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger docs: `http://localhost:8000/docs`

## 4. Frontend

```bash
cd frontend
npm install
npx vite --host
```

App: `http://localhost:5173` (and network URL for mobile testing)

> ℹ️ On Windows, testing from a phone on the same network requires the Wi-Fi profile set to **Private** and inbound firewall rules for ports 5173/8000.

---

# 🧪 Automated Tests

```bash
cd backend
.venv\Scripts\activate
pytest -q
```

Covers: health/DB connectivity, public menu, customer sessions, order creation & idempotency, item availability, JWT auth, protected staff routes, reviews (completed-only, no duplicates).

---

# 📡 Main API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Staff login | Public |
| POST | `/api/v1/client-sessions/start` | Start customer session | Public |
| GET | `/api/v1/menu/{restaurant_id}` | Public menu | Public |
| POST | `/api/v1/orders` | Create order | Customer session |
| PATCH / DELETE | `/api/v1/orders/{id}` | Edit/cancel (30s window) | Customer session |
| GET | `/api/v1/staff/orders` | List orders | JWT (staff/admin) |
| PATCH | `/api/v1/staff/orders/{id}/status` | Advance order status | JWT (staff/admin) |
| POST | `/api/v1/reviews` | Submit review (completed only) | Customer session |
| POST/GET/PATCH | `/api/v1/admin/menu-items` | Menu CRUD | JWT (admin) |
| POST | `/api/v1/admin/categories` | Category creation | JWT (admin) |
| POST/GET/PATCH | `/api/v1/admin/tables` | Table CRUD | JWT (admin) |
| POST/GET/PATCH | `/api/v1/admin/users` | Staff account management | JWT (admin) |
| GET | `/health` | Health check + DB check | Public |
| WS | `/ws/orders/{restaurant_id}` | Realtime order events | Public |

---

# ✅ Feature Checklist (Episode 1 + Episode 2)

**Backend**
- [x] JWT auth + RBAC (admin/employee)
- [x] Order lifecycle (sent → preparing → served → completed / cancelled)
- [x] Idempotent order creation
- [x] 30-second edit/cancel window
- [x] Menu availability validation
- [x] Admin audit logging
- [x] Reviews restricted to completed orders, one per order
- [x] WebSocket broadcasting (created, updated, status changed, cancelled)
- [x] pytest suite (12+ tests)

**Frontend**
- [x] Customer ordering flow (menu → cart → confirm → live status)
- [x] Order editing/cancellation with countdown
- [x] Unified staff/admin dashboard with role-based tabs
- [x] Real-time order tracking (both staff and customer side)
- [x] Menu, category, table, and staff management UIs
- [x] QR code generation and printing per table
- [x] Reconnecting WebSocket (exponential backoff)
- [x] Client session expiry (3h)
- [x] Verified on real mobile devices over local network

---

# 🔒 Security Features

- Cryptographically random `table_token` (not guessable from table number)
- JWT (HS256) + bcrypt password hashing
- Role-based access control on all staff/admin routes
- Admins cannot demote their own account (prevents lockout)
- Idempotency keys with DB-level unique constraint
- Restricted CORS origins
- PostgreSQL integrity constraints (unique table numbers, one review per order, etc.)

---

# 📅 Roadmap — Episode 3

- Production deployment (Vercel / Render / Supabase)
- Client onboarding: real menu, real branding, printed QR codes
- Optional: multilingual support (FR/EN)
- Optional: product photo uploads
- Optional: WebSocket authentication hardening

---

# 📄 License

Developed as an individual engineering project — a production-oriented foundation for a real-world Restaurant & Café QR Menu Management System, first deployed for an actual small tea room.