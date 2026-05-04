import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FamilyHeadDashboard } from '../components/family-head/FamilyHeadDashboard.jsx'
import { useAuthStore } from '../stores/authStore.js'

const DONATION_API = import.meta.env.VITE_DONATION_API_URL || 'https://donation-api.funeralpress.org'

export default function FamilyHeadDashboardPage() {
  const { memorialId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [memorial, setMemorial] = useState(null)
  const [error, setError] = useState(null)

  // Require login — family head must be authenticated
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (!memorialId || !user) return
    let cancelled = false
    fetch(`${DONATION_API}/memorials/${memorialId}/donation-status`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Memorial not found')
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error('Memorial not found')
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setMemorial(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [memorialId, user])

  if (!user) return null  // navigating away
  if (error) {
    return (
      <main className="p-8 text-center text-muted-foreground">
        {error}. If this is your memorial, contact support@funeralpress.org.
      </main>
    )
  }
  if (!memorial) {
    return <main className="p-8 text-center text-muted-foreground">Loading…</main>
  }
  // Memorial without donation block — donations not yet set up
  if (!memorial.donation || !memorial.donation.enabled) {
    return (
      <main className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-3">
          Donations not set up
        </h1>
        <p className="text-muted-foreground">
          This memorial doesn't have a donation rail enabled yet.
          {!memorial.donation && ' Set up donations from the memorial page.'}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <FamilyHeadDashboard memorial={memorial} />
    </main>
  )
}
