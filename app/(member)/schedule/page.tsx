import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ScheduleClient from './ScheduleClient'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <ScheduleClient />
}
