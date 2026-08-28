import { useState } from 'react'
import type { TicketComment } from '../types'
import { useTicketStore } from '../store/ticketStore'
import { formatDate } from '../constants'

interface CommentSectionProps {
  ticketId: number
  comments: TicketComment[]
  locked: boolean
}

export default function CommentSection({ ticketId, comments, locked }: CommentSectionProps) {
  const addComment = useTicketStore((s) => s.addComment)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setError('')
    const result = await addComment(ticketId, text)
    setSending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setText('')
  }

  return (
    <div className="flex flex-col gap-4">
      {comments?.length ? (
        <ul className="flex flex-col gap-3">
          {comments.map((c, i) => (
            <li
              key={c.id ?? i}
              className="rounded-lg border border-[var(--color-line)] px-3.5 py-2.5"
            >
              <p className="text-sm text-[var(--color-ink)]">{c.text}</p>
              {c.created_at && (
                <p className="text-xs font-mono text-[var(--color-ink-soft)] mt-1">
                  {formatDate(c.created_at)}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-ink-soft)]">No comments yet.</p>
      )}

      {locked ? (
        <p className="text-xs text-[var(--color-ink-soft)] italic">
          This ticket is closed — comments are locked.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
            rows={2}
            placeholder="Add a note about this ticket…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <span className="text-xs text-[var(--color-high)]">{error}</span>}
          <div>
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-60"
            >
              {sending ? 'Posting…' : 'Add comment'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
