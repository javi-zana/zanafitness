"use client";

import { useState } from "react";
import Link from "next/link";

const ZLogo = ({ className = "h-7" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" /><path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

type Tab = "home" | "programs" | "community" | "messages" | "schedule";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "programs", label: "Programs", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h10" strokeLinecap="round"/></svg> },
  { id: "community", label: "Community", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "messages", label: "Messages", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "schedule", label: "Schedule", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg> },
];

function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-[#141414]/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#b3cdff] mb-2" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/></svg>
      <p className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff]">Join to unlock</p>
    </div>
  );
}

function HomeTab() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[9px] tracking-[0.3em] text-gray-500 uppercase">Welcome back</p>
        <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white mt-1">Priya.</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Streak", value: "67", unit: "days", color: "#b3cdff" },
          { label: "Phase", value: "03", unit: "", color: "#fff" },
          { label: "Check-ins", value: "12", unit: "done", color: "#86efac" },
        ].map(s => (
          <div key={s.label} className="bg-[#121821] border border-[#2d3a4b] rounded p-4 text-center">
            <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-2">{s.label}</p>
            <p className="text-2xl font-light" style={{ color: s.color }}>{s.value}</p>
            <p className="font-mono text-[8px] text-gray-600 mt-0.5">{s.unit}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#121821] border border-[#b3cdff]/25 rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Today's Session</p>
        <p className="text-base font-light text-white uppercase tracking-wide">Upper Body A</p>
        <p className="font-mono text-[9px] text-gray-500 mt-1">Phase 03 · Day 2 · 6 exercises · ~55 min</p>
        <div className="mt-4 space-y-2">
          {["Bench Press 4×6–8", "Incline DB Press 3×10", "Cable Fly 3×12", "Shoulder Press 4×8", "Lateral Raises 3×15", "Tricep Pushdown 3×12"].map(e => (
            <div key={e} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2d3a4b] shrink-0" />
              <p className="font-mono text-[9px] text-gray-400">{e}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#2d3a4b] flex items-center justify-between">
          <p className="font-mono text-[8px] text-gray-500">Progress this week</p>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 bg-[#141414] rounded-full"><div className="h-1 bg-[#b3cdff] rounded-full" style={{ width: "60%" }} /></div>
            <p className="font-mono text-[8px] text-[#b3cdff]">3/5</p>
          </div>
        </div>
      </div>

      <div className="bg-[#121821] border-l-2 border-l-[#b3cdff] border border-[#2d3a4b] rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-2">Coach's Note</p>
        <p className="text-sm font-light leading-relaxed text-gray-300">
          Control the eccentric. Drop the ego. Progression comes from tension, not just moving weight from point A to B.
        </p>
        <p className="font-mono text-[8px] text-gray-600 mt-3">— Javi</p>
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-3">Nutrition Today</p>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Calories", value: "2,340", color: "#b3cdff" }, { label: "Protein", value: "185g", color: "#86efac" }, { label: "Carbs", value: "240g", color: "#fbbf24" }].map(n => (
            <div key={n.label} className="text-center">
              <p className="font-light text-lg" style={{ color: n.color }}>{n.value}</p>
              <p className="font-mono text-[7px] text-gray-600 uppercase tracking-widest mt-0.5">{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramsTab() {
  const [open, setOpen] = useState<number | null>(0);
  const days = [
    { day: "Day 1", title: "Upper Body A", tag: "Chest / Shoulders / Tris", exercises: ["Bench Press 4×6–8", "Incline DB Press 3×10", "Cable Fly 3×12", "Shoulder Press 4×8", "Lateral Raises 3×15", "Tricep Pushdown 3×12"] },
    { day: "Day 2", title: "Lower Body A", tag: "Quads / Hamstrings / Glutes", exercises: ["Squat 4×5", "Romanian DL 3×10", "Leg Press 3×12", "Leg Curl 3×12", "Walking Lunge 3×10 each", "Calf Raise 4×15"] },
    { day: "Day 3", title: "Upper Body B", tag: "Back / Biceps / Rear Delts", exercises: ["Pull-up 4×6–8", "Barbell Row 4×8", "Seated Row 3×10", "Face Pull 3×15", "DB Curl 3×10", "Hammer Curl 3×12"] },
    { day: "Day 4", title: "Rest / Active Recovery", tag: "Walk · Stretch · Sleep", exercises: [] },
    { day: "Day 5", title: "Lower Body B", tag: "Posterior Chain Focus", exercises: ["Deadlift 4×4–5", "Bulgarian Split Squat 3×8", "Hip Thrust 3×12", "Leg Curl 3×10", "Seated Calf Raise 4×15"] },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[9px] tracking-[0.3em] text-gray-500 uppercase mb-1">Phase 03</p>
        <h2 className="text-xl font-light tracking-[0.12em] uppercase text-white">ZANA Training System</h2>
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Overall Progress</p>
          <p className="text-2xl font-light text-white mt-1">34<span className="text-sm text-gray-500 ml-1">%</span></p>
        </div>
        <div className="w-32 h-1.5 bg-[#141414] rounded-full"><div className="h-1.5 bg-[#b3cdff] rounded-full" style={{ width: "34%" }} /></div>
      </div>

      <div className="space-y-2">
        {days.map((d, i) => (
          <div key={i} className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[8px] text-[#b3cdff] uppercase tracking-widest w-10">{d.day}</span>
                <div>
                  <p className="text-sm font-light text-white">{d.title}</p>
                  <p className="font-mono text-[8px] text-gray-500 mt-0.5">{d.tag}</p>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {open === i && d.exercises.length > 0 && (
              <div className="px-5 pb-4 space-y-2 border-t border-[#141414]">
                {d.exercises.map(e => (
                  <div key={e} className="flex items-center gap-3 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff]/40 shrink-0" />
                    <p className="font-mono text-[9px] text-gray-400">{e}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityTab() {
  const posts = [
    { initials: "JL", name: "Javi", color: "#b3cdff", time: "Today", category: "Announcement", content: "Big win from the team this week — 4 members hit PRs on deadlift. This is what consistent overload looks like. Keep going.", likes: 24, isCoach: true },
    { initials: "PS", name: "Priya S.", color: "#86efac", time: "Today", category: "Check-in", content: "Week 7 Day 3 — Deadlifts felt strong. Hit 145kg × 3. Sleep has been 8hrs consistently. Feel like it's clicking now.", likes: 18, isCoach: false },
    { initials: "MC", name: "Marcus C.", color: "#fbbf24", time: "Today", category: "Win", content: "New bench PR — 185 lbs × 5. Three weeks in and the numbers are moving. No going back now.", likes: 31, isCoach: false },
    { initials: "AT", name: "Aiko T.", color: "#f472b6", time: "Yesterday", category: "Check-in", content: "Week 5 complete. The Romanian DLs are humbling but the posterior chain is waking up. Body comp shifting.", likes: 22, isCoach: false },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <textarea disabled placeholder="Share a win, ask a question..." className="w-full bg-[#121821] border border-[#2d3a4b] rounded p-4 text-sm text-gray-600 placeholder-gray-600 resize-none h-16 cursor-not-allowed" />
        <LockedOverlay />
      </div>

      <div className="space-y-3">
        {posts.map((p, i) => (
          <div key={i} className={`border rounded p-5 ${p.isCoach ? "bg-[#131b2e] border-[#b3cdff]/25 border-l-2 border-l-[#b3cdff]" : "bg-[#121821] border-[#2d3a4b]"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[9px] font-bold shrink-0" style={{ color: p.color, backgroundColor: p.color + "15", border: `1px solid ${p.color}40` }}>{p.initials}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    {p.isCoach && <span className="font-mono text-[6px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">Coach</span>}
                  </div>
                  <p className="font-mono text-[8px] text-gray-500">{p.time} · {p.category}</p>
                </div>
              </div>
            </div>
            <p className="text-sm font-light text-gray-300 leading-relaxed">{p.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 relative">
                <button disabled className="cursor-not-allowed opacity-40">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="font-mono text-[8px] text-gray-500">{p.likes}</span>
              </div>
              <button disabled className="font-mono text-[8px] text-gray-600 cursor-not-allowed opacity-40">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const convs = [
    { initials: "JL", name: "Javi (Coach)", color: "#b3cdff", preview: "Great work this week 💪", time: "2h ago" },
    { initials: "PS", name: "Priya S.", color: "#86efac", preview: "Did you try the new split yet?", time: "Yesterday" },
    { initials: "MC", name: "Marcus C.", color: "#fbbf24", preview: "185 lbs × 5 — new PR!", time: "2 days ago" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border border-[#2d3a4b] rounded overflow-hidden flex" style={{ height: "420px" }}>
        <div className="w-64 shrink-0 bg-[#0a0f16] border-r border-[#2d3a4b] flex flex-col">
          <div className="px-4 py-3 border-b border-[#2d3a4b]">
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-gray-400">Messages</p>
          </div>
          {convs.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#1a222c] ${i === 0 ? "bg-[#b3cdff]/5 border-l-2 border-l-[#b3cdff]" : ""}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[9px] shrink-0" style={{ color: c.color, backgroundColor: c.color + "15", border: `1px solid ${c.color}30` }}>{c.initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{c.name}</p>
                <p className="font-mono text-[8px] text-gray-500 truncate">{c.preview}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="px-4 py-3 border-b border-[#2d3a4b] bg-[#0a0f16] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#b3cdff]/15 border border-[#b3cdff]/30 flex items-center justify-center font-mono text-[8px] text-[#b3cdff]">JL</div>
            <div>
              <p className="text-sm text-white font-medium">Javi (Coach)</p>
              <p className="font-mono text-[7px] text-[#b3cdff] uppercase tracking-widest">Coach</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            {[
              { me: false, text: "How are the energy levels this week?" },
              { me: true, text: "Way better. Sleep's been solid." },
              { me: false, text: "Good. Increase the bench by 2.5kg next session." },
              { me: true, text: "On it 💪" },
              { me: false, text: "Great work this week 💪" },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-2xl text-xs max-w-[70%] ${m.me ? "bg-[#b3cdff] text-[#141414] rounded-br-sm" : "bg-[#1a222c] text-white rounded-bl-sm"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#2d3a4b] relative">
            <input disabled placeholder="Message Javi..." className="w-full bg-[#121821] border border-[#2d3a4b] rounded-full px-4 py-2.5 text-sm text-gray-600 placeholder-gray-600 cursor-not-allowed" />
            <LockedOverlay />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [28, 29, 30, 1, 2, 3, 4];
  const hasDot = [true, false, true, true, false, true, false];
  const events = [
    { tag: "LIVE", color: "#86efac", title: "Group Coaching Call", date: "Thu, May 1", time: "7:00 PM PHT" },
    { tag: "DEADLINE", color: "#fbbf24", title: "Weekly Check-In Deadline", date: "Sun, May 4", time: "11:59 PM PHT" },
    { tag: "1:1", color: "#b3cdff", title: "1:1 Progress Review", date: "Fri, May 9", time: "By Appointment" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Apr 28 — May 4</p>
          <p className="font-mono text-[8px] text-[#b3cdff] uppercase tracking-widest">This Week</p>
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => (
            <div key={d} className={`flex flex-col items-center py-3 gap-1 ${i === 3 ? "bg-[#b3cdff]/10" : ""}`}>
              <p className="font-mono text-[7px] text-gray-500 uppercase">{d}</p>
              <p className={`font-mono text-sm font-light ${i === 3 ? "text-[#b3cdff]" : i < 3 ? "text-gray-600" : "text-white"}`}>{dates[i]}</p>
              {hasDot[i] && <div className={`w-1 h-1 rounded-full ${i === 3 ? "bg-[#b3cdff]" : "bg-[#2d3a4b]"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="bg-[#121821] border border-[#2d3a4b] rounded p-4 flex items-center gap-4">
            <div className="text-center min-w-[44px]">
              <p className="font-mono text-[7px] text-gray-500 uppercase">{e.date.split(" ")[0]}</p>
              <p className="font-mono text-lg font-light text-white">{e.date.split(" ")[2] || e.date.split(" ")[1]}</p>
              <p className="font-mono text-[7px] text-gray-500 uppercase">{e.date.split(" ")[e.date.split(" ").length - 1]}</p>
            </div>
            <div className="w-px self-stretch bg-[#2d3a4b]" />
            <div className="flex-1">
              <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border rounded-sm mb-2 inline-block" style={{ color: e.color, borderColor: e.color + "40", backgroundColor: e.color + "10" }}>{e.tag}</span>
              <p className="text-sm font-light text-white">{e.title}</p>
              <p className="font-mono text-[8px] text-gray-500 mt-0.5">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const tabContent: Record<Tab, React.ReactNode> = {
    home: <HomeTab />,
    programs: <ProgramsTab />,
    community: <CommunityTab />,
    messages: <MessagesTab />,
    schedule: <ScheduleTab />,
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">

      {/* Preview Banner */}
      <div className="bg-[#b3cdff] text-[#141414] text-center py-3 px-4 flex items-center justify-center gap-4 flex-wrap">
        <p className="font-mono text-[9px] tracking-widest uppercase font-bold">Preview Mode — This is what your dashboard looks like inside</p>
        <Link href="/system" className="font-mono text-[8px] tracking-widest uppercase bg-[#141414] text-[#b3cdff] px-4 py-1.5 rounded-full font-bold hover:bg-[#121821] transition-colors whitespace-nowrap">
          Join the System →
        </Link>
      </div>

      {/* Sidebar (desktop) */}
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-60 bg-[#0a0f16] border-r border-[#2d3a4b] fixed top-[44px] bottom-0 z-20">
          <div className="px-6 py-7 border-b border-[#2d3a4b]">
            <ZLogo className="h-5 text-white" />
            <p className="font-mono text-[8px] tracking-[0.4em] text-[#b3cdff] uppercase mt-2">Member Portal</p>
          </div>
          <nav className="flex-1 py-5 px-3 space-y-0.5">
            {NAV.map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all border-l-2 ${active ? "bg-[#b3cdff]/10 text-[#b3cdff] border-[#b3cdff]" : "text-gray-400 hover:text-white hover:bg-[#121821] border-transparent"}`}
                >
                  {item.icon}
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#2d3a4b]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#86efac]/15 border border-[#86efac]/30 flex items-center justify-center font-mono text-[8px] text-[#86efac]">PS</div>
              <div>
                <p className="text-xs text-white">Priya</p>
                <span className="font-mono text-[7px] tracking-widest uppercase text-[#86efac]">Member</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-60 flex flex-col">
          <header className="sticky top-[44px] z-10 bg-[#141414]/95 backdrop-blur border-b border-[#2d3a4b] px-5 py-4 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.3em] text-gray-400 uppercase">{NAV.find(n => n.id === activeTab)?.label}</span>
            <span className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 border border-[#86efac]/30 text-[#86efac] bg-[#86efac]/5 rounded-sm">Preview</span>
          </header>

          <div className="flex-1 p-5 pb-28 md:pb-8">
            {tabContent[activeTab]}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0f16]/95 backdrop-blur-md border-t border-[#2d3a4b] flex">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-[#b3cdff]" : "text-gray-500"}`}
            >
              {item.icon}
              <span className="font-mono text-[7px] tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
