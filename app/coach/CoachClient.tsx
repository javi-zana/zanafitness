'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })
const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = { id: string; first_name: string | null; email: string; role: string; weight_unit: string | null }
type Stat = { id: string; member_id: string; weight_kg: number | null; confidence: number | null; created_at: string }
type Thread = { id: string; member_id: string }
type MsgPreview = { thread_id: string; body: string; created_at: string; author_id: string }
type ReadReceipt = { thread_id: string; last_read_at: string }
type ChatMessage = { id: string; author_id: string; body: string; created_at: string; message_attachments: { id: string; storage_path: string; kind: string }[] }
type CoachTab = 'members' | 'programs' | 'messages' | 'admin'
type Section = 'split' | 'food' | 'habits'

type Props = {
  userId: string
  userEmail: string
  userRole: string
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function memberName(m: Member) { return m.first_name ?? m.email.split('@')[0] }

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

function confidenceColor(v: number) {
  if (v <= 3) return '#f87171'
  if (v <= 5) return '#fbbf24'
  if (v <= 8) return '#86efac'
  return '#b0e455'
}

function toDisplay(kg: number, unit: string | null) {
  if (unit === 'lb') return `${+(kg * 2.20462).toFixed(1)} lb`
  return `${+kg.toFixed(1)} kg`
}

// ─── Coach nav ────────────────────────────────────────────────────────────────

function CoachNav({ active, onChange, isHeadCoach, firstName, avatarColor, avatarUrl, userEmail }: {
  active: CoachTab
  onChange: (t: CoachTab) => void
  isHeadCoach: boolean
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  userEmail: string
}) {
  const tabs: { id: CoachTab; label: string; icon: JSX.Element }[] = [
    { id: 'members', label: 'Members', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'programs', label: 'Programs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'messages', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    ...(isHeadCoach ? [{ id: 'admin' as CoachTab, label: 'Admin', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg> }] : []),
  ]

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col bg-[#0b1509] border-r border-[#b0e455]/12 z-50">
        {/* Logo */}
        <div className="px-6 pt-8 pb-7 border-b border-[#b0e455]/8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#b0e455] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                <path d="M0,2 H32 L18.3,14" />
                <path d="M13.7,18 L0,30 H32" />
              </svg>
            </div>
            <div>
              <p className="text-[#edf5e2] font-bold text-xl tracking-tight leading-none">Zana</p>
              <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase leading-none mt-1.5">Coach Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left ${
                active === t.id
                  ? 'bg-[#b0e455] text-[#0b1509]'
                  : 'text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]'
              }`}
            >
              {t.icon}
              <span className="text-base font-semibold">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="px-4 py-5 border-t border-[#b0e455]/8 space-y-1">
          <Link href="/profile" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212] transition-all">
            <div
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0"
              style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
            >
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <span className="text-base font-semibold">Profile</span>
          </Link>
          <p className="text-[10px] text-[#edf5e2]/15 uppercase tracking-widest px-4 pt-2">© 2026 Zana Fitness</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1a0c]/95 backdrop-blur-md border-t border-[#b0e455]/8 flex z-50">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`w-12 h-7 flex items-center justify-center rounded-full transition-all ${
              active === t.id ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[#edf5e2]/25'
            }`}>
              {t.icon}
            </div>
            <span className={`text-[9px] tracking-wide uppercase font-medium ${
              active === t.id ? 'text-[#b0e455]' : 'text-[#edf5e2]/25'
            }`}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function checkinStatus(stat: Stat | null): 'fresh' | 'ok' | 'overdue' | 'none' {
  if (!stat) return 'none'
  const days = Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000)
  if (days <= 3) return 'fresh'
  if (days <= 7) return 'ok'
  return 'overdue'
}

const STATUS_DOT: Record<string, string> = {
  fresh: 'bg-[#86efac]',
  ok: 'bg-[#fbbf24]',
  overdue: 'bg-[#f87171]',
  none: 'bg-[#edf5e2]/15',
}

const STATUS_LABEL: Record<string, string> = {
  fresh: 'Active',
  ok: 'Due soon',
  overdue: 'Overdue',
  none: 'No data',
}

function MembersTab({ members, allStats, threads, lastMessages }: {
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
}) {
  const supabase = createClient()
  const [stats, setStats] = useState<Stat[]>(allStats)

  useEffect(() => {
    const memberIds = members.map(m => m.id)
    if (!memberIds.length) return
    const channel = supabase
      .channel('coach-member-stats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stat_updates', filter: `member_id=in.(${memberIds.join(',')})` },
        payload => {
          setStats(prev => [payload.new as Stat, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [members]) // eslint-disable-line react-hooks/exhaustive-deps

  const threadToMember = Object.fromEntries(threads.map(t => [t.id, t.member_id]))
  const lastMsgByMember: Record<string, MsgPreview> = {}
  for (const msg of lastMessages) {
    const mid = threadToMember[msg.thread_id]
    if (mid && !lastMsgByMember[mid]) lastMsgByMember[mid] = msg
  }

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))

  const latestPerMember = members.map(m => ({
    member: m,
    stat: stats.find(s => s.member_id === m.id) ?? null,
    lastMsg: lastMsgByMember[m.id] ?? null,
  }))

  const recentStream = [...stats]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  // Summary counts
  const totalMembers = members.length
  const activeThisWeek = latestPerMember.filter(({ stat }) => {
    if (!stat) return false
    return Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) <= 7
  }).length
  const needAttention = latestPerMember.filter(({ stat }) => checkinStatus(stat) === 'overdue' || checkinStatus(stat) === 'none').length

  // Sort: overdue first, then ok, then fresh
  const sortedMembers = [...latestPerMember].sort((a, b) => {
    const order = { overdue: 0, none: 1, ok: 2, fresh: 3 }
    return order[checkinStatus(a.stat)] - order[checkinStatus(b.stat)]
  })

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[#edf5e2]/20">No members assigned yet.</p>
        <p className="text-xs text-[#edf5e2]/15 mt-1">Use Admin to invite members.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#edf5e2]">{totalMembers}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Total</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${needAttention > 0 ? 'bg-[#2a1a1a] border-[#f87171]/20' : 'bg-[#1c2e16] border-[#b0e455]/8'}`}>
          <p className={`text-2xl font-bold ${needAttention > 0 ? 'text-[#f87171]' : 'text-[#edf5e2]/30'}`}>{needAttention}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Attention</p>
        </div>
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#86efac]">{activeThisWeek}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Active</p>
        </div>
      </div>

      {/* Roster */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Roster</p>
        <div className="space-y-2">
          {sortedMembers.map(({ member, stat, lastMsg }) => {
            const status = checkinStatus(stat)
            return (
              <div key={member.id} className="bg-[#1c2e16] rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-[#b0e455]/10 transition-colors">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455]">
                    {memberName(member).charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1c2e16] ${STATUS_DOT[status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#edf5e2] truncate">{memberName(member)}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {stat ? (
                      <p className="text-[10px] text-[#edf5e2]/30 font-mono">
                        Check-in {relTime(stat.created_at)} ago
                        {stat.weight_kg != null ? ` · ${toDisplay(stat.weight_kg, member.weight_unit)}` : ''}
                        {stat.confidence != null ? <span style={{ color: confidenceColor(stat.confidence) }}> · {stat.confidence}/10</span> : null}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#edf5e2]/20 font-mono">No check-ins</p>
                    )}
                    {lastMsg && (
                      <p className="text-[10px] text-[#edf5e2]/20 font-mono">Msg {relTime(lastMsg.created_at)} ago</p>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full ${
                  status === 'fresh' ? 'text-[#86efac] bg-[#86efac]/10'
                  : status === 'ok' ? 'text-[#fbbf24] bg-[#fbbf24]/10'
                  : status === 'overdue' ? 'text-[#f87171] bg-[#f87171]/10'
                  : 'text-[#edf5e2]/20 bg-[#edf5e2]/5'
                }`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {recentStream.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Recent updates</p>
          <div className="space-y-2">
            {recentStream.map(s => {
              const m = memberMap[s.member_id]
              if (!m) return null
              return (
                <div key={s.id} className="bg-[#1c2e16] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#edf5e2]">{memberName(m)}</p>
                    <p className="text-[10px] text-[#edf5e2]/25 font-mono">{relTime(s.created_at)} ago</p>
                  </div>
                  <div className="flex gap-4">
                    {s.weight_kg != null && (
                      <div>
                        <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">Weight</p>
                        <p className="text-sm font-semibold text-[#edf5e2]">{toDisplay(s.weight_kg, m.weight_unit)}</p>
                      </div>
                    )}
                    {s.confidence != null && (
                      <div>
                        <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">Confidence</p>
                        <p className="text-sm font-semibold" style={{ color: confidenceColor(s.confidence) }}>{s.confidence}/10</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Programs tab ─────────────────────────────────────────────────────────────

function ProgramsTab({ members, userId }: { members: Member[]; userId: string }) {
  const supabase = createClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('split')
  const [sections, setSections] = useState<Partial<Record<Section, object | null>>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selected = members.find(m => m.id === selectedId) ?? null
  const SECTIONS: Section[] = ['split', 'food', 'habits']

  async function selectMember(id: string) {
    setSelectedId(id)
    setActiveSection('split')
    const { data } = await supabase
      .from('program_sections')
      .select('section, content_json')
      .eq('member_id', id)
    const map: Partial<Record<Section, object | null>> = {}
    for (const row of data ?? []) map[row.section as Section] = row.content_json
    setSections(map)
  }

  async function saveSection() {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: activeSection, content_json: sections[activeSection] ?? {}, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!selectedId) {
    return (
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Select a member to edit their program</p>
        <div className="space-y-2">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m.id)}
              className="w-full bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3 hover:bg-[#233019] transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455] shrink-0">
                {memberName(m).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#edf5e2]">{memberName(m)}</p>
                <p className="text-[10px] text-[#edf5e2]/30 font-mono">Split · Food · Habits</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#edf5e2]/20 ml-auto">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setSelectedId(null)} className="text-[#edf5e2]/30 hover:text-[#edf5e2] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[#edf5e2]">{memberName(selected!)}</p>
        <button
          onClick={saveSection}
          disabled={saving}
          className="ml-auto text-[10px] tracking-widest uppercase font-mono text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-50"
        >
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-[#b0e455]/8 mb-4 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2.5 text-[11px] tracking-wide font-mono capitalize whitespace-nowrap transition border-b-2 -mb-px ${
              activeSection === s ? 'border-[#b0e455] text-[#b0e455]' : 'border-transparent text-[#edf5e2]/30 hover:text-[#edf5e2]/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <RichTextEditor
        content={sections[activeSection] ?? null}
        onChange={json => setSections(prev => ({ ...prev, [activeSection]: json }))}
      />
    </div>
  )
}

// ─── Messages tab ─────────────────────────────────────────────────────────────

function MessagesTab({
  userId,
  members,
  threads,
  lastMessages,
  myReads,
}: {
  userId: string
  members: Member[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
}) {
  const supabase = createClient()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))
  const threadMap = Object.fromEntries(threads.map(t => [t.id, t]))

  // Last message per thread (already sorted desc by server)
  const lastMsgByThread: Record<string, MsgPreview> = {}
  for (const msg of lastMessages) {
    if (!lastMsgByThread[msg.thread_id]) lastMsgByThread[msg.thread_id] = msg
  }

  const readMap: Record<string, string> = {}
  for (const r of myReads) readMap[r.thread_id] = r.last_read_at

  const sortedThreads = [...threads].sort((a, b) => {
    const ta = lastMsgByThread[a.id]?.created_at ?? ''
    const tb = lastMsgByThread[b.id]?.created_at ?? ''
    return tb.localeCompare(ta)
  })

  function isUnread(threadId: string) {
    const last = lastMsgByThread[threadId]
    if (!last) return false
    if (last.author_id === userId) return false
    const read = readMap[threadId]
    return !read || new Date(last.created_at) > new Date(read)
  }

  async function openThread(threadId: string) {
    setSelectedThreadId(threadId)
    const { data } = await supabase
      .from('messages')
      .select('id, author_id, body, created_at, message_attachments(id, storage_path, kind)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(100)
    setChatMessages((data ?? []) as ChatMessage[])
    await supabase.from('message_reads').upsert({
      thread_id: threadId, user_id: userId, last_read_at: new Date().toISOString(),
    })
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50)
  }

  // Realtime for selected thread
  useEffect(() => {
    if (!selectedThreadId) return
    const channel = supabase
      .channel(`coach-${selectedThreadId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${selectedThreadId}` },
        payload => {
          const msg = payload.new as ChatMessage
          setChatMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, message_attachments: [] }])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          supabase.from('message_reads').upsert({ thread_id: selectedThreadId, user_id: userId, last_read_at: new Date().toISOString() })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedThreadId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    if (!selectedThreadId || !body.trim() || sending) return
    setSending(true)
    const text = body.trim()
    setBody('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    const { data: msg } = await supabase
      .from('messages')
      .insert({ thread_id: selectedThreadId, author_id: userId, body: text })
      .select('id, author_id, body, created_at')
      .single()
    if (msg) setChatMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, message_attachments: [] }])
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Thread inbox
  if (!selectedThreadId) {
    if (sortedThreads.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-[#edf5e2]/20">No threads yet.</p>
          <p className="text-xs text-[#edf5e2]/15 mt-1">Use Admin to set up member threads.</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Inbox</p>
        {sortedThreads.map(thread => {
          const m = memberMap[thread.member_id]
          const last = lastMsgByThread[thread.id]
          const unread = isUnread(thread.id)
          return (
            <button
              key={thread.id}
              onClick={() => openThread(thread.id)}
              className="w-full bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3 hover:bg-[#233019] transition text-left"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455]">
                  {m ? memberName(m).charAt(0).toUpperCase() : '?'}
                </div>
                {unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#b0e455] rounded-full border-2 border-[#0f1a0c]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${unread ? 'font-semibold text-[#edf5e2]' : 'text-[#edf5e2]/70'}`}>
                  {m ? memberName(m) : 'Unknown'}
                </p>
                {last && (
                  <p className="text-[11px] text-[#edf5e2]/30 truncate mt-0.5">{last.body || '📎 Attachment'}</p>
                )}
              </div>
              {last && (
                <p className="text-[10px] text-[#edf5e2]/25 font-mono shrink-0">{relTime(last.created_at)}</p>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Thread chat view
  const thread = threadMap[selectedThreadId]
  const chatMember = thread ? memberMap[thread.member_id] : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setSelectedThreadId(null)} className="text-[#edf5e2]/30 hover:text-[#edf5e2] transition shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[#edf5e2]">{chatMember ? memberName(chatMember) : 'Chat'}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pb-4" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        {chatMessages.map(msg => {
          const isMine = msg.author_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMine ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm' : 'bg-[#1c2e16] text-[#edf5e2]/85 rounded-bl-sm'
              }`}>
                {msg.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 pt-3 border-t border-[#b0e455]/8">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => { setBody(e.target.value); const ta = textareaRef.current; if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` } }}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 bg-[#162212] border border-[#b0e455]/12 rounded-2xl px-4 py-2.5 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 resize-none focus:outline-none focus:border-[#b0e455]/40 transition max-h-28 overflow-y-auto leading-relaxed"
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          className="shrink-0 w-9 h-9 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition disabled:opacity-30 mb-0.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 translate-x-px">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Admin tab ────────────────────────────────────────────────────────────────

function AdminTab({ userId, userEmail, members, threads }: { userId: string; userEmail: string; members: Member[]; threads: Thread[] }) {
  const supabase = createClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [inviteMsg, setInviteMsg] = useState('')
  const [setupStatus, setSetupStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const threadMemberIds = new Set(threads.map(t => t.member_id))
  const membersWithoutThread = members.filter(m => !threadMemberIds.has(m.id))

  async function handleBroadcast(e: FormEvent) {
    e.preventDefault()
    if (!broadcastBody.trim() || !threads.length) return
    setBroadcastStatus('loading')
    for (const thread of threads) {
      await supabase.from('messages').insert({
        thread_id: thread.id,
        author_id: userId,
        body: broadcastBody.trim(),
      })
    }
    setBroadcastBody('')
    setBroadcastStatus('done')
    setTimeout(() => setBroadcastStatus('idle'), 3000)
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteStatus('loading')
    try {
      const res = await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-coach-email': userEmail },
        body: JSON.stringify({ email: inviteEmail.trim(), plan: 'member' }),
      })
      const json = await res.json()
      if (res.ok) { setInviteStatus('ok'); setInviteMsg('Invite sent!'); setInviteEmail('') }
      else { setInviteStatus('error'); setInviteMsg(json.error ?? 'Failed to send invite.') }
    } catch {
      setInviteStatus('error'); setInviteMsg('Network error.')
    }
    setTimeout(() => setInviteStatus('idle'), 3000)
  }

  async function setupThread(member: Member) {
    setSetupStatus(s => ({ ...s, [member.id]: 'loading' }))
    // Create thread
    const { data: thread, error: te } = await supabase
      .from('threads')
      .insert({ member_id: member.id })
      .select('id')
      .single()
    if (te || !thread) { setSetupStatus(s => ({ ...s, [member.id]: 'error' })); return }

    // Add member + coach as participants
    await supabase.from('thread_participants').insert([
      { thread_id: thread.id, user_id: member.id, role: member.role },
      { thread_id: thread.id, user_id: userId, role: 'head_coach' },
    ])
    setSetupStatus(s => ({ ...s, [member.id]: 'done' }))
  }

  return (
    <div className="space-y-8">

      {/* Broadcast message */}
      {threads.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">
            Broadcast to All Members ({threads.length})
          </p>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <textarea
              value={broadcastBody}
              onChange={e => setBroadcastBody(e.target.value)}
              rows={3}
              placeholder="Send one message to every member's inbox…"
              className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-[#edf5e2] text-sm placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/60 transition resize-none"
            />
            <button
              type="submit"
              disabled={broadcastStatus === 'loading' || !broadcastBody.trim()}
              className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
            >
              {broadcastStatus === 'loading' ? 'Sending…' : broadcastStatus === 'done' ? 'Sent!' : 'Send to All'}
            </button>
          </form>
        </div>
      )}

      {/* Invite member */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Invite Member</p>
        <form onSubmit={handleInvite} className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="member@email.com"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-[#edf5e2] text-sm placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/60 transition"
          />
          <button
            type="submit"
            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
            className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
          >
            {inviteStatus === 'loading' ? 'Sending…' : 'Send Invite'}
          </button>
          {inviteMsg && (
            <p className={`text-xs font-mono ${inviteStatus === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{inviteMsg}</p>
          )}
        </form>
      </div>

      {/* Setup messaging threads */}
      {membersWithoutThread.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Setup Messaging Thread</p>
          <div className="space-y-2">
            {membersWithoutThread.map(m => (
              <div key={m.id} className="bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455] shrink-0">
                  {memberName(m).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-[#edf5e2] flex-1">{memberName(m)}</p>
                <button
                  onClick={() => setupThread(m)}
                  disabled={setupStatus[m.id] === 'loading' || setupStatus[m.id] === 'done'}
                  className="text-[10px] tracking-widest uppercase font-mono text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-40"
                >
                  {setupStatus[m.id] === 'loading' ? 'Setting up…'
                    : setupStatus[m.id] === 'done' ? 'Done ✓'
                    : setupStatus[m.id] === 'error' ? 'Error'
                    : 'Setup'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member list */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">All Members ({members.length})</p>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455] shrink-0">
                {memberName(m).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#edf5e2]">{memberName(m)}</p>
                <p className="text-[10px] text-[#edf5e2]/30 font-mono truncate">{m.email}</p>
              </div>
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                threadMemberIds.has(m.id)
                  ? 'text-green-400 border-green-400/20 bg-green-400/10'
                  : 'text-[#edf5e2]/20 border-[#b0e455]/12'
              }`}>
                {threadMemberIds.has(m.id) ? 'Active' : 'No thread'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachClient({ userId, userEmail, userRole, firstName, avatarColor, avatarUrl, members, allStats, threads, lastMessages, myReads }: Props) {
  const [activeTab, setActiveTab] = useState<CoachTab>('members')
  const isHeadCoach = userRole === 'head_coach'

  const TAB_TITLES: Record<CoachTab, string> = {
    members: 'Members',
    programs: 'Programs',
    messages: 'Messages',
    admin: 'Admin',
  }

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  function coachGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pl-72">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between lg:px-8 lg:pt-7 lg:pb-4 lg:border-b lg:border-[#b0e455]/8">
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono">
            Zana · Coach Portal
          </p>
          {activeTab === 'members' ? (
            <>
              <h1 className="text-xl font-bold tracking-tight mt-0.5 lg:text-2xl">
                {coachGreeting()}, {firstName ?? userEmail.split('@')[0]}.
              </h1>
              <p className="text-xs text-[#edf5e2]/35 mt-1">Here's how your members are doing.</p>
            </>
          ) : (
            <h1 className="text-xl font-semibold tracking-tight mt-0.5 lg:text-2xl">{TAB_TITLES[activeTab]}</h1>
          )}
        </div>
        <Link href="/profile" className="shrink-0 mt-1 lg:hidden">
          <div
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold overflow-hidden"
            style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </div>
        </Link>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 lg:px-8 lg:max-w-4xl lg:w-full lg:pb-10 lg:pt-5">
        {activeTab === 'members' && (
          <MembersTab members={members} allStats={allStats} threads={threads} lastMessages={lastMessages} />
        )}
        {activeTab === 'programs' && (
          <ProgramsTab members={members} userId={userId} />
        )}
        {activeTab === 'messages' && (
          <MessagesTab
            userId={userId}
            members={members}
            threads={threads}
            lastMessages={lastMessages}
            myReads={myReads}
          />
        )}
        {activeTab === 'admin' && isHeadCoach && (
          <AdminTab userId={userId} userEmail={userEmail} members={members} threads={threads} />
        )}
      </div>

      <CoachNav
        active={activeTab}
        onChange={setActiveTab}
        isHeadCoach={isHeadCoach}
        firstName={firstName}
        avatarColor={avatarColor}
        avatarUrl={avatarUrl}
        userEmail={userEmail}
      />
    </div>
  )
}
