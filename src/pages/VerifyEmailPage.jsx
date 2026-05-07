import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { phonePinApi } from '../utils/phonePinApi.js'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState(token ? 'loading' : 'error')
  const [errorMessage, setErrorMessage] = useState(
    token ? null : 'Verification link is missing.',
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        await phonePinApi.verifyEmail({ token })
        if (!cancelled) setStatus('success')
      } catch (err) {
        if (cancelled) return
        if (err.status === 401) {
          setErrorMessage('This verification link has expired or is invalid.')
        } else {
          setErrorMessage(err.message || 'Verification failed. Please try again.')
        }
        setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [token])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
            <h1 className="text-xl font-semibold text-foreground mb-1">Verifying your email…</h1>
            <p className="text-muted-foreground text-sm">Hang on for just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-emerald-500 text-4xl mb-3" aria-hidden="true">&#10003;</div>
            <h1 className="text-xl font-semibold text-foreground mb-1">Email verified</h1>
            <p className="text-muted-foreground text-sm mb-5">
              Thank you. Your account is fully set up.
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground font-medium py-2 px-5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-destructive text-4xl mb-3" aria-hidden="true">&#10005;</div>
            <h1 className="text-xl font-semibold text-foreground mb-1">Verification failed</h1>
            <p className="text-destructive text-sm mb-4" role="alert">{errorMessage}</p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground font-medium py-2 px-5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
