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