import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import Button from '../components/Button'
import Field from '../components/Field'
import LoadingScreen from '../components/LoadingScreen'

export default function Progress() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }

  async function addLog(e) {
    e.preventDefault()
    if (!weightInput) return
    setSaving(true)
    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight: Number(weightInput),
    })
    setSaving(false)
    if (!error) {
      setWeightInput('')
      setShowForm(false)
      load()
    }
  }

  if (loading) return <LoadingScreen />

  const startWeight = profile?.weight ?? logs[0]?.weight ?? 0
  const goalWeight = profile?.goal_weight ?? 60
  const latestWeight = logs[logs.length - 1]?.weight ?? startWeight

  const totalNeeded = goalWeight - startWeight
  const progressed = latestWeight - startWeight
  const pct = totalNeeded !== 0 ? Math.min(100, Math.max(0, (progressed / totalNeeded) * 100)) : 0

  const chartData = logs.map((l) => ({
    date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: l.weight,
  }))

  return (
    <Screen
      subtitle="Progress"
      title="Weight"
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
          onSubmit={addLog}
          className="bg-surface-raised border border-border rounded-2xl p-4 mb-6 flex gap-3 items-end"
        >
          <Field
            label="New weight (kg)"
            type="number"
            step="0.1"
            placeholder="57.5"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={saving || !weightInput} className="w-auto px-6">
            {saving ? 'Saving…' : 'Log'}
          </Button>
        </form>
      )}

      {/* Goal progress indicator */}
      <div className="bg-surface-raised border border-border rounded-3xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <span className="font-display text-4xl">{latestWeight}</span>
            <span className="text-muted text-sm ml-1">kg</span>
          </div>
          <span className="text-muted text-sm">Goal: {goalWeight}kg</span>
        </div>
        <div className="h-2.5 bg-surface rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-lime rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>{startWeight}kg start</span>
          <span>{Math.round(pct)}% to goal</span>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-surface-raised border border-border rounded-3xl p-5 mb-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-2)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-2)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-lime)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-lime)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">History</h2>
      <div className="flex flex-col gap-2">
        {[...logs].reverse().map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3"
          >
            <span className="text-sm text-muted">
              {new Date(log.created_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="font-display text-lg">{log.weight} kg</span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-muted text-sm text-center py-8">No weight logs yet. Add your first one.</p>
        )}
      </div>
    </Screen>
  )
}
