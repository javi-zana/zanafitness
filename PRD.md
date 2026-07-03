# ZanaFitness Portal Rebuild — PRD

**Owner:** Javi Lorenzana
**Date:** 2026-07-03
**Status:** Draft for review

---

## 1. Vision

One tool that runs the whole coaching business — from Instagram lead to transformed client — with an AI layer that scales Javi's coaching without diluting it.

> "A blend of Skool and Everfit, but with an integrated AI coaching layer."

Two surfaces:

- **Coach OS** (`ai.zanafitness.com`) — Javi + MJ's single dashboard: applications, client activity, reports, program assignment. Everything the coach does, in one place, zero hunting.
- **Client Portal** (`app.zanafitness.com` / main app) — the client's central point of contact. Log workouts, log meals, read guides, book calls, see their weekly report. Mobile-first PWA ("save to home screen").

The strategic bet: **move logistics and logging out of DMs and into the portal.** DMs stay for relationship and vibe — but everything the AI needs to generate insight (workouts, meals, check-ins) must live in structured form, or the AI layer has nothing to work with.

---

## 2. Why rebuild — problems today

From the coach-workflow interview (2026-07-03):

| # | Problem | Evidence |
|---|---------|----------|
| P1 | Coach only uses the portal for two things: reviewing applications and demoing at onboarding. It's not a daily tool. | "The only times I really have been using the dashboard is for new inbound applications and onboarding." |
| P2 | Applications flow has friction: 2 clicks to reach the tab, extra step to open IG profile, then a manual DM after accepting anyway. | Steps 2–6 of the current application flow. |
| P3 | The CRM is buggy and untrusted in its later stages. Sales qualification actually happens on Instagram, so the pipeline stages are theater. | "The applications CRM is still a bit buggy, and I don't fully trust it." |
| P4 | No notifications. Javi finds out about new applicants only when the lead DMs him. | "I maybe would want a dashboard of applications or notifications regarding new applicants or activity." |
| P5 | No workout tracking. Coaching progression (phase advancement / progressive overload) is done manually over messages. A client explicitly asked for a tracker. | "One client mentioned it would be great if I could put in a workout tracker." |
| P6 | No meal logging. Week-one food-photo habit currently runs through IG DMs. | "I also think it'd be a great place for them to log their meals." |
| P7 | Programs are hand-written per client even though everyone gets the same PPL split. | "I still manually write [programs], even though I give the same workouts to everyone." |
| P8 | Clients don't engage with the portal — because there's nothing to do in it daily. All activity gravitates to IG/FB DMs (via Beeper). | "Clients typically just message me on Instagram or Facebook." |
| P9 | Roadrunner (DM automation) is unreliable and can't be the notification backbone. | "Still very unreliable and buggy in its current state." |

Root cause, stated plainly: **the portal has no daily job for either party.** The coach's job (qualify, sell) happens on IG; the client's job (train, eat) has nowhere to be logged. Fix the daily job and engagement follows; then the AI layer has data to run on.

---

## 3. Users & tiers

| User | Who | What they need |
|------|-----|----------------|
| **Coach** | Javi (+ MJ — include her in access & notifications by default) | One dashboard: new applications, client activity, silence alerts, one-click program assignment, report generation. |
| **VIP client** | 1:1 coaching tier | Everything below + book 1:1 calls with Javi. |
| **Standard client** | Group tier | Everything below + see the group-call schedule. |
| **Applicant** | IG lead who got the apply link | Frictionless application form (exists today, keep). |

ICP reminder: Asian male professional 25–34, status-driven recomp via lifestyle habits, not gym-centric. Everything in the client portal must respect: **habits-based nutrition (no macros, no meal plans), PPL aesthetics-first training, simple over comprehensive.**

---

## 4. Product principles

1. **The portal earns engagement by having a daily job, not by nagging.** Logging a workout or snapping a meal photo must take < 30 seconds on a phone.
2. **DMs are for relationship; the portal is for record.** Never try to out-chat Instagram. Move *structured* things (logs, bookings, reports) into the portal; leave conversation where it is.
3. **AI works off logged data.** Every client-facing logging feature exists primarily to feed the weekly AI report and future insights. No log → no insight → no AI leverage.
4. **Coach actions are one click from home.** If Javi's most common action takes 2+ clicks, it's a bug.
5. **Productize the method.** Same PPL program for everyone = templates, not per-client authoring. Phase progression = a button, not a rewrite.

---

## 5. Scope by phase

### V1 — "The portal has a daily job" (the rebuild)

**Coach OS (ai.zanafitness.com)**

