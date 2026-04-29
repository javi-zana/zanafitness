"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export type ProfileData = {
  id: string;
  email: string;
  plan?: string;
  status?: string;
  role?: string;
  nickname?: string;
  avatar_color?: string;
  fitness_goal?: string;
  instagram?: string;
  tiktok?: string;
  bio?: string;
} | null;

type Tab = "home" | "community" | "messages" | "programs" | "schedule" | "members" | "ranks";
type Category = "All" | "Announcements" | "Check-ins" | "Wins" | "Q&A";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USER = { name: "Javier", plan: "All In", day: 12, phase: 1, streak: 12, points: 72 };

type DBPost = {
  id: string;
  user_id: string;
  author_name: string;
  is_coach: boolean;
  category: string;
  content: string;
  created_at: string;
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

type DBComment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

const PROGRAMS = [
  {
    id: 1, title: "ZANA Training System", phase: "Phase 1 — Foundations",
    description: "12 weeks of structured progressive overload. Build the base before you build the peak.",
    progress: 34, locked: false, active: true, accentColor: "#b3cdff", href: "/workout",
  },
  {
    id: 2, title: "Nutrition Blueprint", phase: "Complete Guide",
    description: "Calorie targets, macro splits, meal timing, and the supplement stack that actually matters.",
    progress: 17, locked: false, active: false, accentColor: "#86efac", href: "/nutrition",
  },
  {
    id: 3, title: "Mindset Protocol", phase: "Mental Edge Series",
    description: "The psychological framework behind elite physical performance. Not motivation — method.",
    progress: 0, locked: true, active: false, accentColor: "#fbbf24", href: null,
  },
  {
    id: 4, title: "Recovery Science", phase: "Sleep & Stress Module",
    description: "Optimize sleep, manage cortisol, train harder by recovering smarter.",
    progress: 0, locked: true, active: false, accentColor: "#f472b6", href: null,
  },
];

const EVENTS = [
  { id: 1, title: "Group Coaching Call", host: "Javier Lorenzana", date: "Thu, May 1", time: "7:00 PM PHT", tag: "LIVE", meetUrl: "https://meet.google.com/new" },
  { id: 2, title: "Weekly Check-In Deadline", host: null, date: "Sun, May 4", time: "11:59 PM PHT", tag: "DEADLINE", meetUrl: null },
  { id: 3, title: "1:1 Progress Review", host: "Javier Lorenzana", date: "Fri, May 9", time: "By Appointment", tag: "1:1", meetUrl: null },
  { id: 4, title: "Group Coaching Call", host: "Javier Lorenzana", date: "Thu, May 15", time: "7:00 PM PHT", tag: "LIVE", meetUrl: "https://meet.google.com/new" },
  { id: 5, title: "Monthly Deload Week Begins", host: null, date: "Mon, May 19", time: "All day", tag: "PROGRAM", meetUrl: null },
];

const MEMBERS_LIST = [
  { id: 1, name: "Priya Sharma", initials: "PS", plan: "All In", joined: "Jan 2026", online: false, streak: 67 },
  { id: 2, name: "Aiko Tanaka", initials: "AT", plan: "All In", joined: "Feb 2026", online: false, streak: 45 },
  { id: 3, name: "Marcus Chen", initials: "MC", plan: "All In", joined: "Mar 2026", online: true, streak: 28 },
  { id: 4, name: "Sofia Reyes", initials: "SR", plan: "Committed", joined: "Mar 2026", online: true, streak: 21 },
  { id: 5, name: "James Kim", initials: "JK", plan: "Committed", joined: "Mar 2026", online: false, streak: 19 },
  { id: 6, name: "Daniel Park", initials: "DP", plan: "Entry", joined: "Apr 2026", online: false, streak: 12 },
  { id: 7, name: "Ryan Nguyen", initials: "RN", plan: "Committed", joined: "Apr 2026", online: true, streak: 9 },
  { id: 8, name: "Kevin Liu", initials: "KL", plan: "Entry", joined: "Apr 2026", online: false, streak: 5 },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: "Priya Sharma", initials: "PS", points: 243, streak: 67, delta: "+8", isUser: false },
  { rank: 2, name: "Aiko Tanaka", initials: "AT", points: 196, streak: 45, delta: "+5", isUser: false },
  { rank: 3, name: "Marcus Chen", initials: "MC", points: 173, streak: 28, delta: "+12", isUser: false },
  { rank: 4, name: "Sofia Reyes", initials: "SR", points: 134, streak: 21, delta: "+7", isUser: false },
  { rank: 5, name: "James Kim", initials: "JK", points: 98, streak: 19, delta: "+3", isUser: false },
  { rank: 6, name: "Daniel Park", initials: "DP", points: 76, streak: 12, delta: "+5", isUser: false },
  { rank: 7, name: "Javier", initials: "JL", points: 72, streak: 12, delta: "+4", isUser: true },
  { rank: 8, name: "Ryan Nguyen", initials: "RN", points: 45, streak: 9, delta: "+2", isUser: false },
  { rank: 9, name: "Kevin Liu", initials: "KL", points: 28, streak: 5, delta: "+1", isUser: false },
];

// ─── ZANA SVG Logos ───────────────────────────────────────────────────────────

const ZLogo = ({ className = "h-7" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const ZMark = ({ className = "h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v9h18V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCommunity({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMessages({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPrograms({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSchedule({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMembers({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconRanks({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    "All In": "text-[#b3cdff] border-[#b3cdff]/30 bg-[#b3cdff]/10",
    "Committed": "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10",
    "Entry": "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10",
  };
  return (
    <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${colors[plan] ?? "text-gray-400 border-gray-700"}`}>
      {plan}
    </span>
  );
}

function Avatar({ initials, size = "md", online, color }: { initials: string; size?: "sm" | "md" | "lg"; online?: boolean; color?: string }) {
  const sz = { sm: "w-7 h-7 text-[9px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" }[size];
  const c = color ?? "#b3cdff";
  return (
    <div className="relative shrink-0">
      <div
        className={`${sz} rounded-full flex items-center justify-center font-mono font-bold tracking-wider border`}
        style={{ color: c, borderColor: c + "40", backgroundColor: c + "15" }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0b0e14] ${online ? "bg-[#86efac]" : "bg-[#1e2a38]"}`} />
      )}
    </div>
  );
}

