import type { Status } from '../types'
import { STATUS_SEQUENCE, STATUS_LABELS } from '../constants'

const ACCENT: Record<Status, string> = {
  OPEN: 'var(--color-open)',
  IN_PROGRESS: 'var(--color-progress)',
  RESOLVED: 'var(--color-resolved)',
  CLOSED: 'var(--color-closed)',
}

// Renders the four-stage lifecycle as a literal rail. The ticket's current
// stage and everything before it are filled in; later stages stay open,
// mirroring the forward-only rule the API enforces.
export default function StatusPipeline({ status }: { status: Status }) {
  const currentIdx = STATUS_SEQUENCE.indexOf(status)

  return (
    <div className="flex items-center w-full">
      {STATUS_SEQUENCE.map((step, i) => {
        const reached = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex items-center justify-center h-6 w-6 rounded-full border-2 text-[10px] font-mono font-medium transition-colors"
                style={{
                  borderColor: reached ? ACCENT[step] : 'var(--color-line)',
                  background: reached ? ACCENT[step] : 'var(--color-canvas)',
                  color: reached ? '#fff' : 'var(--color-ink-soft)',
                  boxShadow: isCurrent ? `0 0 0 3px ${ACCENT[step]}22` : 'none',
                }}
              >
                {i + 1}
              </div>
              <span
                className="text-[11px] font-medium whitespace-nowrap"
                style={{ color: reached ? 'var(--color-ink)' : 'var(--color-ink-soft)' }}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < STATUS_SEQUENCE.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-2 mb-4 rounded-full transition-colors"
                style={{ background: i < currentIdx ? ACCENT[step] : 'var(--color-line)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
