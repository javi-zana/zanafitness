// Read-only intake form viewer. Server component (plain render) — collapsible
// via native <details> so no client JS needed.

type P = Record<string, unknown>

const GROUPS: { title: string; fields: [string, string][] }[] = [
  {
    title: 'Basics',
    fields: [
      ['gender', 'Gender'], ['age', 'Age'], ['height_cm', 'Height (cm)'],
      ['location', 'Location'], ['occupation', 'Occupation'], ['work_schedule', 'Work schedule'],
      ['starting_weight_kg', 'Starting weight (kg)'], ['starting_body_fat_pct', 'Starting body fat %'],
    ],
  },
  {
    title: 'Goals & motivation',
    fields: [
      ['mirror_goal', 'Mirror goal'], ['target_date', 'Target date'],
      ['why_motivation', 'Why / motivation'], ['success_vision', 'Vision of success'],
    ],
  },
  {
    title: 'Training',
    fields: [
      ['training_years', 'Experience'], ['training_frequency_per_week', 'Frequency/wk'],
      ['training_current_state', 'Current training'], ['training_access', 'Access'],
      ['training_equipment', 'Equipment'], ['training_injuries', 'Injuries'],
    ],
  },
  {
    title: 'Diet',
    fields: [
      ['diet_typical_day', 'Typical day'], ['diet_meals_per_day', 'Meals/day'],
      ['diet_who_cooks', 'Who cooks'], ['diet_restrictions', 'Restrictions'],
      ['diet_dislikes', 'Dislikes'], ['diet_alcohol_frequency', 'Alcohol'],
      ['diet_supplements', 'Supplements'], ['diet_eating_out_frequency', 'Eating out'],
    ],
  },
  {
    title: 'Lifestyle',
    fields: [
      ['lifestyle_sleep_hours', 'Sleep hours'], ['lifestyle_sleep_quality', 'Sleep quality'],
      ['lifestyle_stress_level', 'Stress (1-10)'], ['lifestyle_travel_frequency', 'Travel'],
    ],
  },
]

function has(v: unknown): boolean {
  return v !== null && v !== undefined && String(v).trim() !== ''
}

export default function IntakeView({ profile }: { profile: P }) {
  const filledGroups = GROUPS.map((g) => ({
    ...g,
    fields: g.fields.filter(([k]) => has(profile[k])),
  })).filter((g) => g.fields.length > 0)

  return (
    <details className="rounded-2xl border border-zinc-800 bg-zinc-900/30 [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-zinc-200">
        <span>Intake form</span>
        <span className="text-xs text-zinc-500">view ▾</span>
      </summary>
      <div className="space-y-5 px-5 pb-5">
        {filledGroups.length === 0 && (
          <p className="text-sm text-zinc-500">No intake on file yet.</p>
        )}
        {filledGroups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-lime-400">{g.title}</p>
            <dl className="space-y-1.5">
              {g.fields.map(([k, label]) => (
                <div key={k} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
                  <dt className="text-zinc-500">{label}</dt>
                  <dd className="whitespace-pre-wrap text-zinc-300">{String(profile[k])}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  )
}
