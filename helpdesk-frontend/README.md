# Helpdesk Support System — Frontend

A React + TypeScript UI with role-based access for an **admin** to manage
customers and tickets, and a **customer** to register, log in, and track their
own tickets — built against the Django REST API described in the project spec.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Zustand (auth, customer, ticket, dashboard stores)
- React Router — with role-based `ProtectedRoute`
- Axios

## Setup

```bash
npm install
npm run dev
```

The app expects the backend API at `http://127.0.0.1:8000/api/` (see
`src/api/client.ts` to change this). CORS must be enabled on the backend, as
noted in the spec.

## Structure


```
src/
types.ts shared domain types (Customer, Ticket, Status, Priority, ...)
api/ axios client + one typed file per resource (auth, customers, tickets)
store/ Zustand stores — authStore (tokens, role, user) + resource stores
components/ shared UI: ProtectedRoute, Sidebar, badges, modals, forms, status pipeline, ConfirmDialog
pages/ Login, Register, Profile, Dashboard, Tickets, TicketDetail, Customers, CustomerDetail
constants.ts status/priority enums, the forward-only sequence, formatters

```


## Authentication & Roles

- `authStore` holds `access`/`refresh` tokens, `role`, and `customer_id` after
  login, persisted so a page refresh doesn't log the user out.
- `Login` and `Register` pages call `src/api/auth.ts`; a successful login routes
  the user in based on role.
- `ProtectedRoute` wraps routes that need a logged-in user, and optionally a
  specific role (e.g. `roles={['admin']}`) — an unauthenticated user is sent to
  `/login`, and a customer hitting an admin-only route (like `/customers`) is
  redirected to `/tickets`.
- `Profile` page shows the logged-in user's own details.

## Notable behavior

- **Status pipeline.** Ticket status only ever advances one step at a time
  (`OPEN → IN_PROGRESS → RESOLVED → CLOSED`), matching the backend rule. The
  ticket detail page only ever offers the *next* status, never a jump or a
  dropdown of all four.
- **Closed tickets are locked.** Once a ticket is `CLOSED`, the comment form,
  edit action, and "move to next status" action are hidden or disabled
  rather than failing silently against the API's 400 response.
- **Edit and delete.** Both tickets and customers have edit and delete
  actions — inline in the list tables (icon buttons) and on their detail
  pages. Deletes go through a confirmation dialog and surface API errors
  inline rather than failing silently.
- **Field-level errors.** The API's `{ success: false, errors: { field: [...] } }`
  shape is parsed once in `src/api/client.ts` and surfaced under each form
  field, so validation messages line up with the input that caused them.
- **Search is debounced** on both the ticket and customer list pages to
  avoid firing a request on every keystroke.

## Build

```bash
npm run build      # type-checks with tsc, then builds with vite
npm run typecheck  # type-check only
```
