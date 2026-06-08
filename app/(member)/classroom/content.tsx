import React from 'react'

/* ──────────────────────────────────────────────────────────────────────────
   Classroom content registry.

   This is the source of truth for the public classroom. Adding a new section
   (or filling in a "soon" one) is pure data entry below — no new components.

   Inline formatting inside any text string:
     **bold**   *italic*   `code`
   ────────────────────────────────────────────────────────────────────────── */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'callout'; text: string }

export type Module = {
  /** Stable anchor id, e.g. "fundamentals" → #fundamentals */
  id: string
  /** Short kicker, e.g. "Module One" */
  kicker: string
  title: string
  blocks: Block[]
}

export type Section = {
  num: string // "01"
  slug: string
  title: string
  tagline: string
  /** Intro paragraph shown in the section header. */
  summary: string
  status: 'ready' | 'soon'
  readTime?: string
  /** Optional blocks shown above the modules (the "in one breath" intro). */
  intro?: Block[]
  modules: Module[]
}

/* ── Sections ─────────────────────────────────────────────────────────────── */

export const SECTIONS: Section[] = [
  {
    num: '01',
    slug: 'the-game',
    title: 'The Game',
    tagline: 'How to get your desired aesthetic.',
    summary:
      "Fitness looks complicated, but it runs on a small number of levers. Once you understand them and build the intuition to pull them without thinking, the whole thing becomes effortless. That's the goal of this section.",
    status: 'ready',
    readTime: '6 min read',
    intro: [
      { type: 'p', text: '**The game in one breath:**' },
      {
        type: 'list',
        items: [
          'Two levers run everything: *calories in vs. out* (your weight) and *body fat vs. muscle* (your shape).',
          'You pull them with habits and a mindset, not obsessive tracking.',
          "Master the intuition once, and you've mastered it for life.",
        ],
      },
    ],
    modules: [
      {
        id: 'fundamentals',
        kicker: 'Module One',
        title: 'The Fundamentals',
        blocks: [
          { type: 'h3', text: 'The two levers' },
          { type: 'p', text: 'Everything you do comes back to two levers:' },
          {
            type: 'list',
            items: [
              '**Calories in vs. calories out** — controls your *weight*.',
              '**Body fat vs. muscle** — controls your *shape*. Picture a seesaw: fat on one end, muscle on the other.',
            ],
          },
          { type: 'p', text: 'Get a feel for these two and you understand the whole game.' },
          {
            type: 'quote',
            text: 'Your BMR is the baseline that ties this together: eat below it to lose weight, above it to gain.',
          },

          { type: 'h3', text: 'Lever 1 — Weight' },
          {
            type: 'p',
            text: "You *could* track every calorie and predict every meal perfectly. But that's not how life is actually lived. I've tried both the obsessive way and the loose way, and what wins long-term is sticking to a few principles and letting them become habits.",
          },
          { type: 'p', text: 'When you sit down to a meal:' },
          {
            type: 'list',
            items: [
              "Don't eat to the point of being too full.",
              "Make protein the priority — it's the most satiating macro, so it keeps you fuller for longer.",
              'Cut liquid calories wherever you can (Coke Zero is my go-to).',
              "Go easy on carbs and sweets — they hide far more calories than you'd guess.",
            ],
          },
          { type: 'p', text: 'Two mental models make this automatic:' },
          {
            type: 'list',
            items: [
              "**Trim carbs where it's easy.** Small example: I peel the fried coating off tempura. Tiny habit, real savings.",
              '**Ask "is this calorie worth it?"** A random box of cereal isn\'t — unless I planned for it. A great Italian meal absolutely is. Same filter, every time.',
            ],
          },
          {
            type: 'p',
            text: "And the part people get wrong: food is meant to be enjoyed, not restricted. Restriction isn't sustainable, full stop. I want something sweet after almost every meal — so if there's a dessert that's genuinely worth it, I have it. A mindless tub of ice cream? Easy pass. The whole skill is being *intentional*, not depriving yourself.",
          },

          { type: 'h3', text: 'Lever 2 — Body fat & muscle (recomposition)' },
          {
            type: 'p',
            text: "Changing your shape is a game of **recomposition** — shifting your body fat percentage. Losing fat while building muscle at the same time *is* recomposition. That's the language we're working in.",
          },
          { type: 'p', text: 'How it actually works is simple:' },
          {
            type: 'list',
            items: [
              'Protein builds muscle, and muscle is what recomposition is made of.',
              'When you train, your muscles break down and fatigue.',
              'Protein is what repairs them and brings them back stronger.',
            ],
          },
          { type: 'p', text: 'So the play is just: work the muscle, then feed it protein to recover.' },
          {
            type: 'callout',
            text: '**Aim for ~0.8g of protein per pound of bodyweight.** I used to follow the old 1:1 rule, but 0.8 is the real sweet spot.',
          },
          { type: 'p', text: 'In practice, that means:' },
          {
            type: 'list',
            items: [
              "Anchor every meal around protein — it's the star of the plate by volume. Carbs are a condiment.",
              'Lean on the proteins that give you the most per calorie: chicken breast, ground beef, salmon.',
              'Protein powder is a fine way to fill the gaps — build your diet so it has a natural place.',
            ],
          },

          { type: 'h3', text: 'The whole game, summed up' },
          {
            type: 'p',
            text: "Two levers. The art is putting them into a sustainable lifestyle of habits that point at *your* specific goal. Once pulling those levers becomes intuitive, you've mastered the game.",
          },
        ],
      },
      {
        id: 'building-intuition',
        kicker: 'Module Two',
        title: 'Building Intuition',
        blocks: [
          {
            type: 'quote',
            text: "\"The thing I'm most proud of in my fitness journey is how effortless it's become — and that's because I've mastered the game. This is the game, and this is how you get good at it.\"",
          },
          {
            type: 'p',
            text: 'You know what the game looks like now. Building real intuition happens in two levels.',
          },

          { type: 'h3', text: 'Level 1 — The principles (beginner)' },
          { type: 'p', text: 'Run on the broad rules of thumb:' },
          {
            type: 'list',
            items: [
              'Fewer carbs on a cut, more on a bulk.',
              'Anchor every meal around protein.',
              'Apply the "is it worth it?" filter.',
            ],
          },

          { type: 'h3', text: 'Level 2 — The measuring (advanced)' },
          {
            type: 'p',
            text: "To truly lock it in, spend at least **one month tracking every calorie.** Do that once and the intuition stays with you for life. You'll learn what portions actually look like, and you'll never fully need the app again.",
          },
          { type: 'p', text: 'You\'ll want two tools:' },
          {
            type: 'list',
            items: [
              '**MyFitnessPal** for logging.',
              'A **food scale** — weigh everything, including delivery.',
            ],
          },
          {
            type: 'p',
            text: "Run both levels and you've completed the progression that makes fitness effortless.",
          },

          { type: 'h3', text: "How to know it's working" },
          {
            type: 'list',
            items: [
              'Give it time: changes take roughly two weeks to a month to show, depending on where you\'re starting.',
              'The scale is one signal. Body composition scans (InBody, or whatever you can access) help, especially when maintaining.',
              'But the real test is the mirror. The numbers guide you; the mirror tells you the truth — your shape, your confidence, the way it feels to look up and think *"damn, I look good."* Eventually you\'ll just *feel* when you\'ve drifted up a little in body fat, and you\'ll dial protein back in and hold steady.',
            ],
          },
        ],
      },
      {
        id: 'troubleshooting',
        kicker: 'Module Three',
        title: 'Troubleshooting & Plateaus',
        blocks: [
          {
            type: 'p',
            text: "If you're not hitting your goals, the diagnosis is almost always the same: your intuition is off somewhere. Start there.",
          },
          { type: 'p', text: 'The usual culprits:' },
          {
            type: 'list',
            items: [
              "**You're miscounting (or fooling yourself).** Trying to lose weight and the scale won't move? You're almost certainly eating more than you think. Check this first, honestly.",
              "**You're not pushing hard enough in the gym.**",
              "**You haven't given it enough time.** Don't expect a month's worth of change in two weeks.",
            ],
          },
        ],
      },
    ],
  },

  {
    num: '02',
    slug: 'diet',
    title: 'Diet',
    tagline: 'Hydration, food choices, and the habits that run nutrition.',
    summary:
      'The nutrition system in full — how to eat for recomposition without macros or meal plans. Hydration, protein staples, smart swaps, and the rest of the habits that make it automatic.',
    status: 'soon',
    modules: [],
  },
  {
    num: '03',
    slug: 'fitness',
    title: 'Fitness',
    tagline: 'Training that builds the look — PPL, intensity, progressive overload.',
    summary:
      'How to train for aesthetics: the split, the exercises that move the needle, intensity, and the progressive-overload cadence that keeps you growing.',
    status: 'soon',
    modules: [],
  },
  {
    num: '04',
    slug: 'lifestyle',
    title: 'Lifestyle',
    tagline: 'Sleep, walking, stress — the work that happens outside the gym.',
    summary:
      'The multipliers most people ignore. Sleep as a training variable, walking over cardio, and managing stress so the levers actually work.',
    status: 'soon',
    modules: [],
  },
  {
    num: '05',
    slug: 'bonus-resources',
    title: 'Bonus Resources',
    tagline: 'The deeper cuts: full walkthroughs, supplementation, and edge cases.',
    summary:
      'Extra material once the fundamentals are running. Start with the original long-form walkthrough of the system; more deep cuts (sleep, stress and cortisol, supplementation) land here over time.',
    status: 'ready',
    readTime: '6 min read',
    modules: [
      {
        id: 'the-full-game-explained',
        kicker: 'Bonus Module',
        title: 'The Full Game Explained',
        blocks: [
          {
            type: 'p',
            text: "There are three levers underneath everything I'll teach you: **BMR, protein, and progressive overload**. Get these three right and the rest of the system runs itself. Get them wrong and nothing else matters.",
          },

          { type: 'h3', text: 'BMR — How much you should eat' },
          {
            type: 'p',
            text: "BMR is Basal Metabolic Rate — the number of calories your body burns just keeping you alive. Breathing, thinking, keeping your heart going. If you sat in a chair all day and did nothing, this is what you'd burn.",
          },
          {
            type: 'p',
            text: "Add activity on top of that — walking, working, training — and you get your **TDEE** (Total Daily Energy Expenditure). That's the real number we care about. That's how much you actually burn in a day.",
          },
          {
            type: 'p',
            text: "**Eat at TDEE → you stay the same. Eat below it → you lose fat. Eat above it → you gain.** That's the whole game on the food side. Everything else is execution.",
          },
          {
            type: 'callout',
            text: 'To lose fat without losing muscle, eat 300–400 calories below your TDEE. Not 1,000. Not "as little as possible."',
          },
          {
            type: 'p',
            text: 'Why 300–400 and not more? Bigger deficits feel faster but they cost you muscle, sleep, energy in the gym, and mood. You stop being able to push the weights, you stop progressing, you fall off in two weeks. A smaller deficit you can hold for six months will always beat a brutal one you hold for three.',
          },
          {
            type: 'p',
            text: "**Calculate it once. Then forget about it.** Use any calculator online — they're all close enough. Plug in your weight, height, age, and rough activity level. Subtract 300–400 from the TDEE. That's your target. Mine was 2,200. We don't recalculate every week.",
          },

          { type: 'h3', text: 'Protein — The anchor of every meal' },
          {
            type: 'p',
            text: "Protein is the lever that lets you cut fat without losing muscle. It's also the most satiating macro — gram for gram, it keeps you fuller longer than carbs or fat. So it does two jobs at once: it protects your muscle while you're eating less, and it makes eating less actually bearable.",
          },
          {
            type: 'p',
            text: "**The target: roughly 1g of protein per pound of bodyweight.** If you weigh 170 lbs, you're aiming for ~170g of protein a day. You don't have to be perfect — being within 20g is fine — but if you're consistently 50g under, the whole thing breaks.",
          },
          {
            type: 'callout',
            text: 'Anchor every meal around protein first. Build the rest of the plate around it.',
          },
          {
            type: 'p',
            text: "The simplest version: chicken breast or ground beef at least once per meal, eggs as a side. That covers most of the day. If you eat twice, that's two servings of meat plus a few eggs and you're close.",
          },
          {
            type: 'p',
            text: "For the first 4–8 weeks, **buy a cheap kitchen scale and weigh your protein.** Not forever. Just long enough to build an intuition for what a portion actually looks like. After a month you'll be able to eyeball it and never need the scale again.",
          },
          {
            type: 'p',
            text: 'The fastest shortcut: **your closed fist is roughly 100g of cooked chicken breast.** Two fists per meal, twice a day, you\'re in the zone. That intuition lasts forever.',
          },
          {
            type: 'p',
            text: "The reason this matters more than you think: when you eat enough protein and lift heavy in a slight deficit, your body burns fat *and* builds muscle at the same time. That's called recomposition. You don't have to choose between leaner and stronger. With enough protein, you get both.",
          },

          { type: 'h3', text: 'Progressive Overload — How muscle actually grows' },
          {
            type: 'p',
            text: "Muscle is built by giving your body a reason to grow. The reason is stress. Specifically, more stress than you gave it last week. If you bench 135 lbs for 8 reps every week for a year, your body has no reason to change — you've already adapted. You stay the same.",
          },
          {
            type: 'p',
            text: '**Progressive overload is the rule that says: every two weeks, push past what you did before.** A little more weight, a little more volume, a little more intensity. The body adapts upward.',
          },
          {
            type: 'callout',
            text: 'The cadence: weight up roughly every other week. 135 → 145 in two weeks. Boring, slow, undefeated.',
          },
          {
            type: 'p',
            text: "That doesn't mean every workout is a max effort. Most weeks are about *hitting* the weight you wrote down — clean form, full range of motion, every rep. Then every other week, you nudge it up.",
          },
          { type: 'p', text: "If you can't bump the weight, you can progress other ways:" },
          {
            type: 'list',
            items: [
              '**Add a rep.** Same weight, one more rep than last time.',
              '**Add a set.** Three sets becomes four.',
              '**Slow the negative.** Take 3 seconds to lower the weight instead of dropping it.',
            ],
          },
          { type: 'p', text: 'All four count. The point is the same — give the body a reason to keep growing.' },
          {
            type: 'p',
            text: "And the rule that holds the whole thing together: **8 out of 10 intensity, minimum.** If a set ended and you could've done four more reps easily, that set didn't count. Push to where the last rep or two feels genuinely hard. That's the threshold the body responds to.",
          },

          { type: 'h3', text: 'How they connect — The three levers, together' },
          { type: 'p', text: 'Each of these alone does something. All three together is the whole thing.' },
          {
            type: 'list',
            items: [
              '**Slight calorie deficit** tells your body to use fat for fuel.',
              "**High protein** tells it to keep the muscle while it's doing that.",
              '**Progressive overload in the gym** tells it to *build* more muscle on top.',
            ],
          },
          {
            type: 'p',
            text: "That's recomposition. Burning fat and building muscle at the same time. Most people are told this is impossible — that you have to bulk, then cut, then bulk again. That's outdated. Done right, you can run both directions at once for the first few years of serious training.",
          },
          {
            type: 'p',
            text: "You don't need to overthink any of this. **Eat 300–400 below TDEE. Hit your protein. Push the weights up every two weeks. Do that for six months.** The body that comes out the other side is the one you've been trying to get for years.",
          },
        ],
      },
    ],
  },
]

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug)
}

