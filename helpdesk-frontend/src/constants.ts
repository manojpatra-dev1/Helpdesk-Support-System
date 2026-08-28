import type { Status, Priority } from './types'

export const STATUS_SEQUENCE: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH']

export function nextStatus(current: Status): Status | null {
  const idx = STATUS_SEQUENCE.indexOf(current)
  if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return null
  return STATUS_SEQUENCE[idx + 1]
}

export function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
