'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type Attachment = { id: string; storage_path: string; kind: string }
type Message = {
  id: string
  author_id: string
  body: string
  created_at: string
  message_attachments: Attachment[]
}

type ThreadParticipant = {
  user_id: string
  first_name: string | null
  email: string
  role: string
  avatar_url: string | null
  avatar_color: string | null
}

type Thread = {
  id: string
  member_id: string | null
  thread_type: 'dm' | 'group_member' | 'coaches_group' | 'custom'
  title: string | null
  is_group: boolean
  last_message_at: string | null
  participants: ThreadParticipant[]
}

type UserProfile = {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
}

type Props = {
  userId: string
  threads: Thread[]
  userProfile: UserProfile
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

function shouldShowTimestamp(prev: Message | undefined, curr: Message) {
  if (!prev) return true
  return new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000
}

function threadDisplayName(thread: Thread, myId: string): string {
  if (thread.thread_type === 'coaches_group') return 'Team Chat'
  if (thread.thread_type === 'group_member') {
    const coaches = thread.participants.filter(p => p.role === 'coach' || p.role === 'head_coach')
    if (coaches.length === 0) return 'Group Chat'
    return coaches.map(c => c.first_name ?? c.email.split('@')[0]).join(' & ') + ' · Group'
  }
  if (thread.thread_type === 'dm') {
    const other = thread.participants.find(p => p.user_id !== myId)
    const name = other?.first_name ?? other?.email.split('@')[0] ?? 'Coach'
    const role = other?.role === 'head_coach' ? 'Head Coach' : 'Coach'
    return `${name} (${role})`
  }
  return thread.title ?? 'Chat'
}

function threadSubLabel(thread: Thread, myId: string): string {
  if (thread.thread_type === 'group_member') return 'Group · Head Coach + Coach'
  if (thread.thread_type === 'dm') {
    const other = thread.participants.find(p => p.user_id !== myId)
    return other?.role === 'head_coach' ? 'Direct with Head Coach' : 'Direct with Coach'
  }
  return ''
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ p, size = 'sm' }: { p: ThreadParticipant | null; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-10 h-10 text-sm'
  const color = p?.avatar_color ?? '#b0e455'
  const initial = (p?.first_name ?? p?.email ?? '?').charAt(0).toUpperCase()
  if (p?.avatar_url) return <img src={p.avatar_url} alt="" className={`${sz} rounded-full object-cover shrink-0`} style={{ border: `1.5px solid ${color}` }} />
  return <div className={`${sz} rounded-full flex items-center justify-center font-bold shrink-0`} style={{ background: color + '22', border: `1.5px solid ${color}`, color }}>{initial}</div>
}

function GroupIcon({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10'
  return (
    <div className={`${sz} rounded-full bg-[#b0e455]/15 border border-[#b0e455]/40 flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-4 h-4">
        <circle cx="9" cy="7" r="3" /><path d="M3 21v-1.5a4.5 4.5 0 014.5-4.5h3A4.5 4.5 0 0115 19.5V21" strokeLinecap="round" />
        <path d="M16 3.13a3 3 0 010 5.75M21 21v-1a3.5 3.5 0 00-3-3.47" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── No-thread state ──────────────────────────────────────────────────────────

function NoThread() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="px-5 pt-12 pb-4 lg:pt-8 lg:border-b lg:border-[var(--c-border)]">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-xs text-[var(--c-text4)] mt-0.5">Your direct line to your coach</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 space-y-4">
        <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4 text-center">
          <p className="text-xs text-[var(--c-accent-text)] font-medium mb-1">No messages yet</p>
          <p className="text-xs text-[var(--c-text3)]">Your coach will open your thread once you're fully onboarded.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MessagesClient({ userId, threads, userProfile }: Props) {
  const supabase = createClient()
  const [allThreads] = useState<Thread[]>(threads)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    threads.length === 1 ? threads[0].id : null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMsgByThread, setLastMsgByThread] = useState<Record<string, { body: string; created_at: string; author_id: string }>>({})
  const [readMap, setReadMap] = useState<Record<string, string>>({})
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (allThreads.length === 0) return <NoThread />

  const selectedThread = allThreads.find(t => t.id === selectedThreadId) ?? null
  const participantMap = Object.fromEntries((selectedThread?.participants ?? []).map(p => [p.user_id, p]))

  function scrollToBottom(smooth = false) {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  // Load messages when thread selected
  useEffect(() => {
    if (!selectedThreadId) return
    setLoadingMessages(true)
    setMessages([])
    fetch(`/api/get-thread-messages?thread_id=${selectedThreadId}`)
      .then(r => r.json())
      .then(json => {
        if (json.messages) {
          setMessages(json.messages)
          const latest = json.messages[json.messages.length - 1]
          if (latest) {
            setLastMsgByThread(prev => ({ ...prev, [selectedThreadId]: { body: latest.body, created_at: latest.created_at, author_id: latest.author_id } }))
          }
        }
      })
      .catch(() => {})
      .finally(() => { setLoadingMessages(false); setTimeout(() => scrollToBottom(), 50) })

    supabase.from('message_reads').upsert({
      thread_id: selectedThreadId, user_id: userId, last_read_at: new Date().toISOString(),
    }).then(() => setReadMap(prev => ({ ...prev, [selectedThreadId!]: new Date().toISOString() })))
  }, [selectedThreadId]) // eslint-disable-line

  // Realtime
  useEffect(() => {
    if (!selectedThreadId) return
    const channel = supabase
      .channel(`member-thread-${selectedThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${selectedThreadId}` },
        payload => {
          const msg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, message_attachments: [] }])
          setLastMsgByThread(prev => ({ ...prev, [selectedThreadId!]: { body: msg.body, created_at: msg.created_at, author_id: msg.author_id } }))
          setTimeout(() => scrollToBottom(true), 50)
          supabase.from('message_reads').upsert({ thread_id: selectedThreadId, user_id: userId, last_read_at: new Date().toISOString() })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedThreadId]) // eslint-disable-line

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  async function sendMessage() {
    if (sending || !body.trim() || !selectedThreadId) return
    setSending(true)
    setSendError(null)
    const text = body.trim()
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: selectedThreadId, body: text }),
      })
      const json = await res.json()
      if (!res.ok || !json.msg) {
        setSendError(json.error ?? 'Failed to send message.')
      } else {
        setBody('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setMessages(prev => prev.some(m => m.id === json.msg.id) ? prev : [...prev, { ...json.msg, message_attachments: [] }])
        setLastMsgByThread(prev => ({ ...prev, [selectedThreadId]: { body: text, created_at: json.msg.created_at, author_id: userId } }))
        setTimeout(() => scrollToBottom(true), 50)
      }
    } catch {
      setSendError('Network error — check your connection.')
    }
    setSending(false)
  }

  function isUnread(t: Thread) {
    const last = lastMsgByThread[t.id]
    if (!last || last.author_id === userId) return false
    const read = readMap[t.id]
    return !read || new Date(last.created_at) > new Date(read)
  }

  const sortedThreads = [...allThreads].sort((a, b) => {
    const ta = lastMsgByThread[a.id]?.created_at ?? a.last_message_at ?? ''
    const tb = lastMsgByThread[b.id]?.created_at ?? b.last_message_at ?? ''
    return tb.localeCompare(ta)
  })

  // ── Thread list (shown when no thread selected or multiple threads exist) ────
  const showList = !selectedThreadId || allThreads.length > 1

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      {/* Header */}
      <div className="relative px-5 pt-12 pb-4 border-b border-[var(--c-border)] lg:px-8 lg:pt-8 lg:pb-4">
        {selectedThreadId && allThreads.length > 1 && (
          <button
            onClick={() => setSelectedThreadId(null)}
            className="lg:hidden flex items-center gap-1.5 text-xs text-[var(--c-text4)] mb-2 hover:text-[var(--c-text)] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All chats
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {selectedThreadId && selectedThread ? threadDisplayName(selectedThread, userId) : 'Messages'}
        </h1>
        <p className="text-xs text-[var(--c-text4)] mt-0.5">
          {selectedThreadId && selectedThread ? threadSubLabel(selectedThread, userId) : 'Your direct line to your coach'}
        </p>
      </div>

      {/* Desktop: sidebar list + chat */}
      <div className="flex flex-1 overflow-hidden">

        {/* Thread list — desktop always visible sidebar, mobile only when no thread selected */}
        {(showList || !selectedThreadId) && (
          <div className={`${selectedThreadId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-72 lg:border-r lg:border-[var(--c-border)] overflow-y-auto`}>
            <div className="px-4 py-3 space-y-2 pb-28 lg:pb-4">
              {sortedThreads.map(t => {
                const lead = t.thread_type === 'dm'
                  ? t.participants.find(p => p.user_id !== userId) ?? null
                  : null
                const isGroup = t.is_group || t.thread_type === 'group_member'
                const last = lastMsgByThread[t.id]
                const unread = isUnread(t)
                const active = t.id === selectedThreadId
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition text-left ${
                      active
                        ? 'bg-[#b0e455]/10 border-[#b0e455]/30'
                        : 'bg-[var(--c-card)] border-[var(--c-border)] hover:border-[var(--c-border2)] hover:bg-[var(--c-hover)]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {isGroup ? <GroupIcon size="sm" /> : <Avatar p={lead} size="sm" />}
                      {unread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f87171] rounded-full border border-[var(--c-bg)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${unread ? 'font-semibold' : 'font-medium text-[var(--c-text2)]'}`}>
                        {threadDisplayName(t, userId)}
                      </p>
                      {last && (
                        <p className="text-[11px] truncate text-[var(--c-text4)] mt-0.5">{last.body || '📎 Attachment'}</p>
                      )}
                    </div>
                    {last && (
                      <p className="text-[10px] text-[var(--c-text4)] shrink-0" suppressHydrationWarning>{relTime(last.created_at)}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Chat area — desktop always, mobile only when thread selected */}
        {selectedThreadId && (
          <div className={`flex-1 flex flex-col overflow-hidden ${!selectedThreadId ? 'hidden' : ''}`}>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 lg:px-6 pb-36 lg:pb-24">
              {loadingMessages && (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
                </div>
              )}
              {!loadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-[var(--c-text4)]">No messages yet.</p>
                  <p className="text-xs text-[var(--c-text5)] mt-1">Send the first one below.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.author_id === userId
                const prev = messages[i - 1]
                const next = messages[i + 1]
                const showTs = shouldShowTimestamp(prev, msg)
                const prevSame = prev && prev.author_id === msg.author_id && !shouldShowTimestamp(prev, msg)
                const nextSame = next && next.author_id === msg.author_id && !shouldShowTimestamp(msg, next)
                const showName = !prevSame
                const showAvatar = !nextSame

                const authorP: ThreadParticipant | null = isMine
                  ? { user_id: userId, first_name: userProfile.firstName, email: '', role: 'member', avatar_url: userProfile.avatarUrl, avatar_color: userProfile.avatarColor }
                  : (participantMap[msg.author_id] ?? null)

                return (
                  <div key={msg.id}>
                    {showTs && (
                      <p className="text-center text-xs text-[var(--c-text4)] py-3">{formatTime(msg.created_at)}</p>
                    )}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {!isMine && (showAvatar ? <Avatar p={authorP} /> : <div className="w-7 shrink-0" />)}
                      <div className={`max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {showName && authorP?.first_name && (
                          <p className={`text-xs text-[var(--c-text4)] mb-1 font-medium px-1 ${isMine ? 'text-right' : ''}`}>
                            {authorP.first_name}
                          </p>
                        )}
                        {msg.body && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm font-medium'
                              : 'bg-[var(--c-card)] text-[var(--c-text)] rounded-bl-sm border border-[var(--c-border)]'
                          }`}>
                            {msg.body}
                          </div>
                        )}
                        {msg.message_attachments.map(att =>
                          att.kind === 'image'
                            ? <AttachmentImage key={att.id} path={att.storage_path} />
                            : null
                        )}
                      </div>
                      {isMine && (showAvatar ? <Avatar p={authorP} /> : <div className="w-7 shrink-0" />)}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-52 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] px-4 py-3 z-40">
              {sendError && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{sendError}</p>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={handleBodyChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message…"
                  rows={1}
                  className="flex-1 bg-[var(--c-card2)] border border-[var(--c-border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text4)] resize-none focus:outline-none focus:border-[#b0e455]/35 transition max-h-32 overflow-y-auto leading-relaxed"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !body.trim()}
                  className="shrink-0 w-9 h-9 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition disabled:opacity-30 mb-0.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 translate-x-px">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop placeholder when no thread selected and multiple exist */}
        {!selectedThreadId && allThreads.length > 1 && (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center">
            <div>
              <p className="text-sm text-[var(--c-text4)]">Select a conversation</p>
              <p className="text-xs text-[var(--c-text5)] mt-1">Choose one from the left to start chatting.</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function AttachmentImage({ path }: { path: string }) {
  const supabase = createClient()
  const { data } = supabase.storage.from('message-attachments').getPublicUrl(path)
  return <img src={data.publicUrl} alt="" className="max-w-[200px] rounded-xl object-cover bg-white/5 mt-1" />
}
