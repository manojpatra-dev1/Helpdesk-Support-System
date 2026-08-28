import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export default function Modal({ title, onClose, children, width = 'max-w-md' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-[var(--color-ink)]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${width} bg-white rounded-xl border border-[var(--color-line)] shadow-xl`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <h2 className="font-display font-semibold text-[15px]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] rounded p-1 hover:bg-[var(--color-well)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
