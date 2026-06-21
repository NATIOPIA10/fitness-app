import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Field, { SelectField } from '../components/Field'
import Button from '../components/Button'

const STEPS = ['About you', 'Body stats', 'Your goal']

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    gender: 'female',
    height: '',
    weight: '',
    goal_weight: '60',
    fitness_goal: 'gain_muscle',
    experience_level: 'beginner',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const canAdvance = () => {
    if (step === 0) return form.full_name.trim() && form.age
    if (step === 1) return form.height && form.weight
    return form.goal_weight
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const { error } = await supabase.from('user_profile').insert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      goal_weight: Number(form.goal_weight),
      fitness_goal: form.fitness_goal,
      experience_level: form.experience_level,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Also seed the first weight log so progress chart has a starting point
    await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight: Number(form.weight),
    })

    await refreshProfile()
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col px-6 py-10">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-lime' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-2">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="font-display text-4xl mb-8">{STEPS[step]}</h1>

        <div className="flex-1 flex flex-col gap-4">
          {step === 0 && (
            <>
              <Field
                label="Full name"
                placeholder="Jordan Lee"
                value={form.full_name}
                onChange={update('full_name')}
              />
              <Field
                label="Age"
                type="number"
                placeholder="28"
                value={form.age}
                onChange={update('age')}
              />
              <SelectField label="Gender" value={form.gender} onChange={update('gender')}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </SelectField>
            </>
          )}

          {step === 1 && (
            <>
              <Field
                label="Height (cm)"
                type="number"
                placeholder="165"
                value={form.height}
                onChange={update('height')}
              />
              <Field
                label="Current weight (kg)"
                type="number"
                step="0.1"
                placeholder="56"
                value={form.weight}
                onChange={update('weight')}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Field
                label="Goal weight (kg)"
                type="number"
                step="0.1"
                placeholder="60"
                value={form.goal_weight}
                onChange={update('goal_weight')}
              />
              <SelectField
                label="Fitness goal"
                value={form.fitness_goal}
                onChange={update('fitness_goal')}
              >
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
            </>
          )}

          {error && (
            <p className="text-coral text-sm bg-coral/10 border border-coral/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canAdvance() || loading} className="flex-1">
            {loading ? 'Saving…' : step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
