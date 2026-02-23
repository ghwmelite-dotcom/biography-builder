import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export function useGoogleOneTap() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user || !GOOGLE_CLIENT_ID) return

    const tryPrompt = () => {
      if (!window.google?.accounts?.id) return false

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await useAuthStore.getState().handleGoogleLogin(response.credential)
          } catch (err) {
            console.warn('[auth] Google One Tap login failed:', err.message)
          }
        },
        auto_select: true,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.prompt()
      return true
    }

    if (!tryPrompt()) {
      // GIS not loaded yet, wait for it
      const interval = setInterval(() => {
        if (tryPrompt()) clearInterval(interval)
      }, 500)
      const timeout = setTimeout(() => clearInterval(interval), 10000)
      return () => { clearInterval(interval); clearTimeout(timeout) }
    }
  }, [user])
}
