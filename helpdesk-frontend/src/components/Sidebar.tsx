import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Ticket, Users, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/tickets', label: 'Tickets', icon: Ticket, end: false },
  { to: '/customers', label: 'Customers', icon: Users, end: false },
]

const customerLinks = [
  { to: '/tickets', label: 'My Tickets', icon: Ticket, end: false },
  { to: '/profile', label: 'My Profile', icon: User, end: false },
]

export default function Sidebar() {
  const role = useAuthStore((s) => s.role)
  const username = useAuthStore((s) => s.username)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const links = role === 'admin' ? adminLinks : customerLinks

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

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
      <div className="mt-auto flex flex-col gap-1 px-1 pt-6">
        {username && (
          <div className="px-2 pb-2">
            <p className="text-xs font-medium text-[var(--color-ink)] truncate">{username}</p>
            <p className="text-[11px] text-[var(--color-ink-soft)] capitalize">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-well)] hover:text-[var(--color-ink)]"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  )
}
