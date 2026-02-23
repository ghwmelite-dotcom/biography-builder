import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function GoogleLoginButton({ compact = false }) {
  const btnRef = useRef(null)
  const isLoading = useAuthStore((s) => s.isLoading)
  const initialized = useRef(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current) return

    const tryInit = () => {
      if (!window.google?.accounts?.id) return false

      if (!initialized.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setError(null)
            try {
              await useAuthStore.getState().handleGoogleLogin(response.credential)
            } catch (err) {
              console.error('[auth] Login failed:', err)
              setError(err.message)
            }
          },
        })
        initialized.current = true
      }

      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        size: compact ? 'medium' : 'large',
        text: compact ? 'signin' : 'signin_with',
        width: compact ? undefined : 200,
      })
      return true
    }

    if (!tryInit()) {
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [compact])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div>
      <div
        ref={btnRef}
        className={isLoading ? 'opacity-50 pointer-events-none' : ''}
      />
      {error && (
        <div className="absolute top-full right-0 mt-1 p-2 bg-red-900/90 text-red-200 text-xs rounded shadow-lg max-w-64 z-50">
          {error}
        </div>
      )}
    </div>
  )
}
