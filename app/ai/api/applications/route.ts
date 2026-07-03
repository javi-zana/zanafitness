import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/ai-supabase'
import { acceptEmailHtml, ACCEPT_SUBJECT, FROM_EMAIL } from '@/lib/acceptance-email'
import { rejectEmailHtml, REJECT_SUBJECT } from '@/lib/rejection-email'

// Accept/reject applications from the ai-tool inbox. Auth is the ai.* password
// wall (middleware) — same trust model as the other /ai/api routes.

export async function POST(req: NextRequest) {
  const { id, action } = await req.json().catch(() => ({}))
  if (!id || (action !== 'accept' && action !== 'reject')) {
    return NextResponse.json({ error: 'id and action (accept|reject) required' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: app, error: fetchErr } = await db
    .from('applications')
    .select('id, first_name, email, status')
    .eq('id', id)
    .single()

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (action === 'reject') {
    const wasPending = app.status === 'pending'
    const { error } = await db.from('applications').update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    // Soft-rejection email (diet guide + fight-for-a-spot PS) — only for fresh
    // rejections; someone folded in from a later legacy stage shouldn't get
    // "didn't see the commitment in this application".
    let emailSent = false
    if (wasPending && app.email) {
      const { error: emailErr } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: FROM_EMAIL,
        to: app.email as string,
        subject: REJECT_SUBJECT,
        html: rejectEmailHtml((app.first_name as string | null) ?? 'there'),
      })
      if (emailErr) console.error('[ai/applications] reject email error:', emailErr)
      emailSent = !emailErr
    }
    return NextResponse.json({ success: true, status: 'rejected', emailSent })
  }

  // accept — only from pending, since it sends a real email
  if (app.status !== 'pending') {
    return NextResponse.json({ error: 'Already responded' }, { status: 409 })
  }

  const { error: updateErr } = await db.from('applications').update({
    status: 'accepted',
    responded_at: new Date().toISOString(),
  }).eq('id', id)
  if (updateErr) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailErr } = await resend.emails.send({
    from: FROM_EMAIL,
    to: app.email as string,
    subject: ACCEPT_SUBJECT,
    html: acceptEmailHtml((app.first_name as string | null) ?? 'there'),
  })
  if (emailErr) console.error('[ai/applications] Resend error:', emailErr)

  return NextResponse.json({ success: true, status: 'accepted', emailSent: !emailErr })
}
