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

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const activityId = formData.get('activity_id') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!activityId) return NextResponse.json({ error: 'activity_id required' }, { status: 400 })

  // Confirm the activity belongs to the requesting user
  const { data: activity } = await supabase
    .from('activities')
    .select('id, member_id')
    .eq('id', activityId)
    .single()
  if (!activity || activity.member_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${user.id}/${activityId}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = adminClient()
  const { error: uploadError } = await admin.storage
    .from('activity-photos')
    .upload(storagePath, Buffer.from(bytes), { contentType: file.type })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('activity-photos').getPublicUrl(storagePath)

  const { data: photo, error: dbError } = await admin
    .from('activity_photos')
    .insert({ activity_id: activityId, photo_url: publicUrl, storage_path: storagePath })
    .select('id, photo_url, storage_path, created_at')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ photo })
}
