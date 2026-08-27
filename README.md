# Helpdesk Support System — Backend

Django REST Framework backend for a simple helpdesk ticketing system, built as part of a
one-day challenge. A support agent can manage customers and their support tickets —
no login/authentication required.

---

## Tech Stack

- Python, Django
- Django REST Framework (DRF) — generic class-based views
- django-filter — filtering/search
- django-cors-headers — CORS for frontend integration
- SQLite (default local database)

---

## Project Structure

```
helpdesk_backend/
├── helpdesk_project/     # Project settings, urls, custom exception handler
├── customers/             # Customer model, serializer, views, urls
├── tickets/                # Ticket, TicketHistory, Comment models + serializers, views, urls, tests
├── manage.py
└── requirements.txt
```

---

## Setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin panel: `http://127.0.0.1:8000/admin/`
API base URL: `http://127.0.0.1:8000/api/`

---

## Data Models

**Customer**
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

---

## API Endpoints

### Customers
| Method | URL | Description |
|---|---|---|
| GET / POST | `/api/customers/` | List / Create customer (supports `?search=`) |
| GET / PUT / DELETE | `/api/customers/<id>/` | Retrieve / Update / Delete a customer |
| GET | `/api/customers/<id>/tickets/` | List all tickets for this customer |

### Tickets
| Method | URL | Description |
|---|---|---|
| GET / POST | `/api/tickets/` | List / Create ticket (filters: `?status=`, `?priority=`, `?category=`, search: `?search=`) |
| GET / PUT / DELETE | `/api/tickets/<id>/` | Retrieve / Update / Delete a ticket |
| PATCH | `/api/tickets/<id>/change-status/` | Change ticket status (sequence enforced) |
| POST | `/api/tickets/<id>/add-comment/` | Add a comment to a ticket |
| GET | `/api/tickets/<id>/history/` | View a ticket's status-change history |
| GET | `/api/tickets/dashboard/` | Dashboard stats: total, open, in-progress, resolved, closed, high-priority |

Full request/response examples are in `helpdesk_api_handoff.md` (shared with the
frontend developer).

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
development, so the frontend (React) can call this API directly without CORS errors.

---

## Pagination

Not enabled on the backend — all endpoints return the full list. Pagination (if
needed) is handled on the frontend.

---

## Running Tests

```bash
python manage.py test tickets
```

Covers the core business rules: default status on creation, valid/invalid status
transitions, closed-ticket lock (edit, status change, comments), history entry
creation, and invalid-customer rejection.
