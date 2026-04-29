import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CommunityClient, { type Post } from './CommunityClient'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
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
      userRole={profile?.role ?? 'member'}
      initialTab="announcements"
      initialPosts={(posts ?? []) as unknown as Post[]}
    />
  )
}
