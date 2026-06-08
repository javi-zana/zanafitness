'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AiLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.replace('/')
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({}))
    setError(data.error || 'Login failed')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <div className="text-sm font-semibold tracking-[0.2em] text-lime-400">ZANA</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">internal</div>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-lime-500"
        />
        {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-lg bg-lime-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-lime-400 disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
