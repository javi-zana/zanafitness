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
type ReadReceipt = { user_id: string; last_read_at: string }

type AuthorProfile = {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
}

type Props = {
  userId: string
  threadId: string | null
  initialMessages: Message[]
  otherReads: ReadReceipt[]
  authorProfiles: Record<string, AuthorProfile>
  userProfile: AuthorProfile
  isAdmin: boolean
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

function shouldShowTimestamp(prev: Message | undefined, curr: Message) {
  if (!prev) return true
  const diff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()
  return diff > 5 * 60 * 1000 // show timestamp if gap > 5 min
}

// ─── Attachment image ─────────────────────────────────────────────────────────

function AttachmentImage({ path }: { path: string }) {
  const supabase = createClient()
  const { data } = supabase.storage.from('message-attachments').getPublicUrl(path)
  return (
    <img
      src={data.publicUrl}
      alt=""
      className="max-w-[200px] rounded-xl object-cover bg-white/5 mt-1"
    />
  )
}

// ─── Author avatar ────────────────────────────────────────────────────────────

function AuthorAvatar({ profile }: { profile: AuthorProfile }) {
  const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : '?'
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.firstName ?? ''}
        className="w-7 h-7 rounded-full object-cover shrink-0"
        style={{ borderColor: profile.avatarColor, borderWidth: 1.5, borderStyle: 'solid' }}
      />
    )
  }
  return (
    <div
      className="w-7 h-7 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center shrink-0 text-[10px] font-semibold text-[var(--c-text3)]"
      style={{ borderColor: profile.avatarColor }}
    >
      {initial}
    </div>
  )
}

// ─── No-thread state ──────────────────────────────────────────────────────────

