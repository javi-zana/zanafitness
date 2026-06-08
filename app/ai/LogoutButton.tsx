'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }
  return (
    <button
      onClick={logout}
      className="text-xs text-zinc-500 transition hover:text-zinc-300"
    >
      Sign out
    </button>
  )
}
