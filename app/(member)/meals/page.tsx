import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MealsClient from './MealsClient'

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: meals } = await supabase
    .from('meal_logs')
    .select('id, photo_url, note, created_at')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .limit(300)

  return (
    <MealsClient
      initialMeals={(meals ?? []) as { id: string; photo_url: string; note: string | null; created_at: string }[]}
    />
  )
}
