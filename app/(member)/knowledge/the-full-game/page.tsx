import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'The Full Game Explained | Zana',
}

function SectionHeader({ num, label, title }: { num: string; label: string; title: React.ReactNode }) {
  return (
    <header className="mb-8 mt-16 first:mt-0">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#b0e455]">{num}</span>
        <span className="h-px w-8 bg-[var(--c-border2)]" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)]">{label}</span>
      </div>
      <h2 className="font-display leading-[1.1] text-[var(--c-text)]" style={{ fontSize: 'clamp(26px, 3.6vw, 36px)' }}>
        {title}
      </h2>
    </header>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 border-l-2 border-[#b0e455] pl-5 py-1">
      <p className="font-display text-lg md:text-xl leading-snug text-[var(--c-text)]">{children}</p>
    </div>
  )
}

export default async function FullGamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 lg:pb-12 lg:pl-52">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-8">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
          All modules
        </Link>
      </div>

      <article className="max-w-2xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-12 pb-10 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]">Core · 01</span>
            <span className="w-1 h-1 rounded-full bg-[var(--c-text4)]" />
            <span className="text-[11px] text-[var(--c-text4)]">6 min read</span>
          </div>

          <h1 className="font-display leading-[1.05] text-[var(--c-text)] mb-5" style={{ fontSize: 'clamp(34px, 5.2vw, 52px)' }}>
            The Full Game<br />Explained.
          </h1>

          <p className="text-[16px] md:text-[17px] text-[var(--c-text3)] leading-relaxed">
            There are three levers underneath everything I&apos;ll teach you: <strong className="text-[var(--c-text)] font-semibold">BMR, protein, and progressive overload</strong>. Get these three right and the rest of the system runs itself. Get them wrong and nothing else matters.
          </p>
        </header>

        {/* ── BMR ─────────────────────────────────────────────────────────── */}
        <SectionHeader num="01" label="BMR" title={<>How much you should eat.</>} />
        <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)]">
          <p>
            BMR is Basal Metabolic Rate — the number of calories your body burns just keeping you alive. Breathing, thinking, keeping your heart going. If you sat in a chair all day and did nothing, this is what you&apos;d burn.
          </p>
          <p>
            Add activity on top of that — walking, working, training — and you get your <strong className="text-[var(--c-text)] font-semibold">TDEE</strong> (Total Daily Energy Expenditure). That&apos;s the real number we care about. That&apos;s how much you actually burn in a day.
          </p>
          <p>
            <strong className="text-[var(--c-text)] font-semibold">Eat at TDEE → you stay the same. Eat below it → you lose fat. Eat above it → you gain.</strong> That&apos;s the whole game on the food side. Everything else is execution.
          </p>

          <Callout>To lose fat without losing muscle, eat 300&ndash;400 calories below your TDEE. Not 1,000. Not &ldquo;as little as possible.&rdquo;</Callout>

          <p>
            Why 300&ndash;400 and not more? Bigger deficits feel faster but they cost you muscle, sleep, energy in the gym, and mood. You stop being able to push the weights, you stop progressing, you fall off in two weeks. A smaller deficit you can hold for six months will always beat a brutal one you hold for three.
          </p>
          <p>
            <strong className="text-[var(--c-text)] font-semibold">Calculate it once. Then forget about it.</strong> Use any calculator online — they&apos;re all close enough. Plug in your weight, height, age, and rough activity level. Subtract 300&ndash;400 from the TDEE. That&apos;s your target. Mine was 2,200. We don&apos;t recalculate every week.
          </p>
        </div>

        {/* ── PROTEIN ────────────────────────────────────────────────────── */}
        <SectionHeader num="02" label="Protein" title={<>The anchor of every meal.</>} />
        <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)]">
          <p>
            Protein is the lever that lets you cut fat without losing muscle. It&apos;s also the most satiating macro — gram for gram, it keeps you fuller longer than carbs or fat. So it does two jobs at once: it protects your muscle while you&apos;re eating less, and it makes eating less actually bearable.
          </p>
          <p>
            <strong className="text-[var(--c-text)] font-semibold">The target: roughly 1g of protein per pound of bodyweight.</strong> If you weigh 170 lbs, you&apos;re aiming for ~170g of protein a day. You don&apos;t have to be perfect — being within 20g is fine — but if you&apos;re consistently 50g under, the whole thing breaks.
          </p>

          <Callout>Anchor every meal around protein first. Build the rest of the plate around it.</Callout>

          <p>
            The simplest version: chicken breast or ground beef at least once per meal, eggs as a side. That covers most of the day. If you eat twice, that&apos;s two servings of meat plus a few eggs and you&apos;re close.
          </p>
          <p>
            For the first 4&ndash;8 weeks, <strong className="text-[var(--c-text)] font-semibold">buy a cheap kitchen scale and weigh your protein.</strong> Not forever. Just long enough to build an intuition for what a portion actually looks like. After a month you&apos;ll be able to eyeball it and never need the scale again.
          </p>
          <p>
            The fastest shortcut: <strong className="text-[var(--c-text)] font-semibold">your closed fist is roughly 100g of cooked chicken breast.</strong> Two fists per meal, twice a day, you&apos;re in the zone. That intuition lasts forever.
          </p>
          <p>
            The reason this matters more than you think: when you eat enough protein and lift heavy in a slight deficit, your body burns fat <em>and</em> builds muscle at the same time. That&apos;s called recomposition. You don&apos;t have to choose between leaner and stronger. With enough protein, you get both.
          </p>
        </div>

        {/* ── PROGRESSIVE OVERLOAD ───────────────────────────────────────── */}
        <SectionHeader num="03" label="Progressive Overload" title={<>How muscle actually grows.</>} />
        <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)]">
          <p>
            Muscle is built by giving your body a reason to grow. The reason is stress. Specifically, more stress than you gave it last week. If you bench 135 lbs for 8 reps every week for a year, your body has no reason to change — you&apos;ve already adapted. You stay the same.
          </p>
          <p>
            <strong className="text-[var(--c-text)] font-semibold">Progressive overload is the rule that says: every two weeks, push past what you did before.</strong> A little more weight, a little more volume, a little more intensity. The body adapts upward.
          </p>

          <Callout>The cadence: weight up roughly every other week. 135 &rarr; 145 in two weeks. Boring, slow, undefeated.</Callout>

          <p>
            That doesn&apos;t mean every workout is a max effort. Most weeks are about <em>hitting</em> the weight you wrote down — clean form, full range of motion, every rep. Then every other week, you nudge it up.
          </p>
          <p>
            If you can&apos;t bump the weight, you can progress other ways:
          </p>
          <ul className="space-y-2 pl-6 list-disc marker:text-[#b0e455]">
            <li><strong className="text-[var(--c-text)] font-semibold">Add a rep.</strong> Same weight, one more rep than last time.</li>
            <li><strong className="text-[var(--c-text)] font-semibold">Add a set.</strong> Three sets becomes four.</li>
            <li><strong className="text-[var(--c-text)] font-semibold">Slow the negative.</strong> Take 3 seconds to lower the weight instead of dropping it.</li>
          </ul>
          <p>
            All four count. The point is the same — give the body a reason to keep growing.
          </p>
          <p>
            And the rule that holds the whole thing together: <strong className="text-[var(--c-text)] font-semibold">8 out of 10 intensity, minimum.</strong> If a set ended and you could&apos;ve done four more reps easily, that set didn&apos;t count. Push to where the last rep or two feels genuinely hard. That&apos;s the threshold the body responds to.
          </p>
        </div>

        {/* ── HOW THEY CONNECT ───────────────────────────────────────────── */}
        <SectionHeader num="04" label="How they connect" title={<>The three levers, together.</>} />
        <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)]">
          <p>
            Each of these alone does something. All three together is the whole thing.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#b0e455] mt-1.5 shrink-0 text-sm">→</span>
              <span><strong className="text-[var(--c-text)] font-semibold">Slight calorie deficit</strong> tells your body to use fat for fuel.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#b0e455] mt-1.5 shrink-0 text-sm">→</span>
              <span><strong className="text-[var(--c-text)] font-semibold">High protein</strong> tells it to keep the muscle while it&apos;s doing that.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#b0e455] mt-1.5 shrink-0 text-sm">→</span>
              <span><strong className="text-[var(--c-text)] font-semibold">Progressive overload in the gym</strong> tells it to <em>build</em> more muscle on top.</span>
            </li>
          </ul>
          <p>
            That&apos;s recomposition. Burning fat and building muscle at the same time. Most people are told this is impossible — that you have to bulk, then cut, then bulk again. That&apos;s outdated. Done right, you can run both directions at once for the first few years of serious training.
          </p>
          <p>
            You don&apos;t need to overthink any of this. <strong className="text-[var(--c-text)] font-semibold">Eat 300&ndash;400 below TDEE. Hit your protein. Push the weights up every two weeks. Do that for six months.</strong> The body that comes out the other side is the one you&apos;ve been trying to get for years.
          </p>
        </div>

        {/* ── Next ──────────────────────────────────────────────────────── */}
        <div className="mt-20 pt-10 border-t border-[var(--c-border)]">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-3">Up next</p>
          <Link href="/knowledge" className="group block">
            <p className="font-display text-xl md:text-2xl text-[var(--c-text)] leading-snug mb-2 group-hover:text-[#b0e455] transition-colors">
              Back to all modules →
            </p>
            <p className="text-[14px] text-[var(--c-text3)] leading-relaxed">
              More modules going live as I write them. Diet, training, and lifestyle are next.
            </p>
          </Link>
        </div>

      </article>
    </main>
  )
}
