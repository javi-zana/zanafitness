'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type Author = { first_name: string | null; role: string; avatar_url?: string | null; avatar_color?: string | null } | null
type Comment = {
  id: string
  author_id: string
  body: string
  created_at: string
  hidden: boolean
  author: Author
}
export type Post = {
  id: string
  author_id: string
  sub_tab: string
  title: string
  body_json: object
  created_at: string
  hidden: boolean
  author: Author
  reactions: { user_id: string }[]
  comments: Comment[]
}

type SubTab = 'announcements' | 'wins' | 'random'

type Props = {
  userId: string
  userEmail: string
  userRole: string
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  initialTab: SubTab
  initialPosts: Post[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayName(author: Author) {
  if (!author) return 'Member'
  if (author.first_name) return author.first_name
  if (author.role === 'head_coach' || author.role === 'coach') return 'Coach'
  return 'Member'
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function hasContent(json: object | null | undefined) {
  if (!json) return false
  const j = json as { content?: unknown[] }
  return Object.keys(json).length > 0 && (j.content?.length ?? 0) > 0
}

// ─── Avatar bubble ────────────────────────────────────────────────────────────

function AvatarBubble({ author, xs = false }: { author: Author; xs?: boolean }) {
  const name = displayName(author)
  const initial = name.charAt(0).toUpperCase()
  const color = author?.avatar_color ?? '#b0e455'
  const cls = xs ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[9px]'
  if (author?.avatar_url) {
    return <img src={author.avatar_url} alt={name} className={`${cls} rounded-full object-cover shrink-0`} style={{ border: `1.5px solid ${color}50` }} />
  }
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: color + '20', border: `1px solid ${color}40`, color }}>
      {initial}
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  userId,
  userRole,
  onReact,
  onComment,
  onHide,
  onEdit,
  onDelete,
}: {
  post: Post
  userId: string
  userRole: string
  onReact: (postId: string, reacted: boolean) => void | Promise<void>
  onComment: (postId: string, body: string) => void
  onHide: (postId: string) => void
  onEdit: (postId: string, title: string, bodyJson: object | null) => Promise<void>
  onDelete: (postId: string) => Promise<void>
}) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editBody, setEditBody] = useState<object | null>(post.body_json)
  const [editSaving, setEditSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isAuthor = post.author_id === userId
  const canEdit = isAuthor || userRole === 'head_coach'
  const hasReacted = post.reactions.some(r => r.user_id === userId)
  const reactionCount = post.reactions.length
  const visibleComments = post.comments.filter(c => !c.hidden || userRole === 'head_coach')

  async function submitComment(e: FormEvent) {
    e.preventDefault()
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    const text = comment.trim()
    setComment('')
    onComment(post.id, text)
    setSubmitting(false)
  }

  async function saveEdit() {
    if (!editTitle.trim()) return
    setEditSaving(true)
    await onEdit(post.id, editTitle.trim(), editBody)
    setEditSaving(false)
    setEditing(false)
  }

  async function doDelete() {
    setDeleting(true)
    await onDelete(post.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  // Edit mode
  if (editing) {
    return (
      <div className="bg-[var(--c-card2)] rounded-2xl overflow-hidden border border-[var(--c-border2)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--c-accent-text)]/70 uppercase tracking-wide">Editing post</p>
          <button onClick={() => setEditing(false)} className="text-xs text-[var(--c-text4)] hover:text-[var(--c-text)]/60 transition">Cancel</button>
        </div>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/35 transition"
        />
        <RichTextEditor content={editBody} onChange={setEditBody} />
        <button
          onClick={saveEdit}
          disabled={editSaving || !editTitle.trim()}
          className="w-full py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
        >
          {editSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[var(--c-card)] shadow-sm rounded-2xl overflow-hidden border border-[var(--c-border)]">
      {/* Header: avatar + name + time */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <AvatarBubble author={post.author} />
            <span className="text-xs text-[var(--c-text3)]">{displayName(post.author)}</span>
          </div>
          <span className="text-xs text-[var(--c-text4)] shrink-0" suppressHydrationWarning>{relativeTime(post.created_at)}</span>
        </div>
        <h3 className="text-sm font-semibold text-[var(--c-text)] leading-snug">{post.title}</h3>
      </div>

      {/* Body — always visible */}
      {hasContent(post.body_json) && (
        <div className="px-4 pb-3 border-t border-[#b0e455]/5 pt-3">
          <RichTextViewer content={post.body_json} />
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 pb-3 flex items-center gap-4 border-t border-[#b0e455]/5 pt-2.5">
        <button
          onClick={() => onReact(post.id, hasReacted)}
          className="flex items-center gap-1.5 transition group"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition ${hasReacted ? 'fill-red-400 stroke-red-400' : 'fill-none stroke-[var(--c-text4)] group-hover:stroke-red-400'}`}
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`text-xs ${hasReacted ? 'text-red-400' : 'text-[var(--c-text4)]'}`}>
            {reactionCount > 0 ? reactionCount : ''}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(o => !o)}
          className={`flex items-center gap-1.5 transition ${commentsOpen ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)] hover:text-[var(--c-text)]/60'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">{visibleComments.length > 0 ? visibleComments.length : 'Comment'}</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => { setEditTitle(post.title); setEditBody(post.body_json); setEditing(true) }}
              className="text-xs text-[var(--c-text4)] hover:text-[var(--c-accent-text)]/70 transition"
            >
              Edit
            </button>
          )}
          {(userRole === 'head_coach' || isAuthor) && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-[var(--c-text4)] hover:text-red-400/70 transition"
            >
              Delete
            </button>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[var(--c-text4)] hover:text-[var(--c-text)]/60 transition">No</button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="text-xs text-red-400/80 hover:text-red-400 transition"
              >
                {deleting ? '…' : 'Confirm delete'}
              </button>
            </div>
          )}
          {userRole === 'head_coach' && !post.hidden && !canEdit && (
            <button
              onClick={() => onHide(post.id)}
              className="text-xs text-[var(--c-text4)] hover:text-red-400/60 transition"
            >
              Hide
            </button>
          )}
        </div>
      </div>

      {/* Comments section — toggled by comment button */}
      {commentsOpen && (
        <div className="border-t border-[#b0e455]/5 px-4 py-3 space-y-3">
          {visibleComments.length > 0 && (
            <div className="space-y-2.5">
              {visibleComments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <AvatarBubble author={c.author} xs />
                  <div className="flex-1 min-w-0 mt-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-[var(--c-text3)]">{displayName(c.author)}</span>
                      <span className="text-[10px] text-[var(--c-text4)]" suppressHydrationWarning>{relativeTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[var(--c-text2)] leading-relaxed mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-full px-3 py-1.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/35 transition"
            />
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="w-7 h-7 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition disabled:opacity-30 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 translate-x-px">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Coach nav for community page ─────────────────────────────────────────────

function CoachCommunityNav({ firstName, avatarColor, avatarUrl, userRole, userEmail }: {
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  userRole: string
  userEmail: string
}) {
  const initials = (firstName ?? 'C').slice(0, 1).toUpperCase()
  const showAdmin = userRole === 'head_coach' && userEmail === 'me@javilorenzana.com'
  const adminIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  const applicationsIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h3M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg>

  const coachLinks = [
    { href: '/coach', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { href: '/coach', label: 'Members', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { href: '/coach', label: 'Programs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { href: '/coach', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { href: '/community', label: 'Community', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ]

  return (
    <>
      {/* Desktop sidebar — identical layout to coach portal */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-52 flex-col bg-[var(--c-sidebar)] border-r border-[var(--c-border)] z-50">
        <div className="px-5 pt-6 pb-5 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#b0e455] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                <path d="M0,2 H32 L18.3,14" /><path d="M13.7,18 L0,30 H32" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--c-text)] font-bold text-base tracking-tight leading-none">Zana</p>
              <p className="text-[9px] text-[var(--c-text4)] tracking-widest uppercase leading-none mt-1">Coach Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {coachLinks.map(item => {
            const active = item.label === 'Community'
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active ? 'bg-[#b0e455] text-[#0b1509]' : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
                }`}
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            )
          })}
          {showAdmin && (
            <Link
              href="/coach"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]"
            >
              {applicationsIcon}
              <span className="text-sm font-semibold">Applications</span>
            </Link>
          )}
          {userRole === 'head_coach' && (
            <Link
              href="/coach"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]"
            >
              {adminIcon}
              <span className="text-sm font-semibold">Admin</span>
            </Link>
          )}
        </nav>
        <div className="px-3 py-4 border-t border-[var(--c-border)] space-y-0.5">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-all">
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
              style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
            >
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <span className="text-sm font-semibold">Profile</span>
          </Link>
          <p className="text-[9px] text-[var(--c-text5)] uppercase tracking-widest px-3 pt-2">© 2026 Zana</p>
        </div>
      </aside>

      {/* Mobile bottom bar — full coach tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] flex overflow-x-auto z-50 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {coachLinks.map(item => {
          const active = item.label === 'Community'
          return (
            <Link
              key={item.label}
              href={item.href}
              className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
                active ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[9px] uppercase font-medium ${
                active ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
        {showAdmin && (
          <Link href="/coach" className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors">
            <div className="w-10 h-7 flex items-center justify-center rounded-full text-[var(--c-text4)]">{applicationsIcon}</div>
            <span className="text-[9px] uppercase font-medium text-[var(--c-text4)]">Apps</span>
          </Link>
        )}
        {userRole === 'head_coach' && (
          <Link href="/coach" className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors">
            <div className="w-10 h-7 flex items-center justify-center rounded-full text-[var(--c-text4)]">{adminIcon}</div>
            <span className="text-[9px] uppercase font-medium text-[var(--c-text4)]">Admin</span>
          </Link>
        )}
      </nav>
    </>
  )
}

// ─── New post form ────────────────────────────────────────────────────────────

function NewPostForm({
  subTab,
  userId,
  firstName,
  userRole,
  avatarUrl,
  avatarColor,
  onPosted,
  onCancel,
}: {
  subTab: SubTab
  userId: string
  firstName: string | null
  userRole: string
  avatarUrl: string | null
  avatarColor: string
  onPosted: (post: Post) => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [bodyJson, setBodyJson] = useState<object | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    setError('')
    setLoading(true)

    const { data: inserted, error: err } = await supabase
      .from('community_posts')
      .insert({
        author_id: userId,
        sub_tab: subTab,
        title: title.trim(),
        body_json: bodyJson ?? {},
      })
      .select('id, author_id, sub_tab, title, body_json, created_at, hidden')
      .single()

    setLoading(false)
    if (err || !inserted) { setError('Failed to post. Try again.'); return }
    const post: Post = {
      ...inserted,
      author: { first_name: firstName, role: userRole, avatar_url: avatarUrl, avatar_color: avatarColor },
      reactions: [],
      comments: [],
    }
    onPosted(post)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--c-card)] shadow-sm rounded-2xl p-5 space-y-4 border border-[var(--c-border)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--c-text3)]">New Post</h2>
        <span className="text-xs font-medium text-[var(--c-accent-text)]/60 capitalize">{subTab}</span>
      </div>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/35 transition"
      />

      <RichTextEditor content={null} onChange={setBodyJson} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
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
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'wins', label: 'Wins' },
  { id: 'random', label: 'Random' },
]

export default function CommunityClient({ userId, userEmail, userRole, firstName, avatarColor, avatarUrl, initialTab, initialPosts }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<SubTab>(initialTab)
  const [postsByTab, setPostsByTab] = useState<Record<SubTab, Post[]>>({
    announcements: initialTab === 'announcements' ? (initialPosts as Post[]) : [],
    wins: initialTab === 'wins' ? (initialPosts as Post[]) : [],
    random: initialTab === 'random' ? (initialPosts as Post[]) : [],
  })
  const [loadingTab, setLoadingTab] = useState(false)
  const [composing, setComposing] = useState(false)

  const posts = postsByTab[activeTab]

  const canPost =
    userRole === 'head_coach' ||
    (activeTab !== 'announcements' && (userRole === 'member' || userRole === 'coach'))

  // ─── Realtime ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel(`community-${activeTab}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `sub_tab=eq.${activeTab}` },
        async payload => {
          const res = await fetch(`/api/get-community-posts?post_id=${payload.new.id}`)
          const json = await res.json()
          const data = json.post
          if (!data) return
          setPostsByTab(prev => {
            const tab = activeTab
            if (prev[tab].some(p => p.id === data.id)) return prev
            return { ...prev, [tab]: [data as Post, ...prev[tab]] }
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_post_reactions' },
        payload => {
          const { post_id, user_id } = payload.new as { post_id: string; user_id: string }
          setPostsByTab(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(p => {
              if (p.id !== post_id || p.reactions.some(r => r.user_id === user_id)) return p
              return { ...p, reactions: [...p.reactions, { user_id }] }
            }),
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_post_reactions' },
        payload => {
          const { post_id, user_id } = payload.old as { post_id: string; user_id: string }
          setPostsByTab(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(p => {
              if (p.id !== post_id) return p
              return { ...p, reactions: p.reactions.filter(r => r.user_id !== user_id) }
            }),
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_post_comments' },
        async payload => {
          const res = await fetch(`/api/get-community-comment?comment_id=${payload.new.id}`)
          const json = await res.json()
          const comment = json.comment
          if (!comment) return
          setPostsByTab(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(p => {
              if (p.id !== payload.new.post_id || p.comments.some(c => c.id === comment.id)) return p
              return { ...p, comments: [...p.comments, comment as Comment] }
            }),
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Tab switching ──────────────────────────────────────────────────────────

  async function switchTab(tab: SubTab) {
    setActiveTab(tab)
    setComposing(false)
    if (postsByTab[tab].length > 0) return
    setLoadingTab(true)
    const res = await fetch(`/api/get-community-posts?tab=${tab}`)
    const json = await res.json()
    setPostsByTab(prev => ({ ...prev, [tab]: (json.posts ?? []) as Post[] }))
    setLoadingTab(false)
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleReact(postId: string, alreadyReacted: boolean) {
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(p => {
        if (p.id !== postId) return p
        const reactions = alreadyReacted
          ? p.reactions.filter(r => r.user_id !== userId)
          : [...p.reactions, { user_id: userId }]
        return { ...p, reactions }
      }),
    }))
    try {
      const { error } = alreadyReacted
        ? await supabase.from('community_post_reactions').delete().eq('post_id', postId).eq('user_id', userId)
        : await supabase.from('community_post_reactions').insert({ post_id: postId, user_id: userId })
      if (error) throw error
    } catch (err) {
      console.error('react error:', err)
      setPostsByTab(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(p => {
          if (p.id !== postId) return p
          const reactions = alreadyReacted
            ? [...p.reactions, { user_id: userId }]
            : p.reactions.filter(r => r.user_id !== userId)
          return { ...p, reactions }
        }),
      }))
    }
  }

  async function handleComment(postId: string, body: string) {
    const { data: inserted } = await supabase
      .from('community_post_comments')
      .insert({ post_id: postId, author_id: userId, body })
      .select('id, author_id, body, created_at, hidden')
      .single()
    if (!inserted) return
    const comment: Comment = {
      ...inserted,
      author: { first_name: firstName, role: userRole, avatar_url: avatarUrl, avatar_color: avatarColor },
    }
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(p => {
        if (p.id !== postId || p.comments.some(c => c.id === comment.id)) return p
        return { ...p, comments: [...p.comments, comment] }
      }),
    }))
  }

  async function handleHide(postId: string) {
    await supabase.from('community_posts').update({ hidden: true }).eq('id', postId)
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(p => p.id === postId ? { ...p, hidden: true } : p),
    }))
  }

  async function handleEdit(postId: string, title: string, bodyJson: object | null) {
    await supabase
      .from('community_posts')
      .update({ title, body_json: bodyJson ?? {} })
      .eq('id', postId)
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(p =>
        p.id === postId ? { ...p, title, body_json: bodyJson ?? {} } : p
      ),
    }))
  }

  async function handleDelete(postId: string) {
    const res = await fetch('/api/delete-community-post', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    if (!res.ok) return
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(p => p.id !== postId),
    }))
  }

  function handlePosted(post: Post) {
    setPostsByTab(prev => ({ ...prev, [activeTab]: [post, ...prev[activeTab]] }))
    setComposing(false)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">

      <div className="px-5 pt-12 pb-2 flex items-center justify-between lg:px-10 lg:pt-10 lg:pb-4 lg:border-b lg:border-[var(--c-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Community</h1>
          <p className="text-xs text-[var(--c-text4)] mt-0.5">Announcements & posts</p>
        </div>
        {canPost && !composing && (
          <button
            onClick={() => setComposing(true)}
            className="w-8 h-8 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition shrink-0 lg:w-auto lg:h-auto lg:rounded-xl lg:px-3 lg:py-2 lg:gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 lg:w-3 lg:h-3">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span className="hidden lg:inline text-xs font-semibold">Post</span>
          </button>
        )}
      </div>

      <div className="border-b border-[var(--c-border)]">
        <div className="flex gap-1 px-4 lg:px-10">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`relative flex-1 py-3 text-xs font-semibold text-center transition ${
                activeTab === tab.id
                  ? 'text-[var(--c-accent-text)]'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[var(--c-accent-text)] rounded-full translate-y-px" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-3 lg:px-10 lg:pb-10 lg:py-8">
        {composing && (
          <NewPostForm
            subTab={activeTab}
            userId={userId}
            firstName={firstName}
            userRole={userRole}
            avatarUrl={avatarUrl}
            avatarColor={avatarColor}
            onPosted={handlePosted}
            onCancel={() => setComposing(false)}
          />
        )}

        {loadingTab && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
          </div>
        )}

        {!loadingTab && posts.filter(p => !p.hidden || userRole === 'head_coach').length === 0 && !composing && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#b0e455]/8 border border-[var(--c-border)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--c-text4)]">
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-[var(--c-text4)]">Nothing here yet.</p>
            {canPost && (
              <button
                onClick={() => setComposing(true)}
                className="mt-3 text-sm text-[var(--c-accent-text)]/60 hover:text-[var(--c-accent-text)] transition font-medium"
              >
                Be the first to post
              </button>
            )}
          </div>
        )}

        {!loadingTab && posts
          .filter(p => !p.hidden || userRole === 'head_coach')
          .map(post => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              userRole={userRole}
              onReact={handleReact}
              onComment={handleComment}
              onHide={handleHide}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {userRole === 'coach' || userRole === 'head_coach'
        ? <CoachCommunityNav firstName={firstName} avatarColor={avatarColor} avatarUrl={avatarUrl} userRole={userRole} userEmail={userEmail} />
        : <BottomNav />
      }
    </div>
  )
}
