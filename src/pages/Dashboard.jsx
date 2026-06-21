import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ChevronRight, Dumbbell, CalendarDays, TrendingUp, Utensils } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import Button from '../components/Button'

function dayKeyForToday() {
  // workouts.day stores values like 'week1-day1' ... we derive today's slot
  // from how many days the user has been active, capped to the 14-day plan.
  return null
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [todayWorkouts, setTodayWorkouts] = useState([])
  const [completedToday, setCompletedToday] = useState(0)
  const [streak, setStreak] = useState(0)
  const [latestWeight, setLatestWeight] = useState(null)
  const [currentDay, setCurrentDay] = useState('week1-day1')

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  async function loadDashboard() {
    setLoading(true)

    // Determine current program day from progress history (simple sequential model)
    const { data: progressRows } = await supabase
      .from('user_workout_progress')
      .select('workout_id, completed, completed_at, workouts(day)')
      .eq('user_id', user.id)
      .eq('completed', true)

    const completedDays = new Set((progressRows || []).map((r) => r.workouts?.day).filter(Boolean))

    const { data: allDays } = await supabase
      .from('workouts')
      .select('day')
      .order('order_index', { ascending: true })

    const uniqueDays = [...new Set((allDays || []).map((w) => w.day))]
    const nextIncompleteDay = uniqueDays.find((d) => !completedDays.has(d)) || uniqueDays[uniqueDays.length - 1] || 'week1-day1'
    setCurrentDay(nextIncompleteDay)

    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('day', nextIncompleteDay)
      .order('order_index', { ascending: true })

    setTodayWorkouts(workouts || [])

    const workoutIds = (workouts || []).map((w) => w.id)
    let completedCount = 0
    if (workoutIds.length) {
      const { data: doneRows } = await supabase
        .from('user_workout_progress')
        .select('workout_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('workout_id', workoutIds)
      completedCount = doneRows?.length || 0
    }
    setCompletedToday(completedCount)

    // Streak: count distinct completed_at dates, consecutive ending today/yesterday
    const { data: allCompletions } = await supabase
      .from('user_workout_progress')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    setStreak(calculateStreak(allCompletions || []))

    const { data: weights } = await supabase
      .from('weight_logs')
      .select('weight, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    setLatestWeight(weights?.[0]?.weight ?? profile?.weight ?? null)

    setLoading(false)
  }

  function calculateStreak(rows) {
    if (!rows.length) return 0
    const dateSet = new Set(rows.map((r) => new Date(r.completed_at).toDateString()))
    let count = 0
    let cursor = new Date()
    // allow today to be empty without breaking streak from yesterday
    if (!dateSet.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (dateSet.has(cursor.toDateString())) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const goalDiff = profile ? (profile.goal_weight - (latestWeight ?? profile.weight)).toFixed(1) : null
  const allDone = todayWorkouts.length > 0 && completedToday === todayWorkouts.length

  return (
    <Screen subtitle="Today" title={`Hey, ${firstName}`}>
      {/* Streak badge */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-surface-raised border border-border rounded-full px-3 py-1.5">
          <Flame size={16} className="text-lime" fill="currentColor" />
          <span className="text-sm font-bold">{streak} day streak</span>
        </div>
      </div>

      {/* Today's workout preview card */}
      <button
        onClick={() => navigate('/today-workout')}
        className="w-full text-left bg-surface-raised border border-border rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-lime">
            {allDone ? 'All done' : "Today's workout"}
          </span>
          <ChevronRight size={18} className="text-muted" />
        </div>
        {loading ? (
          <div className="h-6 w-2/3 bg-border rounded animate-pulse" />
        ) : todayWorkouts.length === 0 ? (
          <p className="text-muted text-sm">No workout scheduled. Check the plan page.</p>
        ) : (
          <>
            <h2 className="font-display text-2xl mb-1">
              {todayWorkouts.length} exercise{todayWorkouts.length !== 1 ? 's' : ''} · {currentDay.replace('-', ' ')}
            </h2>
            <p className="text-muted text-sm mb-4">
              {completedToday} of {todayWorkouts.length} complete
            </p>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-lime rounded-full transition-all"
                style={{ width: `${(completedToday / todayWorkouts.length) * 100}%` }}
              />
            </div>
          </>
        )}
        <Button className="mt-4" disabled={loading || todayWorkouts.length === 0}>
          <Dumbbell size={18} />
          {allDone ? 'Review workout' : completedToday > 0 ? 'Continue workout' : 'Start workout'}
        </Button>
      </button>

      {/* Weight progress summary */}
      <button
        onClick={() => navigate('/progress')}
        className="w-full text-left bg-surface-raised border border-border rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Weight progress</span>
          <ChevronRight size={18} className="text-muted" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="font-display text-4xl">{latestWeight ?? '—'}</span>
            <span className="text-muted text-sm ml-1">kg</span>
          </div>
          {goalDiff !== null && (
            <p className="text-sm text-muted">
              {Math.abs(goalDiff)}kg to goal ({profile.goal_weight}kg)
            </p>
          )}
        </div>
      </button>

      {/* Quick navigation cards */}
      <div className="grid grid-cols-2 gap-3">
        <QuickCard icon={CalendarDays} label="Workout plan" onClick={() => navigate('/workout-plan')} />
        <QuickCard icon={Utensils} label="Log a meal" onClick={() => navigate('/nutrition')} />
        <QuickCard icon={TrendingUp} label="Add weight" onClick={() => navigate('/progress')} />
        <QuickCard icon={Flame} label="History" onClick={() => navigate('/history')} />
      </div>
    </Screen>
  )
}

function QuickCard({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-surface-raised border border-border rounded-2xl p-4 flex flex-col items-start gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="w-9 h-9 rounded-full bg-lime/10 flex items-center justify-center">
        <Icon size={18} className="text-lime" />
      </div>
      <span className="text-sm font-semibold text-left">{label}</span>
    </button>
  )
}
