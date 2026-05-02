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
  const photoType = formData.get('photo_type') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!['before', 'weekly'].includes(photoType ?? '')) {
    return NextResponse.json({ error: 'Invalid photo_type' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${user.id}/${photoType}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = adminClient()
  const { error: uploadError } = await admin.storage
    .from('progress-photos')
    .upload(storagePath, Buffer.from(bytes), { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('progress-photos')
    .getPublicUrl(storagePath)

  const { data: photo, error: dbError } = await admin
    .from('progress_photos')
    .insert({
      member_id: user.id,
      photo_url: publicUrl,
      storage_path: storagePath,
      photo_type: photoType,
      taken_at: new Date().toISOString().split('T')[0],
    })
    .select('id, photo_url, photo_type, taken_at, created_at')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ photo })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })

  const admin = adminClient()
  const { data: photo } = await admin
    .from('progress_photos')
    .select('storage_path, member_id')
    .eq('id', id)
    .single()

  if (!photo || photo.member_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await Promise.all([
    admin.from('progress_photos').delete().eq('id', id),
    admin.storage.from('progress-photos').remove([photo.storage_path]),
  ])

  return NextResponse.json({ success: true })
}
