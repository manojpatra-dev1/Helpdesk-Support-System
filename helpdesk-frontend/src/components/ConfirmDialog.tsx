import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  busy = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-[var(--color-ink-soft)]">{message}</p>
      {error && <p className="text-xs text-[var(--color-high)] mt-2">{error}</p>}
      <div className="flex justify-end gap-2 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-well)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 ${
            danger ? 'bg-[var(--color-high)] hover:opacity-90' : 'bg-[var(--color-brand)] hover:opacity-90'
          }`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
