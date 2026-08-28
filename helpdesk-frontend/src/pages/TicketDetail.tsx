import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useTicketStore } from '../store/ticketStore'
import { useAuthStore } from '../store/authStore'
import StatusPipeline from '../components/StatusPipeline'
import PriorityBadge from '../components/PriorityBadge'
import CommentSection from '../components/CommentSection'
import HistoryTimeline from '../components/HistoryTimeline'
import EmptyState from '../components/EmptyState'
import TicketFormModal from '../components/TicketFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { nextStatus, STATUS_LABELS, formatDate } from '../constants'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    current: ticket,
    history,
    currentStatus,
    currentError,
    actionError,
    fetchTicket,
    clearCurrentTicket,
    changeStatus,
    clearActionError,
    deleteTicket,
  } = useTicketStore()
  const isAdmin = useAuthStore((s) => s.role === 'admin')

  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (id) fetchTicket(id)
    return () => clearCurrentTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return <p className="text-sm text-[var(--color-ink-soft)]">Loading ticket…</p>
  }
  if (currentStatus === 'failed') {
    return <EmptyState error title="Couldn't load ticket" message={currentError} />
  }
  if (!ticket) return null

  const upcoming = nextStatus(ticket.status)
  const locked = ticket.status === 'CLOSED'

  const handleAdvance = () => {
    if (!upcoming) return
    clearActionError()
    changeStatus(ticket.id, upcoming)
  }

  const handleDelete = async () => {
    setDeleteBusy(true)
    setDeleteError('')
    const result = await deleteTicket(ticket.id)
    setDeleteBusy(false)
    if (!result.ok) {
      setDeleteError(result.error)
      return
    }
    navigate('/tickets')
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link
        to="/tickets"
        className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] w-fit"
      >
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-[var(--color-ink-soft)]">
            #T-{String(ticket.id).padStart(4, '0')}
          </span>
          <h1 className="font-display font-semibold text-2xl tracking-tight mt-0.5">
            {ticket.subject}
          </h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            {ticket.customer_name} · {ticket.category}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <button
            onClick={() => setEditing(true)}
            disabled={locked}
            title={locked ? 'Closed tickets cannot be edited' : 'Edit ticket'}
            className="p-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-well)] disabled:opacity-40"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleting(true)}
            title="Delete ticket"
            className="p-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:text-[var(--color-high)] hover:bg-[var(--color-well)]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] p-5">
        <StatusPipeline status={ticket.status} />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-line)]">
          {locked ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              This ticket is closed and can no longer be edited.
            </p>
          ) : (
            <p className="text-sm text-[var(--color-ink-soft)]">
              Next step: <span className="font-medium text-[var(--color-ink)]">{STATUS_LABELS[upcoming!]}</span>
            </p>
          )}
          {!locked && isAdmin && (
            <button
              onClick={handleAdvance}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90"
            >
              Move to {STATUS_LABELS[upcoming!]}
            </button>
          )}
        </div>
        {actionError && <p className="text-xs text-[var(--color-high)] mt-2">{actionError}</p>}
      </div>

      <div className="rounded-xl border border-[var(--color-line)] p-5">
        <h2 className="font-display font-semibold text-sm mb-2">Description</h2>
        <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{ticket.description}</p>
        <p className="text-xs font-mono text-[var(--color-ink-soft)] mt-3">
          Created {formatDate(ticket.created_at)} · Updated {formatDate(ticket.updated_at)}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-line)] p-5">
          <h2 className="font-display font-semibold text-sm mb-3">Comments</h2>
          <CommentSection ticketId={ticket.id} comments={ticket.comments} locked={locked} />
        </div>
        <div className="rounded-xl border border-[var(--color-line)] p-5">
          <h2 className="font-display font-semibold text-sm mb-3">History</h2>
          <HistoryTimeline history={history} />
        </div>
      </div>

      {editing && <TicketFormModal ticket={ticket} onClose={() => setEditing(false)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete ticket"
          message={`Delete "${ticket.subject}"? This can't be undone.`}
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
