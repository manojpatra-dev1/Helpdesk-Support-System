import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useCustomerStore } from '../store/customerStore'
import EmptyState from '../components/EmptyState'
import CustomerFormModal from '../components/CustomerFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Customer } from '../types'

export default function Customers() {
  const { items, listStatus, listError, fetchCustomers, deleteCustomer } = useCustomerStore()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const result = await deleteCustomer(deleting.id)
    setDeleteBusy(false)
    if (!result.ok) {
      setDeleteError(result.error)
      return
    }
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl tracking-tight">Customers</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Manage the people behind your tickets.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 shrink-0"
        >
          <Plus size={16} /> New customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
        <input
          className="w-full rounded-lg border border-[var(--color-line)] bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {listStatus === 'failed' && <EmptyState error title="Couldn't load customers" message={listError} />}

      {listStatus === 'succeeded' && items.length === 0 && (
        <EmptyState title="No customers found" message="Try a different search or add one." />
      )}

      {listStatus === 'succeeded' && items.length > 0 && (
        <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-well)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-[var(--color-line)] hover:bg-[var(--color-well)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/customers/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{c.email}</td>
                  <td className="px-4 py-3 font-mono text-[var(--color-ink-soft)]">{c.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        title="Edit customer"
                        className="p-1.5 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-white"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        title="Delete customer"
                        className="p-1.5 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-high)] hover:bg-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CustomerFormModal onClose={() => setShowCreate(false)} />}
      {editing && <CustomerFormModal customer={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete customer"
          message={`Delete "${deleting.name}"? This can't be undone.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
        />
      )}
    </div>
  )
}
