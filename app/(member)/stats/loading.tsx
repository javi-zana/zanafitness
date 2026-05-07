export default function StatsLoading() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-10">
        <div className="px-5 lg:px-10 pt-14 lg:pt-6 space-y-3">
          <div className="h-8 w-32 rounded-lg bg-[var(--c-card)] animate-pulse" />
          <div className="h-40 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-28 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-48 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-32 rounded-2xl bg-[var(--c-card)] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
