import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore'
import EmptyState from '../components/EmptyState'
import type { DashboardStats } from '../types'

const CARDS: { key: keyof DashboardStats; label: string; accent: string }[] = [
  { key: 'total', label: 'Total tickets', accent: 'var(--color-ink)' },
  { key: 'open', label: 'Open', accent: 'var(--color-open)' },
  { key: 'in_progress', label: 'In Progress', accent: 'var(--color-progress)' },
  { key: 'resolved', label: 'Resolved', accent: 'var(--color-resolved)' },
  { key: 'closed', label: 'Closed', accent: 'var(--color-closed)' },
  { key: 'high_priority', label: 'High priority', accent: 'var(--color-high)' },
]

export default function Dashboard() {
  const { stats, status, error, fetchDashboard } = useDashboardStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          A snapshot of the current ticket queue.
        </p>
      </div>

      {status === 'failed' && (
        <EmptyState error title="Couldn't load dashboard" message={error} />
      )}

      {status === 'succeeded' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CARDS.map(({ key, label, accent }) => (
            <div
              key={key}
              className="rounded-xl border border-[var(--color-line)] p-5 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
                <span className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <span className="font-display text-3xl font-semibold tabular-nums">
                {stats[key] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Link to="/tickets" className="text-sm font-medium text-[var(--color-brand)] hover:underline">
          View all tickets →
        </Link>
        <Link to="/customers" className="text-sm font-medium text-[var(--color-brand)] hover:underline">
          View all customers →
        </Link>
      </div>
    </div>
  )
}
