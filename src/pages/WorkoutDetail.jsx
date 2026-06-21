import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, Lock, Play, ChevronRight, ChevronLeft, Dumbbell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import LoadingScreen from '../components/LoadingScreen'

// Splits a description like "3 sets x 10 reps. Keep your core tight..." into
// a scannable lead stat ("3 sets x 10 reps") and the remaining form cue text,
// so the most-needed number is easy to read at a glance during a workout.
function splitDescription(text) {
  if (!text) return { stat: null, rest: text }
  const match = text.match(/^([^.]*\b(?:sets?|reps?|seconds?|minutes?|secs?|mins?)\b[^.]*)\.\s*(.*)$/i)
  if (match && match[1].length < 60) {
    return { stat: match[1].trim(), rest: match[2].trim() }
  }
  return { stat: null, rest: text }
}

export default function WorkoutDetail() {
  const { workoutId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [workout, setWorkout] = useState(null)
  const [dayWorkouts, setDayWorkouts] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (user && workoutId) load()
  }, [user, workoutId])

  async function load() {
    setLoading(true)
    setNotFound(false)

    const { data: w } = await supabase.from('workouts').select('*').eq('id', workoutId).maybeSingle()

    if (!w) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setWorkout(w)

    // Load the rest of that day's workouts so we know step position + lock state
    const { data: siblings } = await supabase
      .from('workouts')
      .select('*')
      .eq('day', w.day)
      .order('order_index', { ascending: true })

    setDayWorkouts(siblings || [])

    const ids = (siblings || []).map((s) => s.id)
    if (ids.length) {
      const { data: done } = await supabase
        .from('user_workout_progress')
        .select('workout_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('workout_id', ids)
      setCompletedIds(new Set((done || []).map((d) => d.workout_id)))
    }

    setLoading(false)
  }

  async function markDone() {
    setSaving(true)
    const { error } = await supabase.from('user_workout_progress').upsert(
      {
        user_id: user.id,
        workout_id: workout.id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,workout_id' }
    )
    setSaving(false)

    if (!error) {
      setCompletedIds((prev) => new Set(prev).add(workout.id))
    }
  }

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
        <p className="text-muted mb-6">This exercise couldn't be found.</p>
        <Link to="/today-workout">
          <Button variant="secondary">Back to workout</Button>
        </Link>
      </div>
    )
  }

  const index = dayWorkouts.findIndex((w) => w.id === workout.id)
  const nextIncompleteIndex = dayWorkouts.findIndex((w) => !completedIds.has(w.id))
  const isDone = completedIds.has(workout.id)
  const isUnlocked = index === nextIncompleteIndex || isDone

  const prevWorkout = index > 0 ? dayWorkouts[index - 1] : null
  const nextWorkout = index < dayWorkouts.length - 1 ? dayWorkouts[index + 1] : null
  const nextIsUnlocked = nextWorkout
    ? completedIds.has(nextWorkout.id) || dayWorkouts.findIndex((w) => !completedIds.has(w.id)) === index + 1
    : false

  const { stat, rest } = splitDescription(workout.description)

  return (
    <div className="min-h-screen bg-ink" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
      {/* Header / media */}
      <div className="relative">
        {workout.image_url ? (
          <div className="aspect-square w-full bg-surface overflow-hidden">
            <img src={workout.image_url} alt={workout.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[2/1] w-full bg-surface-raised" />
        )}

        <button
          onClick={() => navigate('/today-workout')}
          className="absolute left-5 w-11 h-11 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
          style={{ top: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
          aria-label="Back to workout"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          className="absolute right-5 bg-ink/70 backdrop-blur rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
          style={{ top: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
        >
          Step {index + 1} of {dayWorkouts.length}
        </div>
      </div>

      <div className="px-5 pt-6">
        <p className="text-lime text-xs font-bold uppercase tracking-widest mb-2">
          {workout.day?.replace('-', ' ')}
        </p>
        <h1 className="font-display text-4xl leading-none mb-4">{workout.title}</h1>

        {isDone && (
          <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/30 rounded-full px-3 py-1.5 mb-5">
            <Check size={14} className="text-lime" strokeWidth={3} />
            <span className="text-xs font-semibold text-lime">Completed</span>
          </div>
        )}

        {!isUnlocked && !isDone && (
          <div className="flex items-center gap-2 bg-surface-raised border border-border rounded-2xl px-4 py-3 mb-5">
            <Lock size={16} className="text-muted-2 shrink-0" />
            <p className="text-sm text-muted">Finish the previous step to unlock this one.</p>
          </div>
        )}

        {(stat || rest) && (
          <div className="mb-6 bg-surface-raised border border-border rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
              How to do it
            </h2>

            {stat && (
              <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/30 rounded-xl px-3.5 py-2 mb-4">
                <Dumbbell size={15} className="text-lime shrink-0" />
                <span className="font-display text-lg leading-none text-lime tracking-wide">
                  {stat}
                </span>
              </div>
            )}

            {rest && (
              <p className="text-text text-[17px] leading-[1.75]">{rest}</p>
            )}
          </div>
        )}

        {workout.video_url && (
          <a
            href={workout.video_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-surface-raised border border-border rounded-2xl py-3.5 mb-6 active:scale-[0.98] transition-transform"
          >
            <Play size={16} className="text-lime" fill="currentColor" />
            <span className="text-sm font-semibold">Watch demo video</span>
          </a>
        )}

        {/* Action */}
        {isDone ? (
          <Button variant="secondary" disabled className="mb-6">
            <Check size={18} /> Completed
          </Button>
        ) : isUnlocked ? (
          <Button onClick={markDone} disabled={saving} className="mb-6">
            {saving ? 'Saving…' : 'Mark as done'}
          </Button>
        ) : (
          <Button variant="secondary" disabled className="mb-6">
            <Lock size={16} /> Locked
          </Button>
        )}

        {/* Step navigation */}
        <div className="flex gap-3">
          {prevWorkout ? (
            <button
              onClick={() => navigate(`/today-workout/${prevWorkout.id}`)}
              className="flex-1 min-h-[52px] flex items-center gap-2 bg-surface-raised border border-border rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
            >
              <ChevronLeft size={18} className="text-muted shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="text-[10px] text-muted uppercase tracking-wide">Previous</p>
                <p className="text-sm font-semibold truncate">{prevWorkout.title}</p>
              </div>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {nextWorkout && (
            <button
              onClick={() => nextIsUnlocked && navigate(`/today-workout/${nextWorkout.id}`)}
              disabled={!nextIsUnlocked}
              className="flex-1 min-h-[52px] flex items-center justify-end gap-2 bg-surface-raised border border-border rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              <div className="text-right overflow-hidden">
                <p className="text-[10px] text-muted uppercase tracking-wide">
                  {nextIsUnlocked ? 'Next' : 'Locked'}
                </p>
                <p className="text-sm font-semibold truncate">{nextWorkout.title}</p>
              </div>
              {nextIsUnlocked ? (
                <ChevronRight size={18} className="text-muted shrink-0" />
              ) : (
                <Lock size={14} className="text-muted-2 shrink-0" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
