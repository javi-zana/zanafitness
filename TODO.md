# TODO

Lightweight backlog for the Zana repo. Cross items off as they ship.

---

## Classroom (member tab)

The **Classroom** sidebar tab — member-only, **not public-facing**. Skool-style: Sections → Modules → lesson. Lives at `/classroom` in `app/(member)/classroom/`.

Data-driven: all content is in `app/(member)/classroom/content.tsx` (the `SECTIONS` array). Adding/filling a section is pure data entry — `**bold**`, `*italic*`, `` `code` `` work inline. Markdown mirror in `course/classroom/`.

**Built**
- [x] Section list (`/classroom`), module list (`/classroom/[slug]`), lesson page (`/classroom/[slug]/[module]`) with module sidebar + prev/next
- [x] Gated via middleware `memberPaths`; sidebar "Classroom" tab points here
- [x] Section 1 — **The Game** (3 modules: Fundamentals / Building Intuition / Troubleshooting)
- [x] Retired old `/knowledge` tab; salvaged its one real article into **Bonus Resources → The Full Game Explained**

**Content to write**
- [ ] Section 2: Diet
- [ ] Section 3: Fitness
- [ ] Section 4: Lifestyle
- [ ] Section 5: Bonus Resources — more deep cuts (sleep/cortisol, supplementation)
- [ ] ⚠️ Reconcile the salvaged Bonus article with Section 1 canon: it still says **1g/lb** (vs **0.8g/lb**) and frames **3 levers** (vs **2**). Kept verbatim for now.

**Polish (later)**
- [ ] Video player component (drop-in for any module)
- [ ] Track read/watched state per member (Supabase)
- [ ] "Continue where you left off" card on Home

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
