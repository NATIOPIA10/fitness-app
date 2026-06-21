import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Screen from '../components/Screen'
import Button from '../components/Button'
import Field, { SelectField } from '../components/Field'

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    goal_weight: profile?.goal_weight || '',
    fitness_goal: profile?.fitness_goal || 'gain_muscle',
    experience_level: profile?.experience_level || 'beginner',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('user_profile')
      .update({
        full_name: form.full_name,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        goal_weight: Number(form.goal_weight),
        fitness_goal: form.fitness_goal,
        experience_level: form.experience_level,
      })
      .eq('user_id', user.id)
    await refreshProfile()
    setSaving(false)
    setEditing(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Screen subtitle="Account" title="Profile">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-lime/10 border-2 border-lime flex items-center justify-center mb-3">
          <span className="font-display text-2xl text-lime">{initials}</span>
        </div>
        <h2 className="font-display text-2xl">{profile?.full_name}</h2>
        <p className="text-muted text-sm">{user?.email}</p>
      </div>

      {editing ? (
        <div className="flex flex-col gap-4 mb-6">
          <Field label="Full name" value={form.full_name} onChange={update('full_name')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" type="number" value={form.age} onChange={update('age')} />
            <Field label="Height (cm)" type="number" value={form.height} onChange={update('height')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Current weight"
              type="number"
              step="0.1"
              value={form.weight}
              onChange={update('weight')}
            />
            <Field
              label="Goal weight"
              type="number"
              step="0.1"
              value={form.goal_weight}
              onChange={update('goal_weight')}
            />
          </div>
          <SelectField label="Fitness goal" value={form.fitness_goal} onChange={update('fitness_goal')}>
            <option value="gain_muscle">Gain muscle</option>
            <option value="lose_fat">Lose fat</option>
            <option value="fitness">General fitness</option>
          </SelectField>
          <SelectField
            label="Experience level"
            value={form.experience_level}
            onChange={update('experience_level')}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </SelectField>

          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save size={16} />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          <InfoRow label="Age" value={profile?.age} />
          <InfoRow label="Height" value={profile?.height ? `${profile.height} cm` : '—'} />
          <InfoRow label="Current weight" value={profile?.weight ? `${profile.weight} kg` : '—'} />
          <InfoRow label="Goal weight" value={profile?.goal_weight ? `${profile.goal_weight} kg` : '—'} />
          <InfoRow label="Fitness goal" value={formatGoal(profile?.fitness_goal)} />
          <InfoRow label="Experience" value={formatLevel(profile?.experience_level)} />

          <Button variant="secondary" onClick={() => setEditing(true)} className="mt-2">
            Edit profile
          </Button>
        </div>
      )}

      <Button variant="danger" onClick={handleLogout}>
        <LogOut size={16} />
        Log out
      </Button>
    </Screen>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3.5">
      <span className="text-muted text-sm">{label}</span>
      <span className="font-semibold text-sm">{value ?? '—'}</span>
    </div>
  )
}

function formatGoal(g) {
  return { gain_muscle: 'Gain muscle', lose_fat: 'Lose fat', fitness: 'General fitness' }[g] || '—'
}
function formatLevel(l) {
  return { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[l] || '—'
}
