import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const POST_SELECT = `
  id, author_id, sub_tab, title, body_json, created_at, hidden,
  author:profiles!author_id(first_name, role),
  reactions:community_post_reactions(user_id),
  comments:community_post_comments(id, author_id, body, created_at, hidden, author:profiles!author_id(first_name, role))
`

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const tab = req.nextUrl.searchParams.get('tab')
  const postId = req.nextUrl.searchParams.get('post_id')

  if (postId) {
    const { data: post } = await admin
      .from('community_posts')
      .select(POST_SELECT)
      .eq('id', postId)
      .single()
    return NextResponse.json({ post: post ?? null })
  }

  if (tab) {
    const { data: posts } = await admin
      .from('community_posts')
      .select(POST_SELECT)
      .eq('sub_tab', tab)
      .order('created_at', { ascending: false })
      .limit(20)
    return NextResponse.json({ posts: posts ?? [] })
  }

  return NextResponse.json({ error: 'tab or post_id required' }, { status: 400 })
}
