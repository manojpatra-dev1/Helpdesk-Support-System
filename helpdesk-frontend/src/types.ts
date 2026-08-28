export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface CustomerInput {
  name: string
  email: string
  phone: string
}

export interface TicketComment {
  id?: number
  text: string
  created_at?: string
}

export interface Ticket {
  id: number
  customer: number
  customer_name: string
  subject: string
  description: string
  category: string
  priority: Priority
  status: Status
  created_at: string
  updated_at: string
  history: HistoryEntry[]
  comments: TicketComment[]
}

export interface TicketCreateInput {
  customer: number
  subject: string
  description: string
  category: string
  priority: Priority
}

export interface TicketEditInput {
  subject: string
  description: string
  category: string
  priority: Priority
}

export interface HistoryEntry {
  id: number
  change_description: string
  created_at: string
}

export interface DashboardStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
  high_priority: number
}

export interface TicketFilters {
  status: Status | ''
  priority: Priority | ''
  category: string
  search: string
}

export interface ApiErrorResult {
  fieldErrors: Record<string, string>
  message: string
}
