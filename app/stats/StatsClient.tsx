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
type ProgressPhoto = {
  id: string
  photo_url: string
  photo_type: 'before' | 'weekly'
  taken_at: string
  created_at: string
}

type Props = {
  userId: string
  weightUnit: 'kg' | 'lb'
  initialStats: StatUpdate[]
  showNudge: boolean
  initialProgressPhotos: ProgressPhoto[]
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
      <p className="text-sm text-[var(--c-text4)] text-center py-4">
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
      <div className="flex justify-between text-xs text-[var(--c-text4)] mt-1">
        <span>{min} {unit}</span>
        <span className="text-[var(--c-accent-text)] font-semibold">{lastVal} {unit} now</span>
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
    <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 space-y-3 border border-[var(--c-border)]">
      <p className="text-xs text-[var(--c-text4)]">
        {formatted} · {time}
      </p>

      <div className="flex gap-4">
        {stat.weight_kg != null && (
          <div>
            <p className="text-xs text-[var(--c-text3)] mb-0.5">Weight</p>
            <p className="text-xl font-bold text-[var(--c-text)]">
              {toDisplay(stat.weight_kg, unit)}
              <span className="text-sm text-[var(--c-text3)] ml-1">{unit}</span>
            </p>
          </div>
        )}
        {stat.confidence != null && (
          <div>
            <p className="text-xs text-[var(--c-text3)] mb-0.5">Confidence</p>
            <p className="text-xl font-bold" style={{ color: confidenceColor(stat.confidence) }}>
              {stat.confidence}
              <span className="text-sm opacity-60 ml-1">/ 10</span>
            </p>
          </div>
        )}
      </div>

      {stat.milestone_text && (
        <p className="text-sm text-[var(--c-text2)] leading-relaxed">{stat.milestone_text}</p>
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
      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[var(--c-card)]"
    />
  )
}

// ─── Progress photos ──────────────────────────────────────────────────────────

function ProgressPhotos({ initialPhotos }: { initialPhotos: ProgressPhoto[] }) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(
    [...initialPhotos].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  )
  const [uploading, setUploading] = useState<'before' | 'weekly' | null>(null)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const weeklyInputRef = useRef<HTMLInputElement>(null)

  const beforePhoto = photos.find(p => p.photo_type === 'before') ?? null
  const weeklyPhotos = photos.filter(p => p.photo_type === 'weekly')
  const latestWeekly = weeklyPhotos[weeklyPhotos.length - 1] ?? null

  async function uploadPhoto(file: File, type: 'before' | 'weekly') {
    setUploading(type)
    setError('')
    if (beforeInputRef.current) beforeInputRef.current.value = ''
    if (weeklyInputRef.current) weeklyInputRef.current.value = ''

    const fd = new FormData()
    fd.append('file', file)
    fd.append('photo_type', type)
    const res = await fetch('/api/upload-progress-photo', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Upload failed')
    } else {
      setPhotos(prev =>
        [...prev, json.photo as ProgressPhoto].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      )
    }
    setUploading(null)
  }

  async function deletePhoto(id: string) {
    const res = await fetch('/api/upload-progress-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setPhotos(prev => prev.filter(p => p.id !== id))
  }

  function photoLabel(photo: ProgressPhoto) {
    if (photo.photo_type === 'before') return 'Before'
    const idx = photos.filter(p => p.photo_type === 'weekly').findIndex(p => p.id === photo.id)
    return `Week ${idx + 1}`
  }

  const cameraIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--c-text4)] uppercase tracking-wide font-medium">Progress Photos</p>
        {photos.length > 0 && (
          <button
            onClick={() => weeklyInputRef.current?.click()}
            disabled={uploading !== null}
            className="text-xs text-[var(--c-accent-text)]/60 hover:text-[var(--c-accent-text)] transition font-medium disabled:opacity-40"
          >
            + Add weekly
          </button>
        )}
      </div>

      {/* Before vs Latest comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Before slot */}
        <div>
          <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wide mb-1.5">Before</p>
          {beforePhoto ? (
            <div
              className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--c-bg)] cursor-pointer"
              onClick={() => setLightbox(beforePhoto.photo_url)}
            >
              <img src={beforePhoto.photo_url} alt="Before" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => beforeInputRef.current?.click()}
              disabled={uploading !== null}
              className="w-full aspect-[3/4] rounded-2xl border border-dashed border-[var(--c-border)] flex flex-col items-center justify-center gap-2 text-[var(--c-text4)] hover:border-[#b0e455]/30 hover:text-[var(--c-accent-text)]/50 transition disabled:opacity-40"
            >
              {uploading === 'before' ? (
                <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
              ) : (
                <>
                  {cameraIcon}
                  <span className="text-xs font-medium">Upload</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Latest weekly slot */}
        <div>
          <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wide mb-1.5">
            {latestWeekly ? `Week ${weeklyPhotos.length}` : 'Latest'}
          </p>
          {latestWeekly ? (
            <div
              className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--c-bg)] cursor-pointer"
              onClick={() => setLightbox(latestWeekly.photo_url)}
            >
              <img src={latestWeekly.photo_url} alt="Latest" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => weeklyInputRef.current?.click()}
              disabled={uploading !== null}
              className="w-full aspect-[3/4] rounded-2xl border border-dashed border-[var(--c-border)] flex flex-col items-center justify-center gap-2 text-[var(--c-text4)] hover:border-[#b0e455]/30 hover:text-[var(--c-accent-text)]/50 transition disabled:opacity-40"
            >
              {uploading === 'weekly' ? (
                <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
              ) : (
                <>
                  {cameraIcon}
                  <span className="text-xs font-medium">Add weekly</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* No photos CTA */}
      {photos.length === 0 && !uploading && (
        <p className="text-xs text-[var(--c-text4)] text-center leading-relaxed">
          Upload a &quot;Before&quot; photo to start tracking your visual progress over time.
        </p>
      )}

      {/* Timeline strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map(photo => (
            <div key={photo.id} className="shrink-0 flex flex-col items-center gap-1">
              <div
                className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--c-card)] cursor-pointer"
                onClick={() => setLightbox(photo.photo_url)}
              >
                <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={e => { e.stopPropagation(); deletePhoto(photo.id) }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--c-bg)]/80 rounded-full flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2 h-2 text-[var(--c-text3)]">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wide">{photoLabel(photo)}</p>
            </div>
          ))}
          {/* Add weekly button */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <button
              onClick={() => weeklyInputRef.current?.click()}
              disabled={uploading !== null}
              className="w-14 h-14 rounded-xl border border-dashed border-[var(--c-border)] flex items-center justify-center text-[var(--c-text4)] hover:border-[#b0e455]/30 hover:text-[var(--c-accent-text)]/50 transition disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wide">Add</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, 'before') }}
      />
      <input
        ref={weeklyInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, 'weekly') }}
      />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
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
        <label className="text-xs text-[var(--c-text3)] block mb-2">
          Weight ({weightUnit})
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder={`e.g. ${weightUnit === 'kg' ? '72.5' : '159.8'}`}
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
        />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs text-[var(--c-text3)]">Confidence</label>
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
                  ? 'border-[var(--c-accent-text)] text-[var(--c-accent-text)] bg-[var(--c-accent-text)]/10'
                  : 'border-[var(--c-border)] text-[var(--c-text3)] hover:border-[var(--c-border2)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs text-[var(--c-text3)]">Milestone</label>
          <span className="text-xs text-[var(--c-text4)]">{milestone.length} / 280</span>
        </div>
        <textarea
          maxLength={280}
          rows={3}
          placeholder="What did you hit this week? Any wins, realizations, momentum?"
          value={milestone}
          onChange={e => setMilestone(e.target.value)}
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
        />
      </div>

      <div>
        <label className="text-xs text-[var(--c-text3)] block mb-2">Photos (optional)</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-[var(--c-border)] rounded-2xl py-3 text-sm text-[var(--c-text3)] hover:border-[var(--c-accent-text)] hover:text-[var(--c-accent-text)] transition"
        >
          + Add photos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {previews.map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[var(--c-card)]" />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-[var(--c-border)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] hover:border-[var(--c-border2)] transition"
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

export default function StatsClient({ userId, weightUnit, initialStats, showNudge, initialProgressPhotos }: Props) {
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
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="flex-1 flex flex-col lg:max-w-4xl lg:mx-auto lg:w-full">

        <div className="px-5 pt-12 pb-4 flex items-center justify-between lg:px-10 lg:pt-10 lg:pb-5 lg:border-b lg:border-[var(--c-border)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">My Stats</h1>
            <p className="text-xs text-[var(--c-text4)] mt-0.5">Track your progress over time</p>
          </div>
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] active:scale-95 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Log
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 space-y-4 lg:px-10 lg:pt-8 lg:pb-10 lg:space-y-5">

          {showNudge && !nudgeDismissed && !formOpen && (
            <div className="relative bg-[#b0e455] rounded-2xl p-5 overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-base font-bold text-[#0f1a0c] tracking-tight">Time to log</p>
                  <p className="text-sm text-[#0f1a0c]/70 mt-1 leading-relaxed">
                    {stats.length === 0
                      ? "You haven't logged any stats yet. Drop your first update."
                      : "It's been 3+ days since your last update. Keep the momentum going."}
                  </p>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 bg-[var(--c-bg)] text-[var(--c-accent-text)] text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[var(--c-card)] transition"
                  >
                    Log now
                  </button>
                </div>
                <button
                  onClick={() => setNudgeDismissed(true)}
                  className="text-[#0f1a0c]/30 hover:text-[#0f1a0c]/60 transition shrink-0 mt-0.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {formOpen && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-5 border border-[var(--c-border)]">
              <h2 className="text-base font-bold text-[var(--c-text)] mb-5">New Update</h2>
              <LogForm
                userId={userId}
                weightUnit={weightUnit}
                onSaved={handleSaved}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          )}

          {chartStats.length > 0 && !formOpen && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <p className="text-xs text-[var(--c-text4)] uppercase tracking-wide mb-3">Weight trend</p>
              <WeightChart stats={chartStats} unit={weightUnit} />
            </div>
          )}

          <ProgressPhotos initialPhotos={initialProgressPhotos} />

          {stats.length === 0 && !formOpen ? (
            <div className="space-y-3 pt-2">
              <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-5 space-y-4">
                <p className="text-xs font-semibold text-[var(--c-accent-text)] uppercase tracking-wider">What you&apos;ll track</p>
                {[
                  { icon: <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />, label: "Body weight", desc: "Logged in kg or lbs, charted over time so you can see the trend clearly." },
                  { icon: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />, label: "Confidence score", desc: "How you're feeling about your progress on a 1-10 scale. Tells your coach a lot." },
                  { icon: <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />, label: "Progress photos", desc: "Before and weekly photos to visually track your transformation over time." },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-5 h-5">{item.icon}</svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-[var(--c-text3)] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-5">
                <p className="text-sm font-semibold mb-2">How often should I log?</p>
                <p className="text-sm text-[var(--c-text3)] leading-relaxed">
                  At least once a week - ideally every 3-4 days. Consistency matters more than frequency. Even weekly data gives your coach a clear picture of what's actually happening.
                </p>
              </div>
              <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-5">
                <p className="text-sm font-semibold text-[var(--c-accent-text)] mb-1">Ready to start?</p>
                <p className="text-sm text-[var(--c-text3)] leading-relaxed">
                  Tap <strong className="text-[var(--c-text2)]">Log</strong> above to drop your first check-in. It takes less than a minute.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.length > 0 && (
                <p className="text-xs text-[var(--c-text4)] uppercase tracking-wide">History</p>
              )}
              {stats.map(stat => (
                <StatCard key={stat.id} stat={stat} unit={weightUnit} />
              ))}
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
