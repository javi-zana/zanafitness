# ZANA App Overhaul

A full restructure of both surfaces around how Javi actually coaches.

- **Client app** (members) — collapses to **5 sections**: Reports · Program · Curriculum · Calls · Weekly Check-in
- **Coach tool** (`ai.zanafitness.com`) — where Javi runs everything; standalone, password-gated. Scoped later.

Both share one Supabase backend. This supersedes parts of the earlier "rewrite v1" plan (Messaging, Community, and continuous Stats logging are being dropped/changed — see Decisions needed).

---

## ✅ Decisions (resolved 2026-06-08)

- **Stats** — the **weekly check-in replaces** continuous stat logging. Remove `/stats`. (Supersedes the old "My Stats" continuous-logging model.)
- **Feed / activity log** — removed.
- **Curriculum** — `/curriculum` (the data-driven 5-section version) is **canon**; gate it **members-only**; retire the old member `/knowledge/the-full-game` page. Members only.
- **Tiers** — two tiers; the *only* difference is **call booking**: VIP can book calls with Javi on demand, standard cannot. Stored on `profiles.tier`.
- **Weekly check-in fields** — defined (see section B.5).

---

## A. Foundation & cleanup

**Strategy:** strip only the *member* surface now. Leave coach side, API routes, the Activity components, and DB tables in place (coach still uses them; reversible). Login landing stays `/dashboard`.

### A1. Member cleanup (IN PROGRESS)
- [ ] Rewire **BottomNav** → 5 tabs: `Home · Program · Curriculum · Calls · Check-in`; remove the messages-unread logic
- [ ] Remove **Messages** (member) — delete `app/(member)/messages`, drop from nav + dashboard, drop `/messages` from `memberPaths`
- [ ] Remove **Stats** (member) — delete `app/(member)/stats`, drop "Track" tab, drop `/stats` from `memberPaths`
- [ ] Remove **Activity feed** from member Home — drop the feed, `ActivityCard`, `useActivityRealtime`, streak, achievements from the dashboard
- [ ] Rework `/dashboard` (Home) into a clean hub: keep OKR + referral, add "this week's report" placeholder + links to Program/Curriculum
- [ ] Create `/calls` (member) — move the Cal.com booking here (VIP gating later)
- [ ] Create `/checkin` (member) — placeholder until the form is built

### A2. Deferred to their workstreams (not in cleanup)
- [ ] **Reports** gets its own nav tab once the `reports` table + view exist (B.1) — lives on Home for now
- [ ] **Curriculum** consolidation: tab points at `/knowledge` for now; gate `/curriculum` + retire `/knowledge` in B.3
- [ ] Remove API routes + drop DB tables for messages/activities — only after coach side is rebuilt
- [ ] Add **membership tier** to `profiles` (standard / VIP) — with Calls gating (B.4)

## B. Client side — the 5 sections

### 1. Reports (NEW)
- [ ] Member-facing report view — read from the `reports` table (created by the coach tool)
- [ ] List of past reports + open one (rendered with the report template)
- [ ] Entry from a shareable link too (`/r/<token>`) for non-app delivery
- *Depends on:* coach tool report builder + `reports` table (workstream C)

### 2. Program (EXISTS — keep, light polish)
- [ ] Keep OKR (objective + 3 KRs) + Split / Food + Principles, read-only for member
- [ ] Confirm "Habits" stays removed; verify program view matches current data model

### 3. Curriculum (consolidate → members-only)
- [ ] Make `/curriculum` the single canon; gate it **members-only** (add to `memberPaths`)
- [ ] Retire member `/knowledge/the-full-game` (point nav/links at `/curriculum`)
- [ ] Write Section 2: Diet
- [ ] Write Section 3: Fitness
- [ ] Write Section 4: Lifestyle
- [ ] Write Section 5: Bonus Resources
- [ ] (Later) per-member read/progress state, video player component

### 4. Calls (was "Schedule")
- [ ] View upcoming calls (Cal.com data — booking integration already partly exists)
- [ ] **VIP** members can book a call on demand; **standard** cannot (gate by `profiles.tier`)
- [ ] Standard: view-only / upsell state

### 5. Weekly Check-in (NEW — build soon)
- [ ] Member submit form with these fields:
  - **Morale** (1–10): how happy with your progress?
  - **Program changes needed?** (Yes/No + details)
  - **Ratings (1–10):** Sleep quality · Energy · Strength · Stress · Workout adherence · Nutrition adherence
  - **Weight change**
  - **Went off-plan?** (Yes → explain)
  - **One thing you're proud of**
  - **One thing you can improve**
  - **Final comments / questions / concerns**
- [ ] Store check-ins (`weekly_checkins` table)
- [ ] Surface latest check-in to the coach tool (feeds report generation)

## C. Coach side — `ai.zanafitness.com` (scope later)

- [x] Phase 0: subdomain + password wall + shell *(done — pending `AI_TOOL_PASSWORD` + deploy)*
- [ ] Client list + record screen (read goals/intake/notes/data from Supabase)
- [ ] Add/keep notes (reuse `coach_notes`)
- [ ] `reports` table + report builder (Claude generation, references goals + curriculum)
- [ ] Editable preview + Send (Resend email + shareable link)
- [ ] Review check-ins; (later) calls management, tiers admin

---

## Cross-cutting / shared
- [x] `reports` table — migration `20260608000001_reports.sql`
- [x] `weekly_checkins` table — migration `20260608000002_weekly_checkins.sql`
- [x] `profiles.tier` — migration `20260608000003_profiles_tier.sql`
- [ ] **Apply** the three migrations to prod (`supabase db push`)
- [ ] (Later, with coach rebuild) DROP migration for messages/threads, activities/*, stat_updates/calorie_logs/workout_logs/member_milestones
- [ ] Keep PWA "add to home screen" feel on mobile throughout
