# Zana — UX Research & Design Principles

**Status:** Draft v1 · for discussion
**Owner:** Javi Lorenzana
**Last updated:** 2026-05-01
**Companion to:** [PRD.md](./PRD.md)

---

## 0. How to read this doc

The first half is a compact summary of the design principles I think should govern the rewrite. The second half ([§7 Recommended insights](#7-recommended-insights-to-implement)) is the actionable part — concrete things to consider doing, organized by app surface, each mapped back to a principle. **Go through §7 and mark each item ✅ keep / ❌ skip / 🤔 discuss.** That's what we'll use to drive implementation.

The bias throughout: **simplicity and ease of use beat power and completeness.** When in doubt, cut.

---

## 1. Foundational principles

### 1.1 Nielsen's 10 usability heuristics
The 30-year-old standard. Most relevant for us, in priority order:

1. **Visibility of system status** — users always know what's happening (saving, sent, loading, offline).
2. **Match the real world** — speak the user's language ("Last weighed Tuesday," not "Last weight log: 2026-04-28T14:32:00Z").
3. **User control & freedom** — undo, escape hatches, no dead ends.
4. **Consistency & standards** — same thing looks/behaves the same everywhere.
5. **Error prevention** — design so the error can't happen (disable submit until valid; confirm destructive actions).
6. **Recognition over recall** — show options, don't make users remember.
7. **Flexibility & efficiency** — accelerators for power users (Javi) without burdening newcomers (members).
8. **Aesthetic & minimalist design** — every extra unit of information competes with relevant information.
9. **Help users recover from errors** — plain language, suggest a fix.
10. **Help & documentation** — if needed, make it findable; better, design so it isn't needed.

### 1.2 Don Norman — affordances, signifiers, feedback
- **Affordance:** what an object lets you do (a button can be tapped).
- **Signifier:** the visual cue that tells you so (the button looks tappable).
- **Feedback:** the system tells you what just happened (haptic, animation, toast, state change).
- **Mapping:** controls map naturally to outcomes (slider up = bigger).
- **Constraints:** prevent invalid states (date picker won't let you pick yesterday).

### 1.3 Laws of UX (Yablonski)
- **Hick's Law:** more options = slower decisions. Limit choices, group, defer.
- **Fitts's Law:** bigger + closer targets = faster taps. Critical for thumbs.
- **Jakob's Law:** users expect your app to work like the apps they already know (iMessage, Instagram, Notes). Don't reinvent patterns.
- **Miller's Law:** ~7 items in working memory. Chunk lists.
- **Doherty Threshold:** sub-400ms feedback or it feels broken.
- **Peak-End Rule:** people remember the most intense moment and the end. Polish those.

---

## 2. Simplicity principles (the bias we're optimizing for)

### 2.1 Cognitive load management
The brain has limited working memory. Every element on screen taxes it. Reduce by:
- **Progressive disclosure** — show essentials first, reveal depth on demand. (Coined by Nielsen, 1995.)
- **Hierarchy** — one primary action per screen, secondary actions visually demoted.
- **Chunking** — break long tasks/lists into ≤5–7 grouped items.
- **Defaults** — pre-fill the most likely answer; reduce the number of decisions per screen.

### 2.2 The "ease of use" stack (most → least impactful)
1. **Don't ask at all.** The fastest interaction is the one that doesn't happen.
2. **Ask once, infer forever.** Default thereafter.
3. **One tap.** Single primary action, thumb-reachable.
4. **Two taps with a clear path.** Accept friction only when it prevents an error.
5. **Free text last.** Typing on mobile is the highest-friction input.

### 2.3 Empty states are anti-friction
A blank screen is a moment of doubt. Every empty state should answer **"what now?"** with one obvious next action. Treat them as onboarding, not error states.

### 2.4 Reduce, then refine
> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." — Saint-Exupéry

For the rewrite specifically: every feature in the existing 1,800-line MemberDashboard is on trial. The default is **delete**, and the burden of proof is on keeping it.

---

## 3. Mobile-first & PWA principles

### 3.1 The thumb zone (Steven Hoober)
- 49% of users hold the phone one-handed; ~75% of taps are thumb-driven.
- **Green zone** (bottom-center, easy reach): primary navigation + main CTAs.
- **Yellow zone** (mid-screen sides): secondary actions.
- **Red zone** (top corners): only for things you want users to *not* tap accidentally (e.g., destructive actions).
- **Implication for us:** bottom tab bar for the 5 sections. Avoid hamburger menus.

### 3.2 Touch targets
- Minimum 44×44pt (Apple HIG) / 48×48dp (Material). We should default to 48 and treat anything smaller as a bug.
- Spacing between targets matters as much as size — adjacent small targets cause mistaps.

### 3.3 PWA-specific UX
- **Install prompt:** ask after the user has had a positive experience, not on first load. Show value first.
- **Offline behavior:** every screen needs a defined offline state. Read-mostly screens (Program, Stats history) should cache aggressively. Write screens (log weight, send message) should queue and sync.
- **iOS Safari constraints:** no real push, limited background. Don't design flows that depend on either.
- **Look native:** safe-area insets, no browser chrome leaking through, proper status bar styling.

### 3.4 Performance is UX
- **Doherty threshold (400ms)** is the perception-of-instant cutoff. Optimistic UI, skeleton loaders, route prefetching.
- **First Input Delay** matters more than load time on a PWA — users tap fast.

---

## 4. Domain principles — fitness coaching apps

### 4.1 What actually drives retention
Industry data from fitness app studies:
- **Onboarding under 60 seconds** can lift retention ~50%.
- **Personalization** lifts engagement ~74%, retention up to 50%.
- **Visual progress** generates ~3× the repeat usage of social features.
- **Streaks + visible progress + small wins** outperform big-bang gamification.

### 4.2 Behavior change — Fogg's B = MAT
A behavior happens when **Motivation**, **Ability**, and **Trigger** converge.
- We can't manufacture motivation, but we can **maximize ability** (make logging trivially easy) and **place triggers** (gentle nudges, the existing 3-day no-update rule).
- "Tiny habits" — make the starting action absurdly small. Logging weight should be one tap to open, one to save.

### 4.3 Habit anchoring
Pair the app with a moment the user already repeats (morning weigh-in, post-workout). Onboarding should literally ask: *"When during your day will you log this?"*

### 4.4 The coaching relationship is the product
Unlike B2C fitness apps, our retention driver isn't gamification — it's the felt presence of the coach. Every design choice should reinforce that: messages feel personal, programs feel hand-written (because they are), the coach's voice is visible.

---

## 5. Coach dashboard principles

The coach side is a **professional tool**, not a consumer app. Different rules apply:

- **At-a-glance triage** — within 5 seconds of opening, Javi should know who needs attention.
- **Prioritize warnings & actionable items** — surface members who haven't logged, haven't replied, hit a milestone, or flagged something. The dashboard's job is to direct attention, not display data.
- **≤5–6 cards** in the initial view. Anything more becomes a wall.
- **F-pattern / Z-pattern scanning** — most important info top-left.
- **One screen, no scroll-hunting** for the primary triage view. Drill down for detail.
- **Bulk actions matter** — coaches deal with N members. Single-member-at-a-time UX scales poorly.

---

## 6. Messaging principles (relevant to /messages)

- **Sticky composer** — input bar always reachable, never moves.
- **Familiar patterns** (Jakob's Law) — bubbles, timestamps, read receipts. Don't get clever.
- **Group chat clarity** — color/initials per sender, since one thread will eventually have multiple coaches + AI.
- **Read state** — both coach and member should know what's been seen. Reduces "did they get my message" anxiety on both sides.
- **Reply-to-message** — preserves thread context when conversations get long.
- **Optimistic send** — message appears instantly, with a delivery indicator that resolves async.

---

## 7. Recommended insights to implement

This is the punch list. **Read each item and decide ✅/❌/🤔.** Each is tagged with the principle it derives from.

### 7.1 Global / cross-app

| # | Insight | Why | Decision |
|---|---|---|---|
| G1 | **Bottom tab bar** with the 5 member sections; coach dashboard uses a top tab/segmented control inside one screen. | Thumb zone (§3.1), Jakob's Law (§1.3). Hamburger menus are red-zone and hide IA. | |
| G2 | **One primary action per screen.** Visually dominant, thumb-reachable, never two competing CTAs. | Hick's Law, hierarchy (§2.1). | |
| G3 | **48px minimum touch targets**, ≥8px spacing. Audit existing UI as a single sweep. | Fitts's Law (§3.2). | |
| G4 | **Optimistic UI everywhere writes happen** (log weight, send message, post to community). State updates instantly; sync resolves in background with a subtle indicator. | Doherty threshold (§1.3, §3.4). | |
| G5 | **Skeleton loaders, not spinners**, for any load >200ms. | Visibility of status (§1.1). | |
| G6 | **Defined offline state per screen**, with a clear banner ("You're offline — changes will sync when you're back"). Queue writes; never lose user input. | PWA UX (§3.3). | |
| G7 | **Defer the install prompt** until after the user has logged something or read their program once. Not on first load. | PWA UX (§3.3). | |
| G8 | **Empty states answer "what now?"** with one obvious next action — for every list, every tab, every brand-new account. | Empty states (§2.3). | |
| G9 | **Plain-language timestamps everywhere** ("Tuesday," "2 days ago," "Just now") instead of ISO timestamps. | Match real world (§1.1). | |
| G10 | **Undo for destructive actions** (delete a stat entry, delete a community post). 5-second toast with Undo, not a confirm modal. | User control (§1.1, Gmail pattern). | |
| G11 | **Consistent component library** — one button, one input, one card. Document them, then enforce. | Consistency (§1.1). | |
| G12 | **Respect safe-area insets and iOS Safari quirks** so the installed PWA doesn't feel like a website. | PWA UX (§3.3). | |

### 7.2 /stats (My Stats)

| # | Insight | Why | Decision |
|---|---|---|---|
| S1 | **One-tap log** — opening /stats puts the cursor in the weight input by default. Big "Save" button in the green zone. Nothing else above the fold. | Tiny habits, ease-of-use stack (§2.2, §4.2). | |
| S2 | **Pre-fill last value** as the default in the weight input. Tapping changes it; not tapping submits last value. | Defaults reduce decisions (§2.1). | |
| S3 | **Confidence + milestone collapse behind "Add note"** — only weight is the foreground action. Other fields are progressive disclosure. | Progressive disclosure (§2.1). | |
| S4 | **Visible streak + sparkline** as the second screen element. Visual progress is the #1 retention driver. | §4.1. | |
| S5 | **"Last weighed Tuesday" headline** in plain language; show the 3-day-no-update nudge inline (gentle, never red/scary). | Match real world (§1.1), Fogg trigger (§4.2). | |
| S6 | **Onboarding question: "When do you usually weigh in?"** — anchors the habit and informs nudge timing later. | Habit anchoring (§4.3). | |

### 7.3 /program (My Program)

| # | Insight | Why | Decision |
|---|---|---|---|
| P1 | **Tabs render as a horizontal scroll-snap row** (Split / Food / Habits / Principles), not a dropdown. Sticky on scroll. | Recognition over recall (§1.1), Jakob's Law. | |
| P2 | **Read mode is the default**, not edit mode. Most program views are members reading; editing is rare and coach-only. | Hierarchy, defaults (§2.1). | |
| P3 | **Typography is the design** — this section is mostly long-form rich text. Optimize line length (60–75ch), line height (1.5–1.7), font weight contrast. | Aesthetic minimalism (§1.1). | |
| P4 | **Last-updated stamp** at the top of each tab in plain language ("Updated by Javi 3 days ago"). Reinforces the coaching relationship. | §4.4. | |
| P5 | **Principles tab is read-only for members, edited only by head coach.** Visually distinguish it (subtle accent) so it feels like a reference doc, not a personal plan. | Constraints (§1.2). | |
| P6 | **Aggressive offline cache** for /program — it's read-mostly and members reference it mid-workout. | PWA (§3.3). | |

### 7.4 /messages

| # | Insight | Why | Decision |
|---|---|---|---|
| M1 | **iMessage-style layout** — bubbles, sticky composer at bottom, auto-scroll to latest, infinite-scroll up for history. Don't reinvent. | Jakob's Law (§1.3). | |
| M2 | **Optimistic send** with a single-tick "sent" / double-tick "read" indicator. | §1.1, §6. | |
| M3 | **Color/initial per sender** in the bubble header (not the bubble fill) — preps for multi-coach + AI later. | §6. | |
| M4 | **Long-press a message → reply, copy, react** (sheet from bottom). Familiar pattern; thumb-zone friendly. | §3.1. | |
| M5 | **Typing indicator** — small but disproportionately important for the "felt presence" of the coach. | §4.4. | |
| M6 | **No notifications system in v1**, but design the message list so the unread count and last-message preview is instantly scannable when the member opens the app. | Out of scope for v1, but compensates. | |

### 7.5 /community

| # | Insight | Why | Decision |
|---|---|---|---|
| C1 | **Sub-tabs (Announcements / Wins / Random)** at the top, sticky. Each tab is its own scroll. | Chunking (§2.1). | |
| C2 | **Compose is a floating action button** in the green zone. Single tap → composer sheet. | Thumb zone (§3.1). | |
| C3 | **Announcements are visually distinct** (subtle pinned/banner style) and read-only for members — mirrors the head-coach role. | Constraints, hierarchy. | |
| C4 | **Wins tab celebrates** — small visual reinforcement (subtle confetti or accent on a new post). Tied to peak-end rule. | §1.3, §4.1. | |
| C5 | **Empty state for Wins:** "Be the first to share — even a small win counts." Action-oriented, low pressure. | Empty states (§2.3). | |

### 7.6 /schedule

| # | Insight | Why | Decision |
|---|---|---|---|
| SC1 | **Embedded Calendly inline**, not a "Book a call" button that opens a modal that opens Calendly. Reduce taps. | Ease-of-use stack (§2.2). | |
| SC2 | **Show next booked call prominently** above the booking widget, in plain language. ("Your next call: Thursday 3pm with Javi.") | Match real world (§1.1). | |
| SC3 | **If no upcoming call**, the widget is the empty state's primary action — no separate "book now" CTA. | Empty states (§2.3). | |

### 7.7 Coach dashboard (/coach)

| # | Insight | Why | Decision |
|---|---|---|---|
| CD1 | **Triage strip at top** — list of members who need attention, sorted by urgency (no log in 3+ days, unread message, milestone hit). Each row is one-tap to that member's view. | At-a-glance prioritization (§5). | |
| CD2 | **≤5 cards in the initial view.** Default cards: Needs attention, Recent messages, Recent wins, Today's calls, Quick stats. Anything else is a drill-down. | §5. | |
| CD3 | **Per-member view is a single scroll** — stats summary, current program, recent messages, scheduled calls. No tab switching for the most common task. | Reduce navigation cost. | |
| CD4 | **Inline edit for program tabs** from the coach view — not a separate "edit program" page. | Recognition over recall (§1.1). | |
| CD5 | **Bulk-message capability** (broadcast to a coach's full member list) — but visually distinct from a normal message so it's never sent by accident. | Bulk actions (§5), error prevention (§1.1). | |
| CD6 | **Head-coach-only actions** (invite member, post Announcement, edit Principles) are visually scoped to a single area, not sprinkled. Respects role boundaries and reduces accidental clicks. | Constraints (§1.2). | |
| CD7 | **Search/filter member list** — coaches will eventually have 20+ members; the list needs filter + search by default, even with N=5 today. | Scale-ready, recognition over recall. | |
| CD8 | **Coach view is desktop-first**, member view is mobile-first. Different shapes for different jobs. (Still responsive both ways.) | §5 — coach is a pro tool. | |

### 7.8 Onboarding (member)

| # | Insight | Why | Decision |
|---|---|---|---|
| O1 | **First session under 60 seconds to a useful state.** Must do: name, goal one-liner, weigh-in time. Everything else is deferred. | §4.1. | |
| O2 | **First action after signup is logging a stat**, not reading a tour. Empty states across the app then guide the rest. | Tiny habits (§4.2). | |
| O3 | **"Save to Home Screen" prompt** triggers after first stat is logged + program is opened — i.e., after the user has felt the value. | §3.3. | |

---

## 8. Open questions for discussion

These are choices we should make explicitly before building, but I don't have a strong default:

1. **Streak vs. consistency-rate framing.** Streaks are sticky but punishing (one missed day breaks them). Consistency rate (e.g., "5 of last 7 days") is forgiving but less viscerally motivating. Which fits Javi's coaching philosophy?
2. **Weight unit defaults.** Ask once at onboarding (lb/kg) and never again, or per-entry toggle? Lean: ask once.
3. **Message threading vs. flat thread.** PRD says single thread per member with all coaches. Do replies-to-messages (M4) preserve enough context, or do we need full threads? Lean: replies are enough for v1.
4. **Coach dashboard density.** Card-based (CD2) vs. table-based for the triage strip. Tables scale better past 20 members; cards read better at 5. Lean: cards now, table later.
5. **Tone of nudges.** "You haven't weighed in for 3 days" can read as scolding or supportive depending on copy. Worth a pass on voice/tone guidelines before any nudge ships.

---

## Sources

Foundational principles
- [10 Usability Heuristics for User Interface Design — Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Don Norman's Principles of Interaction Design](https://medium.com/@sachinrekhi/don-normans-principles-of-interaction-design-51025a2c0f33)
- [Affordances — Interaction Design Foundation](https://ixdf.org/literature/topics/affordances)
- [Laws of UX (Yablonski)](https://lawsofux.com/)

Simplicity & cognitive load
- [Progressive Disclosure — Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- [What is Progressive Disclosure? — Interaction Design Foundation](https://ixdf.org/literature/topics/progressive-disclosure)

Mobile & PWA
- [The Thumb Zone: Designing For Mobile Users — Smashing Magazine](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)
- [Designing For Thumb Zones: Mobile UX in 2025](https://diversewebsitedesign.com.au/designing-for-thumb-zones-mobile-ux-in-2025/)
- [Best practices for PWAs — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)

Fitness app domain
- [Best UX/UI practices for fitness apps — Dataconomy](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/)
- [How to Design a Fitness App — Zfort](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)
- [UX Design Principles From 5 Top Health and Fitness Apps — Superside](https://www.superside.com/blog/ux-design-principles-fitness-apps)

Behavior change
- [Designing Apps for Behavior Change — TrackMind](https://www.trackmind.com/designing-apps-behavior-change/)
- [What Designers Get Wrong About Habit Loops](https://medium.com/design-bootcamp/what-designers-get-wrong-about-habit-loops-and-how-to-fix-it-6fd47be714d2)

Dashboards & messaging
- [From Data To Decisions: UX Strategies For Real-Time Dashboards — Smashing Magazine](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)
- [Dashboard Design Principles — UXPin](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [UI/UX Best Practices for Chat App Design — CometChat](https://www.cometchat.com/blog/chat-app-design-best-practices)
- [Chat UX Best Practices — Stream](https://getstream.io/blog/chat-ux/)
- [Empty State UX — Pencil & Paper](https://www.pencilandpaper.io/articles/empty-states)
