import { useState, useCallback } from 'react'

const SHARE_API_URL = 'https://brochure-share-api.ghwmelite.workers.dev'

export function useShareBrochure() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const shareBrochure = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(SHARE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || 'Failed to share brochure')
      }
      return response.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadShared = useCallback(async (code) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SHARE_API_URL}/${code}`)
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Not found' }))
        throw new Error(err.error || 'Shared brochure not found')
      }
      return response.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateShared = useCallback(async (code, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SHARE_API_URL}/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || 'Failed to update shared brochure')
      }
      return response.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { shareBrochure, loadShared, updateShared, loading, error }
}
