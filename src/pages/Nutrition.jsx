import { useEffect, useState } from 'react'
import { Plus, X, Utensils } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import Button from '../components/Button'
import { TextAreaField } from '../components/Field'
import Field from '../components/Field'
import LoadingScreen from '../components/LoadingScreen'

export default function Nutrition() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [meals, setMeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [mealText, setMealText] = useState('')
  const [calories, setCalories] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMeals(data || [])
    setLoading(false)
  }

  async function addMeal(e) {
    e.preventDefault()
    if (!mealText.trim()) return
    setSaving(true)
    const description = calories ? `${mealText.trim()} (${calories} cal)` : mealText.trim()
    const { error } = await supabase.from('meals').insert({
      user_id: user.id,
      meal: description,
    })
    setSaving(false)
    if (!error) {
      setMealText('')
      setCalories('')
      setShowForm(false)
      load()
    }
  }

  // Group meals by date
  const grouped = meals.reduce((acc, m) => {
    const key = new Date(m.created_at).toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  if (loading) return <LoadingScreen />

  return (
    <Screen
      subtitle="Nutrition"
      title="Meals"
      action={
        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-11 h-11 rounded-full bg-lime flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          {showForm ? <X size={20} className="text-ink" /> : <Plus size={20} className="text-ink" />}
        </button>
      }
    >
      {showForm && (
        <form
          onSubmit={addMeal}
          className="bg-surface-raised border border-border rounded-2xl p-4 mb-6 flex flex-col gap-3"
        >
          <TextAreaField
            label="What did you eat?"
            placeholder="Grilled chicken, rice, steamed broccoli"
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            autoFocus
          />
          <Field
            label="Calories (optional)"
            type="number"
            placeholder="450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <Button type="submit" disabled={saving || !mealText.trim()}>
            {saving ? 'Saving…' : 'Log meal'}
          </Button>
        </form>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <Utensils size={32} className="text-muted-2 mx-auto mb-3" />
          <p className="text-muted text-sm">No meals logged yet.</p>
        </div>
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
              {items.map((m) => (
                <div
                  key={m.id}
                  className="bg-surface-raised border border-border rounded-xl px-4 py-3 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-lime/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Utensils size={14} className="text-lime" />
                  </div>
                  <div>
                    <p className="text-sm">{m.meal}</p>
                    <p className="text-muted-2 text-xs mt-1">
                      {new Date(m.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
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
