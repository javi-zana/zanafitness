import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActivityWithDetails, ActivityKind } from '@/components/ActivityCard'

type RawActivity = {
  id: string
  member_id: string
  kind: ActivityKind
  note: string | null
  confidence: number
  created_at: string
  activity_photos: { id: string; photo_url: string; storage_path: string }[] | null
  activity_reactions: { user_id: string; kind: string }[] | null
  activity_comments: { id: string; author_id: string; body: string; created_at: string }[] | null
}

type RawProfile = { id: string; first_name: string | null; email: string; role: string }

export async function fetchActivities(
  client: SupabaseClient,
  memberIds: string[],
  limit = 50,
): Promise<ActivityWithDetails[]> {
  if (memberIds.length === 0) return []

  const { data: rows } = await client
    .from('activities')
    .select(`
      id, member_id, kind, note, confidence, created_at,
      activity_photos ( id, photo_url, storage_path ),
      activity_reactions ( user_id, kind ),
      activity_comments ( id, author_id, body, created_at )
    `)
    .in('member_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(limit) as { data: RawActivity[] | null }

  if (!rows || rows.length === 0) return []

  const authorIds = new Set<string>()
  for (const a of rows) {
    authorIds.add(a.member_id)
    for (const c of a.activity_comments ?? []) authorIds.add(c.author_id)
  }

  const { data: profileRows } = await client
    .from('profiles')
    .select('id, first_name, email, role')
    .in('id', Array.from(authorIds)) as { data: RawProfile[] | null }

  const profMap = Object.fromEntries(
    (profileRows ?? []).map(p => [p.id, p])
  ) as Record<string, RawProfile>

  return rows.map(a => {
    const memberProfile = profMap[a.member_id]
    return {
      id: a.id,
      member_id: a.member_id,
      kind: a.kind,
      note: a.note,
      confidence: a.confidence,
      created_at: a.created_at,
      photos: a.activity_photos ?? [],
      reactions: a.activity_reactions ?? [],
      comments: [...(a.activity_comments ?? [])]
        .sort((x, y) => new Date(x.created_at).getTime() - new Date(y.created_at).getTime())
        .map(c => {
          const author = profMap[c.author_id]
          return {
            id: c.id,
            author_id: c.author_id,
            body: c.body,
            created_at: c.created_at,
            author_name: author?.first_name ?? author?.email?.split('@')[0] ?? null,
            author_role: (author?.role as 'member' | 'coach' | 'head_coach' | undefined) ?? null,
          }
        }),
      member_name: memberProfile?.first_name ?? memberProfile?.email?.split('@')[0] ?? null,
    }
  })
}
