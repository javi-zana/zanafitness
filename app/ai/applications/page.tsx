import Link from 'next/link'
import { createServiceClient } from '@/lib/ai-supabase'
import ApplicationsClient, { type Application } from './ApplicationsClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <Link href="/" className="text-xs text-zinc-500 transition hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="mt-2 text-lg font-medium text-zinc-100">Applications</h1>
      </header>
      <ApplicationsClient initial={(data ?? []) as Application[]} />
    </main>
  )
}
