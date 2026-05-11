export type OkrContent = {
  type: 'okr'
  objective: string
  key_results: string[]
}

export function okrHasContent(okr: OkrContent | null | undefined): boolean {
  if (!okr) return false
  if (okr.objective?.trim()) return true
  return (okr.key_results ?? []).some(k => k?.trim())
}

export function OkrCard({ okr, showEmpty = true }: { okr: OkrContent | null; showEmpty?: boolean }) {
  const objective = okr?.objective?.trim() ?? ''
  const krs = (okr?.key_results ?? []).map(k => k?.trim() ?? '').filter(Boolean)
  const empty = !objective && krs.length === 0

  if (empty) {
    if (!showEmpty) return null
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--c-border2)] bg-[var(--c-card2)] p-6">
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-[0.2em] mb-2">Objective</p>
        <p className="text-sm text-[var(--c-text3)] leading-relaxed">
          Your coach hasn't set your objective yet. You'll see what you're working toward here.
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--c-border2)] bg-gradient-to-br from-[var(--c-card)] to-[var(--c-card2)] p-6 lg:p-7 shadow-lg shadow-[#b0e455]/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b0e455]/50 to-transparent" />
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#b0e455]/8 blur-3xl pointer-events-none" />

      <p className="relative text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-[0.2em] mb-3">Objective</p>
      <h2 className="relative font-display leading-tight text-2xl lg:text-3xl text-[var(--c-text)]">
        {objective || <span className="text-[var(--c-text4)]">Not set</span>}
      </h2>

      {krs.length > 0 && (
        <div className="relative mt-6 pt-5 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-[0.2em] mb-4">Key Results</p>
          <div className="space-y-3">
            {krs.map((kr, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-xs text-[var(--c-accent-text)] shrink-0 mt-1 tabular-nums">0{i + 1}</span>
                <p className="text-sm text-[var(--c-text2)] leading-relaxed">{kr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
