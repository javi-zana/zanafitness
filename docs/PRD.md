# Zana — Member App Rewrite PRD

**Status:** Draft v1
**Owner:** Javi Lorenzana
**Last updated:** 2026-04-29

---

## 1. Context

Zana is a fitness coaching product. The current web app (Next.js 14 + Supabase) has accumulated routes (`/dashboard`, `/profile`, `/workout`, `/nutrition`, `/progress`, `/guidance`) and most logic now lives in two giant files: [MemberDashboard.tsx](../app/dashboard/MemberDashboard.tsx) (~1800 lines) and [CoachDashboard.tsx](../app/dashboard/CoachDashboard.tsx) (~1200 lines).

This PRD specifies a streamlined rewrite. The member surface collapses to **5 sections**; the coach side becomes **one consolidated dashboard** that mirrors them.

## 2. Goals & non-goals

**Goals**
- Mobile-responsive PWA, installed via "Save to Home Screen" — primary install path.
- Five clean member sections that match how Javi actually coaches (continuous stats, rich-text programs, conversational messaging, community, scheduled calls).
- One consolidated coach dashboard.
- Data model that supports multiple coaches and per-coach member scoping, even though Javi is the only coach today.

**Non-goals (v1)**
- Native iOS/Android apps.
- Push/email notifications system.
- AI coach in messaging.
- Native scheduling (calendar engine, availability windows, reminders).
- Structured workout/macro tracking with adherence checkboxes.
- Public landing pages — out of scope for this PRD; the rewrite touches the authenticated app only.

## 3. Personas

- **Member** — pays for coaching, uses the app on their phone (PWA). Logs stats, reads their program, messages the coach, posts in community, books calls.
- **Coach** — assigned to a subset of members. Reads their members' stats, edits their programs, messages them, posts in community, sees their booked calls.
- **Head coach (Javi)** — superset of coach. Can invite members, post Announcements, edit the global Principles doc, manage coach↔member assignments.

For v1, Javi is the only person in the coach + head coach roles. The data model still supports the distinction.

---

## 4. Information architecture

### Member surface
```
/stats         — My Stats
/program       — My Program (tabs: Split, Food, Habits, Principles)
/messages      — Messaging
/community     — Community (sub-tabs: Announcements, Wins, Random)
/schedule      — Schedule
/profile       — Account settings (kept; minimal)
```

### Coach surface
```
/coach         — Coach dashboard (single consolidated view)
```

### Sunset / migrate
- `/dashboard` → split into `/stats`, `/program`, `/messages`, `/community`, `/schedule` (member) and `/coach` (coach)
- `/workout`, `/nutrition`, `/progress`, `/guidance` → folded into `/program` and `/stats`

---

## 5. Section: My Stats `/stats`

### What members can do
- **Log a stat update** anytime. A stat update is composed of:
  - **Weight** (number, optional units toggle kg/lb in profile)
  - **Confidence** (1–10 scale)
  - **Milestone** (free text, tweet-style, ~280 char limit)
  - **Photo(s)** (optional, multiple, stored in Supabase storage)
- **History view**: chronological feed of their own stat updates with a weight trend chart.
- **3-day nudge**: if the member has not logged any stat update in 3+ days, an in-app banner / modal prompts them on their next visit. No push notif, no email — purely in-app for v1.

### What coaches can see (under `/coach`)
- Each assigned member's latest stat update card.
- Stream view: "all my members' recent stat updates" sorted by most recent.
- Per-member detail: full history, weight chart.

### Data model sketch
```
stat_updates
  id, member_id, weight_kg, confidence (1-10),
  milestone_text, created_at
stat_update_photos
  id, stat_update_id, storage_path, created_at
```

### Open
- Unit handling (kg/lb): store canonical kg, display per user preference.
- Should the photo gallery on a member's history page be private to coach + that member only? (Default yes.)

---

## 6. Section: My Program `/program`

### Structure
Every member has the same four tabs, in this order:
1. **Split** — `{firstName}'s Split`
2. **Food** — `{firstName}'s Food`
3. **Habits** — `{firstName}'s Habits`
4. **Principles** — shared doc; same content for every member

