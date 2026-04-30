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

type Props = {
  userId: string
  threadId: string | null
  initialMessages: Message[]
  otherReads: ReadReceipt[]
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

// ─── No-thread state ──────────────────────────────────────────────────────────

function NoThread() {
  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pr-64">
      <div className="px-5 pt-12 pb-4 lg:pt-8 lg:border-b lg:border-[#b0e455]/8">
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 space-y-4">
        <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-5 space-y-4">
          <p className="text-xs font-semibold text-[#b0e455] uppercase tracking-wider">Direct line to your coach</p>
          {[
            { label: 'Ask anything', desc: 'Questions about your program, nutrition, a specific workout — nothing is too small.' },
            { label: 'Log between calls', desc: 'Share a win, flag something that felt off, or just check in. Your coach reads it all.' },
            { label: 'Fast responses', desc: 'Coaches check messages daily. You\'re not waiting days to hear back.' },
          ].map(item => (
            <div key={item.label} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455] mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-[#edf5e2]/40 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#b0e455]/6 border border-[#b0e455]/15 rounded-2xl p-4 text-center">
          <p className="text-xs text-[#b0e455] font-medium mb-1">Thread not active yet</p>
          <p className="text-xs text-[#edf5e2]/40">Your coach will open your direct message thread once you're fully onboarded.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MessagesClient({ userId, threadId, initialMessages, otherReads }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [coachReadAt, setCoachReadAt] = useState<string | null>(
    otherReads[0]?.last_read_at ?? null
  )
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

  // Realtime: new messages
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
    const text = body.trim()
    setBody('')
    setPreviews([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const { data: msg, error } = await supabase
      .from('messages')
      .insert({ thread_id: threadId, author_id: userId, body: text })
      .select('id, author_id, body, created_at')
      .single()

    if (error || !msg) { setSending(false); return }

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
    setSending(false)
    setTimeout(() => scrollToBottom(true), 50)
  }

  // "Seen" — show under last message sent by current user if coach has read it
  const myMessages = messages.filter(m => m.author_id === userId)
  const lastMine = myMessages[myMessages.length - 1]
  const coachHasSeen = coachReadAt && lastMine
    ? new Date(coachReadAt) >= new Date(lastMine.created_at)
    : false

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pr-64">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-[#b0e455]/8 lg:pt-8">
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-1" style={{ paddingBottom: '140px' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#edf5e2]/20">No messages yet.</p>
            <p className="text-xs text-[#edf5e2]/15 mt-1">Send the first one below.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.author_id === userId
          const prev = messages[i - 1]
          const showTs = shouldShowTimestamp(prev, msg)
          const isLastMine = msg.id === lastMine?.id

          return (
            <div key={msg.id}>
              {showTs && (
                <p className="text-center text-xs text-[#edf5e2]/25 py-3">
                  {formatTime(msg.created_at)}
                </p>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {msg.body && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm font-medium'
                          : 'bg-[#1c2e16] text-[#edf5e2]/85 rounded-bl-sm border border-[#b0e455]/8'
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
                    <p className="text-xs text-[#edf5e2]/30 mt-1 mr-1">Seen</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#0f1a0c]/95 backdrop-blur-md border-t border-[#b0e455]/8 px-4 py-3 z-40">
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
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#0f1a0c] border border-[#edf5e2]/15 rounded-full text-[#edf5e2]/60 flex items-center justify-center text-[10px]"
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
            className="shrink-0 w-9 h-9 rounded-full border border-[#edf5e2]/10 flex items-center justify-center text-[#edf5e2]/30 hover:text-[#edf5e2]/60 hover:border-[#edf5e2]/25 transition mb-0.5"
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
            className="flex-1 bg-[#1c2e16] border border-[#b0e455]/12 rounded-2xl px-4 py-2.5 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 resize-none focus:outline-none focus:border-[#b0e455]/35 transition max-h-32 overflow-y-auto leading-relaxed"
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
