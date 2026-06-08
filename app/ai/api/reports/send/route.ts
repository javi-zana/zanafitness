import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/ai-supabase'
import { renderReportHtml, type ReportContent } from '@/lib/report-template'

const FROM_EMAIL = 'Javier Lorenzana <javi@zanafitness.com>'

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: report } = await supabase
    .from('reports')
    .select('content_json, week_label, member_id, share_token')
    .eq('id', id)
    .maybeSingle()
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const { data: member } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('id', report.member_id as string)
    .single()
  if (!member?.email) {
    return NextResponse.json({ error: 'Client has no email on file' }, { status: 400 })
  }

  const html = renderReportHtml(report.content_json as ReportContent, {
    clientName: (member.first_name as string) ?? 'Client',
    weekLabel: (report.week_label as string) ?? '',
  })
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://zanafitness.com'}/r/${report.share_token}`

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: member.email as string,
      subject: `Your weekly brief${report.week_label ? ` — ${report.week_label}` : ''}`,
      html,
    })
    if (error) {
      console.error('[ai/reports/send] resend error:', error)
      return NextResponse.json({ error: 'Email failed to send' }, { status: 502 })
    }
  }

  const { error: updErr } = await supabase
    .from('reports')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
  if (updErr) {
    console.error('[ai/reports/send] status update error:', updErr)
    return NextResponse.json({ error: 'Sent email but failed to mark sent' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, shareUrl })
}
