// The weekly report: shared content type, HTML renderer, and curriculum index.
//
// The renderer reproduces the "professional coaching brief" template
// (.claude/skills/weekly-report/weekly-client-report-template.html) from
// structured content, so the coach preview, member view, and shareable link
// all render identically. Edit the CSS here in lockstep with that template.

export type Lever = { sub: string; items: string[] }

export type ReportContent = {
  objective: string
  objective_subline: string
  coach_note?: string
  priorities: { title: string; detail: string }[]
  levers: {
    training?: Lever
    nutrition?: Lever
    lifestyle?: Lever
  }
}

export type ReportMeta = {
  clientName: string
  weekLabel: string
}

// Lightweight index of Javi's curriculum so generated reports can point clients
// at a real lesson. Grow this as sections get written (see app/(member)/classroom).
export const CURRICULUM_INDEX = [
  { section: 'The Game', slug: 'the-game', lessons: ['The Fundamentals', 'Building Intuition', 'Troubleshooting & Plateaus'] },
  { section: 'Diet', slug: 'diet', lessons: ['High-protein eating', 'What to eat & what to avoid'] },
  { section: 'Fitness', slug: 'fitness', lessons: ['Optimal workouts', 'Progressive overload'] },
  { section: 'Lifestyle', slug: 'lifestyle', lessons: ['Sleep & recovery', 'Managing stress'] },
  { section: 'Bonus Resources', slug: 'bonus-resources', lessons: ['The pre-workout routine'] },
] as const

function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const STYLE = `
  :root {
    --ink:#14201a; --ink2:#2e3a33; --ink3:#5b665f; --ink4:#8a948d;
    --paper:#fbfaf6; --rule:#e4e2d8; --rule2:#cfccc0; --accent:#4d8f1a; --accent-bg:#f0f4e6;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background:#efeee8; color:var(--ink); font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; line-height:1.6; padding:40px 18px 64px; }
  .sheet { max-width:720px; margin:0 auto; background:var(--paper); border:1px solid var(--rule2); padding:56px 60px 48px; }
  .serif { font-family:'Fraunces',Georgia,serif; letter-spacing:-0.01em; }
  .label { font-family:'JetBrains Mono',ui-monospace,monospace; font-size:10px; text-transform:uppercase; letter-spacing:0.22em; color:var(--ink4); }
  .label.accent { color:var(--accent); }
  .letterhead { display:flex; align-items:flex-end; justify-content:space-between; padding-bottom:18px; border-bottom:2px solid var(--ink); }
  .letterhead .wordmark { font-family:'Fraunces',Georgia,serif; font-weight:600; font-size:22px; letter-spacing:0.04em; color:var(--ink); }
  .letterhead .wordmark span { color:var(--accent); }
  .letterhead .doc-meta { text-align:right; }
  .letterhead .doc-meta .kind { font-size:11px; color:var(--ink3); font-weight:600; letter-spacing:0.04em; }
  .letterhead .doc-meta .wk { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink4); margin-top:3px; }
  .recipient { display:flex; justify-content:space-between; padding:14px 0 26px; border-bottom:1px solid var(--rule); margin-bottom:30px; }
  .recipient .field .label { display:block; margin-bottom:4px; }
  .recipient .field .val { font-size:14px; color:var(--ink2); font-weight:500; }
  .note { background:var(--accent-bg); border-left:3px solid var(--accent); padding:22px 26px; margin-bottom:34px; }
  .note .from { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .note .from .name { font-family:'Fraunces',serif; font-weight:600; font-size:15px; color:var(--ink); }
  .note p { font-family:'Fraunces',Georgia,serif; font-size:15px; font-style:italic; color:var(--ink2); line-height:1.7; white-space:pre-wrap; }
  .objective { margin-bottom:34px; }
  .objective .label { display:block; margin-bottom:12px; }
  .objective h1 { font-weight:600; font-size:27px; line-height:1.25; color:var(--ink); max-width:38ch; }
  .objective .subline { font-size:14.5px; color:var(--ink3); line-height:1.7; margin-top:14px; max-width:62ch; }
  .section-head { display:flex; align-items:baseline; gap:12px; margin:0 0 18px; padding-bottom:8px; border-bottom:1px solid var(--rule); }
  .section-head .n { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--accent); font-weight:500; }
  .section-head h2 { font-family:'Fraunces',Georgia,serif; font-weight:600; font-size:17px; color:var(--ink); }
  .priorities { list-style:none; margin-bottom:38px; }
  .priorities li { display:grid; grid-template-columns:34px 1fr; gap:4px 6px; padding:16px 0; border-bottom:1px solid var(--rule); }
  .priorities li:last-child { border-bottom:none; }
  .priorities .num { font-family:'Fraunces',Georgia,serif; font-weight:600; font-size:18px; color:var(--accent); line-height:1.2; }
  .priorities .ptitle { font-size:15px; font-weight:600; color:var(--ink); align-self:center; }
  .priorities .pdetail { grid-column:2; font-size:14px; color:var(--ink3); line-height:1.6; margin-top:3px; }
  .levers { margin-bottom:38px; }
  .lever { display:grid; grid-template-columns:150px 1fr; gap:18px; padding:18px 0; border-bottom:1px solid var(--rule); }
  .lever:last-child { border-bottom:none; }
  .lever .lh .lname { font-family:'Fraunces',Georgia,serif; font-weight:600; font-size:15px; color:var(--ink); }
  .lever .lh .lsub { font-size:11.5px; color:var(--ink4); margin-top:2px; }
  .lever ul { list-style:none; }
  .lever ul li { position:relative; padding-left:18px; font-size:14px; color:var(--ink2); line-height:1.55; margin-bottom:7px; }
  .lever ul li:last-child { margin-bottom:0; }
  .lever ul li::before { content:""; position:absolute; left:0; top:9px; width:6px; height:6px; background:var(--accent); border-radius:1px; transform:rotate(45deg); }
  .signoff { margin-top:40px; padding-top:18px; border-top:2px solid var(--ink); display:flex; align-items:center; justify-content:space-between; }
  .signoff .who .sig { font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:var(--ink); }
  .signoff .who .role { font-size:11px; color:var(--ink4); margin-top:2px; }
  .signoff .tag { font-size:11px; color:var(--ink4); text-align:right; max-width:24ch; line-height:1.5; }
  @media print { body { background:#fff; padding:0; } .sheet { border:none; max-width:none; padding:36px 44px; } .note { break-inside:avoid; } }
  @media (max-width:560px) { .sheet { padding:36px 24px; } .lever { grid-template-columns:1fr; gap:8px; } }
`

