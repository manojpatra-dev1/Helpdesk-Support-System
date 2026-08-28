import { create } from 'zustand'
import { ticketsApi } from '../api/tickets'
import { parseApiError } from '../api/client'
import type {
  Ticket,
  TicketCreateInput,
  TicketEditInput,
  HistoryEntry,
  TicketFilters,
  Status,
  ApiErrorResult,
} from '../types'

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
type Result<T> = { ok: true; data: T } | { ok: false; error: ApiErrorResult }
type SimpleResult = { ok: true } | { ok: false; error: string }

interface TicketStore {
  items: Ticket[]
  listStatus: FetchStatus
  listError: string | null
  filters: TicketFilters

  current: Ticket | null
  history: HistoryEntry[]
  currentStatus: FetchStatus
  currentError: string | null
  actionError: string | null

  setFilters: (patch: Partial<TicketFilters>) => void
  fetchTickets: () => Promise<void>
  fetchTicket: (id: number | string) => Promise<void>
  createTicket: (payload: TicketCreateInput) => Promise<Result<Ticket>>
  updateTicket: (id: number | string, payload: TicketEditInput) => Promise<Result<Ticket>>
  deleteTicket: (id: number | string) => Promise<SimpleResult>
  changeStatus: (id: number | string, status: Status) => Promise<SimpleResult>
  addComment: (id: number | string, text: string) => Promise<SimpleResult>
  clearCurrentTicket: () => void
  clearActionError: () => void
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  items: [],
  listStatus: 'idle',
  listError: null,
  filters: { status: '', priority: '', category: '', search: '' },

  current: null,
  history: [],
  currentStatus: 'idle',
  currentError: null,
  actionError: null,

  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

  fetchTickets: async () => {
    const { filters } = get()
    set({ listStatus: 'loading', listError: null })
    try {
      const params: Record<string, string> = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      const items = await ticketsApi.list(params)
      set({ items, listStatus: 'succeeded' })
    } catch (err) {
      set({ listStatus: 'failed', listError: parseApiError(err).message })
    }
  },

  fetchTicket: async (id) => {
    set({ currentStatus: 'loading', currentError: null })
    try {
      const [ticket, history] = await Promise.all([ticketsApi.get(id), ticketsApi.history(id)])
      set({ current: ticket, history, currentStatus: 'succeeded' })
    } catch (err) {
      set({ currentStatus: 'failed', currentError: parseApiError(err).message })
    }
  },

  createTicket: async (payload) => {
    try {
      const data = await ticketsApi.create(payload)
      set({ items: [data, ...get().items] })
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: parseApiError(err) }
    }
  },

  updateTicket: async (id, payload) => {
    try {
      const data = await ticketsApi.update(id, payload)
      set({
        items: get().items.map((t) => (t.id === data.id ? data : t)),
        current: get().current?.id === data.id ? data : get().current,
      })
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: parseApiError(err) }
    }
  },

  deleteTicket: async (id) => {
    try {
      await ticketsApi.remove(id)
      set({ items: get().items.filter((t) => String(t.id) !== String(id)) })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: parseApiError(err).message }
    }
  },

  changeStatus: async (id, status) => {
    try {
      const ticket = await ticketsApi.changeStatus(id, status)
      const history = await ticketsApi.history(id)
      set({
        current: ticket,
        history,
        actionError: null,
        items: get().items.map((t) => (t.id === ticket.id ? ticket : t)),
      })
      return { ok: true }
    } catch (err) {
      const message = parseApiError(err).message
      set({ actionError: message })
      return { ok: false, error: message }
    }
  },

  addComment: async (id, text) => {
    try {
      const ticket = await ticketsApi.addComment(id, text)
      set({ current: ticket, actionError: null })
      return { ok: true }
    } catch (err) {
      const message = parseApiError(err).message
      set({ actionError: message })
      return { ok: false, error: message }
    }
  },

  clearCurrentTicket: () =>
    set({ current: null, history: [], currentStatus: 'idle', currentError: null }),

  clearActionError: () => set({ actionError: null }),
}))
