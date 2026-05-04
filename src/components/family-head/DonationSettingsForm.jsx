import { useState, useEffect } from 'react'
import { useFamilyHeadStore } from '../../stores/familyHeadStore.js'

const WALL_MODES = [
  { value: 'full', label: 'Full', help: 'Show donor name and amount' },
  { value: 'names_only', label: 'Names only', help: 'Show donor name, hide amount' },
  { value: 'private', label: 'Private', help: 'Hide all donor info' },
]

const goalToString = (pesewas) =>
  pesewas ? String((pesewas / 100).toFixed(0)) : ''

export function DonationSettingsForm({ memorialId, initial, onSaved }) {
  const updateSettings = useFamilyHeadStore((s) => s.updateSettings)
  const settingsLoading = useFamilyHeadStore((s) => s.settingsLoading)
  const settingsError = useFamilyHeadStore((s) => s.settingsError)

  // Derived-state sync pattern (per React docs): compare incoming props to a
  // tracked snapshot, and on mismatch reset the form state during render
  // rather than in an effect (avoids the react-hooks/set-state-in-effect rule
  // and the cascading re-render it causes).
  const [wallMode, setWallMode] = useState(initial?.wall_mode || 'full')
  const [goalGhs, setGoalGhs] = useState(goalToString(initial?.goal_amount_pesewas))
  const [paused, setPaused] = useState(!!initial?.paused)
  const [prevInitial, setPrevInitial] = useState({
    wall_mode: initial?.wall_mode,
    goal_amount_pesewas: initial?.goal_amount_pesewas,
    paused: initial?.paused,
  })
  const [showSaved, setShowSaved] = useState(false)

  if (
    initial &&
    (prevInitial.wall_mode !== initial.wall_mode ||
      prevInitial.goal_amount_pesewas !== initial.goal_amount_pesewas ||
      prevInitial.paused !== initial.paused)
  ) {
    setPrevInitial({
      wall_mode: initial.wall_mode,
      goal_amount_pesewas: initial.goal_amount_pesewas,
      paused: initial.paused,
    })
    setWallMode(initial.wall_mode || 'full')
    setGoalGhs(goalToString(initial.goal_amount_pesewas))
    setPaused(!!initial.paused)
  }

  // Auto-hide the "Saved" indicator after 4 seconds
  useEffect(() => {
    if (!showSaved) return
    const t = setTimeout(() => setShowSaved(false), 4000)
    return () => clearTimeout(t)
  }, [showSaved])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = {
      wall_mode: wallMode,
      goal_amount_pesewas: goalGhs ? Math.round(parseFloat(goalGhs) * 100) : null,
      paused,
    }
    try {
      await updateSettings(memorialId, body)
      setShowSaved(true)
      onSaved?.()
    } catch (err) {
      console.error('updateSettings failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">Donor wall visibility</h3>
        <fieldset className="space-y-2">
          <legend className="sr-only">Wall mode</legend>
          {WALL_MODES.map((m) => (
            <label
              key={m.value}
              className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <input
                type="radio"
                name="wall_mode"
                value={m.value}
                checked={wallMode === m.value}
                onChange={() => setWallMode(m.value)}
                className="mt-1 accent-primary"
              />
              <div>
                <p className="text-foreground font-medium">{m.label}</p>
                <p className="text-muted-foreground text-sm">{m.help}</p>
              </div>
            </label>
          ))}
        </fieldset>
      </div>

      <div>
        <label htmlFor="goal" className="block text-base font-semibold text-foreground mb-2">
          Donation goal (optional)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">GHS</span>
          <input
            id="goal"
            type="number"
            inputMode="decimal"
            value={goalGhs}
            onChange={(e) => setGoalGhs(e.target.value)}
            placeholder="50000"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <p className="text-muted-foreground text-xs mt-1">
          Shown as a progress bar on the donate page. Leave blank for no goal.
        </p>
      </div>

      <div>
        <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            checked={paused}
            onChange={(e) => setPaused(e.target.checked)}
            className="mt-1 accent-primary"
          />
          <div>
            <p className="text-foreground font-medium">Pause donations</p>
            <p className="text-muted-foreground text-sm">
              Stops new donations from being accepted. Existing donations are unaffected.
            </p>
          </div>
        </label>
      </div>

      {settingsError && <p className="text-destructive text-sm">{settingsError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={settingsLoading}
          className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {settingsLoading ? 'Saving…' : 'Save changes'}
        </button>
        {showSaved && (
          <span className="text-emerald-600 text-sm">✓ Saved</span>
        )}
      </div>
    </form>
  )
}
