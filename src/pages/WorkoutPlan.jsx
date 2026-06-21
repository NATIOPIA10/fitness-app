import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import LoadingScreen from '../components/LoadingScreen'

function formatDayLabel(day) {
  // expects 'week1-day1' style keys
  const match = day.match(/week(\d+)-day(\d+)/i)
  if (!match) return day
  return { week: Number(match[1]), day: Number(match[2]) }
}

export default function WorkoutPlan() {
  const [loading, setLoading] = useState(true)
  const [grouped, setGrouped] = useState({})
  const [openDay, setOpenDay] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .order('order_index', { ascending: true })

    const byWeek = {}
    ;(data || []).forEach((w) => {
      const parsed = formatDayLabel(w.day)
      const weekKey = parsed.week ?? 1
      if (!byWeek[weekKey]) byWeek[weekKey] = {}
      if (!byWeek[weekKey][w.day]) byWeek[weekKey][w.day] = []
      byWeek[weekKey][w.day].push(w)
    })

    setGrouped(byWeek)
    const firstDay = data?.[0]?.day
    if (firstDay) setOpenDay(firstDay)
    setLoading(false)
  }

  if (loading) return <LoadingScreen />

  const weekKeys = Object.keys(grouped).sort((a, b) => Number(a) - Number(b))

  return (
    <Screen subtitle="2-week program" title="Workout plan">
      {weekKeys.length === 0 ? (
        <p className="text-muted text-center py-16">No plan available yet.</p>
      ) : (
        weekKeys.map((week) => (
          <div key={week} className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-lime mb-3">
              Week {week}
            </h2>
            <div className="flex flex-col gap-3">
              {Object.entries(grouped[week]).map(([dayKey, exercises]) => {
                const parsed = formatDayLabel(dayKey)
                const isOpen = openDay === dayKey
                return (
                  <div
                    key={dayKey}
                    className="bg-surface-raised border border-border rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenDay(isOpen ? null : dayKey)}
                      className="w-full flex items-center justify-between px-5 py-4 active:bg-surface transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-display text-xl leading-none">
                          Day {parsed.day ?? dayKey}
                        </p>
                        <p className="text-muted text-xs mt-1">
                          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 flex flex-col gap-3">
                        {exercises.map((ex, i) => (
                          <div
                            key={ex.id}
                            className="flex gap-3 bg-surface rounded-xl p-3 border border-border"
                          >
                            <span className="font-display text-lg text-lime w-6 shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-sm">{ex.title}</p>
                              {ex.description && (
                                <p className="text-muted text-xs mt-0.5 leading-relaxed">
                                  {ex.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </Screen>
  )
}
