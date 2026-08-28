import axios, { type AxiosError } from 'axios'
import type { ApiErrorResult } from '../types'
import { useAuthStore } from '../store/authStore'

export const client = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the logged-in user's access token to every request.
client.interceptors.request.use((config) => {
  const { access } = useAuthStore.getState()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// The access token expires in 1 hour and there's no refresh endpoint yet,
// so a 401 means the session is dead — clear it and send the user back to
// the login page.
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

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
