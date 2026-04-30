'use client'

import { useState, useRef, FormEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type Photo = { id: string; storage_path: string }
type StatUpdate = {
  id: string
  weight_kg: number | null
  confidence: number | null
  milestone_text: string | null
  created_at: string
  stat_update_photos: Photo[]
}

type Props = {
  userId: string
  weightUnit: 'kg' | 'lb'
  initialStats: StatUpdate[]
  showNudge: boolean
}

// ─── Weight helpers ────────────────────────────────────────────────────────────

function toDisplay(kg: number, unit: 'kg' | 'lb') {
  return unit === 'lb' ? +(kg * 2.20462).toFixed(1) : +kg.toFixed(1)
}
function toKg(val: number, unit: 'kg' | 'lb') {
  return unit === 'lb' ? val / 2.20462 : val
}

// ─── Confidence label ─────────────────────────────────────────────────────────

function confidenceLabel(v: number) {
  if (v <= 3) return 'Low'
  if (v <= 5) return 'Mid'
  if (v <= 8) return 'High'
  return 'Max'
}
function confidenceColor(v: number) {
  if (v <= 3) return '#f87171'
  if (v <= 5) return '#fbbf24'
  if (v <= 8) return '#86efac'
  return '#b0e455'
}

// ─── Weight chart ─────────────────────────────────────────────────────────────

function WeightChart({ stats, unit }: { stats: StatUpdate[]; unit: 'kg' | 'lb' }) {
  const pts = [...stats]
    .reverse()
    .filter(s => s.weight_kg != null)
    .map(s => toDisplay(s.weight_kg!, unit))

  if (pts.length < 2) {
    return (
      <p className="text-sm text-[#edf5e2]/30 text-center py-4">
        Log at least 2 weights to see your trend
      </p>
    )
  }

  const W = 300
  const H = 60
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1

  const coords = pts.map((w, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - ((w - min) / range) * (H - 8) - 4,
  }))

  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')
  const fillPath = [
    `M${coords[0].x},${H}`,
    ...coords.map(c => `L${c.x},${c.y}`),
    `L${coords[coords.length - 1].x},${H}`,
    'Z',
  ].join(' ')

  const last = coords[coords.length - 1]
  const lastVal = pts[pts.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: 72 }}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b0e455" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#b0e455" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#chartGrad)" />
        <polyline points={polyline} fill="none" stroke="#b0e455" strokeWidth="1.5" />
        <circle cx={last.x} cy={last.y} r="3" fill="#b0e455" />
      </svg>
      <div className="flex justify-between text-xs text-[#edf5e2]/35 mt-1">
        <span>{min} {unit}</span>
        <span className="text-[#b0e455] font-semibold">{lastVal} {unit} now</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ stat, unit }: { stat: StatUpdate; unit: 'kg' | 'lb' }) {
  const date = new Date(stat.created_at)
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="bg-[#1c2e16] rounded-2xl p-4 space-y-3 border border-[#b0e455]/8">
      <p className="text-xs text-[#edf5e2]/35">
        {formatted} · {time}
      </p>

      <div className="flex gap-4">
        {stat.weight_kg != null && (
          <div>
            <p className="text-xs text-[#edf5e2]/40 mb-0.5">Weight</p>
            <p className="text-xl font-bold text-[#edf5e2]">
              {toDisplay(stat.weight_kg, unit)}
              <span className="text-sm text-[#edf5e2]/40 ml-1">{unit}</span>
            </p>
          </div>
        )}
        {stat.confidence != null && (
          <div>
            <p className="text-xs text-[#edf5e2]/40 mb-0.5">Confidence</p>
            <p className="text-xl font-bold" style={{ color: confidenceColor(stat.confidence) }}>
              {stat.confidence}
              <span className="text-sm opacity-60 ml-1">/ 10</span>
            </p>
          </div>
        )}
      </div>

      {stat.milestone_text && (
        <p className="text-sm text-[#edf5e2]/70 leading-relaxed">{stat.milestone_text}</p>
      )}

      {stat.stat_update_photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stat.stat_update_photos.map(photo => (
            <PhotoThumb key={photo.id} path={photo.storage_path} />
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoThumb({ path }: { path: string }) {
  const supabase = createClient()
  const { data } = supabase.storage.from('stat-photos').getPublicUrl(path)
  return (
    <img
      src={data.publicUrl}
      alt=""
      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#edf5e2]/5"
    />
  )
}

// ─── Log form ─────────────────────────────────────────────────────────────────

function LogForm({
  userId,
  weightUnit,
  onSaved,
  onCancel,
}: {
  userId: string
  weightUnit: 'kg' | 'lb'
  onSaved: (stat: StatUpdate) => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [weight, setWeight] = useState('')
  const [confidence, setConfidence] = useState(7)
  const [milestone, setMilestone] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const PRESETS = [
    { label: 'Low', value: 2 },
    { label: 'Mid', value: 5 },
    { label: 'High', value: 7 },
    { label: 'Max', value: 10 },
  ]

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!weight && !milestone && confidence === 7 && photos.length === 0) {
      setError('Add at least one field before saving.')
      return
    }
    setError('')
    setLoading(true)

    const weightKg = weight ? toKg(parseFloat(weight), weightUnit) : null

    const { data: update, error: insertErr } = await supabase
      .from('stat_updates')
      .insert({
        member_id: userId,
        weight_kg: weightKg,
        confidence,
        milestone_text: milestone || null,
      })
      .select('id, weight_kg, confidence, milestone_text, created_at')
      .single()

    if (insertErr || !update) {
      setError('Failed to save. Try again.')
      setLoading(false)
      return
    }

    const savedPhotos: Photo[] = []
    for (const file of photos) {
      const path = `${userId}/${update.id}/${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('stat-photos').upload(path, file)
      if (!uploadErr) {
        const { data: photoRow } = await supabase
          .from('stat_update_photos')
          .insert({ stat_update_id: update.id, storage_path: path })
          .select('id, storage_path')
          .single()
        if (photoRow) savedPhotos.push(photoRow)
      }
    }

    onSaved({ ...update, stat_update_photos: savedPhotos })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs text-[#edf5e2]/45 block mb-2">
          Weight ({weightUnit})
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder={`e.g. ${weightUnit === 'kg' ? '72.5' : '159.8'}`}
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="w-full bg-[#0f1a0c] border border-[#b0e455]/15 rounded-2xl px-4 py-3 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition"
        />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs text-[#edf5e2]/45">Confidence</label>
          <span className="text-sm font-semibold" style={{ color: confidenceColor(confidence) }}>
            {confidence} / 10 · {confidenceLabel(confidence)}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={confidence}
          onChange={e => setConfidence(Number(e.target.value))}
          className="w-full accent-[#b0e455]"
        />
        <div className="flex justify-between mt-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setConfidence(p.value)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition border ${
                confidence === p.value
                  ? 'border-[#b0e455] text-[#b0e455] bg-[#b0e455]/10'
                  : 'border-[#edf5e2]/10 text-[#edf5e2]/40 hover:border-[#edf5e2]/25'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs text-[#edf5e2]/45">Milestone</label>
          <span className="text-xs text-[#edf5e2]/30">{milestone.length} / 280</span>
        </div>
        <textarea
          maxLength={280}
          rows={3}
          placeholder="What did you hit this week? Any wins, realizations, momentum?"
          value={milestone}
          onChange={e => setMilestone(e.target.value)}
          className="w-full bg-[#0f1a0c] border border-[#b0e455]/15 rounded-2xl px-4 py-3 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
        />
      </div>

      <div>
        <label className="text-xs text-[#edf5e2]/45 block mb-2">Photos (optional)</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-[#edf5e2]/12 rounded-2xl py-3 text-sm text-[#edf5e2]/40 hover:border-[#b0e455]/35 hover:text-[#b0e455]/60 transition"
        >
          + Add photos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {previews.map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#edf5e2]/5" />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-[#edf5e2]/10 text-sm text-[#edf5e2]/50 hover:text-[#edf5e2] hover:border-[#edf5e2]/25 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatsClient({ userId, weightUnit, initialStats, showNudge }: Props) {
  const [stats, setStats] = useState<StatUpdate[]>(initialStats)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  function handleSaved(stat: StatUpdate) {
    setStats(prev => [stat, ...prev])
    setFormOpen(false)
    setNudgeDismissed(true)
  }

  const chartStats = [...stats].filter(s => s.weight_kg != null)

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pl-72">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between lg:px-10 lg:pt-10 lg:pb-5 lg:border-b lg:border-[#b0e455]/8">
        <div>
          <p className="text-xs lg:text-sm text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
          <h1 className="text-xl font-bold tracking-tight lg:text-3xl">My Stats</h1>
        </div>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-xs font-semibold hover:bg-[#c9f070] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Log
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4 lg:px-10 lg:max-w-4xl lg:pb-10 lg:space-y-5">
        {showNudge && !nudgeDismissed && !formOpen && (
          <div className="flex items-start gap-3 bg-[#b0e455]/8 border border-[#b0e455]/15 rounded-2xl p-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-4 h-4 mt-0.5 shrink-0">
              <path d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#b0e455]">Time to log</p>
              <p className="text-sm text-[#edf5e2]/50 mt-0.5">
                {stats.length === 0
                  ? "You haven't logged any stats yet. Drop your first update."
                  : "It's been 3+ days since your last update. Keep the momentum going."}
              </p>
            </div>
            <button
              onClick={() => setNudgeDismissed(true)}
              className="text-[#edf5e2]/20 hover:text-[#edf5e2]/50 transition shrink-0 mt-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {formOpen && (
          <div className="bg-[#1c2e16] rounded-2xl p-5 border border-[#b0e455]/8">
            <h2 className="text-sm font-semibold text-[#edf5e2]/60 mb-5">New Update</h2>
            <LogForm
              userId={userId}
              weightUnit={weightUnit}
              onSaved={handleSaved}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        )}

        {chartStats.length > 0 && !formOpen && (
          <div className="bg-[#1c2e16] rounded-2xl p-4 border border-[#b0e455]/8">
            <p className="text-xs text-[#edf5e2]/35 uppercase tracking-wide mb-3">Weight trend</p>
            <WeightChart stats={chartStats} unit={weightUnit} />
          </div>
        )}

        {stats.length === 0 && !formOpen ? (
          <div className="space-y-3 pt-2">
            <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-5 space-y-4">
              <p className="text-xs font-semibold text-[#b0e455] uppercase tracking-wider">What you'll track</p>
              {[
                { icon: <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />, label: "Body weight", desc: "Logged in kg or lbs, charted over time so you can see the trend clearly." },
                { icon: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />, label: "Confidence score", desc: "How you're feeling about your progress on a 1-10 scale. Tells your coach a lot." },
                { icon: <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />, label: "Progress photos", desc: "Optional. Attach photos to any check-in to build a visual record over time." },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-4.5 h-4.5 w-5 h-5">{item.icon}</svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-[#edf5e2]/40 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-5">
              <p className="text-sm font-semibold mb-2">How often should I log?</p>
              <p className="text-sm text-[#edf5e2]/45 leading-relaxed">
                At least once a week - ideally every 3-4 days. Consistency matters more than frequency. Even weekly data gives your coach a clear picture of what's actually happening.
              </p>
            </div>
            <div className="bg-[#b0e455]/6 border border-[#b0e455]/15 rounded-2xl p-5">
              <p className="text-sm font-semibold text-[#b0e455] mb-1">Ready to start?</p>
              <p className="text-sm text-[#edf5e2]/50 leading-relaxed">
                Tap <strong className="text-[#edf5e2]/70">Log</strong> above to drop your first check-in. It takes less than a minute.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.length > 0 && (
              <p className="text-xs text-[#edf5e2]/30 uppercase tracking-wide">History</p>
            )}
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} unit={weightUnit} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
