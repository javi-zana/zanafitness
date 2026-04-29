'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionData = { section: string; content_json: object; updated_at: string } | null
type PrinciplesData = { content_json: object; updated_at: string } | null

type Props = {
  userId: string
  firstName: string | null
  role: string
  split: SectionData
  food: SectionData
  habits: SectionData
  principles: PrinciplesData
}

type Tab = 'split' | 'food' | 'habits' | 'principles'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasContent(json: object | null | undefined) {
  if (!json) return false
  const j = json as { content?: unknown[] }
  return Object.keys(json).length > 0 && (j.content?.length ?? 0) > 0
}

function relativeTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-full bg-[#b0e455]/8 border border-[#b0e455]/15 flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#edf5e2]/25">
          <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-[#edf5e2]/25">{message}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgramClient({ userId, firstName, role, split, food, habits, principles }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('split')
  const [editingPrinciples, setEditingPrinciples] = useState(false)
  const [principlesContent, setPrinciplesContent] = useState<object | null>(
    principles?.content_json ?? null
  )
  const [saving, setSaving] = useState(false)

  const isHeadCoach = role === 'head_coach'
  const name = firstName ? `${firstName}'s` : 'Your'

  const TABS: { id: Tab; label: string }[] = [
    { id: 'split', label: `${name} Split` },
    { id: 'food', label: `${name} Food` },
    { id: 'habits', label: `${name} Habits` },
    { id: 'principles', label: 'Principles' },
  ]

  async function savePrinciples() {
    setSaving(true)
    await supabase
      .from('principles_doc')
      .update({ content_json: principlesContent, updated_by: userId })
      .eq('id', '00000000-0000-0000-0000-000000000001')
    setSaving(false)
    setEditingPrinciples(false)
  }

  function renderContent() {
    if (activeTab === 'principles') {
      const content = principlesContent
      const updatedAt = principles?.updated_at

      return (
        <div className="space-y-4">
          {isHeadCoach && (
            <div className="flex justify-end gap-4">
              {editingPrinciples ? (
                <>
                  <button
                    onClick={() => setEditingPrinciples(false)}
                    className="text-sm text-[#edf5e2]/30 hover:text-[#edf5e2] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePrinciples}
                    disabled={saving}
                    className="text-sm font-semibold text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingPrinciples(true)}
                  className="text-sm text-[#edf5e2]/30 hover:text-[#b0e455] transition"
                >
                  Edit
                </button>
              )}
            </div>
          )}

          {editingPrinciples ? (
            <RichTextEditor content={content} onChange={setPrinciplesContent} />
          ) : hasContent(content) ? (
            <>
              <RichTextViewer content={content} />
              {updatedAt && (
                <p className="text-xs text-[#edf5e2]/20 pt-2">{relativeTime(updatedAt)}</p>
              )}
            </>
          ) : (
            <EmptyState
              message={
                isHeadCoach
                  ? 'No principles written yet. Tap Edit to add.'
                  : 'Principles haven\'t been written yet.'
              }
            />
          )}
        </div>
      )
    }

    const sectionMap = { split, food, habits }
    const section = sectionMap[activeTab]
    const content = section?.content_json ?? null
    const updatedAt = section?.updated_at

    if (!hasContent(content)) {
      return (
        <EmptyState message="Your coach hasn't written this section yet. Check back soon." />
      )
    }

    return (
      <div className="space-y-3">
        <RichTextViewer content={content} />
        {updatedAt && (
          <p className="text-xs text-[#edf5e2]/20 pt-2">{relativeTime(updatedAt)}</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">
      <div className="px-5 pt-12 pb-2">
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">My Program</h1>
      </div>

      <div className="overflow-x-auto border-b border-[#b0e455]/8">
        <div className="flex min-w-max px-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setEditingPrinciples(false)
              }}
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

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28">
        {renderContent()}
      </div>

      <BottomNav />
    </div>
  )
}