The first three are personalized per member (header uses the member's first name); content is written by their coach. **Principles** is a single global document edited only by the head coach.

### Authoring
- Coach edits Split / Food / Habits per member in a Notion-style block editor.
- Editor supports: headings, paragraphs, bold/italic, bulleted/numbered lists, checkboxes (visual only — no adherence tracking), images, **embedded video** (YouTube and Vimeo URLs at minimum).
- Member view is **read-only** rendering.

### Embedded video
- Member pastes-`*` no — coach pastes a YouTube or Vimeo URL; the editor embeds the player inline. Mobile playback must work in the PWA.
- Cap: assume any reasonable number per page; performance is not a concern at expected post counts.

### Principles
- One global document.
- Edited only by head coach (Javi).
- Read by all members.

### Data model sketch
```
program_sections
  member_id, section ('split' | 'food' | 'habits'),
  content_json (structured rich text), updated_at, updated_by
principles_doc
  id (singleton), content_json, updated_at, updated_by
```

### Open
- Rich-text format: pick one — Tiptap (recommend) vs. Lexical vs. plain markdown. Tiptap has Notion-style UX and good React support.
- Should members see "your coach updated your Food on Apr 28" — small badge / timestamp? (Recommend: yes, lightweight "updated 2 days ago" indicator.)

---

## 7. Section: Messaging `/messages`

### Model
- **One thread per member**, with the member and all coaches as participants.
- For v1: Javi is the only coach, so every member's thread has 2 participants (member + Javi).
- Future-proofed for: additional coaches joining a member's thread; an AI coach as a future participant type.

### Capabilities
- Text messages.
- Image attachments (Supabase storage).
- Read indicator (last-read timestamp per participant; show "seen" on coach side).
- No typing indicators in v1.
- No audio/video messages in v1.

### Coach view
- Inbox of all assigned members' threads, sorted by most recent message.
- Can send messages from the same UI used by members.

### Data model sketch
```
threads
  id, member_id (1 thread per member)
thread_participants
  thread_id, user_id, role ('member' | 'coach' | 'head_coach' | 'ai' [v2])
messages
  id, thread_id, author_id, body, created_at
message_attachments
  id, message_id, storage_path, kind
message_reads
  thread_id, user_id, last_read_at
```

### Open
- Should attachments support PDFs (for sharing forms/handouts)? Lean yes.
- File size cap.

---

## 8. Section: Community `/community`

A simple forum. Three sub-tabs, single post type.

### Sub-tabs and posting permissions
| Sub-tab | Who can post |
|---|---|
| Announcements | Coaches only (head coach + coaches) |
| Wins | Members + coaches |
| Random | Members + coaches |

### Post capabilities
- Title + rich-text body (same editor as Program — supports images, video embeds).
- Single reaction type: **like** (heart or thumbs-up; pick one and stay consistent).
- Comments (single level, no nested threading in v1).
- Posts ordered most-recent first per sub-tab; pinning is a v2.

### Visibility
- All posts (in all sub-tabs) are visible to **all** members and **all** coaches.
- Coach scoping does NOT apply to community — it's a single shared space.

### Data model sketch
```
community_posts
  id, author_id, sub_tab ('announcements' | 'wins' | 'random'),
  title, body_json, created_at
community_post_reactions
  post_id, user_id (unique pair)
community_post_comments
  id, post_id, author_id, body, created_at
```

### Open
- Edit/delete own post window — always editable, or 15-min window?
- Moderation: head coach can hide any post/comment. (Recommend: yes, but no other moderation features in v1.)
- Reaction icon — heart or 👍? Pick one for the design system.

---

## 9. Section: Schedule `/schedule`

### Capabilities
- Embed Calendly for booking the bi-weekly call with Javi.
- Show "your next booked call" if Calendly's API surfaces it (or just rely on Calendly's email confirmation flow for v1).
- Optional: "Upcoming" panel listing the next booked call.

### Cadence
- Bi-weekly call with Javi is the canonical cadence. Members are responsible for booking; the app does not auto-suggest a slot in v1.

### Implementation
- Calendly embed widget on the page (inline or popup).
- Use the URL/event-type configured for Javi's bi-weekly slot.
- No native calendar storage in our DB for v1.

### Open
- Pull booked-event data via Calendly API to render a native "next call: Tue 3pm" card, vs. just embedding the widget? (Recommend: just embed for v1, revisit when multiple coaches exist.)

---

## 10. Coach dashboard `/coach`

A single consolidated view that mirrors the 5 member sections, plus admin tools.

### Layout (mobile-first; desktop = wider columns)
- **Member roster** — list of assigned members, with at-a-glance signal: latest stat-update timestamp, confidence trend arrow, unread message count.
- **Stats stream** — chronological feed of stat updates from assigned members.
- **Program editor** — pick a member, edit their Split / Food / Habits.
- **Messages** — inbox of all threads with assigned members.
- **Community** — same view as members, but with "Post" enabled in Announcements (head coach only).
- **Schedule** — Calendly admin link / embedded view of upcoming bookings.
- **Admin (head coach only)**:
  - Invite member ([app/api/invite-member/route.ts](../app/api/invite-member/route.ts) already exists)
  - Manage coach↔member assignments
  - Edit Principles doc

---

## 11. Roles & permissions

### Roles
| Role | Notes |
|---|---|
| `member` | Default for invited users. |
| `coach` | Assigned to a subset of members. |
| `head_coach` | Javi. Superset of coach. |

Stored on `profiles.role`. The middleware already gates membership ([middleware.ts](../middleware.ts)); extend to recognize `head_coach`.

### Member↔coach assignment
- New table: `coach_assignments(member_id, coach_id)` — many-to-many to support strength-coach + nutrition-coach in the future.
- v1 assumption: every member is assigned to exactly one coach (Javi). Migration creates the rows automatically.

