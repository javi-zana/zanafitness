export default function ProgramLoading() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-10">
        <div className="px-5 lg:px-10 pt-14 lg:pt-6 space-y-3">
          <div className="h-8 w-40 rounded-lg bg-[var(--c-card)] animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-full bg-[var(--c-card)] animate-pulse" />
            <div className="h-9 w-20 rounded-full bg-[var(--c-card)] animate-pulse" />
            <div className="h-9 w-20 rounded-full bg-[var(--c-card)] animate-pulse" />
            <div className="h-9 w-20 rounded-full bg-[var(--c-card)] animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-40 rounded-2xl bg-[var(--c-card)] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
