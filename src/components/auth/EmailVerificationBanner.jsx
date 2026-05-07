import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore.js'

/**
 * Slim banner shown to authenticated users whose email is not verified yet.
 * Hidden when the user is anonymous, when they signed up via Google (always
 * pre-verified), or when `email_verified_at` is set.
 *
 * NOTE: the resend-verification endpoint (POST /auth/phone/resend-verification)
 * is not yet implemented on the backend. Until it lands, the resend button
 * surfaces a console warning and a brief inline acknowledgement so the user
 * knows we received their click. Wire this to a real call once the backend
 * route exists.
 */
export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  // Only show when logged in AND email is not verified.
  if (!user) return null
  if (user.email_verified_at) return null
  if (dismissed) return null

  const handleResend = async () => {
    if (busy) return
    setBusy(true)
    // TODO: replace with real call to /auth/phone/resend-verification once the
    // backend endpoint ships. For now we just acknowledge the click.
    console.warn('[EmailVerificationBanner] Resend endpoint not yet implemented')
    setTimeout(() => {
      setSent(true)
      setBusy(false)
    }, 600)
  }

  return (
    <div
      role="status"
      className="w-full bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
        <span className="flex-1">
          {sent
            ? "We've sent another verification email — check your inbox."
            : 'Please verify your email so we can help you recover your PIN if you forget it.'}
        </span>
        {!sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="underline disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Resend verification email'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="opacity-70 hover:opacity-100"
        >
          &#10005;
        </button>
      </div>
    </div>
  )
}

export default EmailVerificationBanner
