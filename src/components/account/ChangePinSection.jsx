import { useState } from 'react'
import { PinInput } from '../auth/PinInput.jsx'
import { phonePinApi } from '../../utils/phonePinApi.js'

const PIN_LENGTH = 6

export default function ChangePinSection() {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const update = (setter) => (val) => {
    setError(null); setSuccess(false); setter(val)
  }

  const isValid =
    currentPin.length === PIN_LENGTH &&
    newPin.length === PIN_LENGTH &&
    confirmNew.length === PIN_LENGTH

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (newPin !== confirmNew) { setError('New PINs do not match'); return }
    if (newPin === currentPin) { setError('New PIN must differ from current PIN'); return }
    if (!/^\d{6}$/.test(newPin)) { setError('PIN must be 6 digits'); return }
    setLoading(true); setError(null)
    try {
      await phonePinApi.changePin({ current_pin: currentPin, new_pin: newPin })
      setSuccess(true)
      setCurrentPin(''); setNewPin(''); setConfirmNew('')
    } catch (err) {
      if (err.status === 401) {
        setError('Current PIN is incorrect.')
      } else if (err.status === 400) {
        setError(err.message || 'New PIN is invalid.')
      } else {
        setError(err.message || 'Could not change PIN. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-1">Change your PIN</h2>
      <p className="text-muted-foreground text-sm mb-5">
        We&apos;ll email you a confirmation each time your PIN changes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="block text-sm text-foreground mb-1">Current PIN</span>
          <PinInput
            value={currentPin}
            onChange={update(setCurrentPin)}
            disabled={loading}
            ariaLabel="Current PIN"
          />
        </div>
        <div>
          <span className="block text-sm text-foreground mb-1">New PIN</span>
          <PinInput
            value={newPin}
            onChange={update(setNewPin)}
            disabled={loading}
            ariaLabel="New PIN"
          />
        </div>
        <div>
          <span className="block text-sm text-foreground mb-1">Confirm new PIN</span>
          <PinInput
            value={confirmNew}
            onChange={update(setConfirmNew)}
            disabled={loading}
            ariaLabel="Confirm new PIN"
          />
        </div>

        {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
        {success && (
          <p className="text-emerald-500 text-sm" role="status">
            PIN updated. A confirmation has been sent to your email.
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="bg-primary text-primary-foreground font-medium py-2 px-5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {loading ? 'Saving…' : 'Save new PIN'}
        </button>
      </form>
    </section>
  )
}
