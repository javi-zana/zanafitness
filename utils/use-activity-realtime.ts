'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type {
  ActivityWithDetails,
  ActivityComment,
  ActivityReaction,
} from '@/components/ActivityCard'

type AuthorInfo = { name: string | null; role: 'member' | 'coach' | 'head_coach' | null }
type AuthorMap = Record<string, AuthorInfo>

type Options = {
  initial: ActivityWithDetails[]
  /** Member IDs whose activities this feed cares about. Used to filter realtime events. */
  memberIds: string[]
  /** Lookup of authorId → display info. Used when a new comment arrives via realtime. */
  authorMap: AuthorMap
}

/**
 * Manages a realtime activity feed: holds the activities list, subscribes to
 * postgres_changes on activities/reactions/comments, and exposes mutators
 * for optimistic UI updates.
 */
export function useActivityRealtime({ initial, memberIds, authorMap }: Options) {
  const [activities, setActivities] = useState<ActivityWithDetails[]>(initial)
  const memberIdSet = useRef(new Set(memberIds))
  const authorMapRef = useRef(authorMap)
  authorMapRef.current = authorMap
  memberIdSet.current = new Set(memberIds)

  // Keep state fresh if the parent re-renders with new server data (e.g. after navigation).
  useEffect(() => {
    setActivities(initial)
  }, [initial])

  const mutate = useCallback(
    (id: string, mutator: (a: ActivityWithDetails) => ActivityWithDetails) => {
      setActivities(prev => prev.map(a => (a.id === id ? mutator(a) : a)))
    },
    []
  )

  const remove = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }, [])

  const prepend = useCallback((a: ActivityWithDetails) => {
    setActivities(prev => (prev.some(x => x.id === a.id) ? prev : [a, ...prev]))
  }, [])

  // Realtime subscription
  useEffect(() => {
    if (memberIds.length === 0) return
    const supabase = createClient()
    const filter = `member_id=in.(${memberIds.join(',')})`

    const channel = supabase
      .channel(`activity-feed-${memberIds.slice(0, 3).join('-')}-${memberIds.length}`)
      // ── activity inserted (someone posted) ──────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities', filter },
        async (payload) => {
          const row = payload.new as { id: string; member_id: string; kind: ActivityWithDetails['kind']; note: string | null; confidence: number; created_at: string }
          if (!memberIdSet.current.has(row.member_id)) return
          const author = authorMapRef.current[row.member_id]
          prepend({
            id: row.id,
            member_id: row.member_id,
            kind: row.kind,
            note: row.note,
            confidence: row.confidence,
            created_at: row.created_at,
            photos: [],
            reactions: [],
            comments: [],
            member_name: author?.name ?? null,
          })
        }
      )
      // ── activity deleted ────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'activities' },
        (payload) => {
          const row = payload.old as { id: string }
          remove(row.id)
        }
      )
      // ── reaction added ──────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_reactions' },
        (payload) => {
          const r = payload.new as ActivityReaction & { activity_id: string }
          setActivities(prev =>
            prev.map(a =>
              a.id === r.activity_id
                ? {
                    ...a,
                    reactions: a.reactions.some(x => x.user_id === r.user_id)
                      ? a.reactions
                      : [...a.reactions, { user_id: r.user_id, kind: r.kind }],
                  }
                : a
            )
          )
        }
      )
      // ── reaction removed ────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'activity_reactions' },
        (payload) => {
          const r = payload.old as { activity_id: string; user_id: string }
          setActivities(prev =>
            prev.map(a =>
              a.id === r.activity_id
                ? { ...a, reactions: a.reactions.filter(x => x.user_id !== r.user_id) }
                : a
            )
          )
        }
      )
      // ── comment added ───────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_comments' },
        (payload) => {
          const c = payload.new as { id: string; activity_id: string; author_id: string; body: string; created_at: string }
          const author = authorMapRef.current[c.author_id]
          const newComment: ActivityComment = {
            id: c.id,
            author_id: c.author_id,
            body: c.body,
            created_at: c.created_at,
            author_name: author?.name ?? null,
            author_role: author?.role ?? null,
          }
          setActivities(prev =>
            prev.map(a =>
              a.id === c.activity_id
                ? {
                    ...a,
                    comments: a.comments.some(x => x.id === c.id)
                      ? a.comments
                      : [...a.comments, newComment],
                  }
                : a
            )
          )
        }
      )
      // ── comment deleted ─────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'activity_comments' },
        (payload) => {
          const c = payload.old as { id: string; activity_id: string }
          setActivities(prev =>
            prev.map(a =>
              a.id === c.activity_id
                ? { ...a, comments: a.comments.filter(x => x.id !== c.id) }
                : a
            )
          )
        }
      )
      // ── photo added (for activities posted with photos via /api/activity-photo) ──
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_photos' },
        (payload) => {
          const p = payload.new as { id: string; activity_id: string; photo_url: string; storage_path: string }
          setActivities(prev =>
            prev.map(a =>
              a.id === p.activity_id
                ? {
                    ...a,
                    photos: a.photos.some(x => x.id === p.id)
                      ? a.photos
                      : [...a.photos, { id: p.id, photo_url: p.photo_url, storage_path: p.storage_path }],
                  }
                : a
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memberIds.join(','), prepend, remove]) // eslint-disable-line react-hooks/exhaustive-deps

  return { activities, mutate, remove, prepend, setActivities }
}
