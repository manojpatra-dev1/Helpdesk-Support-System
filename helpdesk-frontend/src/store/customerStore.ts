import { create } from 'zustand'
import { customersApi } from '../api/customers'
import { parseApiError } from '../api/client'
import type { Customer, CustomerInput, Ticket, ApiErrorResult } from '../types'

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface CustomerStore {
  items: Customer[]
  listStatus: FetchStatus
  listError: string | null

  current: Customer | null
  currentTickets: Ticket[]
  currentStatus: FetchStatus
  currentError: string | null

  fetchCustomers: (search?: string) => Promise<void>
  fetchCustomer: (id: number | string) => Promise<void>
  createCustomer: (payload: CustomerInput) => Promise<{ ok: true; data: Customer } | { ok: false; error: ApiErrorResult }>
  updateCustomer: (id: number | string, payload: CustomerInput) => Promise<{ ok: true; data: Customer } | { ok: false; error: ApiErrorResult }>
  deleteCustomer: (id: number | string) => Promise<{ ok: true } | { ok: false; error: string }>
  clearCurrentCustomer: () => void
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  items: [],
  listStatus: 'idle',
  listError: null,

  current: null,
  currentTickets: [],
  currentStatus: 'idle',
  currentError: null,

  fetchCustomers: async (search) => {
    set({ listStatus: 'loading', listError: null })
    try {
      const items = await customersApi.list(search)
      set({ items, listStatus: 'succeeded' })
    } catch (err) {
      set({ listStatus: 'failed', listError: parseApiError(err).message })
    }
  },

  fetchCustomer: async (id) => {
    set({ currentStatus: 'loading', currentError: null })
    try {
      const [customer, tickets] = await Promise.all([
        customersApi.get(id),
        customersApi.tickets(id),
      ])
      set({ current: customer, currentTickets: tickets, currentStatus: 'succeeded' })
    } catch (err) {
      set({ currentStatus: 'failed', currentError: parseApiError(err).message })
    }
  },

  createCustomer: async (payload) => {
    try {
      const data = await customersApi.create(payload)
      set({ items: [data, ...get().items] })
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: parseApiError(err) }
    }
  },

  updateCustomer: async (id, payload) => {
    try {
      const data = await customersApi.update(id, payload)
      set({
        items: get().items.map((c) => (c.id === data.id ? data : c)),
        current: get().current?.id === data.id ? data : get().current,
      })
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: parseApiError(err) }
    }
  },

  deleteCustomer: async (id) => {
    try {
      await customersApi.remove(id)
      set({ items: get().items.filter((c) => String(c.id) !== String(id)) })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: parseApiError(err).message }
    }
  },

  clearCurrentCustomer: () =>
    set({ current: null, currentTickets: [], currentStatus: 'idle', currentError: null }),
}))
