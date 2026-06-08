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

- [ ] Restructure bottom nav from `Home · Track · Program · Learn · Messages` → the new 5 sections
- [ ] Remove **Messages** — route `app/(member)/messages`, nav item, `/api` message routes (decide: keep `threads`/`messages` tables dormant or migrate out)
- [ ] Remove **Activity log / feed** — `activities` (workout/win/meal), reactions, comments; nav/UI
- [ ] Remove **Stats** — route `app/(member)/stats`, nav "Track" item (replaced by weekly check-in)
- [ ] Rework `/dashboard` into a clean hub of the 5 sections
- [ ] Add **membership tier** to `profiles` (standard / VIP) — even if VIP-gating is wired later

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
- [ ] `reports` table (shared by coach builder + member Reports section)
- [ ] `weekly_checkins` table (shared by member submit + coach review)
- [ ] `profiles.tier` (shared by Calls gating + coach admin)
- [ ] Keep PWA "add to home screen" feel on mobile throughout
