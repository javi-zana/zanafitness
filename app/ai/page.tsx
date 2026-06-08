import LogoutButton from './LogoutButton'

// Planned tool sections. Wired up phase by phase — for now this is the shell.
const SECTIONS = [
  { label: 'Reports', desc: 'Generate & send weekly client reports', ready: false },
  { label: 'Clients', desc: 'Live stats, check-ins & progress from the app', ready: false },
  { label: 'Notes', desc: 'Running notes per client', ready: false },
]

export default function AiHome() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-[0.2em] text-lime-400">ZANA</div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">internal tool</div>
        </div>
        <LogoutButton />
      </header>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4"
          >
            <div>
              <div className="text-sm font-medium text-zinc-100">{s.label}</div>
              <div className="text-xs text-zinc-500">{s.desc}</div>
            </div>
            <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {s.ready ? 'Ready' : 'Soon'}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] text-zinc-600">
        Private. Only you have access.
      </p>
    </main>
  )
}
