import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Field from '../components/Field'
import Button from '../components/Button'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm mx-auto w-full">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-2">Welcome back</p>
        <h1 className="font-display text-5xl mb-10">Sign in</h1>

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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-coral text-sm bg-coral/10 border border-coral/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-8">
          New here?{' '}
          <Link to="/register" className="text-lime font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