function leverHtml(name: string, lever?: Lever): string {
  if (!lever || !lever.items?.filter(Boolean).length) return ''
  const items = lever.items.filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join('')
  return `
    <div class="lever">
      <div class="lh">
        <div class="lname">${esc(name)}</div>
        <div class="lsub">${esc(lever.sub ?? '')}</div>
      </div>
      <ul>${items}</ul>
    </div>`
}

export function renderReportHtml(content: ReportContent, meta: ReportMeta): string {
  const priorities = (content.priorities ?? [])
    .filter((p) => p?.title)
    .map(
      (p, i) => `
      <li>
        <span class="num">${i + 1}</span>
        <span class="ptitle">${esc(p.title)}</span>
        <span class="pdetail">${esc(p.detail ?? '')}</span>
      </li>`,
    )
    .join('')

  const note = content.coach_note?.trim()
    ? `
    <section class="note">
      <div class="from">
        <span class="name">A note from Javi</span>
        <span class="label">Personal</span>
      </div>
      <p>${esc(content.coach_note)}</p>
    </section>`
    : ''

  const levers = [
    leverHtml('Training', content.levers?.training),
    leverHtml('Nutrition', content.levers?.nutrition),
    leverHtml('Lifestyle', content.levers?.lifestyle),
  ].join('')

  const leversBlock = levers.trim()
    ? `
    <div class="section-head"><span class="n">02</span><h2>The Levers</h2></div>
    <div class="levers">${levers}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(meta.clientName)} — Weekly Brief · ${esc(meta.weekLabel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>${STYLE}</style>
</head>
<body>
<div class="sheet">
  <header class="letterhead">
    <div class="wordmark">ZANA<span>.</span> Fitness</div>
    <div class="doc-meta">
      <div class="kind">Weekly Coaching Brief</div>
      <div class="wk">${esc(meta.weekLabel)}</div>
    </div>
  </header>

  <div class="recipient">
    <div class="field">
      <span class="label">Prepared for</span>
      <span class="val">${esc(meta.clientName)}</span>
    </div>
    <div class="field" style="text-align:right">
      <span class="label">Coach</span>
      <span class="val">Javi Lorenzana</span>
    </div>
  </div>

  ${note}

  <section class="objective">
    <span class="label accent">Objective — This Week</span>
    <h1 class="serif">${esc(content.objective)}</h1>
    <p class="subline">${esc(content.objective_subline ?? '')}</p>
  </section>

  <div class="section-head"><span class="n">01</span><h2>Priorities</h2></div>
  <ol class="priorities">${priorities}</ol>

  ${leversBlock}

  <footer class="signoff">
    <div class="who">
      <div class="sig">Javi Lorenzana</div>
      <div class="role">Head Coach · ZANA Fitness</div>
    </div>
    <div class="tag">Built for results.<br/>One week at a time.</div>
  </footer>
</div>
</body>
</html>`
}
