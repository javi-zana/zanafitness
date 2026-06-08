# TODO

Lightweight backlog for the Zana repo. Cross items off as they ship.

---

## Knowledge tab (in progress)

The new member-area tab. Static written modules now, videos later.

**Core modules**
- [x] The Full Game Explained — BMR, protein, progressive overload
- [ ] Diet — high protein
- [ ] Working Out
- [ ] Lifestyle & Recovery

**Bonus modules**
- [ ] What to Eat & What to Avoid
- [ ] Optimal Workouts
- [ ] The Pre-Workout Routine

**Polish (after content lands)**
- [ ] Add video player component (drop-in for any module)
- [ ] Track read/watched state per member (Supabase)
- [ ] "Continue where you left off" card on Home

**Curriculum** — public-facing, live at `/curriculum` (UI built)
Data-driven: all content lives in `app/curriculum/content.tsx` (the `SECTIONS` array). Adding/filling a section is pure data entry — `**bold**`, `*italic*`, `` `code` `` work inline. Source markdown mirror in `course/curriculum/`.
- [x] Landing page (`/curriculum`) — 5 sections, ready ones link, "soon" ones disabled
- [x] Section page (`/curriculum/[slug]`) — module jump-nav, prev/next pager, coming-soon state
- [x] Section 1: The Game Explained — 3 modules (Fundamentals / Building Intuition / Troubleshooting)
- [ ] Write Section 2: Diet
- [ ] Write Section 3: Fitness
- [ ] Write Section 4: Lifestyle
- [ ] Write Section 5: Bonus Resources
- [ ] ⚠️ Reconcile with the member `the-full-game` page (`app/(member)/knowledge/`) — content conflicts:
  - Old page: **3 levers** (BMR, protein, progressive overload) · **1g/lb** protein
  - New §1: **2 levers** (calories, recomp) · **0.8g/lb** protein
  - New curriculum used as canon. Decide whether to retire the old member page or point `/knowledge` at `/curriculum`.

---

## Next-up features

From [memory:roadmap-next](/.claude/projects/-Users-javierlorenzana-Desktop-zanafitness/memory/roadmap_next.md) — Javi's top-of-mind moves after v1.

- [ ] Full workout tracker (structured sets/reps logging — overrides the v1 "lightweight" cap)
- [ ] Weekly check-in system (build the existing manual cadence into the app)
- [ ] Instagram DM integration (IG Graph API + Messenger Platform — larger scoping effort)

---

## Public / marketing

- [x] `/starter` lead magnet (free lite version of the program)
- [x] `/protocol` long-form story
- [x] `/system` principles page
