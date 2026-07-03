import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Meal photo log: same shape as upload-progress-photo — member session
// authenticates, service role writes to the public meal-photos bucket under
// the member's id, metadata row goes to meal_logs.

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
  const note = ((formData.get('note') as string | null) ?? '').trim().slice(0, 280)

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Not an image' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${user.id}/meal-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = adminClient()
  const { error: uploadError } = await admin.storage
    .from('meal-photos')
    .upload(storagePath, Buffer.from(bytes), { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('meal-photos')
    .getPublicUrl(storagePath)

  const { data: meal, error: dbError } = await admin
    .from('meal_logs')
    .insert({
      member_id: user.id,
      photo_url: publicUrl,
      storage_path: storagePath,
      note: note || null,
    })
    .select('id, photo_url, note, created_at')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ meal })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })

  const admin = adminClient()
  const { data: meal } = await admin
    .from('meal_logs')
    .select('storage_path, member_id')
    .eq('id', id)
    .single()

  if (!meal || meal.member_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await Promise.all([
    admin.from('meal_logs').delete().eq('id', id),
    admin.storage.from('meal-photos').remove([meal.storage_path]),
  ])

  return NextResponse.json({ success: true })
}
