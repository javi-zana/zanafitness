import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { renderReportHtml, type ReportContent } from '@/lib/report-template'

export default async function MemberReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS ("member reads own sent reports") guarantees they can only load theirs.
  const { data: report } = await supabase
    .from('reports')
    .select('content_json, week_label')
    .eq('id', params.id)
    .maybeSingle()
  if (!report) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const html = renderReportHtml(report.content_json as ReportContent, {
    clientName: profile?.first_name ?? 'You',
    weekLabel: (report.week_label as string) ?? '',
  })

  return (
    <main className="min-h-screen bg-[#efeee8]">
      <div className="sticky top-0 z-10 bg-[#efeee8]/90 backdrop-blur px-4 py-3 border-b border-[#cfccc0]">
        <Link href="/reports" className="text-xs font-medium text-[#5b665f] hover:text-[#14201a]">← Reports</Link>
      </div>
      <iframe title="Weekly brief" srcDoc={html} className="w-full h-[calc(100vh-49px)] border-0" />
    </main>
  )
}
