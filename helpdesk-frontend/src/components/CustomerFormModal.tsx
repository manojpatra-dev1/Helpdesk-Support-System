import { useState } from 'react'
import type { Customer, CustomerInput } from '../types'
import { useCustomerStore } from '../store/customerStore'
import Modal from './Modal'
import FormField, { inputClass } from './FormField'

interface CustomerFormModalProps {
  customer?: Customer | null
  onClose: () => void
  onSaved?: (customer: Customer) => void
}

export default function CustomerFormModal({ customer, onClose, onSaved }: CustomerFormModalProps) {
  const createCustomer = useCustomerStore((s) => s.createCustomer)
  const updateCustomer = useCustomerStore((s) => s.updateCustomer)
  const isEdit = Boolean(customer)

  const [form, setForm] = useState<CustomerInput>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof CustomerInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const result = isEdit
      ? await updateCustomer(customer!.id, form)
      : await createCustomer(form)

    setSaving(false)
    if (!result.ok) {
      setErrors(result.error.fieldErrors)
      return
    }
    onSaved?.(result.data)
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit customer' : 'New customer'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Name" error={errors.name}>
          <input
            className={inputClass}
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Jane Cooper"
            required
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={handleChange('email')}
            placeholder="jane@example.com"
            required
          />
        </FormField>
        <FormField label="Phone" error={errors.phone}>
          <input
            className={inputClass}
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="9999999999"
            required
          />
        </FormField>
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
