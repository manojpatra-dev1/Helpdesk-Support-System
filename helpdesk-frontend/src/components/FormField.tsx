import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</label>
      {children}
      {error && <span className="text-xs text-[var(--color-high)]">{error}</span>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors disabled:opacity-60 disabled:bg-[var(--color-well)]'
