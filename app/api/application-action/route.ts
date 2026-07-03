import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { acceptEmailHtml, ACCEPT_SUBJECT, FROM_EMAIL } from '@/lib/acceptance-email'

const ADMIN_EMAIL = 'me@javilorenzana.com'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { applicationId } = await req.json()
  if (!applicationId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const db = admin()

  const { data: app, error: fetchErr } = await db
    .from('applications')
    .select('id, first_name, email, status')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (app.status !== 'pending') {
    return NextResponse.json({ error: 'Already responded' }, { status: 409 })
  }

  await db.from('applications').update({
    status: 'accepted',
    responded_at: new Date().toISOString(),
  }).eq('id', applicationId)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = (app.first_name as string | null) ?? 'there'

  const { error: emailErr } = await resend.emails.send({
    from: FROM_EMAIL,
    to: app.email as string,
    subject: ACCEPT_SUBJECT,
    html: acceptEmailHtml(firstName),
  })

  if (emailErr) {
    console.error('[application-action] Resend error:', emailErr)
  }

  return NextResponse.json({ success: true, emailSent: !emailErr })
}
