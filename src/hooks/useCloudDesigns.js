import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { fetchCloudDesignList } from '../utils/syncEngine'

export function useCloudDesigns() {
  const user = useAuthStore((s) => s.user)
  const [cloudDesigns, setCloudDesigns] = useState([])
  const [isLoadingCloud, setIsLoadingCloud] = useState(false)

  const refreshCloudDesigns = useCallback(async () => {
    if (!user) {
      setCloudDesigns([])
      return
    }
    setIsLoadingCloud(true)
    try {
      const designs = await fetchCloudDesignList()
      setCloudDesigns(designs)
    } catch {
      setCloudDesigns([])
    } finally {
      setIsLoadingCloud(false)
    }
  }, [user])

  useEffect(() => {
    refreshCloudDesigns()
  }, [refreshCloudDesigns])

  return { cloudDesigns, isLoadingCloud, refreshCloudDesigns }
}
