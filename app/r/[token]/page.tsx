import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/ai-supabase'
import { renderReportHtml, type ReportContent } from '@/lib/report-template'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Weekly Brief · ZANA Fitness',
  robots: { index: false, follow: false },
}

// Public, tokenized view of a single SENT report — no login required.
export default async function SharedReportPage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient()
  const { data: report } = await supabase
    .from('reports')
    .select('content_json, week_label, status, member_id')
    .eq('share_token', params.token)
    .maybeSingle()

  if (!report || report.status !== 'sent') notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', report.member_id as string)
    .single()

  const html = renderReportHtml(report.content_json as ReportContent, {
    clientName: profile?.first_name ?? 'Client',
    weekLabel: (report.week_label as string) ?? '',
  })

  return <iframe title="Weekly brief" srcDoc={html} className="fixed inset-0 w-full h-full border-0" />
}
