# Helpdesk Support System

A helpdesk ticketing system built as a one-day challenge. Supports two roles —
**admin** (support agent) and **customer** — with JWT-based authentication.
Admins manage all customers and tickets; customers can register, log in, and
raise/track their own tickets.

The project has two parts:
- `helpdesk_backend/` — Django REST Framework API
- `helpdesk-frontend/` — React frontend (consumes the API)

---

## Tech Stack

**Backend**
- Python, Django
- Django REST Framework (DRF) — generic class-based views
- djangorestframework-simplejwt — JWT authentication
- django-filter — filtering/search
- django-cors-headers — CORS for frontend integration
- SQLite (default local database)

**Frontend**
- React + Vite
- TypeScript
- Tailwind CSS
- Zustand — state management (including auth store)
- Axios — API calls
- React Router — with protected/role-based routes
- Lucide React — icons

---

## Project Structure


```
HelpDesk_Support_System/
├── helpdesk_backend/
│ ├── helpdesk_project/ # Project settings, urls, custom exception handler
│ ├── accounts/ # User auth: register, login, JWT, role permissions
│ ├── customers/ # Customer model, serializer, views, urls
│ ├── tickets/ # Ticket, TicketHistory, Comment models + serializers, views, urls, tests
│ ├── manage.py
│ ├── requirements.txt
│ └── README.md
├── helpdesk-frontend/
│ ├── src/
│ │ ├── api/ # auth.ts, customers.ts, tickets.ts, client.ts
│ │ ├── store/ # authStore.ts + other Zustand stores
│ │ ├── components/ # ProtectedRoute.tsx, Sidebar.tsx, etc.
│ │ └── pages/ # Login, Register, Profile, Dashboard, Tickets, Customers...
│ ├── public/
│ └── package.json
└── .gitignore
```



---

## Backend Setup

```bash
cd helpdesk_backend
python -m venv venv
venv\Scripts\activate          # Windows

pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin panel: `http://127.0.0.1:8000/admin/`
API base URL: `http://127.0.0.1:8000/api/`

---

## Frontend Setup

```bash
cd helpdesk-frontend
npm install
npm run dev
```

Runs on Vite's default dev server (usually `http://localhost:5173`).

---

## Authentication & Roles

- Auth is JWT-based (`djangorestframework-simplejwt`) — `access` + `refresh` tokens
  issued on login and stored client-side (Zustand `authStore`).
- Two roles:
  - **admin** (`is_staff=True`) — full access: all customers, all tickets, dashboard
    stats, and can change ticket status.
  - **customer** — created automatically at registration, linked 1:1 to a `Customer`
    record; can only see/manage their own tickets.
- Frontend routes are role-gated via `ProtectedRoute` — e.g. `/customers` and the
  dashboard (`/`) are admin-only; a logged-in customer is redirected to `/tickets`.

---

## Data Models

**Customer**
- `user` (OneToOne to Django `User`, nullable — only set for self-registered customers)
- `name`, `email` (unique), `phone`
- `created_at`, `updated_at`

**Ticket**
- `customer` (FK to Customer)
- `subject`, `description`, `category`
- `priority`: `LOW` | `MEDIUM` | `HIGH`
- `status`: `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`
- `created_at`, `updated_at`

**TicketHistory**
- `ticket` (FK), `change_description`, `created_at`
- Auto-created whenever a ticket's status changes

**Comment**
- `ticket` (FK), `text`, `created_at`

---

## Business Rules Implemented

1. A ticket must reference a valid, existing customer.
2. A new ticket always starts with status `OPEN`.
3. Status can only move forward in sequence — `OPEN → IN_PROGRESS → RESOLVED → CLOSED`.
   Skipping a step (e.g. `OPEN → RESOLVED`) is rejected.
4. A `CLOSED` ticket is locked — it cannot be edited, have its status changed, or
   receive new comments.
5. Every status change is recorded in `TicketHistory`.
6. Invalid input (missing fields, invalid customer, invalid status jump) returns a
   clear `400` error.
7. Only an **admin** can change ticket status or view the customer list/dashboard;
   a **customer** only sees their own tickets.
8. Registration rejects an email that's already in use; password + confirm-password
   must match.

---

## API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new customer account (`name`, `email`, `password`, `confirm_password`) |
| POST | `/api/auth/login/` | Log in (`email`, `password`) → returns `access`, `refresh`, `role`, `customer_id`, `username` |

### Customers
| Method | URL | Description |
|---|---|---|
| GET / POST | `/api/customers/` | List / Create customer — admin only (supports `?search=`) |
| GET / PUT / DELETE | `/api/customers/<id>/` | Retrieve / Update / Delete a customer |
| GET | `/api/customers/<id>/tickets/` | List all tickets for this customer |

### Tickets
| Method | URL | Description |
|---|---|---|
| GET / POST | `/api/tickets/` | List / Create ticket (filters: `?status=`, `?priority=`, `?category=`, search: `?search=`) — customers see only their own |
| GET / PUT / DELETE | `/api/tickets/<id>/` | Retrieve / Update / Delete a ticket |
| PATCH | `/api/tickets/<id>/change-status/` | Change ticket status — admin only (sequence enforced) |
| POST | `/api/tickets/<id>/add-comment/` | Add a comment to a ticket |
| GET | `/api/tickets/<id>/history/` | View a ticket's status-change history |
| GET | `/api/tickets/dashboard/` | Dashboard stats — admin only: total, open, in-progress, resolved, closed, high-priority |

---

## Error Response Format

All errors follow a consistent shape via a custom DRF exception handler:

```json
{
  "success": false,
  "errors": {
    "field_name": ["error message here"]
  }
}
```

---

## CORS

`django-cors-headers` is enabled with `CORS_ALLOW_ALL_ORIGINS = True` for local
development, so the frontend can call the API directly without CORS errors.

---

## Pagination

Not enabled on the backend — all endpoints return the full list. Pagination (if
needed) is handled on the frontend.

---

## Running Backend Tests

```bash
cd helpdesk_backend
python manage.py test tickets
```

Covers the core business rules: default status on creation, valid/invalid status
transitions, closed-ticket lock (edit, status change, comments), history entry
creation, and invalid-customer rejection.
