import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, ArrowRightCircle } from 'lucide-react'
import { useTicketStore } from '../store/ticketStore'
import { useAuthStore } from '../store/authStore'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import EmptyState from '../components/EmptyState'
import TicketFormModal from '../components/TicketFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { STATUS_SEQUENCE, STATUS_LABELS, PRIORITIES, PRIORITY_LABELS, formatDate, nextStatus } from '../constants'
import type { Ticket } from '../types'

export default function Tickets() {
  const { items, listStatus, listError, filters, setFilters, fetchTickets, deleteTicket, changeStatus } =
    useTicketStore()
  const role = useAuthStore((s) => s.role)
  const isAdmin = role === 'admin'
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [deleting, setDeleting] = useState<Ticket | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [searchInput, setSearchInput] = useState(filters.search)
  const [advancingId, setAdvancingId] = useState<number | null>(null)

  useEffect(() => {
    fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) setFilters({ search: searchInput })
    }, 350)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const result = await deleteTicket(deleting.id)
    setDeleteBusy(false)
    if (!result.ok) {
      setDeleteError(result.error)
      return
    }
    setDeleting(null)
  }

  const handleAdvance = async (t: Ticket) => {
    const upcoming = nextStatus(t.status)
    if (!upcoming) return
    setAdvancingId(t.id)
    await changeStatus(t.id, upcoming)
    setAdvancingId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl tracking-tight">Tickets</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Search, filter, and triage support tickets.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 shrink-0"
        >
          <Plus size={16} /> New ticket
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
          <input
            className="w-full rounded-lg border border-[var(--color-line)] bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
            placeholder="Search subject or description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
        >
          <option value="">All statuses</option>
          {STATUS_SEQUENCE.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          value={filters.priority}
          onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <input
          className="w-36 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
        />
      </div>

      {listStatus === 'failed' && <EmptyState error title="Couldn't load tickets" message={listError} />}

      {listStatus === 'succeeded' && items.length === 0 && (
        <EmptyState title="No tickets match these filters" message="Try clearing a filter or create a new ticket." />
      )}

      {listStatus === 'succeeded' && items.length > 0 && (
        <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-well)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                <th className="px-4 py-2.5 font-medium">Ticket</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Updated</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const locked = t.status === 'CLOSED'
                return (
                  <tr
                    key={t.id}
                    className="border-t border-[var(--color-line)] hover:bg-[var(--color-well)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${t.id}`} className="block">
                        <span className="font-mono text-xs text-[var(--color-ink-soft)]">
                          #T-{String(t.id).padStart(4, '0')}
                        </span>
                        <p className="font-medium text-[var(--color-ink)]">{t.subject}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{t.customer_name}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{t.category}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[var(--color-ink-soft)]">
                      {formatDate(t.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <button
                            onClick={() => handleAdvance(t)}
                            disabled={locked || advancingId === t.id}
                            title={
                              locked
                                ? 'Closed tickets cannot change status'
                                : `Move to ${STATUS_LABELS[nextStatus(t.status)!]}`
                            }
                            className="p-1.5 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-brand)] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <ArrowRightCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setEditing(t)}
                          disabled={locked}
                          title={locked ? 'Closed tickets cannot be edited' : 'Edit ticket'}
                          className="p-1.5 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleting(t)}
                          title="Delete ticket"
                          className="p-1.5 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-high)] hover:bg-white"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <TicketFormModal onClose={() => setShowCreate(false)} />}
      {editing && <TicketFormModal ticket={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete ticket"
          message={`Delete "${deleting.subject}"? This can't be undone.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
        />
      )}
    </div>
  )
}
