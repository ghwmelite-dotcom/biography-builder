import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { PhoneInput } from './PhoneInput.jsx'
import { phonePinApi } from '../../utils/phonePinApi.js'

const ENUMERATION_SAFE_COPY = "If an account matches, a reset link is on its way."

export function ForgotPinDialog({ open, onOpenChange }) {
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('GH')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) {
      setPhone(''); setLoading(false); setSubmitted(false)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (loading || !phone) return
    setLoading(true)
    try {
      await phonePinApi.forgot({ phone })
    } catch {
      // Per spec, copy is identical regardless of outcome to avoid enumeration.
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-lg z-50">
          {!submitted && (
            <form onSubmit={handleSubmit}>
              <Dialog.Title className="text-xl font-semibold text-foreground mb-1">
                Reset your PIN
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground text-sm mb-4">
                Enter the phone number on your account and we&apos;ll email you a reset link.
              </Dialog.Description>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-foreground mb-1">Phone number</label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    country={country}
                    onCountryChange={setCountry}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!phone || loading}
                  className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </div>
            </form>
          )}

          {submitted && (
            <div className="text-center py-2">
              <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
                Check your email
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground">
                {ENUMERATION_SAFE_COPY}
              </Dialog.Description>
              <button
                type="button"
                onClick={() => onOpenChange?.(false)}
                className="mt-5 w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ForgotPinDialog