### Permission matrix (v1)
| Capability | Member | Coach (assigned) | Head coach |
|---|---|---|---|
| View own stats | ✓ | ✓ | ✓ |
| View assigned member's stats | — | ✓ | ✓ (all) |
| Log own stat update | ✓ | — | — |
| View own program | ✓ | ✓ | ✓ (all) |
| Edit assigned member's program | — | ✓ | ✓ (all) |
| Edit Principles | — | — | ✓ |
| Send/receive messages in own thread | ✓ | ✓ (assigned) | ✓ (all) |
| Read all community posts | ✓ | ✓ | ✓ |
| Post in Wins/Random | ✓ | ✓ | ✓ |
| Post in Announcements | — | — | ✓ |
| Comment / react in community | ✓ | ✓ | ✓ |
| Hide community post/comment | — | — | ✓ |
| Invite member | — | — | ✓ |
| Manage assignments | — | — | ✓ |

(Coaches not assigned to a given member should not see that member's stats/program/messages. Enforce via Supabase RLS, not just app code.)

---

## 12. Tech & delivery

- **Stack (unchanged)**: Next.js 14 App Router, TypeScript, Tailwind, Supabase (auth + Postgres + storage), Paddle (billing), Resend (email), Vercel (hosting).
- **Editor**: pick Tiptap for the Notion-style block editor in Program and Community posts.
- **Mobile-first**: every screen designed at phone widths first; desktop is a wider-grid afterthought. PWA install prompt already exists ([commit fcfe544](../public/manifest.json)).
- **RLS**: all per-member access enforced at the database level. App-layer checks are belt-and-suspenders, not the primary gate.

### 12.1 Database migration workflow (must be set up before build)

Today, schema changes are made by hand in the Supabase dashboard — there are no migration files in the repo (only [supabase/email-templates/](../supabase/email-templates/) exists). For a rewrite that adds ~12 new tables plus RLS policies, this is too risky: there's no version history, no way to recreate the DB from scratch, and prod can silently drift from documentation.

**Fix — adopt the Supabase CLI before any schema work begins.** This is a one-time setup, ~30 minutes:

1. Install the CLI:
   ```bash
   brew install supabase/tap/supabase
   ```
2. Initialize Supabase config in the repo:
   ```bash
   supabase init
   ```
   This creates `supabase/config.toml` and a `supabase/migrations/` folder.
3. Link the repo to the existing hosted project (project ref is in the Supabase dashboard URL):
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
4. Capture the current production schema as the baseline migration:
   ```bash
   supabase db pull
   ```
   This generates one big SQL file in `supabase/migrations/` representing today's DB state. Commit it.
5. From here on, every schema change is a new migration file:
   ```bash
   supabase migration new add_stat_updates_table
   ```
   Edit the generated SQL file, then apply to the linked project:
   ```bash
   supabase db push
   ```
   Optional: run `supabase start` to test locally against a Docker-hosted Postgres before pushing.

**Rule going forward**: every PR that adds/changes a table, column, RLS policy, function, or storage bucket includes a migration file in `supabase/migrations/`. No more dashboard-only changes for schema (auth settings, email templates, and project config can still be managed in the dashboard).

---

## 13. Out of scope for v1

- Push and email notifications.
- AI coach.
- Native scheduling.
- Structured workout/macro tracking and adherence logging.
- SMS.
- Group video calls.
- Member-to-member DMs.
- Pinned community posts; rich moderation tools.
- Multi-coach-per-member workflows beyond the data model existing.

---

## 14. Open questions to resolve before build

These are tracked but not blocking the PRD:

1. **Confidence scale display** — slider (1–10) or numbered buttons? (Slider feels lower friction on mobile.)
2. **3-day nudge UX** — toast, banner at top of `/stats`, or full-screen modal on next visit?
3. **Rich-text editor choice** — confirm Tiptap.
4. **Reaction icon** — heart or thumbs-up? (Pick one and use everywhere.)
5. **Comment edit/delete** — windowed (e.g., 15 min) or always?
6. **Calendly integration depth** — embed only, or also pull bookings via API?
7. **Multi-coach-per-member** — confirm the join-table approach is right even though v1 enforces 1:1.
8. **Storage limits** — caps on photo / attachment file sizes.
9. **Member display name** — "Javier" personalization in `/program` headers — pulled from `profiles.first_name`? Confirm field exists or needs adding.

---

## 15. Roll-out plan (suggested, not locked)

0. **Set up Supabase CLI + migrations workflow** (see §12.1). Capture today's schema as the baseline migration before any new work.
1. Data model + RLS migrations for the new tables.
2. `/stats` (smallest section, validates the auth + RLS pattern end-to-end).
3. `/program` + Principles (largest authoring surface; introduces Tiptap).
4. `/messages` (real-time concerns; Supabase Realtime).
5. `/community` (reuses Tiptap from Program).
6. `/schedule` (Calendly embed — should be hours, not days).
7. `/coach` consolidation.
8. Migration: redirect old routes (`/dashboard`, `/workout`, `/nutrition`, `/progress`, `/guidance`) to their new homes; delete the giant dashboard files.