| Feature | Description |
|---------|-------------|
| **Home dashboard** | Single screen on login: (a) new applications needing review, (b) client activity feed (workouts/meals/check-ins logged), (c) silence alerts — clients with no activity in 4–5 days (matches existing contact rhythm), (d) upcoming calls. |
| **Applications inbox** | One click from home. Card per applicant: application answers inline, IG handle as a direct tap-to-open link (kills the extra step), Accept / Reject buttons. Accept → sends the Resend email *and* shows exactly what was sent + a copy-paste DM snippet so the follow-up IG message is one paste, not composed from scratch. **Pipeline collapsed to: New → Accepted / Rejected.** No later stages — qualification happens on IG and the untrusted CRM stages are deleted, not fixed. |
| **New-application notifications** | Email (and PWA push if enabled) to Javi + MJ the moment an application lands. Kills P4 without touching Roadrunner. |
| **Program templates + assignment** | PPL program lives as a template with phases (Phase 1, 2, 3…). Onboarding = pick template, optionally tweak exercises for this client, assign. Progression = "Advance to Phase 2" button. Kills P7 and manual phase-pushing. |
| **Client detail page** | Per client: vital stats (weight + trend, BF%, morale, last check-in), activity log, current program + phase, meal photo stream, reports history, intake viewer. Meeting notes dropped (2026-07-04) — Granola records calls. |
| **On-demand report generation** | Keep the existing AI-report pipeline but drop the Monday cadence — Javi generates a report for any client whenever he wants, from the client detail page. Published reports become *visible to the client in their portal*, not just sent. |

**Client Portal (main app)**

| Feature | Description |
|---------|-------------|
| **Home** | Prescribed workouts for the current phase (Push / Pull / Legs — client picks which one to do, no forced "today's workout"), quick meal-photo button, latest report, next call. One screen. |
| **Workout logging** | Pick a prescribed workout → each exercise shows last session's weight × reps pre-filled → tap to confirm or adjust → done. Clients can **add extra exercises** to any session via autocomplete from the exercise library (seeded from `exercises-dataset-main`, 1,324 exercises with body-part/equipment/instructions). Structured-lite: weight and reps, no RPE/tempo/supersets. Pre-fill makes progressive overload self-evident and gives V2's auto-progression something to read. |
| **Meal photo log** | Camera button → photo + optional one-line note. **No macros, no calorie counting** — this is the week-one food-photo habit moved from IG DMs into structured storage. Coach sees the stream on the client page. |
| **Guides library** | Javi's existing supplement / nutrition / workout guides as in-app content (Tiptap already in the stack for authoring). Replaces sending PDFs/links over DM. |
| **Calls** | VIP: book a 1:1 (existing booking flow). Standard: view upcoming group-call schedule. |
| **Reports** | Coach-generated AI focus sheets, rendered in-app with history. New report → client gets a push/email. |
| **Nudges** | 3-day no-activity soft nudge via PWA push/email (existing contact-rhythm rule, automated). No Roadrunner dependency. |

### V2 — "The AI layer"

- **Weekly check-in form** — short structured check-in (energy, adherence, wins, blockers) feeding the report.
- **AI insights from logs** — weekly report auto-drafts from actual workout/meal/check-in data instead of coach-assembled context.
- **Auto-progression suggestions** — "Jim has hit top-of-range on all Phase 1 lifts for 2 weeks → suggest Phase 2" surfaced on the coach dashboard; coach approves with one click.
- **Meal-photo AI feedback** — habit-level observations ("protein looks light this week"), never macro counts.

### V1.5 — "Roadrunner bridge" (DM signal into the dashboard)

