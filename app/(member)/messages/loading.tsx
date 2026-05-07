export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-10">
        <div className="px-5 lg:px-10 pt-14 lg:pt-6 space-y-3">
          <div className="h-8 w-32 rounded-lg bg-[var(--c-card)] animate-pulse" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--c-card)] animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[var(--c-border)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 rounded bg-[var(--c-border)]" />
                  <div className="h-3 w-2/3 rounded bg-[var(--c-border)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
