import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import CommunityClient, { type Post } from './CommunityClient'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Service role client so coach/head_coach role is reliably fetched
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, role, avatar_color, avatar_url')
    .eq('id', user.id)
    .single()

  const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']
  const isCoachEmail = COACH_EMAILS.includes(user.email ?? '')
  const resolvedRole = profile?.role ?? (isCoachEmail ? 'coach' : 'member')

  const { data: posts } = await admin
    .from('community_posts')
    .select(`
      id, author_id, sub_tab, title, body_json, created_at, hidden,
      author:profiles!author_id(first_name, role),
      reactions:community_post_reactions(user_id),
      comments:community_post_comments(
        id, author_id, body, created_at, hidden,
        author:profiles!author_id(first_name, role)
      )
    `)
    .eq('sub_tab', 'announcements')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <CommunityClient
      userId={user.id}
      userRole={resolvedRole}
      firstName={profile?.first_name ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      avatarUrl={profile?.avatar_url ?? null}
      initialTab="announcements"
      initialPosts={(posts ?? []) as unknown as Post[]}
    />
  )
}
