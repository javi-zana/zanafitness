'use client'

import { useState } from 'react'

type Note = { id: string; body: string; created_at: string }

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Notebook({ memberId, initialNotes }: { memberId: string; initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function add() {
    if (!draft.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memberId, body: draft }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')
      setNotes((n) => [data.note, ...n])
      setDraft('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    const prev = notes
    setNotes((n) => n.filter((x) => x.id !== id))
    const res = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) setNotes(prev) // rollback
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-zinc-200">Meeting notes</h2>
        <span className="text-xs text-zinc-600">{notes.length}</span>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') add() }}
        placeholder="Notes from your call — quick paragraphs or bullets. These feed the report generator. (⌘↵ to save)"
        rows={3}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-lime-500"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={add}
          disabled={saving || !draft.trim()}
          className="rounded-lg bg-lime-500 px-4 py-1.5 text-sm font-semibold text-zinc-950 transition hover:bg-lime-400 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Add note'}
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">{fmt(n.created_at)}</span>
                <button
                  onClick={() => remove(n.id)}
                  className="text-[10px] text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
