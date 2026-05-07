import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { PinInput } from '../components/auth/PinInput.jsx'
import { phonePinApi } from '../utils/phonePinApi.js'
import { useNotification } from '../components/ui/notification.jsx'

const PIN_LENGTH = 6

export default function ResetPinPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const token = params.get('token') || ''

  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(token ? null : 'Reset link is missing or invalid.')

  useEffect(() => {
    if (!token) setError('Reset link is missing or invalid.')
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (pin !== confirmPin) { setError('PINs do not match'); return }
    if (!/^\d{6}$/.test(pin)) { setError('PIN must be 6 digits'); return }
    setLoading(true); setError(null)
    try {
      await phonePinApi.reset({ token, new_pin: pin })
      notify('PIN reset. Sign in with your new PIN.', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      if (err.status === 401) {
        setError('This reset link has expired or is invalid.')
      } else if (err.status === 400) {
        setError(err.message || 'PIN must be 6 digits.')
      } else {
        setError(err.message || 'Reset failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const updatePin = (setter) => (val) => { setError(null); setter(val) }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Reset your PIN</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Pick a new 6-digit PIN. You&apos;ll use it to sign in next time.
        </p>

        {!token || error === 'Reset link is missing or invalid.' || error === 'This reset link has expired or is invalid.' ? (
          <div className="space-y-4">
            <p className="text-destructive text-sm" role="alert">{error || 'Reset link is missing or invalid.'}</p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to home
            </Link>
            <p className="text-sm text-muted-foreground">
              You can request a new reset link from the &quot;Forgot PIN?&quot; option on the sign-in screen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="block text-sm text-foreground mb-1">New PIN</span>
              <PinInput value={pin} onChange={updatePin(setPin)} autoFocus disabled={loading} ariaLabel="New PIN" />
            </div>
            <div>
              <span className="block text-sm text-foreground mb-1">Confirm new PIN</span>
              <PinInput
                value={confirmPin}
                onChange={updatePin(setConfirmPin)}
                disabled={loading}
                ariaLabel="Confirm new PIN"
              />
            </div>
            {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading || pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH}
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? 'Resetting…' : 'Reset PIN'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
