'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// The tool lives as a saved-to-home-screen PWA: iOS keeps the page alive for
// days, so server-fetched data goes stale between visits. Re-pull whenever the
// app regains focus.
export default function RefreshOnFocus() {
  const router = useRouter()
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [router])
  return null
}
