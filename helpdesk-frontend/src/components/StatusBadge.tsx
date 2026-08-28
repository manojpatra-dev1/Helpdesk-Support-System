import type { Status } from '../types'
import { STATUS_LABELS } from '../constants'

const STYLES: Record<Status, { bg: string; fg: string }> = {
  OPEN: { bg: 'var(--color-open-soft)', fg: 'var(--color-open)' },
  IN_PROGRESS: { bg: 'var(--color-progress-soft)', fg: 'var(--color-progress)' },
  RESOLVED: { bg: 'var(--color-resolved-soft)', fg: 'var(--color-resolved)' },
  CLOSED: { bg: 'var(--color-closed-soft)', fg: 'var(--color-closed)' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const s = STYLES[status] || STYLES.CLOSED
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-tight"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