// ─── Tab: Home ────────────────────────────────────────────────────────────────

function HomeTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, false, false, false];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <p className="font-mono text-[8px] tracking-[0.4em] text-[#b3cdff] uppercase mb-3">Good morning</p>
        <h1 className="font-display text-5xl md:text-6xl uppercase text-white leading-none">
          {USER.name}.
        </h1>
      </div>

      {/* Phase + Streak strip */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded-xl px-4 py-4 flex items-center justify-between">
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Day</p>
          <p className="font-display text-3xl text-white leading-none">{USER.day}</p>
        </div>
        <div className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded-xl px-4 py-4 flex items-center justify-between">
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Phase</p>
          <p className="font-display text-3xl text-white leading-none">0{USER.phase}</p>
        </div>
        <button
          onClick={() => onNavigate("ranks")}
          className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded-xl px-4 py-4 flex items-center justify-between hover:border-[#b3cdff]/40 transition-colors"
        >
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Streak</p>
          <p className="font-display text-3xl text-[#b3cdff] leading-none">{USER.streak}</p>
        </button>
      </div>

      {/* Today's Session */}
      <div className="bg-[#0f141b] border border-[#1e2a38] rounded-xl p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-2">Today&apos;s Session</p>
            <h2 className="font-display text-3xl uppercase text-white leading-none">
              Lower Body<br />Hypertrophy
            </h2>
          </div>
          <span className="font-mono text-[8px] tracking-widest text-gray-500 uppercase border border-[#1e2a38] px-2 py-1 rounded">
            45 min
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5 font-mono text-[9px] text-gray-400 uppercase tracking-widest">
          <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">4</p>Exercises
          </div>
          <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">16</p>Sets
          </div>
          <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">RPE 8</p>Target
          </div>
        </div>
        <Link
          href="/workout"
          className="block w-full text-center bg-[#b3cdff] text-[#0b0e14] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded-xl hover:bg-white transition-colors"
        >
          Start Session
        </Link>
      </div>

      {/* Week Progress */}
      <div className="bg-[#0f141b] border border-[#1e2a38] rounded-xl p-6">
        <div className="flex justify-between items-center mb-5">
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-400 uppercase">This Week</p>
          <p className="font-mono text-[8px] tracking-widest text-[#b3cdff] uppercase">4 / 7 Days</p>
        </div>
        <div className="flex gap-2">
          {weekDays.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-full aspect-square rounded-sm flex items-center justify-center ${completed[i] ? "bg-[#b3cdff]" : i === 4 ? "border-2 border-[#b3cdff] bg-transparent" : "bg-[#111820]"}`}>
                {completed[i] && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#0f141b" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="font-mono text-[8px] text-gray-500 uppercase">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <Link href="/nutrition">
        <div className="bg-[#0f141b] border border-[#1e2a38] rounded-xl p-6 flex justify-between items-center hover:border-[#b3cdff]/40 transition-colors cursor-pointer group">
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] text-gray-400 uppercase mb-2 group-hover:text-[#b3cdff] transition-colors">Nutrition</p>
            <p className="text-base font-light tracking-widest uppercase text-white">On Track</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#86efac] flex items-center justify-center">
            <svg viewBox="0 0 12 12" className="w-4 h-4" fill="none" stroke="#86efac" strokeWidth="2">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Schedule shortcut */}
      <button
        onClick={() => onNavigate("schedule")}
        className="w-full bg-[#0f141b] border border-[#1e2a38] rounded-xl p-5 flex items-center justify-between hover:border-[#b3cdff]/40 transition-colors group"
      >
        <div className="text-left">
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-400 uppercase mb-1 group-hover:text-[#b3cdff] transition-colors">Next Event</p>
          <p className="text-sm font-light tracking-wide text-white">Group Coaching Call</p>
          <p className="font-mono text-[9px] text-gray-500 mt-0.5">Thu, May 1 · 7:00 PM PHT</p>
        </div>
        <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-1 rounded border text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10">
          LIVE
        </span>
      </button>

      {/* Coach's Note */}
      <div className="bg-[#0f141b] border-l-2 border-l-[#b3cdff] border border-[#1e2a38] rounded-xl p-6">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Coach&apos;s Note</p>
        <p className="text-sm font-light leading-relaxed text-gray-300">
          Control the eccentric. Drop the ego. Progression comes from tension, not just moving weight from point A to B.
        </p>
      </div>

      <InstallAppBanner />
    </div>
  );
}

// ─── Install Banner ───────────────────────────────────────────────────────────

function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    if (isIOS) { setPlatform("ios"); setVisible(true); }
    else if (isAndroid) { setPlatform("android"); setVisible(true); }
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setVisible(false);
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  }

  const iosSteps = [
    { n: "1.", text: <p>Tap the <span className="text-white font-medium">Share</span> button <span className="text-gray-500">(box with arrow pointing up)</span></p> },
    { n: "2.", text: <p>Scroll down and tap <span className="text-white font-medium">"Add to Home Screen"</span></p> },
    { n: "3.", text: <p>Tap <span className="text-white font-medium">"Add"</span> in the top right corner</p> },
  ];
  const androidSteps = [
    { n: "1.", text: <p>Tap the <span className="text-white font-medium">three-dot menu</span> in Chrome <span className="text-gray-500">(top right corner)</span></p> },
    { n: "2.", text: <p>Tap <span className="text-white font-medium">"Add to Home Screen"</span></p> },
    { n: "3.", text: <p>Tap <span className="text-white font-medium">"Add"</span> to confirm</p> },
  ];
  const steps = platform === "ios" ? iosSteps : androidSteps;

  return (
    <>
      <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-1">Get the App</p>
          <p className="text-sm font-light text-white">Add ZANA to your home screen</p>
          <p className="font-mono text-[8px] text-gray-500 mt-0.5">No app store needed.</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-4 py-2.5 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors"
        >
          Install
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-[#111820] border border-[#1e2a38] rounded-2xl p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-6">Add to Home Screen</p>
            <div className="space-y-5 text-sm text-gray-300 leading-relaxed">
              {steps.map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className="font-mono text-[#b3cdff] shrink-0">{s.n}</span>
                  {s.text}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-8 w-full font-mono text-[9px] tracking-widest uppercase py-3 border border-[#1e2a38] text-gray-400 rounded hover:text-white transition-colors"
            >Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Tab: Community ───────────────────────────────────────────────────────────

function postInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function groupPostsByDate(posts: DBPost[]) {
  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
  const yestMid = new Date(todayMid); yestMid.setDate(todayMid.getDate() - 1);
  const groups = new Map<string, DBPost[]>();
  for (const p of posts) {
    const d = new Date(p.created_at); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === todayMid.getTime()) label = "Today";
    else if (d.getTime() === yestMid.getTime()) label = "Yesterday";
    else label = new Date(p.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(p);
  }
  return Array.from(groups.entries()).map(([label, ps]) => ({ label, posts: ps }));
}

function CommunityTab({ userInitials, userName, avatarColor, userId }: {
  userInitials: string; userName: string; avatarColor: string; userId: string;
}) {
  const supabase = createClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<DBPost[]>([]);
  const [composerText, setComposerText] = useState("");
  const [composerCategory, setComposerCategory] = useState("Check-ins");
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, DBComment[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const categories = ["All", "Announcements", "Check-ins", "Wins", "Q&A"];
  const postCategories = ["Check-ins", "Wins", "Q&A"];
  const categoryColors: Record<string, string> = {
    Announcements: "text-[#b3cdff] bg-[#b3cdff]/10 border-[#b3cdff]/30",
    "Check-ins": "text-[#86efac] bg-[#86efac]/10 border-[#86efac]/30",
    Wins: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
    "Q&A": "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/30",
  };

  useEffect(() => {
    loadPosts();
    supabase.from("profiles").select("role").eq("id", userId).single()
      .then(({ data }) => { if (data?.role === "coach") setIsCoach(true); });
  }, []);

  async function loadPosts() {
    setLoading(true);
    const [{ data: rawPosts }, { data: allLikes }, { data: myLikes }, { data: allComments }] = await Promise.all([
      supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("community_likes").select("post_id"),
      supabase.from("community_likes").select("post_id").eq("user_id", userId),
      supabase.from("community_comments").select("post_id"),
    ]);
    const likeCount: Record<string, number> = {};
    for (const l of allLikes ?? []) likeCount[l.post_id] = (likeCount[l.post_id] ?? 0) + 1;
    const myLikeSet = new Set((myLikes ?? []).map(l => l.post_id));
    const commentCount: Record<string, number> = {};
    for (const c of allComments ?? []) commentCount[c.post_id] = (commentCount[c.post_id] ?? 0) + 1;
    setPosts((rawPosts ?? []).map(p => ({
      ...p,
      likes_count: likeCount[p.id] ?? 0,
      comments_count: commentCount[p.id] ?? 0,
      liked_by_me: myLikeSet.has(p.id),
    })));
    setLoading(false);
  }

  async function handlePost() {
    if (!composerText.trim() || !userId) return;
    const { data, error } = await supabase.from("community_posts").insert({
      user_id: userId, author_name: userName, is_coach: isCoach,
      category: composerCategory, content: composerText.trim(),
    }).select().single();
    if (!error && data) {
      setPosts(prev => [{ ...data, likes_count: 0, comments_count: 0, liked_by_me: false }, ...prev]);
      setComposerText(""); setShowComposer(false);
    }
  }

  async function toggleLike(postId: string, liked: boolean) {
    if (liked) {
      await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", userId);
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1, liked_by_me: false } : p));
    } else {
      await supabase.from("community_likes").insert({ post_id: postId, user_id: userId });
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1, liked_by_me: true } : p));
    }
  }

  async function toggleComments(postId: string) {
    setOpenComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    if (comments[postId] !== undefined) return;
    const { data } = await supabase.from("community_comments").select("*")
      .eq("post_id", postId).order("created_at", { ascending: true });
    setComments(prev => ({ ...prev, [postId]: data ?? [] }));
  }

  async function submitComment(postId: string) {
    const text = (replyText[postId] ?? "").trim();
    if (!text) return;
    const { data, error } = await supabase.from("community_comments").insert({
      post_id: postId, user_id: userId, author_name: userName, content: text,
    }).select().single();
    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), data] }));
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      setReplyText(prev => ({ ...prev, [postId]: "" }));
    }
  }

  async function deletePost(postId: string) {
    await supabase.from("community_posts").delete().eq("id", postId);
    setPosts(ps => ps.filter(p => p.id !== postId));
    setOpenMenuId(null);
  }

  async function saveEdit(postId: string) {
    const text = editText.trim();
    if (!text) return;
    const { error } = await supabase.from("community_posts").update({ content: text }).eq("id", postId);
    if (!error) {
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, content: text } : p));
      setEditingId(null);
    }
  }

  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);
  const grouped = groupPostsByDate(filtered);

  return (
    <div className="max-w-2xl mx-auto space-y-5" onClick={() => setOpenMenuId(null)}>
      {/* Composer trigger */}
      {!showComposer ? (
        <div
          className="bg-[#0f141b] border border-[#1e2a38] rounded p-4 flex items-center gap-3 cursor-pointer hover:border-[#b3cdff]/30 transition-colors"
          onClick={() => setShowComposer(true)}
        >
          <Avatar initials={userInitials} size="sm" color={avatarColor} />
          <div className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded px-4 py-3 font-mono text-[10px] text-gray-500 tracking-wide">
            Share a win, ask a question, post a check-in...
          </div>
        </div>
      ) : (
        <div className="bg-[#0f141b] border border-[#b3cdff]/30 rounded p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar initials={userInitials} size="sm" color={avatarColor} />
            <span className="text-sm text-white">{userName}</span>
          </div>
          <textarea
            autoFocus value={composerText} onChange={e => setComposerText(e.target.value)}
            placeholder="What's on your mind?" rows={3}
            className="w-full bg-[#0f141b] border border-[#1e2a38] rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors resize-none font-light leading-relaxed"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {postCategories.map(c => (
                <button key={c} onClick={() => setComposerCategory(c)}
                  className={`shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors ${composerCategory === c ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#1e2a38] hover:text-white"}`}
                >{c}</button>
              ))}
              {isCoach && (
                <button onClick={() => setComposerCategory("Announcements")}
                  className={`shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors ${composerCategory === "Announcements" ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#1e2a38] hover:text-white"}`}
                >Announcement</button>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setShowComposer(false); setComposerText(""); }}
                className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#1e2a38] text-gray-400 rounded hover:text-white transition-colors"
              >Cancel</button>
              <button onClick={handlePost} disabled={!composerText.trim()}
                className="font-mono text-[8px] tracking-widest uppercase px-4 py-2 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`shrink-0 font-mono text-[8px] tracking-[0.2em] uppercase px-3 py-2 rounded border transition-colors ${activeCategory === c ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#1e2a38] bg-[#0f141b] hover:border-[#b3cdff]/30 hover:text-white"}`}
          >{c}</button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600">No posts yet. Be the first.</p>
        </div>
      )}

      {/* Posts grouped by date */}
      {grouped.map(group => (
        <div key={group.label} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1e2a38]" />
            <span className="font-mono text-[8px] tracking-widest uppercase text-gray-500 shrink-0">{group.label}</span>
            <div className="flex-1 h-px bg-[#1e2a38]" />
          </div>

          {group.posts.map(post => {
            const isAnnouncement = post.category === "Announcements";
            const commentsOpen = openComments.has(post.id);
            const postComments = comments[post.id] ?? [];
            return (
              <div key={post.id} className={`border rounded overflow-hidden transition-colors ${isAnnouncement ? "bg-[#131b2e] border-[#b3cdff]/25" : "bg-[#0f141b] border-[#1e2a38]"}`}>
                {isAnnouncement && <div className="h-px w-full bg-[#b3cdff]/40" />}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar initials={postInitials(post.author_name)} size="md" online={post.is_coach ? true : undefined} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{post.author_name}</span>
                        {post.is_coach && (
                          <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">Coach</span>
                        )}
                        <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${categoryColors[post.category] ?? ""}`}>
                          {post.category}
                        </span>
                      </div>
                      <p className="font-mono text-[9px] text-gray-500 mt-0.5">{formatTime(post.created_at)}</p>
                    </div>
                    {/* Menu — visible only to post owner or coach */}
                    {(post.user_id === userId || isCoach) && (
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-white transition-colors rounded hover:bg-[#111820]"
                        >
                          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                            <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
                          </svg>
                        </button>
                        {openMenuId === post.id && (
                          <div className="absolute right-0 top-8 z-20 bg-[#111820] border border-[#1e2a38] rounded shadow-xl min-w-[120px] overflow-hidden" onClick={e => e.stopPropagation()}>
                            {post.user_id === userId && (
                              <button
                                onClick={() => { setEditingId(post.id); setEditText(post.content); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-left font-mono text-[9px] tracking-widest uppercase text-gray-300 hover:bg-[#1e2a38] hover:text-white transition-colors"
                              >
                                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => deletePost(post.id)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left font-mono text-[9px] tracking-widest uppercase text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                            >
                              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l1 9h6l1-9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId === post.id ? (
                    <div className="mb-4 space-y-2">
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0f141b] border border-[#b3cdff]/40 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#b3cdff]/70 transition-colors resize-none leading-relaxed"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(post.id)}
                          disabled={!editText.trim()}
                          className="font-mono text-[8px] tracking-widest uppercase px-3 py-1.5 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40"
                        >Save</button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="font-mono text-[8px] tracking-widest uppercase px-3 py-1.5 border border-[#1e2a38] text-gray-400 rounded hover:text-white transition-colors"
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
                  )}

                  <div className="flex items-center gap-5 pt-3 border-t border-[#1a222c]">
                    <button onClick={() => toggleLike(post.id, post.liked_by_me)}
                      className={`flex items-center gap-1.5 font-mono text-[9px] transition-colors uppercase tracking-widest ${post.liked_by_me ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"}`}
                    >
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill={post.liked_by_me ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 2.667L9.667 6H14l-3.333 2.667L12 13.333 8 10.667 4 13.333l1.333-4.666L2 6h4.333L8 2.667z" />
                      </svg>
                      {post.likes_count}
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 font-mono text-[9px] transition-colors uppercase tracking-widest ${commentsOpen ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"}`}
                    >
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 10a2 2 0 01-2 2H4l-2 2V4a2 2 0 012-2h8a2 2 0 012 2v6z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.comments_count}
                    </button>
                  </div>

                  {commentsOpen && (
                    <div className="mt-4 space-y-3 pt-3 border-t border-[#1a222c]">
                      {postComments.map(comment => (
                        <div key={comment.id} className="flex gap-2.5">
                          <Avatar initials={postInitials(comment.author_name)} size="sm" />
                          <div className="flex-1 bg-[#0f141b] rounded px-3 py-2.5">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-medium text-white">{comment.author_name}</span>
                              <span className="font-mono text-[8px] text-gray-600">{formatTime(comment.created_at)}</span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <Avatar initials={userInitials} size="sm" color={avatarColor} />
                        <input
                          value={replyText[post.id] ?? ""}
                          onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                          placeholder="Write a reply..."
                          className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
                        />
                        <button onClick={() => submitComment(post.id)} disabled={!(replyText[post.id] ?? "").trim()}
                          className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40"
                        >Reply</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Messages ────────────────────────────────────────────────────────────

type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  other: { id: string; name: string; initials: string; color: string; role: string };
  last_preview: string;
};

type DM = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type MemberProfile = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
};

function dmInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function MessagesTab({ userId, userName, userInitials, avatarColor }: {
  userId: string; userName: string; userInitials: string; avatarColor: string;
}) {
  const supabase = createClient();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [allMembers, setAllMembers] = useState<MemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const activeConv = convs.find(c => c.id === activeId) ?? null;

  useEffect(() => {
    if (!userId) return;
    loadConvs();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    channelRef.current?.unsubscribe();
    channelRef.current = supabase
      .channel(`dm-${activeId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "direct_messages",
        filter: `conversation_id=eq.${activeId}`,
      }, (payload) => {
        const incoming = payload.new as DM;
        setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
        setConvs(prev => prev.map(c =>
          c.id === activeId ? { ...c, last_preview: incoming.content, last_message_at: incoming.created_at } : c
        ));
      })
      .subscribe();
    return () => { channelRef.current?.unsubscribe(); };
  }, [activeId]);

  async function loadConvs() {
    setLoadingConvs(true);
    const { data: raw } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (!raw?.length) { setConvs([]); setLoadingConvs(false); return; }

    const otherIds = raw.map(c => c.participant_1 === userId ? c.participant_2 : c.participant_1);
    const profRes = await fetch(`/api/profiles?ids=${otherIds.join(",")}`);
    const { profiles } = await profRes.json();
    const profileMap = Object.fromEntries((profiles ?? []).map((p: { id: string; nickname?: string; email?: string; avatar_color?: string; role?: string }) => [p.id, p]));

    const convIds = raw.map(c => c.id);
    const { data: lastMsgs } = await supabase
      .from("direct_messages").select("conversation_id, content")
      .in("conversation_id", convIds).order("created_at", { ascending: false });
    const previewMap: Record<string, string> = {};
    for (const m of lastMsgs ?? []) {
      if (!previewMap[m.conversation_id]) previewMap[m.conversation_id] = m.content;
    }

    setConvs(raw.map(c => {
      const othId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const p = profileMap[othId];
      const name = p?.nickname || p?.email?.split("@")[0] || "Member";
      return { ...c, other: { id: othId, name, initials: dmInitials(name), color: p?.avatar_color ?? "#b3cdff", role: p?.role ?? "member" }, last_preview: previewMap[c.id] ?? "" };
    }));
    setLoadingConvs(false);
  }

  async function loadMessages(convId: string) {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("direct_messages").select("*")
      .eq("conversation_id", convId).order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoadingMsgs(false);
  }

  async function loadMembers() {
    const res = await fetch(`/api/profiles?exclude=${userId}`);
    const { profiles } = await res.json();
    setAllMembers((profiles ?? []).map((p: { id: string; nickname?: string; email?: string; avatar_color?: string; role?: string }) => {
      const name = p.nickname || p.email?.split("@")[0] || "User";
      return { id: p.id, name, initials: dmInitials(name), color: p.avatar_color ?? "#b3cdff", role: p.role ?? "member" };
    }));
  }

  async function openOrCreateConv(otherId: string) {
    const [p1, p2] = [userId, otherId].sort();
    const { data: existing } = await supabase
      .from("conversations").select("id")
      .eq("participant_1", p1).eq("participant_2", p2).maybeSingle();
    if (existing) {
      setActiveId(existing.id);
    } else {
      const { data: created } = await supabase
        .from("conversations").insert({ participant_1: p1, participant_2: p2 })
        .select().single();
      if (created) { setActiveId(created.id); await loadConvs(); }
    }
    setShowPicker(false); setSearch("");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !activeId) return;
    setInput("");
    await supabase
      .from("direct_messages")
      .insert({ conversation_id: activeId, sender_id: userId, content: text });
    await supabase.from("conversations")
      .update({ last_message_at: new Date().toISOString() }).eq("id", activeId);
  }

  const filteredMembers = allMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-130px)] md:h-[calc(100dvh-80px)] flex border border-[#1e2a38] rounded overflow-hidden relative">

      {/* ── Conversation list ── */}
      <div className={`w-full md:w-72 shrink-0 bg-[#0a0f16] border-r border-[#1e2a38] flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-3.5 border-b border-[#1e2a38] flex items-center justify-between">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-gray-400">Messages</p>
          <button
            onClick={() => { setShowPicker(true); loadMembers(); }}
            className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors flex items-center gap-1"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" />
            </div>
          )}
          {!loadingConvs && convs.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="font-mono text-[8px] tracking-widest uppercase text-gray-600">No conversations yet</p>
              <button onClick={() => { setShowPicker(true); loadMembers(); }}
                className="mt-3 font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors"
              >Start one →</button>
            </div>
          )}
          {convs.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#1a222c] ${activeId === conv.id ? "bg-[#b3cdff]/5 border-l-2 border-l-[#b3cdff]" : "hover:bg-[#0f141b]"}`}
            >
              <Avatar initials={conv.other.initials} size="sm" color={conv.other.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs text-white font-medium truncate">{conv.other.name}</p>
                  {conv.other.role === "coach" && (
                    <span className="font-mono text-[6px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30 shrink-0">Coach</span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-gray-500 truncate">{conv.last_preview || "No messages yet"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat view ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeId ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3.5 border-b border-[#1e2a38] flex items-center gap-3 bg-[#0a0f16]">
              <button onClick={() => setActiveId(null)} className="md:hidden text-gray-400 hover:text-white transition-colors mr-1">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 3L4 8l6 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <Avatar initials={activeConv.other.initials} size="sm" color={activeConv.other.color} />
              <div>
                <p className="text-sm text-white font-medium">{activeConv.other.name}</p>
                {activeConv.other.role === "coach" && (
                  <p className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff]">Coach</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs && (
                <div className="flex justify-center py-8">
                  <div className="w-4 h-4 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" />
                </div>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-gray-600">No messages yet. Say something.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === userId;
                const prevMsg = messages[i - 1];
                const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-7 shrink-0">
                        {showAvatar && <Avatar initials={activeConv.other.initials} size="sm" color={activeConv.other.color} />}
                      </div>
                    )}
                    <div className={`max-w-[72%] md:max-w-sm space-y-0.5 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-[#b3cdff] text-[#0f141b] rounded-br-sm" : "bg-[#111820] text-white rounded-bl-sm"}`}>
                        {msg.content}
                      </div>
                      <p className="font-mono text-[8px] text-gray-600 px-1">
                        {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#1e2a38] flex gap-2 bg-[#0a0f16]">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={`Message ${activeConv.other.name}...`}
                className="flex-1 bg-[#0f141b] border border-[#1e2a38] rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#b3cdff] text-[#0f141b] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-90" fill="currentColor">
                  <path d="M8 1l7 7-7 7M1 8h14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <svg viewBox="0 0 48 48" className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 30H5a2 2 0 01-2-2V8a2 2 0 012-2h38a2 2 0 012 2v20a2 2 0 01-2 2h-8l-8 8v-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600">Select a conversation</p>
            <button onClick={() => { setShowPicker(true); loadMembers(); }}
              className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors"
            >or start a new one →</button>
          </div>
        )}
      </div>

      {/* ── New DM picker overlay ── */}
      {showPicker && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-[#0f141b] border border-[#1e2a38] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e2a38] flex items-center justify-between">
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-gray-400">New Message</p>
              <button onClick={() => { setShowPicker(false); setSearch(""); }} className="text-gray-500 hover:text-white transition-colors">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3 border-b border-[#1e2a38]">
              <input
                autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full bg-[#0f141b] border border-[#1e2a38] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 && (
                <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600 text-center py-8">No members found</p>
              )}
              {filteredMembers.map(m => (
                <button key={m.id} onClick={() => openOrCreateConv(m.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#111820] transition-colors text-left border-b border-[#1a222c] last:border-0"
                >
                  <Avatar initials={m.initials} size="sm" color={m.color} />
                  <div>
                    <p className="text-sm text-white">{m.name}</p>
                    {m.role === "coach" && <p className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff]">Coach</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Programs ────────────────────────────────────────────────────────────

type ContentType = "workout" | "meal_plan" | "instructions" | "video";
type ContentBlock = {
  id: string;
  program_id: number;
  type: ContentType;
  title: string;
  label: string | null;
  body: string | null;
  created_at: string;
};
const CONTENT_META: Record<ContentType, { label: string; color: string }> = {
  workout:      { label: "Workout Plan",  color: "#b3cdff" },
  meal_plan:    { label: "Meal Plan",     color: "#86efac" },
  instructions: { label: "Instructions", color: "#fbbf24" },
  video:        { label: "Video",         color: "#f472b6" },
};

function ProgramsTab() {
  const supabase = createClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [contents, setContents] = useState<Record<number, ContentBlock[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const toggleExpand = async (progId: number, locked: boolean) => {
    if (locked) return;
    if (expanded === progId) { setExpanded(null); return; }
    setExpanded(progId);
    if (contents[progId] !== undefined) return;
    setLoadingId(progId);
    const { data } = await supabase
      .from("program_content")
      .select("*")
      .eq("program_id", progId)
      .order("created_at", { ascending: true });
    setContents(prev => ({ ...prev, [progId]: data ?? [] }));
    setLoadingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Your Library</p>
        <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Programs</h2>
      </div>

      {PROGRAMS.map(prog => (
        <div
          key={prog.id}
          className={`bg-[#0f141b] border rounded overflow-hidden transition-all ${prog.locked ? "border-[#1a222c] opacity-60" : "border-[#1e2a38]"}`}
        >
          <div className="h-0.5 w-full" style={{ backgroundColor: prog.accentColor }} />

          {/* Header — clickable to expand (unlocked only) */}
          <button
            onClick={() => toggleExpand(prog.id, prog.locked)}
            className={`w-full p-5 flex items-start justify-between text-left ${!prog.locked ? "hover:bg-[#111820]/50 transition-colors" : "cursor-default"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[8px] tracking-widest uppercase" style={{ color: prog.accentColor }}>{prog.phase}</p>
                {prog.locked ? (
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="7" width="10" height="8" rx="1" />
                    <path d="M5 7V5a3 3 0 016 0v2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <div className="flex items-center gap-2">
                    {prog.active && <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">Active</span>}
                    <svg viewBox="0 0 16 16" className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${expanded === prog.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-base font-light tracking-[0.1em] uppercase text-white mb-1">{prog.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{prog.description}</p>

              {!prog.locked && (
                <div className="mt-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Progress</span>
                    <span className="font-mono text-[8px] text-gray-400">{prog.progress}%</span>
                  </div>
                  <div className="h-0.5 bg-[#111820] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${prog.progress}%`, backgroundColor: prog.accentColor }} />
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Expand: content blocks */}
          {!prog.locked && expanded === prog.id && (
            <div className="border-t border-[#1e2a38] px-5 pt-4 pb-5 space-y-3">
              {loadingId === prog.id ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-[#b3cdff]/20 border-t-[#b3cdff] rounded-full animate-spin" />
                </div>
              ) : (contents[prog.id] ?? []).length === 0 ? (
                <p className="font-mono text-[9px] text-gray-600 text-center py-4 uppercase tracking-widest">No content posted yet. Check back soon.</p>
              ) : (
                <div className="space-y-3">
                  {(contents[prog.id] ?? []).map(block => {
                    const meta = CONTENT_META[block.type];
                    return (
                      <div key={block.id} className="bg-[#0f141b] border border-[#1e2a38] rounded p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded border" style={{ color: meta.color, borderColor: meta.color + "40", backgroundColor: meta.color + "10" }}>
                            {meta.label}
                          </span>
                          {block.label && <span className="font-mono text-[8px] text-gray-500">{block.label}</span>}
                        </div>
                        <p className="text-sm font-medium text-white mb-2">{block.title}</p>
                        {block.body && (
                          block.type === "video"
                            ? <a href={block.body} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-[#b3cdff] hover:underline break-all">{block.body}</a>
                            : <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{block.body}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CTA */}
              <Link
                href={prog.href!}
                className="block w-full text-center font-mono text-[8px] tracking-[0.25em] uppercase py-3 rounded border transition-colors"
                style={{ borderColor: prog.accentColor + "40", color: prog.accentColor }}
              >
                {prog.progress > 0 ? "Continue Program" : "Start Program"}
              </Link>
            </div>
          )}

          {/* Locked CTA */}
          {prog.locked && (
            <div className="px-5 pb-5">
              <Link href="/system" className="block w-full text-center font-mono text-[8px] tracking-widest uppercase py-3 rounded border border-[#1a222c] text-gray-600 hover:border-[#b3cdff]/30 hover:text-[#b3cdff] transition-colors">
                Upgrade to unlock
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Schedule ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const tagColors: Record<string, string> = {
    LIVE: "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10",
    DEADLINE: "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10",
    "1:1": "text-[#b3cdff] border-[#b3cdff]/30 bg-[#b3cdff]/10",
    PROGRAM: "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10",
  };
  const tagDotColors: Record<string, string> = {
    LIVE: "bg-[#86efac]", DEADLINE: "bg-[#f87171]", "1:1": "bg-[#b3cdff]", PROGRAM: "bg-[#fbbf24]",
  };

  const todayRef = new Date();
  todayRef.setHours(0, 0, 0, 0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(todayRef));

  function getWeekStart(offset: number): Date {
    const d = new Date(todayRef);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff + offset * 7);
    return d;
  }

  const weekStart = getWeekStart(weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = weekDays[6];

  function parseEventDate(dateStr: string): Date {
    const comma = dateStr.indexOf(",");
    const rest = comma >= 0 ? dateStr.slice(comma + 2) : dateStr;
    return new Date(`${rest}, 2026`);
  }

  function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function eventsOnDay(date: Date) {
    return EVENTS.filter(e => isSameDay(parseEventDate(e.date), date));
  }

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-US", opts);

  const weekLabel = `${fmt(weekStart, { month: "short", day: "numeric" })} – ${fmt(weekEnd, { month: "short", day: "numeric" })}`;

  const displayedEvents = selectedDate
    ? EVENTS.filter(e => isSameDay(parseEventDate(e.date), selectedDate))
    : EVENTS;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Schedule</p>
        <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">This Week</h2>
      </div>

      {/* ── Weekly calendar ── */}
      <div className="bg-[#0f141b] border border-[#1e2a38] rounded overflow-hidden">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a38]">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded hover:bg-[#111820]"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[9px] tracking-widest text-gray-300 uppercase">{weekLabel}</p>
            {weekOffset !== 0 && (
              <button
                onClick={() => { setWeekOffset(0); setSelectedDate(new Date(todayRef)); }}
                className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/20 hover:bg-[#b3cdff]/20 transition-colors"
              >Today</button>
            )}
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded hover:bg-[#111820]"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-7 p-3 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
            const date = weekDays[i];
            const isToday = isSameDay(date, todayRef);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            const isPast = date < todayRef;
            const dayEvents = eventsOnDay(date);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-all ${
                  isSelected
                    ? "bg-[#b3cdff] text-[#0f141b]"
                    : isToday
                    ? "bg-[#b3cdff]/10 border border-[#b3cdff]/30 text-[#b3cdff]"
                    : isPast
                    ? "text-gray-600 hover:bg-[#111820] hover:text-gray-400"
                    : "text-gray-400 hover:bg-[#111820] hover:text-white"
                }`}
              >
                <span className="font-mono text-[8px] tracking-widest uppercase">{label}</span>
                <span className={`text-sm leading-none ${isSelected ? "font-semibold" : "font-light"}`}>
                  {date.getDate()}
                </span>
                <div className="flex gap-0.5 min-h-[6px] items-center">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span
                      key={j}
                      className={`w-1 h-1 rounded-full ${isSelected ? "bg-[#0f141b]/50" : tagDotColors[e.tag] ?? "bg-gray-500"}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recurring note */}
      <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-4 font-mono text-[9px] text-gray-400 tracking-wide">
        <span className="text-[#b3cdff]">Every Thursday — </span>
        Group Coaching Call with Javier. 7:00 PM Manila time.
      </div>

      {/* Events for selected day or all upcoming */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase">
            {selectedDate
              ? fmt(selectedDate, { weekday: "long", month: "long", day: "numeric" })
              : "Upcoming"}
          </p>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="font-mono text-[7px] tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
            >Show all</button>
          )}
        </div>

        {displayedEvents.length === 0 ? (
          <div className="bg-[#0f141b] border border-[#1e2a38] rounded p-10 text-center">
            <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600">Nothing scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedEvents.map(event => (
              <div key={event.id} className="bg-[#0f141b] border border-[#1e2a38] rounded p-5 flex items-start gap-4 hover:border-[#1e2a38]/80 transition-colors">
                <div className="text-center min-w-[48px]">
                  <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest leading-tight">
                    {event.date.split(",")[0]}
                  </p>
                  <p className="font-mono text-lg font-light text-white leading-tight">
                    {event.date.split(" ")[1]}
                  </p>
                  <p className="font-mono text-[8px] text-gray-500 uppercase leading-tight">
                    {event.date.split(" ")[2]}
                  </p>
                </div>

                <div className="w-px self-stretch bg-[#1e2a38] mx-1" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${tagColors[event.tag]}`}>
                      {event.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-light tracking-wide text-white mb-0.5">{event.title}</h3>
                  {event.host && <p className="font-mono text-[9px] text-gray-500">with {event.host}</p>}
                  <p className="font-mono text-[9px] text-gray-500 mt-0.5">{event.time}</p>
                </div>

                {event.tag === "LIVE" && event.meetUrl && (
                  <a href={event.meetUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors"
                  >Join</a>
                )}
                {event.tag === "1:1" && (
                  <a href="mailto:me@javilorenzana.com?subject=1:1 Progress Review Request"
                    className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors"
                  >Book</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab() {
  const online = MEMBERS_LIST.filter(m => m.online).length;
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">The Roster</p>
          <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Members</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#86efac]" />
          <span className="font-mono text-[9px] text-gray-400">{online} online</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Members", value: MEMBERS_LIST.length },
          { label: "This Month", value: "4" },
          { label: "Avg Streak", value: "26d" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f141b] border border-[#1e2a38] rounded p-4 text-center">
            <p className="text-xl font-light text-white mb-1">{s.value}</p>
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MEMBERS_LIST.map(member => (
          <div key={member.id} className="bg-[#0f141b] border border-[#1e2a38] rounded p-4 flex items-center gap-3">
            <Avatar initials={member.initials} size="md" online={member.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <PlanBadge plan={member.plan} />
              </div>
              <p className="font-mono text-[9px] text-gray-500 mt-0.5">Joined {member.joined}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] text-[#b3cdff]">{member.streak}d</p>
              <p className="font-mono text-[8px] text-gray-600 uppercase tracking-widest">streak</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Ranks ───────────────────────────────────────────────────────────────

function RanksTab() {
  const [period, setPeriod] = useState<"weekly" | "alltime">("alltime");
  const userEntry = LEADERBOARD_DATA.find(e => e.isUser)!;
  const maxPoints = LEADERBOARD_DATA[0].points;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-[#0f141b] border border-[#b3cdff]/20 rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-4">Your Standing</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-light text-white">#{userEntry.rank}</p>
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-1">Rank</p>
          </div>
          <div className="w-px h-12 bg-[#1e2a38]" />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Points</span>
              <span className="font-mono text-[8px] text-[#b3cdff]">{userEntry.points} / {maxPoints}</span>
            </div>
            <div className="h-1 bg-[#111820] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b3cdff] rounded-full"
                style={{ width: `${(userEntry.points / maxPoints) * 100}%` }}
              />
            </div>
            <p className="font-mono text-[8px] text-gray-500 mt-2">{userEntry.streak}d streak · {userEntry.delta} this week</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["weekly", "alltime"] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 font-mono text-[8px] tracking-widest uppercase py-2.5 rounded border transition-colors ${
              period === p
                ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]"
                : "text-gray-400 border-[#1e2a38] bg-[#0f141b] hover:text-white"
            }`}
          >
            {p === "weekly" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      <div className="bg-[#0f141b] border border-[#1e2a38] rounded overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_60px_50px] gap-3 px-4 py-3 border-b border-[#1e2a38]">
          {["#", "Member", "Points", "Streak"].map(h => (
            <p key={h} className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {LEADERBOARD_DATA.map((entry, i) => (
          <div
            key={entry.rank}
            className={`grid grid-cols-[40px_1fr_60px_50px] gap-3 px-4 py-3 items-center transition-colors ${
              entry.isUser
                ? "bg-[#b3cdff]/5 border-l-2 border-l-[#b3cdff]"
                : i < LEADERBOARD_DATA.length - 1 ? "border-b border-[#0f141b]" : ""
            }`}
          >
            <p className={`font-mono text-sm ${entry.rank <= 3 ? "text-[#b3cdff]" : "text-gray-500"} font-light`}>
              {entry.rank}
            </p>
            <div className="flex items-center gap-2 min-w-0">
              <Avatar initials={entry.initials} size="sm" />
              <p className={`text-sm truncate ${entry.isUser ? "text-[#b3cdff]" : "text-white"}`}>
                {entry.name} {entry.isUser && <span className="font-mono text-[8px] text-[#b3cdff]/60">(you)</span>}
              </p>
            </div>
            <div>
              <p className="font-mono text-sm text-white">{entry.points}</p>
              <p className="font-mono text-[8px] text-[#86efac]">{entry.delta}</p>
            </div>
            <p className="font-mono text-[10px] text-gray-400">{entry.streak}d</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: (props: { active?: boolean }) => JSX.Element }[] = [
  { id: "home", label: "Home", icon: IconHome },
  { id: "community", label: "Community", icon: IconCommunity },
  { id: "messages", label: "Messages", icon: IconMessages },
  { id: "programs", label: "Programs", icon: IconPrograms },
  { id: "schedule", label: "Schedule", icon: IconSchedule },
  { id: "members", label: "Members", icon: IconMembers },
  { id: "ranks", label: "Ranks", icon: IconRanks },
];

function getInitials(source: string, email?: string): string {
  const base = source.includes("@") ? source.split("@")[0] : source;
  const parts = base.split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  const fallback = (email ?? "").split("@")[0];
  return fallback.slice(0, 2).toUpperCase() || "ME";
}

export default function MemberDashboard({ profile }: { profile: ProfileData }) {
  const userEmail = profile?.email ?? "";
  const userNickname = profile?.nickname ?? "";
  const userInitials = getInitials(userNickname || userEmail, userEmail);
  const displayName = userNickname || (userEmail ? userEmail.split("@")[0].split(/[._-]/)[0] : USER.name);
  const displayNameCapitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const displayPlan = profile?.plan ?? USER.plan;
  const avatarColor = profile?.avatar_color ?? "#b3cdff";

  const [activeTab, setActiveTab] = useState<Tab>("home");

  const currentLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#070b10] border-r border-[#1e2a38] fixed h-full z-20">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#1e2a38]">
          <Link href="/" title="Back to home">
            <ZLogo className="h-6 text-white hover:opacity-70 transition-opacity" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${
                  active
                    ? "bg-[#b3cdff]/10 text-[#b3cdff] rounded-lg"
                    : "text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                }`}
              >
                <item.icon active={active} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-5 border-t border-[#1e2a38]">
          <div className="flex items-center gap-3">
            <Avatar initials={userInitials} size="sm" online={true} color={avatarColor} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate capitalize">{displayNameCapitalized}</p>
              <PlanBadge plan={displayPlan} />
            </div>
            <Link href="/profile" className="text-gray-500 hover:text-white transition-colors">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v6M5 8h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#1e2a38] px-5 py-4 flex items-center justify-between">
          {/* Mobile: Z mark — tapping goes home */}
          <Link href="/" className="md:hidden" title="Back to home">
            <ZMark className="h-5 text-white hover:opacity-70 transition-opacity" />
          </Link>
          {/* Desktop: current section */}
          <p className="hidden md:block font-mono text-[10px] tracking-[0.3em] text-gray-400 uppercase">{currentLabel}</p>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 17a1.5 1.5 0 003 0" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#b3cdff] rounded-full" />
            </button>
            {/* Avatar */}
            <Link href="/profile">
              <Avatar initials={userInitials} size="sm" online={true} color={avatarColor} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-5 pb-28 md:pb-8">
          {activeTab === "home" && <HomeTab onNavigate={setActiveTab} />}
          {activeTab === "community" && <CommunityTab userInitials={userInitials} userName={displayNameCapitalized} avatarColor={avatarColor} userId={profile?.id ?? ""} />}
          {activeTab === "messages" && <MessagesTab userId={profile?.id ?? ""} userName={displayNameCapitalized} userInitials={userInitials} avatarColor={avatarColor} />}
          {activeTab === "programs" && <ProgramsTab />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "ranks" && <RanksTab />}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#070b10]/95 backdrop-blur-md border-t border-[#1e2a38] flex">
        {NAV_ITEMS.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? "text-[#b3cdff]" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon active={active} />
              <span className="font-mono text-[7px] tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
