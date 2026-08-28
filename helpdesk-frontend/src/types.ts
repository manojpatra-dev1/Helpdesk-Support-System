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
  customer?: number // admin must include this; omitted for the customer role (auto-assigned by the API)
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

// --- Auth ---

export type Role = 'admin' | 'customer'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  role: Role
  customer_id: number | null
  username: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirm_password: string
}

export interface RegisterResponse {
  detail: string
  customer: Customer
}
