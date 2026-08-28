import { create } from 'zustand'
import { ticketsApi } from '../api/tickets'
import { parseApiError } from '../api/client'
import type { DashboardStats } from '../types'

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface DashboardStore {
  stats: DashboardStats | null
  status: FetchStatus
  error: string | null
  fetchDashboard: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  status: 'idle',
  error: null,

  fetchDashboard: async () => {
    set({ status: 'loading', error: null })
    try {
      const stats = await ticketsApi.dashboard()
      set({ stats, status: 'succeeded' })
    } catch (err) {
      set({ status: 'failed', error: parseApiError(err).message })
    }
  },
}))