export function getModule(
  sectionSlug: string,
  moduleId: string
): { section: Section; module: Module; index: number } | undefined {
  const section = getSection(sectionSlug)
  if (!section) return undefined
  const index = section.modules.findIndex((m) => m.id === moduleId)
  if (index === -1) return undefined
  return { section, module: section.modules[index], index }
}

/* ── Inline + block renderers ─────────────────────────────────────────────── */

/** Renders **bold**, *italic*, and `code` inside a plain string. */
export function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[var(--c-text)] font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-[var(--c-card2)] px-1.5 py-0.5 text-[0.9em] text-[var(--c-text)]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[var(--c-text)]">
          {part.slice(1, -1)}
        </em>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'h3':
      return (
        <h3 className="font-display text-xl md:text-2xl text-[var(--c-text)] leading-snug pt-6 first:pt-0">
          {renderInline(block.text)}
        </h3>
      )
    case 'p':
      return <p>{renderInline(block.text)}</p>
    case 'list':
      return (
        <ul className="space-y-2 pl-6 list-disc marker:text-[#b0e455]">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-[var(--c-border2)] pl-5 italic text-[var(--c-text3)]">
          {renderInline(block.text)}
        </blockquote>
      )
    case 'callout':
      return (
        <div className="my-2 border-l-2 border-[#b0e455] pl-5 py-1">
          <p className="font-display text-lg md:text-xl leading-snug text-[var(--c-text)]">
            {renderInline(block.text)}
          </p>
        </div>
      )
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)]">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  )
}
