import { client } from './client'
import type { Ticket, TicketCreateInput, TicketEditInput, HistoryEntry, DashboardStats, Status } from '../types'

export interface TicketListParams {
  status?: string
  priority?: string
  category?: string
  search?: string
}

export const ticketsApi = {
  list: (params: TicketListParams = {}): Promise<Ticket[]> =>
    client.get('tickets/', { params }).then((r) => r.data),

  get: (id: number | string): Promise<Ticket> =>
    client.get(`tickets/${id}/`).then((r) => r.data),

  create: (payload: TicketCreateInput): Promise<Ticket> =>
    client.post('tickets/', payload).then((r) => r.data),

  update: (id: number | string, payload: TicketEditInput): Promise<Ticket> =>
    client.patch(`tickets/${id}/`, payload).then((r) => r.data),

  remove: (id: number | string): Promise<void> =>
    client.delete(`tickets/${id}/`).then(() => undefined),

  changeStatus: (id: number | string, status: Status): Promise<Ticket> =>
    client.patch(`tickets/${id}/change-status/`, { status }).then((r) => r.data),

  addComment: (id: number | string, text: string): Promise<Ticket> =>
    client.post(`tickets/${id}/add-comment/`, { text }).then((r) => r.data),

  history: (id: number | string): Promise<HistoryEntry[]> =>
    client.get(`tickets/${id}/history/`).then((r) => r.data),

  dashboard: (): Promise<DashboardStats> =>
    client.get('tickets/dashboard/').then((r) => r.data),
}
