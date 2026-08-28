import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import FormField, { inputClass } from '../components/FormField'

interface LocationState {
  registered?: boolean
}

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange =
    (field: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')

    const result = await login(form)

    setBusy(false)
    if (!result.ok) {
      setErrors(result.error.fieldErrors)
      setFormError(result.error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-well)] px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[var(--color-line)] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-7 w-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">H</span>
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">Helpdesk</span>
        </div>

        <h1 className="font-display font-semibold text-xl tracking-tight mb-1">Sign in</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mb-5">
          {state?.registered
            ? 'Account created — sign in to continue.'
            : 'Sign in to manage tickets and customers.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Password" error={errors.password}>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
              required
            />
          </FormField>

          {formError && !errors.email && !errors.password && !Object.keys(errors).length && (
            <p className="text-xs text-[var(--color-high)]">{formError}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-60 mt-1"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-soft)] mt-5 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[var(--color-brand)] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
