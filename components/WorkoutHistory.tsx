'use client'

import { useState } from 'react'
import { parseWorkoutLog, setsSummary } from '@/lib/workout-notes'

export type WorkoutLogRecord = { id: string; logged_date: string; notes: string | Record<string, unknown> | null }

// Expandable list of past workouts with per-set summaries. Used on the member
// Program page (recent) and the /workouts history page (full).
export default function WorkoutHistory({ logs, limit = 10, heading = 'Recent workouts' }: {
  logs: WorkoutLogRecord[]
  limit?: number
  heading?: string | null
}) {
  const [expandedDate, setExpandedDate] = useState<string | null>(logs[0]?.logged_date ?? null)
  if (!logs.length) return null
  return (
    <div className="mt-6 space-y-2">
      {heading && (
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">{heading}</p>
      )}
      {logs.slice(0, limit).map(log => {
        const { exercises, notes: logNotes } = parseWorkoutLog(log.notes)
        const isExpanded = expandedDate === log.logged_date
        const d = new Date(log.logged_date + 'T12:00:00')
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return (
          <div key={log.logged_date} className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] overflow-hidden">
            <button
              onClick={() => setExpandedDate(isExpanded ? null : log.logged_date)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--c-hover)] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--c-text)]">{dayLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                {exercises.length > 0 && (
                  <span className="text-[10px] text-[var(--c-text4)] font-mono">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-[var(--c-text4)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-[var(--c-border)] px-4 py-3 space-y-3">
                {exercises.length > 0 ? (
                  <div className="space-y-1">
                    {exercises.map((ex, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 py-1 border-b border-[var(--c-border)] last:border-0">
                        <p className="text-sm text-[var(--c-text)] min-w-0 truncate">{ex.move}</p>
                        <p className="text-xs text-[var(--c-text3)] font-mono text-right shrink-0">{setsSummary(ex.sets)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--c-text4)]">No exercises recorded</p>
                )}
                {logNotes && (
                  <p className="text-xs text-[var(--c-text3)] italic border-t border-[var(--c-border)] pt-2">{logNotes}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
