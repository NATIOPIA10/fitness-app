import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Field from '../components/Field'
import Button from '../components/Button'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords don\u2019t match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // If email confirmation is required, there will be no active session yet
    if (data?.user && !data?.session) {
      setNeedsConfirmation(true)
      return
    }

    navigate('/onboarding')
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-ink flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="font-display text-3xl mb-3">Check your inbox</h1>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-text">{email}</span>. Confirm your
            email, then sign in to set up your profile.
          </p>
          <Link to="/login">
            <Button className="mt-8">Back to sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm mx-auto w-full">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-2">Get started</p>
        <h1 className="font-display text-5xl mb-10">Create account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Field
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-coral text-sm bg-coral/10 border border-coral/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-lime font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
