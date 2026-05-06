"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "home" | "programs" | "messages" | "schedule";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "programs", label: "Program", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "messages", label: "Messages", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "schedule", label: "Schedule", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg> },
];

function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-[#162212]/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#b0e455] mb-2" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/></svg>
      <p className="text-[9px] tracking-widest uppercase text-[#b0e455] font-semibold">Join to unlock</p>
    </div>
  );
}

function HomeTab() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const loggedIdxs = new Set([0, 1, 3]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-2xl font-bold tracking-tight">Morning, Priya.</h1>
      </div>

      {/* Announcement */}
      <div className="bg-[#b0e455]/8 border border-[#b0e455]/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-4 h-4">
              <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#b0e455] font-semibold uppercase tracking-wider mb-1">Announcement</p>
            <p className="text-sm font-semibold text-[#edf5e2]/90 leading-snug">4 members hit PRs on deadlift this week. Consistent overload is working.</p>
            <p className="text-xs text-[#edf5e2]/30 mt-1">Today</p>
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="bg-[#162212] rounded-2xl p-4 border border-[#b0e455]/8">
        <p className="text-[10px] text-[#edf5e2]/30 tracking-wider uppercase mb-3">This Week</p>
        <div className="flex justify-between">
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const isPast = day < today;
            const hasLog = loggedIdxs.has(i);
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-medium uppercase ${isToday ? "text-[#b0e455]" : isPast ? "text-[#edf5e2]/30" : "text-[#edf5e2]/15"}`}>
                  {DAY_LABELS[i]}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isToday ? "bg-[#b0e455] text-[#0f1a0c]" : isPast ? "text-[#edf5e2]/45" : "text-[#edf5e2]/15"}`}>
                  {day.getDate()}
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${hasLog ? "bg-[#b0e455]" : "bg-transparent"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-[#162212] rounded-2xl p-5 border border-[#b0e455]/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-[#edf5e2]/40">Latest check-in</p>
            <p className="text-xs text-[#edf5e2]/25 mt-0.5">2d ago</p>
          </div>
          <span className="text-[10px] bg-[#b0e455]/10 border border-[#b0e455]/20 text-[#b0e455] px-2.5 py-1 rounded-full font-medium">Build Muscle</span>
        </div>
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-wider mb-1">Weight</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight">68.5</span>
              <span className="text-sm text-[#edf5e2]/40">kg</span>
            </div>
            <p className="text-xs mt-1 font-medium text-[#86efac]">−0.5 kg</p>
          </div>
          <div className="ml-2">
            <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-wider mb-2">Confidence</p>
            <div className="relative w-[72px] h-[72px] flex items-center justify-center">
              <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="#86efac" strokeOpacity="0.12" strokeWidth="5"/>
                <circle cx="36" cy="36" r="28" fill="none" stroke="#86efac" strokeWidth="5" strokeDasharray={`${(7/10)*2*Math.PI*28} ${2*Math.PI*28}`} strokeLinecap="round"/>
              </svg>
              <div className="flex flex-col items-center relative z-10">
                <span className="text-xl font-bold leading-none" style={{ color: "#86efac" }}>7</span>
                <span className="text-[9px] text-[#edf5e2]/30 font-medium leading-none mt-0.5">/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-wider uppercase mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Log Update", sub: "Weight & confidence", icon: <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/> },
            { label: "My Program", sub: "Training & nutrition", icon: <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/> },
            { label: "Messages", sub: "Chat with coach", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round"/> },
            { label: "Schedule", sub: "Book coaching call", icon: <><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/></> },
          ].map(a => (
            <div key={a.label} className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">{a.icon}</svg>
              </div>
              <div>
                <p className="text-sm font-semibold">{a.label}</p>
                <p className="text-xs text-[#edf5e2]/35 mt-0.5">{a.sub}</p>
              </div>
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
    { day: "Day 1", title: "Upper Body A", tag: "Chest / Shoulders / Tris", exercises: ["Bench Press 4×6-8", "Incline DB Press 3×10", "Cable Fly 3×12", "Shoulder Press 4×8", "Lateral Raises 3×15", "Tricep Pushdown 3×12"] },
    { day: "Day 2", title: "Lower Body A", tag: "Quads / Hamstrings / Glutes", exercises: ["Squat 4×5", "Romanian DL 3×10", "Leg Press 3×12", "Leg Curl 3×12", "Walking Lunge 3×10 each", "Calf Raise 4×15"] },
    { day: "Day 3", title: "Upper Body B", tag: "Back / Biceps / Rear Delts", exercises: ["Pull-up 4×6-8", "Barbell Row 4×8", "Seated Row 3×10", "Face Pull 3×15", "DB Curl 3×10", "Hammer Curl 3×12"] },
    { day: "Day 4", title: "Rest / Active Recovery", tag: "Walk · Stretch · Sleep", exercises: [] },
    { day: "Day 5", title: "Lower Body B", tag: "Posterior Chain Focus", exercises: ["Deadlift 4×4-5", "Bulgarian Split Squat 3×8", "Hip Thrust 3×12", "Leg Curl 3×10", "Seated Calf Raise 4×15"] },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">My Program</h1>
      </div>
      <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-widest">Phase 03 · ZANA Training System</p>
          <p className="text-2xl font-bold text-[#edf5e2] mt-1">34<span className="text-sm text-[#edf5e2]/40 ml-1">%</span></p>
        </div>
        <div className="w-32 h-1.5 bg-[#0f1a0c] rounded-full"><div className="h-1.5 bg-[#b0e455] rounded-full" style={{ width: "34%" }}/></div>
      </div>
      <div className="space-y-2">
        {days.map((d, i) => (
          <div key={i} className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#b0e455] font-semibold uppercase tracking-widest w-10">{d.day}</span>
                <div>
                  <p className="text-sm font-semibold text-[#edf5e2]">{d.title}</p>
                  <p className="text-xs text-[#edf5e2]/35 mt-0.5">{d.tag}</p>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className={`w-3.5 h-3.5 text-[#edf5e2]/25 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {open === i && d.exercises.length > 0 && (
              <div className="px-5 pb-4 space-y-2 border-t border-[#b0e455]/5">
                {d.exercises.map(e => (
                  <div key={e} className="flex items-center gap-3 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b0e455]/40 shrink-0"/>
                    <p className="text-xs text-[#edf5e2]/60">{e}</p>
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

function MessagesTab() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
      </div>
      <div className="space-y-1">
        {[
          { me: false, text: "How are the energy levels this week?" },
          { me: true, text: "Way better. Sleep's been solid." },
          { me: false, text: "Good. Increase the bench by 2.5kg next session." },
          { me: true, text: "On it 💪" },
          { me: false, text: "Great work this week 💪" },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.me ? "bg-[#b0e455] text-[#0f1a0c] rounded-br-sm font-medium" : "bg-[#1c2e16] text-[#edf5e2]/85 rounded-bl-sm border border-[#b0e455]/8"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <p className="text-right text-xs text-[#edf5e2]/30 mr-1">Seen</p>
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 bg-[#1c2e16] border border-[#b0e455]/12 rounded-2xl px-4 py-3">
          <p className="flex-1 text-sm text-[#edf5e2]/20">Message…</p>
          <div className="w-8 h-8 rounded-full bg-[#b0e455]/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2.5" className="w-4 h-4 translate-x-px"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <LockedOverlay/>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dates = [28, 29, 30, 1, 2, 3, 4];
  const hasDot = [true, false, true, true, false, true, false];
  const todayIdx = 3;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Schedule</h1>
      </div>
      <div className="bg-[#162212] rounded-2xl p-4 border border-[#b0e455]/8">
        <p className="text-[10px] text-[#edf5e2]/30 tracking-wider uppercase mb-3">This Week</p>
        <div className="flex justify-between">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-medium uppercase ${i === todayIdx ? "text-[#b0e455]" : i < todayIdx ? "text-[#edf5e2]/30" : "text-[#edf5e2]/15"}`}>{d}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i === todayIdx ? "bg-[#b0e455] text-[#0f1a0c]" : i < todayIdx ? "text-[#edf5e2]/45" : "text-[#edf5e2]/15"}`}>{dates[i]}</div>
              <div className={`w-1.5 h-1.5 rounded-full ${hasDot[i] ? "bg-[#b0e455]" : "bg-transparent"}`}/>
            </div>
          ))}
        </div>
      </div>
      {[
        { tag: "LIVE", color: "#86efac", title: "Group Coaching Call", date: "Thu, May 1", time: "7:00 PM PHT" },
        { tag: "1:1", color: "#b0e455", title: "1:1 Progress Review", date: "Fri, May 9", time: "By Appointment" },
      ].map((e, i) => (
        <div key={i} className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-center min-w-[44px]">
            <p className="text-[10px] text-[#edf5e2]/30 uppercase">{e.date.split(",")[0]}</p>
            <p className="text-2xl font-bold text-[#edf5e2]">{e.date.split(" ")[2] || e.date.split(" ")[1]}</p>
          </div>
          <div className="w-px self-stretch bg-[#b0e455]/10"/>
          <div className="flex-1">
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 border rounded-full mb-2 inline-block font-semibold" style={{ color: e.color, borderColor: e.color + "40", backgroundColor: e.color + "10" }}>{e.tag}</span>
            <p className="text-sm font-semibold text-[#edf5e2]">{e.title}</p>
            <p className="text-xs text-[#edf5e2]/35 mt-0.5">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const tabContent: Record<Tab, React.ReactNode> = {
    home: <HomeTab/>,
    programs: <ProgramsTab/>,
    messages: <MessagesTab/>,
    schedule: <ScheduleTab/>,
  };

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      {/* Preview Banner */}
      <div className="bg-[#b0e455] text-[#0f1a0c] py-3 px-4 flex items-center justify-between gap-4 shrink-0">
        <Link href="/" className="text-[9px] tracking-widest uppercase font-bold hover:opacity-70 transition whitespace-nowrap">
          ← Home
        </Link>
        <p className="text-[10px] tracking-widest uppercase font-bold text-center hidden sm:block">Preview Mode - This is what your dashboard looks like inside</p>
        <Link href="/system" className="text-[9px] tracking-widest uppercase bg-[#0f1a0c] text-[#b0e455] px-4 py-1.5 rounded-full font-bold hover:bg-[#162212] transition whitespace-nowrap">
          Join →
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pr-64">
          {/* Header bar */}
          <div className="sticky top-0 z-10 bg-[#162212]/95 backdrop-blur border-b border-[#b0e455]/8 px-5 py-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#edf5e2]/40 uppercase tracking-wider">{NAV.find(n => n.id === activeTab)?.label}</span>
            <span className="text-[9px] tracking-widest uppercase px-3 py-1 border border-[#b0e455]/30 text-[#b0e455] bg-[#b0e455]/8 rounded-full font-semibold">Preview</span>
          </div>
          <div className="px-5 py-5">
            {tabContent[activeTab]}
          </div>
        </main>

        {/* Desktop sidebar - RIGHT side */}
        <aside className="hidden md:flex flex-col fixed right-0 top-[44px] bottom-0 w-64 bg-[#0b1509] border-l border-[#b0e455]/12 z-20">
          {/* Logo */}
          <div className="px-5 pt-7 pb-6 border-b border-[#b0e455]/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#b0e455] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                  <path d="M0,2 H32 L18.3,14"/>
                  <path d="M13.7,18 L0,30 H32"/>
                </svg>
              </div>
              <div>
                <p className="text-[#edf5e2] font-bold text-lg tracking-tight leading-none">Zana</p>
                <p className="text-[9px] text-[#edf5e2]/30 tracking-widest uppercase leading-none mt-1">Fitness Platform</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            {NAV.map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all text-left ${
                    active ? "bg-[#b0e455] text-[#0b1509]" : "text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Profile + footer */}
          <div className="px-3 py-4 border-t border-[#b0e455]/8">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#edf5e2]/40">
              <div className="w-7 h-7 rounded-full bg-[#86efac]/15 border border-[#86efac]/30 flex items-center justify-center text-[10px] font-bold text-[#86efac] shrink-0">PS</div>
              <div>
                <p className="text-sm font-semibold text-[#edf5e2]/70">Priya</p>
                <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest">Member</p>
              </div>
            </div>
            <p className="text-[10px] text-[#edf5e2]/15 uppercase tracking-widest px-4 pt-2">© 2026 Zana Fitness</p>
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f1a0c]/95 backdrop-blur-md border-t border-[#b0e455]/8 flex z-50">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <div className={`w-12 h-7 flex items-center justify-center rounded-full transition-all ${active ? "bg-[#b0e455] text-[#0f1a0c]" : "text-[#edf5e2]/25"}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] tracking-wide uppercase font-medium ${active ? "text-[#b0e455]" : "text-[#edf5e2]/25"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
