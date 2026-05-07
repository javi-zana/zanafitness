'use client'

import { useState, FormEvent } from 'react'

export type ActivityKind = 'workout' | 'win' | 'meal'

export type ActivityPhoto = {
  id: string
  photo_url: string
  storage_path: string
}

export type ActivityReaction = {
  user_id: string
  kind: string
}

export type ActivityComment = {
  id: string
  author_id: string
  body: string
  created_at: string
  author_name?: string | null
  author_role?: 'member' | 'coach' | 'head_coach' | null
}

export type ActivityWithDetails = {
  id: string
  member_id: string
  kind: ActivityKind
  note: string | null
  confidence: number
  created_at: string
  photos: ActivityPhoto[]
  reactions: ActivityReaction[]
  comments: ActivityComment[]
  member_name?: string | null
}

const KIND_META: Record<ActivityKind, { label: string; emoji: string; tint: string }> = {
  workout: { label: 'Workout', emoji: '🏋️', tint: 'text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20' },
  win:     { label: 'Win',     emoji: '🏆', tint: 'text-[#b0e455] bg-[#b0e455]/10 border-[#b0e455]/20' },
  meal:    { label: 'Meal',    emoji: '🍽️', tint: 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20' },
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString()
}

function confidenceColor(v: number) {
  if (v <= 3) return '#dc2626'
  if (v <= 5) return '#b45309'
  if (v <= 8) return '#16a34a'
  return '#15803d'
}

export function ActivityCard({
  activity,
  currentUserId,
  showMemberName = false,
  onChange,
}: {
  activity: ActivityWithDetails
  currentUserId: string
  showMemberName?: boolean
  onChange: () => void
}) {
  const meta = KIND_META[activity.kind]
  const isOwner = activity.member_id === currentUserId
  const liked = activity.reactions.some(r => r.user_id === currentUserId && r.kind === 'like')
  const likeCount = activity.reactions.length

  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [busyLike, setBusyLike] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function toggleLike() {
    setBusyLike(true)
    await fetch('/api/activity-reaction', {
      method: liked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_id: activity.id }),
    })
    setBusyLike(false)
    onChange()
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    await fetch('/api/activity-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_id: activity.id, body: commentText.trim() }),
    })
    setPosting(false)
    setCommentText('')
    onChange()
  }

  async function deleteComment(commentId: string) {
    await fetch('/api/activity-comment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: commentId }),
    })
    onChange()
  }

  async function deleteActivity() {
    setDeleting(true)
    await fetch('/api/activities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activity.id }),
    })
    setDeleting(false)
    onChange()
  }

  return (
    <div className="bg-[var(--c-card)] shadow-sm border border-[var(--c-border)] rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${meta.tint}`}>
              <span aria-hidden>{meta.emoji}</span>{meta.label}
            </span>
            {showMemberName && activity.member_name && (
              <span className="text-xs text-[var(--c-text3)]">· {activity.member_name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--c-text4)] font-mono">{relTime(activity.created_at)}</span>
            {isOwner && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete activity"
                className="text-[var(--c-text5)] hover:text-[#dc2626] transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {isOwner && confirmDelete && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-[10px] uppercase tracking-wide text-[var(--c-text4)] hover:text-[var(--c-text)]"
                >
                  cancel
                </button>
                <button
                  type="button"
                  onClick={deleteActivity}
                  disabled={deleting}
                  className="text-[10px] uppercase tracking-wide text-[#dc2626] hover:opacity-75 disabled:opacity-40"
                >
                  {deleting ? '…' : 'delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {activity.note && (
          <p className="text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-wrap mb-3">{activity.note}</p>
        )}

        {activity.photos.length > 0 && (
          <div className={`grid gap-2 mb-3 ${activity.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {activity.photos.map(p => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.photo_url} alt=""
                className="w-full max-h-96 object-cover rounded-xl bg-[var(--c-bg)]" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[var(--c-text5)]">Confidence</span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: confidenceColor(activity.confidence) }}
          >
            {activity.confidence}/10
          </span>
        </div>
      </div>

      {/* Reactions + comment composer */}
      <div className="px-4 py-3 border-t border-[var(--c-border)] space-y-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLike}
            disabled={busyLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition ${
              liked ? 'text-[#dc2626]' : 'text-[var(--c-text3)] hover:text-[var(--c-text)]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          <span className="text-xs text-[var(--c-text4)]">
            {activity.comments.length === 0 ? '' : `${activity.comments.length} comment${activity.comments.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {activity.comments.length > 0 && (
          <div className="space-y-2">
            {activity.comments.map(c => {
              const isMine = c.author_id === currentUserId
              return (
                <div key={c.id} className="flex items-start gap-2 group">
                  <div className="flex-1 min-w-0 bg-[var(--c-bg)] rounded-lg px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <p className="text-[11px] font-semibold text-[var(--c-text)]">
                        {c.author_name ?? (isMine ? 'You' : 'Coach')}
                        {c.author_role && c.author_role !== 'member' && (
                          <span className="ml-1.5 text-[9px] uppercase tracking-widest text-[var(--c-accent-text)] font-mono">Coach</span>
                        )}
                      </p>
                      <span className="text-[10px] text-[var(--c-text5)] font-mono">{relTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[var(--c-text2)] leading-relaxed whitespace-pre-wrap">{c.body}</p>
                  </div>
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      aria-label="Delete comment"
                      className="opacity-0 group-hover:opacity-100 text-[var(--c-text5)] hover:text-[#dc2626] transition pt-2 shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <form onSubmit={handleComment} className="flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/50 transition"
          />
          <button
            type="submit"
            disabled={posting || !commentText.trim()}
            className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition disabled:opacity-30 px-2"
          >
            {posting ? '…' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
