import type { Priority } from '../types'
import { PRIORITY_LABELS } from '../constants'

const STYLES: Record<Priority, { bg: string; fg: string }> = {
  LOW: { bg: 'var(--color-low-soft)', fg: 'var(--color-low)' },
  MEDIUM: { bg: 'var(--color-medium-soft)', fg: 'var(--color-medium)' },
  HIGH: { bg: 'var(--color-high-soft)', fg: 'var(--color-high)' },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const s = STYLES[priority] || STYLES.LOW
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}
