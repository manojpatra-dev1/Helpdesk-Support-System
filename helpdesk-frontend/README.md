# Helpdesk Support System — Frontend

A React + TypeScript UI for a support agent to manage customers and tickets,
built against the Django REST API described in the project spec.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Zustand (customer, ticket, dashboard stores)
- React Router
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
  types.ts       shared domain types (Customer, Ticket, Status, Priority, ...)
  api/           axios client + one typed file per resource (customers, tickets)
  store/         Zustand stores — each owns its slice of state + async actions
  components/    shared UI: badges, modals, forms, the status pipeline, ConfirmDialog
  pages/         Dashboard, Tickets, TicketDetail, Customers, CustomerDetail
  constants.ts   status/priority enums, the forward-only sequence, formatters
```

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
