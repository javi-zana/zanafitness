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
- [x] Reworked landing → Reports is the first tab (`/dashboard` redirects to `/reports`)
- [x] Create `/calls` (member) — Cal.com booking moved here (VIP gating later)
- [x] Create `/checkin` (member) — now a real form (see B.5)

### A2. Deferred to their workstreams (not in cleanup)
- [x] **Reports** is now its own landing tab (B.1 shipped)
- [ ] **Classroom** (curriculum): nav now points at `/classroom`; bring content under `(member)` + gate in `memberPaths` (B.3, in progress by Javi)
- [ ] Remove API routes + drop DB tables for messages/activities — only after coach side is rebuilt
- [ ] Add **membership tier** to `profiles` (standard / VIP) — with Calls gating (B.4)

## B. Client side — the 5 sections

### 1. Reports (SHIPPED — coach builder + member view + send)
- [x] Member-facing report view (`/reports`) — landing tab: greeting + OKR + this-week brief + past briefs
- [x] Single report full-screen (`/reports/[id]`) rendered with the shared template
- [x] Public shareable link (`/r/[token]`)
- [x] Coach tool: client list → generate (Claude) → edit → save → **Send** (Resend email)
- [x] `reports` table + RLS (members see only their own sent)

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

### 5. Weekly Check-in (SHIPPED)
- [x] Member submit form (`/checkin`) — morale, 6 ratings, weight, program-changes Y/N, off-plan Y/N, proud-of, improve, comments
- [x] Store check-ins (`weekly_checkins` table) via member-scoped insert
- [x] Surface latest check-in to the coach tool (feeds report generation via `fetchClientContext`)
- [ ] (Later) coach-side review UI; once-per-week guard / edit existing

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
