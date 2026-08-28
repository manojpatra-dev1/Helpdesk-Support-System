import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { useCustomerStore } from '../store/customerStore'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import EmptyState from '../components/EmptyState'
import CustomerFormModal from '../components/CustomerFormModal'
import TicketFormModal from '../components/TicketFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatDate } from '../constants'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    current: customer,
    currentTickets,
    currentStatus,
    currentError,
    fetchCustomer,
    clearCurrentCustomer,
    deleteCustomer,
  } = useCustomerStore()

  const [editOpen, setEditOpen] = useState(false)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (id) fetchCustomer(id)
    return () => clearCurrentCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return <p className="text-sm text-[var(--color-ink-soft)]">Loading customer…</p>
  }
  if (currentStatus === 'failed') {
    return <EmptyState error title="Couldn't load customer" message={currentError} />
  }
  if (!customer) return null

  const handleDelete = async () => {
    setDeleteBusy(true)
    setDeleteError('')
    const result = await deleteCustomer(customer.id)
    setDeleteBusy(false)
    if (!result.ok) {
      setDeleteError(result.error)
      return
    }
    navigate('/customers')
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link
        to="/customers"
        className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] w-fit"
      >
        <ArrowLeft size={15} /> Back to customers
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl tracking-tight">{customer.name}</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            {customer.email} · <span className="font-mono">{customer.phone}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--color-line)] hover:bg-[var(--color-well)]"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={() => setDeleting(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--color-line)] text-[var(--color-high)] hover:bg-[var(--color-well)]"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm">Tickets</h2>
          <button
            onClick={() => setTicketOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-brand)] text-white hover:opacity-90"
          >
            <Plus size={14} /> New ticket
          </button>
        </div>

        {currentTickets.length === 0 ? (
          <EmptyState title="No tickets yet" message="Create the first ticket for this customer." />
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-line)]">
            {currentTickets.map((t) => (
              <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                <Link to={`/tickets/${t.id}`} className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-[var(--color-ink-soft)]">
                      #T-{String(t.id).padStart(4, '0')}
                    </span>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">{formatDate(t.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editOpen && <CustomerFormModal customer={customer} onClose={() => setEditOpen(false)} />}
      {ticketOpen && <TicketFormModal presetCustomerId={customer.id} onClose={() => setTicketOpen(false)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete customer"
          message={`Delete "${customer.name}"? This can't be undone.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleting(false)
            setDeleteError('')
          }}
        />
      )}
    </div>
  )
}