function NoThread() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="px-5 pt-12 pb-4 lg:pt-8 lg:border-b lg:border-[var(--c-border)]">
        <p className="text-xs text-[var(--c-text4)] tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 space-y-4">
        <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] p-5 space-y-4">
          <p className="text-xs font-semibold text-[#b0e455] uppercase tracking-wider">Direct line to your coach</p>
          {[
            { label: 'Ask anything', desc: 'Questions about your program, nutrition, a specific workout - nothing is too small.' },
            { label: 'Log between calls', desc: 'Share a win, flag something that felt off, or just check in. Your coach reads it all.' },
            { label: 'Fast responses', desc: 'Coaches check messages daily. You\'re not waiting days to hear back.' },
          ].map(item => (
            <div key={item.label} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455] mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-[var(--c-text3)] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4 text-center">
          <p className="text-xs text-[#b0e455] font-medium mb-1">Thread not active yet</p>
          <p className="text-xs text-[var(--c-text3)]">Your coach will open your direct message thread once you're fully onboarded.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MessagesClient({
  userId,
  threadId,
  initialMessages,
  otherReads,
  authorProfiles,
  isAdmin,
}: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [coachReadAt, setCoachReadAt] = useState<string | null>(
    otherReads[0]?.last_read_at ?? null
  )
  const [sendError, setSendError] = useState<string | null>(null)
  const [groupPanelOpen, setGroupPanelOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (!threadId) return <NoThread />

  // Scroll to bottom
  function scrollToBottom(smooth = false) {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { scrollToBottom() }, [])

  // Realtime: new messages + read receipts
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        payload => {
          const msg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, { ...msg, message_attachments: [] }]
          })
          setTimeout(() => scrollToBottom(true), 50)
          // Mark as read when new message arrives
          supabase.from('message_reads').upsert({
            thread_id: threadId,
            user_id: userId,
            last_read_at: new Date().toISOString(),
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reads', filter: `thread_id=eq.${threadId}` },
        payload => {
          const row = payload.new as ReadReceipt
          if (row.user_id !== userId) setCoachReadAt(row.last_read_at)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [threadId, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` }
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setAttachmentFiles(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function sendMessage() {
    if (sending || (!body.trim() && attachmentFiles.length === 0)) return
    setSending(true)
    setSendError(null)
    const text = body.trim()

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, body: text }),
      })
      const json = await res.json()
      if (!res.ok || !json.msg) {
        setSendError(json.error ?? 'Failed to send message.')
        setSending(false)
        return
      }

      const msg = json.msg
      setBody('')
      setPreviews([])
      if (textareaRef.current) textareaRef.current.style.height = 'auto'

      const savedAtts: Attachment[] = []
      for (const file of attachmentFiles) {
        const path = `${threadId}/${msg.id}/${Date.now()}-${file.name}`
        const { error: upErr } = await supabase.storage.from('message-attachments').upload(path, file)
        if (!upErr) {
          const kind = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other'
          const { data: att } = await supabase
            .from('message_attachments')
            .insert({ message_id: msg.id, storage_path: path, kind })
            .select('id, storage_path, kind')
            .single()
          if (att) savedAtts.push(att)
        }
      }

      setAttachmentFiles([])
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, { ...msg, message_attachments: savedAtts }]
      })
      setTimeout(() => scrollToBottom(true), 50)
    } catch {
      setSendError('Network error — check your connection.')
    }
    setSending(false)
  }

  // "Seen" — show under last message sent by current user if coach has read it
  const myMessages = messages.filter(m => m.author_id === userId)
  const lastMine = myMessages[myMessages.length - 1]
  const coachHasSeen = coachReadAt && lastMine
    ? new Date(coachReadAt) >= new Date(lastMine.created_at)
    : false

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">

      {/* Header */}
      <div className="relative px-5 pt-12 pb-4 border-b border-[var(--c-border)] lg:px-10 lg:pt-10 lg:pb-5">
        <p className="text-xs lg:text-sm text-[var(--c-text4)] tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight lg:text-3xl">Messages</h1>

        {/* Admin: group thread button */}
        {isAdmin && (
          <button
            onClick={() => setGroupPanelOpen(v => !v)}
            className="absolute right-5 top-12 lg:right-10 lg:top-10 w-8 h-8 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] flex items-center justify-center text-[var(--c-text4)] hover:text-[var(--c-text)] hover:border-[var(--c-border2)] transition"
            title="Group thread"
          >
            {/* Two-people icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" strokeLinecap="round" />
              <circle cx="12" cy="8" r="3" />
              <path d="M21 20c0-1.657-1.567-3-3.5-3" strokeLinecap="round" />
              <path d="M18.5 6a2.5 2.5 0 010 5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Admin: group panel dropdown */}
        {isAdmin && groupPanelOpen && (
          <div className="fixed right-4 top-20 z-50 w-64 bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl shadow-xl p-4 lg:right-10 lg:top-24">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[var(--c-text)] uppercase tracking-wider">Group Thread</p>
              <button
                onClick={() => setGroupPanelOpen(false)}
                className="w-5 h-5 flex items-center justify-center text-[var(--c-text4)] hover:text-[var(--c-text)] transition text-sm"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-amber-400 leading-relaxed">
              Run the group thread migration first.
            </p>
          </div>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 lg:px-10 lg:max-w-3xl lg:mx-auto w-full pb-36 lg:pb-24">
        {messages.length === 0 && (
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

          // Determine whether to show sender name + avatar for non-own messages
          const prevIsSameSender = prev && prev.author_id === msg.author_id && !shouldShowTimestamp(prev, msg)
          const nextIsSameSender = next && next.author_id === msg.author_id && !shouldShowTimestamp(msg, next)
          const showName = !isMine && !prevIsSameSender
          // Show avatar on the last message of a consecutive run (bottom of group)
          const showAvatar = !isMine && !nextIsSameSender

          const isLastMine = msg.id === lastMine?.id
          const profile = authorProfiles[msg.author_id]

          return (
            <div key={msg.id}>
              {showTs && (
                <p className="text-center text-xs text-[var(--c-text4)] py-3">
                  {formatTime(msg.created_at)}
                </p>
              )}

              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>

                {/* Left avatar slot for non-own messages */}
                {!isMine && (
                  showAvatar && profile
                    ? <AuthorAvatar profile={profile} />
                    : <div className="w-7 shrink-0" />
                )}

                {/* Bubble column */}
                <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender name (only on first message of a run) */}
                  {showName && profile?.firstName && (
                    <p className="text-xs text-[var(--c-text4)] mb-1 font-medium px-1">
                      {profile.firstName}
                    </p>
                  )}

                  {msg.body && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm font-medium'
                          : 'bg-[var(--c-card)] text-[var(--c-text)] rounded-bl-sm border border-[var(--c-border)]'
                      }`}
                    >
                      {msg.body}
                    </div>
                  )}

                  {msg.message_attachments.map(att => (
                    att.kind === 'image'
                      ? <AttachmentImage key={att.id} path={att.storage_path} />
                      : null
                  ))}

                  {isLastMine && coachHasSeen && (
                    <p className="text-xs text-[var(--c-text4)] mt-1 mr-1">Seen</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer — fixed above bottom nav on mobile, flush to bottom on desktop */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-52 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] px-4 py-3 z-40">
        {sendError && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{sendError}</p>
          </div>
        )}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {previews.map((src, i) => (
              <div key={i} className="relative shrink-0">
                <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover bg-white/5" />
                <button
                  onClick={() => {
                    setAttachmentFiles(f => f.filter((_, j) => j !== i))
                    setPreviews(p => p.filter((_, j) => j !== i))
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-full text-[var(--c-text3)] flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 w-9 h-9 rounded-full border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text4)] hover:text-[var(--c-text)]/60 hover:border-[var(--c-border2)] transition mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFilesChange} />

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
            disabled={sending || (!body.trim() && attachmentFiles.length === 0)}
            className="shrink-0 w-9 h-9 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition disabled:opacity-30 mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 translate-x-px">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
