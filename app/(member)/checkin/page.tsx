export default function CheckinPage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Weekly check-in</p>
          <h1 className="font-display text-3xl leading-none">Check-in</h1>
        </div>

        <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--c-text3)] leading-relaxed">
            Your weekly check-in is coming soon.<br />
            You&apos;ll submit how the week went right here.
          </p>
        </div>
      </div>
    </main>
  )
}
