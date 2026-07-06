// Workout log payload stored in workout_logs.notes (JSONB). Two versions:
//   v1: { v: 1, exercises: [{ move, kg, reps, sets }], notes }        — one line per exercise
//   v2: { v: 2, exercises: [{ move, sets: [{ kg, reps }] }], notes }  — Strong-style per-set
// Everything reads through parseWorkoutLog so old logs keep rendering.

export type SetEntry = { kg: string; reps: string }
export type LoggedExercise = { move: string; sets: SetEntry[] }
export type ParsedWorkout = { exercises: LoggedExercise[]; notes: string | null }

export function parseWorkoutLog(raw: string | Record<string, unknown> | null): ParsedWorkout {
  if (!raw) return { exercises: [], notes: null }
  try {
    const p = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
      v?: number
      exercises?: Array<Record<string, unknown>>
      notes?: string | null
    }
    const notes = p.notes ?? null
    const list = Array.isArray(p.exercises) ? p.exercises : []

    const exercises: LoggedExercise[] = list
      .map((e) => {
        const move = String(e.move ?? '').trim()
        if (Array.isArray(e.sets)) {
          // v2
          const sets = (e.sets as Array<Record<string, unknown>>).map((s) => ({
            kg: String(s.kg ?? ''),
            reps: String(s.reps ?? ''),
          }))
          return { move, sets }
        }
        // v1 — expand "sets: 3" into 3 identical set entries
        const n = Math.max(1, Math.min(20, parseInt(String(e.sets ?? '')) || 1))
        const entry = { kg: String(e.kg ?? ''), reps: String(e.reps ?? '') }
        return { move, sets: Array.from({ length: n }, () => ({ ...entry })) }
      })
      .filter((e) => e.move)

    return { exercises, notes }
  } catch {
    return { exercises: [], notes: null }
  }
}

/** Compact one-line summary of an exercise's sets: "50×8 · 50×8 · 45×10". */
export function setsSummary(sets: SetEntry[]): string {
  const parts = sets
    .filter((s) => s.kg || s.reps)
    .map((s) => `${s.kg || '—'}×${s.reps || '—'}`)
  return parts.join(' · ') || '—'
}
