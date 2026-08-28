import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: Role[] // when set, only these roles may view the route
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const access = useAuthStore((s) => s.access)
  const role = useAuthStore((s) => s.role)

  if (!access) {
    return <Navigate to="/login" replace />
  }
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
