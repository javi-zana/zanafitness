import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'

const COACH_EMAILS = ['me@javilorenzana.com']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role, avatar_color, avatar_url')
    .eq('id', user.id)
    .single()

  const isCoach =
    ['coach', 'head_coach'].includes(profile?.role ?? '') ||
    COACH_EMAILS.includes(user.email ?? '')

  if (isCoach) redirect('/coach')

  const [{ data: referralRow }, { data: okrRow }] = await Promise.all([
    supabase.from('referrals').select('code').eq('referrer_id', user.id).maybeSingle(),
    supabase
      .from('program_sections')
      .select('content_json')
      .eq('member_id', user.id)
      .eq('section', 'okr')
      .maybeSingle(),
  ])

  let referralCode = referralRow?.code ?? null
  if (!referralCode) {
    const code = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    const { data: newRef } = await supabase
      .from('referrals')
      .insert({ code, referrer_id: user.id })
      .select('code')
      .maybeSingle()
    referralCode = newRef?.code ?? null
  }

  return (
    <DashboardClient
      firstName={profile?.first_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      referralCode={referralCode}
      okr={okrRow?.content_json ?? null}
    />
  )
}
