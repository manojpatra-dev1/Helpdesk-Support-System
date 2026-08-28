import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import FormField, { inputClass } from '../components/FormField'

interface FormState {
  name: string
  email: string
  password: string
  confirm_password: string
}

export default function Register() {
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')

    const result = await register(form)

    setBusy(false)
    if (!result.ok) {
      setErrors(result.error.fieldErrors)
      setFormError(result.error.message)
      return
    }
    navigate('/login', { replace: true, state: { registered: true } })
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

        <h1 className="font-display font-semibold text-xl tracking-tight mb-1">Create an account</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mb-5">
          Register as a customer to raise and track your own tickets.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Name" error={errors.name}>
            <input
              className={inputClass}
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Jane Cooper"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              required
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
          <FormField label="Confirm password" error={errors.confirm_password}>
            <input
              type="password"
              className={inputClass}
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              placeholder="••••••••"
              required
            />
          </FormField>

          {formError && !Object.keys(errors).length && (
            <p className="text-xs text-[var(--color-high)]">{formError}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-60 mt-1"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-soft)] mt-5 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-brand)] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
