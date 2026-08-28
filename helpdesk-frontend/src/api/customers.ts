import { client } from './client'
import type { Customer, CustomerInput, Ticket } from '../types'

export const customersApi = {
  list: (search?: string): Promise<Customer[]> =>
    client.get('customers/', { params: search ? { search } : {} }).then((r) => r.data),

  get: (id: number | string): Promise<Customer> =>
    client.get(`customers/${id}/`).then((r) => r.data),

  create: (payload: CustomerInput): Promise<Customer> =>
    client.post('customers/', payload).then((r) => r.data),

  update: (id: number | string, payload: CustomerInput): Promise<Customer> =>
    client.patch(`customers/${id}/`, payload).then((r) => r.data),

  remove: (id: number | string): Promise<void> =>
    client.delete(`customers/${id}/`).then(() => undefined),

  tickets: (id: number | string): Promise<Ticket[]> =>
    client.get(`customers/${id}/tickets/`).then((r) => r.data),
}
