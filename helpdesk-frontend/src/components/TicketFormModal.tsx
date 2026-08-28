import { useState, useEffect } from 'react'
import type { Customer, Priority, Ticket } from '../types'
import { useTicketStore } from '../store/ticketStore'
import { customersApi } from '../api/customers'
import Modal from './Modal'
import FormField, { inputClass } from './FormField'
import { PRIORITIES, PRIORITY_LABELS } from '../constants'

interface TicketFormModalProps {
  ticket?: Ticket | null // pass to edit an existing ticket instead of creating one
  presetCustomerId?: number
  onClose: () => void
  onSaved?: (ticket: Ticket) => void
}

interface FormState {
  customer: number | ''
  subject: string
  description: string
  category: string
  priority: Priority
}

export default function TicketFormModal({
  ticket,
  presetCustomerId,
  onClose,
  onSaved,
}: TicketFormModalProps) {
  const createTicket = useTicketStore((s) => s.createTicket)
  const updateTicket = useTicketStore((s) => s.updateTicket)
  const isEdit = Boolean(ticket)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState<FormState>({
    customer: ticket?.customer ?? presetCustomerId ?? '',
    subject: ticket?.subject ?? '',
    description: ticket?.description ?? '',
    category: ticket?.category ?? '',
    priority: ticket?.priority ?? 'MEDIUM',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit && !presetCustomerId) {
      customersApi.list().then(setCustomers).catch(() => {})
    }
  }, [isEdit, presetCustomerId])

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const result = isEdit
      ? await updateTicket(ticket!.id, {
          subject: form.subject,
          description: form.description,
          category: form.category,
          priority: form.priority,
        })
      : await createTicket({
          customer: Number(form.customer),
          subject: form.subject,
          description: form.description,
          category: form.category,
          priority: form.priority,
        })

    setSaving(false)
    if (!result.ok) {
      setErrors(result.error.fieldErrors)
      return
    }
    onSaved?.(result.data)
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit ticket' : 'New ticket'} onClose={onClose} width="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEdit && !presetCustomerId && (
          <FormField label="Customer" error={errors.customer}>
            <select className={inputClass} value={form.customer} onChange={handleChange('customer')} required>
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </FormField>
        )}
        <FormField label="Subject" error={errors.subject}>
          <input
            className={inputClass}
            value={form.subject}
            onChange={handleChange('subject')}
            placeholder="Internet not working"
            required
          />
        </FormField>
        <FormField label="Description" error={errors.description}>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Describe the issue"
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" error={errors.category}>
            <input
              className={inputClass}
              value={form.category}
              onChange={handleChange('category')}
              placeholder="Network"
              required
            />
          </FormField>
          <FormField label="Priority" error={errors.priority}>
            <select className={inputClass} value={form.priority} onChange={handleChange('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-well)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
