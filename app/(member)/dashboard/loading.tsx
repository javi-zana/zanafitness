export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-10">
        <div className="mx-5 mt-14 lg:mt-6 lg:mx-10 rounded-3xl h-44 bg-[var(--c-card)] animate-pulse" />
        <div className="px-5 lg:px-10 space-y-3 pt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 rounded-2xl bg-[var(--c-card)] animate-pulse" />
            <div className="h-20 rounded-2xl bg-[var(--c-card)] animate-pulse" />
            <div className="h-20 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          </div>
          <div className="h-32 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-24 rounded-2xl bg-[var(--c-card)] animate-pulse" />
          <div className="h-24 rounded-2xl bg-[var(--c-card)] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
