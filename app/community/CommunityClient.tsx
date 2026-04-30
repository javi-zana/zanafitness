'use client'

import { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type Author = { first_name: string | null; role: string } | null
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
  userRole: string
  initialTab: SubTab
  initialPosts: Post[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayName(author: Author) {
  if (!author) return 'Member'
  if (author.role === 'head_coach') return 'Javi'
  if (author.role === 'coach') return 'Coach'
  return author.first_name ?? 'Member'
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
  onReact: (postId: string, reacted: boolean) => void
  onComment: (postId: string, body: string) => void
  onHide: (postId: string) => void
  onEdit: (postId: string, title: string, bodyJson: object | null) => Promise<void>
  onDelete: (postId: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
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
      <div className="bg-[#1c2e16] rounded-2xl overflow-hidden border border-[#b0e455]/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#b0e455]/70 uppercase tracking-wide">Editing post</p>
          <button onClick={() => setEditing(false)} className="text-xs text-[#edf5e2]/30 hover:text-[#edf5e2]/60 transition">Cancel</button>
        </div>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full bg-[#0f1a0c] border border-[#b0e455]/12 rounded-2xl px-4 py-3 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/35 transition"
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
    <div className="bg-[#1c2e16] rounded-2xl overflow-hidden border border-[#b0e455]/8">
      <button
        className="w-full text-left px-4 pt-4 pb-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#b0e455]/12 border border-[#b0e455]/20 flex items-center justify-center text-[9px] font-bold text-[#b0e455] shrink-0">
              {displayName(post.author).charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-[#edf5e2]/50">{displayName(post.author)}</span>
          </div>
          <span className="text-xs text-[#edf5e2]/25 shrink-0">{relativeTime(post.created_at)}</span>
        </div>
        <h3 className="text-sm font-semibold text-[#edf5e2] leading-snug text-left">{post.title}</h3>
      </button>

      {expanded && hasContent(post.body_json) && (
        <div className="px-4 pb-3 border-t border-[#b0e455]/5 pt-3">
          <RichTextViewer content={post.body_json} />
        </div>
      )}

      <div className="px-4 pb-3 flex items-center gap-4 border-t border-[#b0e455]/5 pt-2.5">
        <button
          onClick={() => onReact(post.id, hasReacted)}
          className="flex items-center gap-1.5 transition group"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition ${hasReacted ? 'fill-red-400 stroke-red-400' : 'fill-none stroke-[#edf5e2]/25 group-hover:stroke-red-400'}`}
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`text-xs ${hasReacted ? 'text-red-400' : 'text-[#edf5e2]/25'}`}>
            {reactionCount > 0 ? reactionCount : ''}
          </span>
        </button>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-[#edf5e2]/25 hover:text-[#edf5e2]/60 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">{visibleComments.length > 0 ? visibleComments.length : ''}</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => { setEditTitle(post.title); setEditBody(post.body_json); setEditing(true) }}
              className="text-xs text-[#edf5e2]/20 hover:text-[#b0e455]/70 transition"
            >
              Edit
            </button>
          )}
          {(userRole === 'head_coach' || isAuthor) && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-[#edf5e2]/20 hover:text-red-400/70 transition"
            >
              Delete
            </button>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#edf5e2]/30 hover:text-[#edf5e2]/60 transition">No</button>
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
              className="text-xs text-[#edf5e2]/20 hover:text-red-400/60 transition"
            >
              Hide
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#b0e455]/5 px-4 py-3 space-y-3">
          {visibleComments.length > 0 && (
            <div className="space-y-2.5">
              {visibleComments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#edf5e2]/5 border border-[#edf5e2]/10 flex items-center justify-center text-[8px] font-medium text-[#edf5e2]/40 shrink-0 mt-0.5">
                    {displayName(c.author).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[#edf5e2]/40">{displayName(c.author)}</span>
                      <span className="text-[10px] text-[#edf5e2]/20">{relativeTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[#edf5e2]/70 leading-relaxed mt-0.5">{c.body}</p>
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
              className="flex-1 bg-[#0f1a0c] border border-[#b0e455]/12 rounded-full px-3 py-1.5 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/35 transition"
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

// ─── New post form ────────────────────────────────────────────────────────────

function NewPostForm({
  subTab,
  userId,
  onPosted,
  onCancel,
}: {
  subTab: SubTab
  userId: string
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

    const { data: post, error: err } = await supabase
      .from('community_posts')
      .insert({
        author_id: userId,
        sub_tab: subTab,
        title: title.trim(),
        body_json: bodyJson ?? {},
      })
      .select(`
        id, author_id, sub_tab, title, body_json, created_at, hidden,
        author:profiles!author_id(first_name, role),
        reactions:community_post_reactions(user_id),
        comments:community_post_comments(id, author_id, body, created_at, hidden, author:profiles!author_id(first_name, role))
      `)
      .single()

    setLoading(false)
    if (err || !post) { setError('Failed to post. Try again.'); return }
    onPosted(post as unknown as Post)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1c2e16] rounded-2xl p-5 space-y-4 border border-[#b0e455]/8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#edf5e2]/50">New Post</h2>
        <span className="text-xs font-medium text-[#b0e455]/60 capitalize">{subTab}</span>
      </div>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full bg-[#0f1a0c] border border-[#b0e455]/12 rounded-2xl px-4 py-3 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/35 transition"
      />

      <RichTextEditor content={null} onChange={setBodyJson} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-[#edf5e2]/10 text-sm text-[#edf5e2]/40 hover:text-[#edf5e2] hover:border-[#edf5e2]/25 transition"
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

const POST_SELECT = `
  id, author_id, sub_tab, title, body_json, created_at, hidden,
  author:profiles!author_id(first_name, role),
  reactions:community_post_reactions(user_id),
  comments:community_post_comments(id, author_id, body, created_at, hidden, author:profiles!author_id(first_name, role))
`

export default function CommunityClient({ userId, userRole, initialTab, initialPosts }: Props) {
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
          const { data } = await supabase
            .from('community_posts')
            .select(POST_SELECT)
            .eq('id', payload.new.id)
            .single()
          if (!data) return
          setPostsByTab(prev => {
            const tab = activeTab
            if (prev[tab].some(p => p.id === data.id)) return prev
            return { ...prev, [tab]: [data as unknown as Post, ...prev[tab]] }
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
          const { data: comment } = await supabase
            .from('community_post_comments')
            .select('id, author_id, body, created_at, hidden, author:profiles!author_id(first_name, role)')
            .eq('id', payload.new.id)
            .single()
          if (!comment) return
          setPostsByTab(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(p => {
              if (p.id !== payload.new.post_id || p.comments.some(c => c.id === comment.id)) return p
              return { ...p, comments: [...p.comments, comment as unknown as Comment] }
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
    const { data } = await supabase
      .from('community_posts')
      .select(POST_SELECT)
      .eq('sub_tab', tab)
      .order('created_at', { ascending: false })
      .limit(20)
    setPostsByTab(prev => ({ ...prev, [tab]: (data ?? []) as unknown as Post[] }))
    setLoadingTab(false)
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleReact(postId: string, alreadyReacted: boolean) {
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
    if (alreadyReacted) {
      supabase.from('community_post_reactions').delete().eq('post_id', postId).eq('user_id', userId)
    } else {
      supabase.from('community_post_reactions').insert({ post_id: postId, user_id: userId })
    }
  }

  async function handleComment(postId: string, body: string) {
    const { data: comment } = await supabase
      .from('community_post_comments')
      .insert({ post_id: postId, author_id: userId, body })
      .select('id, author_id, body, created_at, hidden, author:profiles!author_id(first_name, role)')
      .single()
    if (!comment) return
    setPostsByTab(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(p => {
        if (p.id !== postId || p.comments.some(c => c.id === comment.id)) return p
        return { ...p, comments: [...p.comments, comment as unknown as Comment] }
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
    await supabase.from('community_posts').delete().eq('id', postId)
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
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pr-64">
      <div className="px-5 pt-12 pb-2 flex items-center justify-between lg:pt-8 lg:border-b lg:border-[#b0e455]/8">
        <div>
          <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
          <h1 className="text-xl font-bold tracking-tight">Community</h1>
        </div>
        {canPost && !composing && (
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-xs font-semibold hover:bg-[#c9f070] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Post
          </button>
        )}
      </div>

      <div className="overflow-x-auto border-b border-[#b0e455]/8">
        <div className="flex min-w-max px-5">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#b0e455] text-[#b0e455]'
                  : 'border-transparent text-[#edf5e2]/30 hover:text-[#edf5e2]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-3 lg:max-w-2xl lg:pb-10">
        {composing && (
          <NewPostForm
            subTab={activeTab}
            userId={userId}
            onPosted={handlePosted}
            onCancel={() => setComposing(false)}
          />
        )}

        {loadingTab && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#b0e455]/20 border-t-[#b0e455]/60 rounded-full animate-spin" />
          </div>
        )}

        {!loadingTab && posts.filter(p => !p.hidden || userRole === 'head_coach').length === 0 && !composing && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#b0e455]/8 border border-[#b0e455]/12 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#edf5e2]/25">
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-[#edf5e2]/25">Nothing here yet.</p>
            {canPost && (
              <button
                onClick={() => setComposing(true)}
                className="mt-3 text-sm text-[#b0e455]/60 hover:text-[#b0e455] transition font-medium"
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

      <BottomNav />
    </div>
  )
}
