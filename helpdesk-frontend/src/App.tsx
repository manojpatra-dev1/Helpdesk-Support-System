import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './store/authStore'

function AppShell() {
  const role = useAuthStore((s) => s.role)

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 px-8 py-7 overflow-y-auto">
        <Routes>
          {/* Dashboard stats are admin-only; customers land on their tickets */}
          <Route path="/" element={role === 'admin' ? <Dashboard /> : <Navigate to="/tickets" replace />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route
            path="/customers"
            element={
              <ProtectedRoute roles={['admin']}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.access))

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
