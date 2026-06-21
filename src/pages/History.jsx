import { useEffect, useState } from 'react'
import { Check, Flame } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import LoadingScreen from '../components/LoadingScreen'

export default function History() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [completions, setCompletions] = useState([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('user_workout_progress')
      .select('id, completed_at, workouts(title, day)')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    setCompletions(data || [])
    setStreak(calculateStreak(data || []))
    setLoading(false)
  }

  function calculateStreak(rows) {
    if (!rows.length) return 0
    const dateSet = new Set(rows.map((r) => new Date(r.completed_at).toDateString()))
    let count = 0
    let cursor = new Date()
    if (!dateSet.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (dateSet.has(cursor.toDateString())) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  // Group by date
  const grouped = completions.reduce((acc, c) => {
    const key = new Date(c.completed_at).toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  if (loading) return <LoadingScreen />

  return (
    <Screen subtitle="Your journey" title="History">
      <div className="flex items-center gap-3 bg-surface-raised border border-border rounded-2xl px-5 py-4 mb-6">
        <div className="w-11 h-11 rounded-full bg-lime/10 flex items-center justify-center shrink-0">
          <Flame size={20} className="text-lime" fill="currentColor" />
        </div>
        <div>
          <p className="font-display text-2xl leading-none">{streak} days</p>
          <p className="text-muted text-xs mt-1">Current streak</p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted text-sm text-center py-16">
          No completed workouts yet. Finish today's session to start your history.
        </p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-raised border border-border rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-lime flex items-center justify-center shrink-0">
                    <Check size={14} className="text-ink" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.workouts?.title}</p>
                    <p className="text-muted-2 text-xs mt-0.5">
                      {c.workouts?.day?.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </Screen>
  )
}
