'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ActivityComposer } from '@/components/ActivityComposer'
import { ActivityCard, type ActivityWithDetails } from '@/components/ActivityCard'
import { useActivityRealtime } from '@/utils/use-activity-realtime'

export default function StatsClient({
  userId,
  firstName,
  initialActivities,
}: {
  userId: string
  firstName: string | null
  initialActivities: ActivityWithDetails[]
}) {
  const router = useRouter()

  const { activities, mutate, remove } = useActivityRealtime({
    initial: initialActivities,
    memberIds: [userId],
    authorMap: {}, // member side: their own comments show 'You'; coach comments show 'Coach' badge
  })

  const goHome = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Track</p>
          <h1 className="font-display text-3xl leading-none">
            Hey{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-[var(--c-text3)] mt-2 leading-relaxed">
            Log a workout, a win, or a meal. Anything you want your coach to see.
          </p>
        </div>

        <ActivityComposer onPosted={goHome} />

        <div className="mt-8 space-y-3">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Recent Activity</p>
          {activities.length === 0 ? (
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 text-center">
              <p className="text-sm text-[var(--c-text3)] leading-relaxed">
                Nothing logged yet.<br />
                Pick a type above to share your first update.
              </p>
            </div>
          ) : (
            activities.map(a => (
              <ActivityCard
                key={a.id}
                activity={a}
                currentUserId={userId}
                onMutate={mutate}
                onDelete={remove}
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
