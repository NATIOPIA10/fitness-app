import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import BottomNav from './BottomNav'

export function RequireAuth() {
  const { session, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/onboarding" replace />

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

export function RequireOnboarding() {
  const { session, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (profile) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export function RedirectIfAuthed() {
  const { session, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (session && profile) return <Navigate to="/dashboard" replace />
  if (session && !profile) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
