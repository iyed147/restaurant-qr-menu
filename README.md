# 🍽️ Restaurant & Café QR Menu Platform

A modern QR Code menu platform for restaurants, cafés and tea rooms, built with a scalable architecture using FastAPI, React and PostgreSQL.

The application provides three dedicated interfaces:

- 👤 **Customer** – Browse the menu, place orders and submit reviews without creating an account.
- 👨‍🍳 **Employee** – Manage incoming orders in real time.
- 👨‍💼 **Administrator / Manager** – Manage menus, tables, employees and restaurant settings.
- 🌐 **Super Administrator** – Manage the entire platform and multiple restaurants.

---

# 🚀 Technology Stack

## Frontend
- React
- Vite
- TypeScript
- Tailwind CSS v4

## Backend
- FastAPI
- SQLAlchemy
- Alembic

## Database
- PostgreSQL

## Authentication & Security
- JWT Authentication (HS256)
- Passlib (bcrypt)
- Role-Based Access Control (RBAC)

## Realtime
- WebSocket

---

# 👥 User Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Global platform administrator |
| **Admin / Manager** | Manages a single restaurant |
| **Employee** | Handles customer orders |
| **Customer** | Temporary QR session (no account required) |

---

# 🔐 Authentication Model

The application uses **two completely different authentication mechanisms**.

## 1. Customer Authentication (QR Session)

Customers **do not create an account**.

After scanning a QR Code located on a table:

- a temporary session is created
- the session is linked to:
  - the restaurant
  - the table
- no password is required

This session is stored in:

```text
client_sessions
```

---

## 2. Staff Authentication (JWT)

Employees, Managers and Super Admins authenticate using:

- email
- password

After a successful login:

```
POST /api/v1/auth/login
```

the backend generates a signed JWT containing:

- user id
- role
- expiration date

The JWT is then sent with every protected request using:

```http
Authorization: Bearer <JWT>
```

---

## Authentication Comparison

| | QR Session | JWT |
|---|---|---|
| Used by | Customer | Employee / Admin / Super Admin |
| Requires account | ❌ No | ✅ Yes |
| Password | ❌ No | ✅ Yes |
| Authentication | `table_token` | JWT |
| Lifetime | Session | 24h (default) |

---

# 📂 Project Structure

```text
restaurant-qr-menu/
│
├── frontend/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── client_sessions.py
│   │   │       ├── menu.py
│   │   │       ├── orders.py
│   │   │       ├── staff_orders.py
│   │   │       ├── admin.py
│   │   │       └── reviews.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── ws/
│   │   └── tests/
│   │
│   └── alembic/
│
├── infra/
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# ⚙️ Local Installation

## 1. Environment Variables

Copy:

```text
backend/.env.example
```

to

```text
backend/.env
```

Copy:

```text
frontend/.env.example
```

to

```text
frontend/.env
```

Generate a strong random value for:

```env
SECRET_KEY=
```

> Never commit `.env` files to Git.

---

## 2. Start PostgreSQL

```bash
docker compose up -d db
```

---

## 3. Backend

```bash
cd backend

.venv\Scripts\activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger documentation:

```
http://localhost:8000/docs
```

---

## 4. Frontend

```bash
cd frontend

npm install

npm run dev
```

Application:

```
http://localhost:5173
```

---

# 🧪 Automated Tests

Run all tests:

```bash
cd backend

.venv\Scripts\activate

pytest -q
```

Current automated test coverage includes:

- Health endpoint
- Database connectivity
- Public menu
- Customer sessions
- Order creation
- Idempotent orders
- Item availability validation
- JWT authentication
- Protected staff routes
- Reviews workflow
- Duplicate review prevention

---

# 🔑 Development Test Account

| Role | Email | Password |
|------|-------|----------|
| Admin | employe1@test.com | motdepasse123 |

> ⚠️ Development account only. Replace credentials before any production deployment.

---

# 📡 Main API Endpoints

| Method | Endpoint | Description | Authentication |
|---------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Staff login | Public |
| POST | `/api/v1/client-sessions/start` | Start customer session | Public |
| GET | `/api/v1/menu/{restaurant_id}` | Public menu | Public |
| POST | `/api/v1/orders` | Create order | Customer Session |
| PATCH / DELETE | `/api/v1/orders/{id}` | Update / Cancel order | Customer Session |
| GET | `/api/v1/staff/orders` | Staff orders | JWT |
| PATCH | `/api/v1/staff/orders/{id}/status` | Update order status | JWT |
| POST | `/api/v1/reviews` | Submit review | Customer Session |
| POST / PATCH | `/api/v1/admin/*` | Administration | JWT |
| GET | `/health` | Health check | Public |
| WS | `/ws/orders/{restaurant_id}` | Realtime notifications | Public |

---

# ✅ End-to-End Workflow

- [ ] Start customer session
- [ ] Retrieve public menu
- [ ] Create customer order
- [ ] Verify idempotent order creation
- [ ] Staff authentication
- [ ] Update order status
- [ ] Submit review after completed order
- [ ] Prevent duplicate reviews
- [ ] Prevent order modification after timeout
- [ ] Reject unavailable menu items

---

# 🔒 Security Features (Episode 1)

- ✅ Secure QR Codes using cryptographically generated `table_token`
- ✅ JWT Authentication (HS256)
- ✅ Password hashing with bcrypt
- ✅ Role-Based Access Control (RBAC)
- ✅ Protected Staff and Admin endpoints
- ✅ Command idempotency (`idempotency_key`)
- ✅ Menu availability validation
- ✅ Administrative audit logging
- ✅ Restricted CORS configuration
- ✅ PostgreSQL integrity constraints

---

# 📅 Roadmap — Episode 2

- Complete React frontend
- WebSocket integration
- Production deployment
- UI/UX improvements
- Dashboard enhancements
- Additional automated tests

---

# 📄 License

This project was developed as an academic engineering project and serves as a production-ready foundation for a Restaurant & Café QR Menu Management System.