import { NavLink } from 'react-router-dom'
import { LayoutGrid, Ticket, Users } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/tickets', label: 'Tickets', icon: Ticket, end: false },
  { to: '/customers', label: 'Customers', icon: Users, end: false },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-[var(--color-line)] flex flex-col py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-7 w-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">H</span>
        </div>
        <span className="font-display font-semibold text-[15px] tracking-tight">
          Helpdesk
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-well)] hover:text-[var(--color-ink)]'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-3 pt-6 text-[11px] text-[var(--color-ink-soft)] font-mono">
        agent console
      </div>
    </aside>
  )
}
