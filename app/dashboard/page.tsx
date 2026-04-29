import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isCoach =
    ['coach', 'head_coach'].includes(profile?.role ?? '') ||
    COACH_EMAILS.includes(user.email ?? '')

  redirect(isCoach ? '/coach' : '/stats')
}
