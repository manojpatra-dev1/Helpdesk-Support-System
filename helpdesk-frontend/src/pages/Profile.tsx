import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCustomerStore } from '../store/customerStore'
import EmptyState from '../components/EmptyState'
import CustomerFormModal from '../components/CustomerFormModal'
import { formatDate } from '../constants'

export default function Profile() {
  const customerId = useAuthStore((s) => s.customerId)
  const { current: customer, currentStatus, currentError, fetchCustomer, clearCurrentCustomer } =
    useCustomerStore()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (customerId) fetchCustomer(customerId)
    return () => clearCurrentCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return <p className="text-sm text-[var(--color-ink-soft)]">Loading profile…</p>
  }
  if (currentStatus === 'failed') {
    return <EmptyState error title="Couldn't load profile" message={currentError} />
  }
  if (!customer) return null

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-tight">My profile</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">Your account details.</p>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-lg">{customer.name}</h2>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">
              {customer.email} · <span className="font-mono">{customer.phone}</span>
            </p>
            <p className="text-xs font-mono text-[var(--color-ink-soft)] mt-2">
              Customer since {formatDate(customer.created_at)}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--color-line)] hover:bg-[var(--color-well)] shrink-0"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>

      {editing && <CustomerFormModal customer={customer} onClose={() => setEditing(false)} />}
    </div>
  )
}
