import axios, { type AxiosError } from 'axios'
import type { ApiErrorResult } from '../types'

export const client = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
})

interface ApiErrorShape {
  success: false
  errors: Record<string, string[] | string>
}

// The API returns errors as { success: false, errors: { field: [msg] } }.
// Normalize that into a plain object of field -> first message, plus a
// human-readable summary, so components don't need to know the shape.
export function parseApiError(error: unknown): ApiErrorResult {
  const axiosError = error as AxiosError<ApiErrorShape>
  const data = axiosError?.response?.data

  if (data && data.success === false && data.errors) {
    const fieldErrors: Record<string, string> = {}
    const messages: string[] = []
    for (const [field, msgs] of Object.entries(data.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : msgs
      fieldErrors[field] = msg
      messages.push(msg)
    }
    return { fieldErrors, message: messages[0] || 'Something went wrong.' }
  }

  const message = axiosError?.message || 'Something went wrong.'
  return { fieldErrors: {}, message }
}