Constraint that shapes everything: Roadrunner reads DMs via the **Beeper Desktop API (localhost on Javi's Mac)** — a hosted portal can never reach it. So we bridge the *signal*, not the transport:

- `sweep.py` (Roadrunner) gains a push step: POST its per-client triage JSON (who spoke last, days silent, snippet) to `/ai/api/sweep` (secret-authenticated).
- Portal stores it in a `dm_signals` table (client → matched profile, last_dm_at, direction, snippet, swept_at).
- Coach home merges DM + portal signals into one needs-attention truth: "needs reply — DM 2d" / "silent 6d (everywhere)". Dashboard shows sync staleness rather than guessing when Beeper is down.
- Optional: `zana-leads` pushes new "ZANA"-keyword IG leads into the same bridge → Applications inbox shows DM leads that haven't applied yet.
- Trigger stays local (manual sweep or launchd cron on the Mac).

### V3 — "Messaging"

- Drafting/sending stays in Roadrunner on the Mac: the staging gate (identity verification + voice lint + explicit approval) is the safety-critical IP and its transport is desktop-only by design. Revisit a portal-side send path only if a reliable non-desktop IG transport appears.
- Skool-style community feed — only if group-tier growth demands it.

---

## 6. Out of scope (deliberately)

- Macro / calorie tracking — contradicts the habits-based method.
- Meal plans — same.
- Custom program builder UI beyond template + per-client exercise tweaks.
- In-app chat / messaging — DMs win; don't compete.
- Multi-stage sales CRM — qualification lives on IG; the portal only needs New → Accepted/Rejected.
- Payments changes — Paddle stays as-is.
- Native mobile apps — PWA is the delivery model.

---

## 7. Data model sketch (new/changed tables)

```
program_templates      (id, name)                          -- "PPL"
template_phases        (id, template_id, order, name)      -- Phase 1..n
phase_workouts         (id, phase_id, day, name)           -- Push / Pull / Legs
workout_exercises      (id, workout_id, order, name, target_sets, target_rep_range)

client_programs        (id, client_id, template_id, current_phase_id, assigned_at)
client_exercise_overrides (id, client_program_id, workout_exercise_id, replacement_name)

exercises              (id, name, body_part, equipment, instructions)  -- seeded from exercises-dataset-main (1,324 rows)
workout_logs           (id, client_id, workout_id, date)               -- workout_id nullable for freestyle sessions
exercise_logs          (id, workout_log_id, exercise_id, weight, reps, set_number)  -- exercise_id → exercises; covers added exercises too

meal_logs              (id, client_id, photo_url, note, created_at)

guides                 (id, title, content_json, tier_visibility, published)

reports                (id, client_id, generated_at, content, published_to_client)  -- on-demand, not weekly

notifications          (id, user_id, type, payload, read_at)
```

Existing: auth, clients, applications, calls/booking, payments — keep, prune unused columns/stages.

---

## 8. Success metrics

| Metric | Today | Target (90 days post-V1) |
|--------|-------|--------------------------|
| Coach opens dashboard | ~only when an applicant DMs | Daily (it's the morning screen) |
| Clients logging ≥3 workouts/week | 0 (no feature) | 70% of active clients |
| Meal photos in portal vs IG DMs | 0% | 80% of food-photo clients |
| Clicks from login → accept applicant | ~5+ steps | 2 (open inbox → accept) |
| Time to notice a new application | whenever lead DMs | < 5 min (notification) |
| Time to assign a program at onboarding | manual write-up | < 2 min (template + assign) |

---

## 9. Technical approach

- **Keep:** Next.js 14 + Supabase (auth, DB, storage for meal photos) + Resend + Paddle + Tiptap (guide authoring). No stack change, no data migration drama.
- **Rebuild:** the route surfaces. Current app has ~30 top-level routes accreted over iterations; the rebuild collapses the client experience to ~5 sections (per the 2026-06 overhaul plan: Reports / Program / Curriculum→Guides / Calls / Check-in) and deletes dead routes.
- **Coach OS** lives at ai.zanafitness.com (already password-gated, already has report generation + client notes) and absorbs applications + activity + program assignment. The main app's `/admin` and `/coach` routes get deleted once parity lands.
- **PWA:** manifest + service worker + push on both surfaces; install path stays "save to home screen."
- **Order of work:** 1) Applications inbox + notifications (smallest, kills the daily coach pain immediately) → 2) Program templates + workout logging → 3) Meal log → 4) Guides → 5) Reports-in-portal + nudges.

---

## 10. Open decisions (defaults chosen — veto anything)

| # | Decision | Default | Why |
|---|----------|---------|-----|
| D1 | Meal logging style | Photo + note, zero macros | Matches habits-based method and week-one food-photo habit |
| D2 | Notification backbone | Email + PWA push, Roadrunner deferred to V3 | Roadrunner unreliable; don't build on sand |
| D3 | CRM depth | Delete pipeline stages; New → Accepted/Rejected only | Qualification lives on IG; untrusted stages get deleted, not debugged |
| D4 | Workout log granularity | Weight × reps per exercise, pre-filled from last session | Enough for progressive overload + V2 auto-progression; no RPE/tempo bloat |
| D5 | Coach surface | ai.zanafitness.com becomes the full Coach OS | Consistent with 2026-06 overhaul decision; already gated + has reports |
| D6 | Community feed | Not in V1/V2 | Group tier too small to sustain a feed; Skool-envy is a trap until it isn't |

---

## 11. Risks

- **Engagement doesn't move even with features.** Mitigation: nudges + coach-published reports give a recurring pull; onboarding call now includes "install the app, log your first workout live with me."
- **Clients keep sending food photos to IG out of habit.** Mitigation: during week one, reply to IG food photos with "log it in the app so it counts toward your report" — the report is the carrot.
- **Scope creep back toward Everfit-parity.** Mitigation: this document. Anything not in §5 needs a new row in §10 first.
