import { Inbox, AlertTriangle } from 'lucide-react'

interface EmptyStateProps {
  title: string
  message?: string | null
  error?: boolean
}

export default function EmptyState({ title, message, error = false }: EmptyStateProps) {
  const Icon = error ? AlertTriangle : Inbox
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Icon
        size={28}
        strokeWidth={1.5}
        className={error ? 'text-[var(--color-high)]' : 'text-[var(--color-ink-soft)]'}
      />
      <p className="font-display font-semibold text-sm">{title}</p>
      {message && (
        <p className="text-sm text-[var(--color-ink-soft)] max-w-sm">{message}</p>
      )}
    </div>
  )
}
