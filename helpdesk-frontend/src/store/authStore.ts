import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { parseApiError } from '../api/client'
import type { ApiErrorResult, LoginPayload, RegisterPayload, Role } from '../types'

type Result<T> = { ok: true; data: T } | { ok: false; error: ApiErrorResult }

interface AuthStore {
  access: string | null
  refresh: string | null
  role: Role | null
  customerId: number | null
  username: string | null
  authBusy: boolean

  login: (payload: LoginPayload) => Promise<Result<{ role: Role }>>
  register: (payload: RegisterPayload) => Promise<Result<{ id: number }>>
  logout: () => void
}

// Tokens live in localStorage (via the persist middleware) so a page refresh
// doesn't log the user out. The access token expires in 1 hour and there's
// no refresh endpoint wired up yet, so an expired token just results in a
// 401 -> the response interceptor in api/client.ts logs the user out.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      role: null,
      customerId: null,
      username: null,
      authBusy: false,

      login: async (payload) => {
        set({ authBusy: true })
        try {
          const data = await authApi.login(payload)
          set({
            access: data.access,
            refresh: data.refresh,
            role: data.role,
            customerId: data.customer_id,
            username: data.username,
            authBusy: false,
          })
          return { ok: true, data: { role: data.role } }
        } catch (err) {
          set({ authBusy: false })
          return { ok: false, error: parseApiError(err) }
        }
      },

      register: async (payload) => {
        set({ authBusy: true })
        try {
          const data = await authApi.register(payload)
          set({ authBusy: false })
          return { ok: true, data: { id: data.customer.id } }
        } catch (err) {
          set({ authBusy: false })
          return { ok: false, error: parseApiError(err) }
        }
      },

      logout: () =>
        set({ access: null, refresh: null, role: null, customerId: null, username: null }),
    }),
    {
      name: 'helpdesk-auth',
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        role: state.role,
        customerId: state.customerId,
        username: state.username,
      }),
    },
  ),
)
