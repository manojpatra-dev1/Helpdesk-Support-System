import type { HistoryEntry } from '../types'
import { formatDate } from '../constants'

export default function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
  if (!history?.length) {
    return <p className="text-sm text-[var(--color-ink-soft)]">No activity yet.</p>
  }
  return (
    <ol className="flex flex-col">
      {history.map((h, i) => (
        <li key={h.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full mt-1.5 bg-[var(--color-brand)]" />
            {i < history.length - 1 && (
              <div className="w-px flex-1 bg-[var(--color-line)]" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm text-[var(--color-ink)]">{h.change_description}</p>
            <p className="text-xs font-mono text-[var(--color-ink-soft)] mt-0.5">
              {formatDate(h.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
