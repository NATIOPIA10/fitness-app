import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, Play, PartyPopper, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import Button from '../components/Button'
import StepRing from '../components/StepRing'
import LoadingScreen from '../components/LoadingScreen'

export default function TodayWorkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [savingId, setSavingId] = useState(null)
  const [day, setDay] = useState('')

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)

    const { data: progressRows } = await supabase
      .from('user_workout_progress')
      .select('workout_id, completed, workouts(day)')
      .eq('user_id', user.id)
      .eq('completed', true)

    const completedDays = new Set((progressRows || []).map((r) => r.workouts?.day).filter(Boolean))

    const { data: allDays } = await supabase
      .from('workouts')
      .select('day')
      .order('order_index', { ascending: true })

    const uniqueDays = [...new Set((allDays || []).map((w) => w.day))]
    const targetDay = uniqueDays.find((d) => !completedDays.has(d)) || uniqueDays[uniqueDays.length - 1] || ''
    setDay(targetDay)

    const { data: dayWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('day', targetDay)
      .order('order_index', { ascending: true })

    setWorkouts(dayWorkouts || [])

    const ids = (dayWorkouts || []).map((w) => w.id)
    if (ids.length) {
      const { data: done } = await supabase
        .from('user_workout_progress')
        .select('workout_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('workout_id', ids)
      setCompletedIds(new Set((done || []).map((d) => d.workout_id)))
    } else {
      setCompletedIds(new Set())
    }

    setLoading(false)
  }

  async function markDone(workoutId) {
    setSavingId(workoutId)

    const { error } = await supabase.from('user_workout_progress').upsert(
      {
        user_id: user.id,
        workout_id: workoutId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,workout_id' }
    )

    if (!error) {
      setCompletedIds((prev) => new Set(prev).add(workoutId))
    }
    setSavingId(null)
  }

  if (loading) return <LoadingScreen />

  const completedCount = workouts.filter((w) => completedIds.has(w.id)).length
  const allDone = workouts.length > 0 && completedCount === workouts.length
  // index of the first not-yet-completed workout — only this one is unlocked
  const nextIndex = workouts.findIndex((w) => !completedIds.has(w.id))

  return (
    <Screen subtitle={day.replace('-', ' ') || 'Workout'} title="Today's session">
      {workouts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No workout found for today. Check the workout plan.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <StepRing total={workouts.length} completed={completedCount} />
          </div>

          {allDone && (
            <div className="flex items-center gap-3 bg-lime/10 border border-lime/30 rounded-2xl px-4 py-4 mb-6">
              <PartyPopper size={22} className="text-lime shrink-0" />
              <p className="text-sm font-semibold">
                Session complete. Great work — see you tomorrow.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {workouts.map((w, i) => {
              const isDone = completedIds.has(w.id)
              const isUnlocked = i === nextIndex || isDone
              const isSaving = savingId === w.id

              return (
                <div
                  key={w.id}
                  className={`bg-surface-raised border rounded-3xl overflow-hidden transition-opacity ${
                    isUnlocked ? 'border-border' : 'border-border opacity-50'
                  }`}
                >
                  {w.image_url && (
                    <div className="aspect-video w-full bg-surface overflow-hidden">
                      <img
                        src={w.image_url}
                        alt={w.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <button
                      onClick={() => isUnlocked && navigate(`/today-workout/${w.id}`)}
                      disabled={!isUnlocked}
                      className="w-full text-left disabled:cursor-default"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-display text-2xl leading-tight">{w.title}</h3>
                        <div className="shrink-0 mt-1 flex items-center gap-2">
                          {isDone ? (
                            <div className="w-7 h-7 rounded-full bg-lime flex items-center justify-center">
                              <Check size={16} className="text-ink" strokeWidth={3} />
                            </div>
                          ) : !isUnlocked ? (
                            <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center">
                              <Lock size={14} className="text-muted-2" />
                            </div>
                          ) : (
                            <ChevronRight size={20} className="text-muted" />
                          )}
                        </div>
                      </div>

                      {w.description && (
                        <p className="text-muted text-sm leading-relaxed mb-4">{w.description}</p>
                      )}
                    </button>

                    {w.video_url && isUnlocked && (
                      <a
                        href={w.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-lime text-sm font-semibold mb-4"
                      >
                        <Play size={14} fill="currentColor" /> Watch demo
                      </a>
                    )}

                    {isDone ? (
                      <Button variant="secondary" disabled>
                        <Check size={18} /> Completed
                      </Button>
                    ) : isUnlocked ? (
                      <Button onClick={() => markDone(w.id)} disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Mark as done'}
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        <Lock size={16} /> Complete previous step first
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Screen>
  )
}
