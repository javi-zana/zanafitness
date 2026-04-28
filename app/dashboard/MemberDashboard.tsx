"use client";

import { useState } from "react";
import Link from "next/link";

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

type Tab = "home" | "community" | "programs" | "schedule" | "members" | "ranks";
type Category = "All" | "Announcements" | "Check-ins" | "Wins" | "Q&A";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USER = { name: "Javier", plan: "All In", day: 12, phase: 1, streak: 12, points: 72 };

type Post = {
  id: number;
  author: string;
  initials: string;
  isCoach: boolean;
  category: Category;
  time: string;
  content: string;
  likes: number;
  comments: number;
  pinned?: boolean;
};

const INITIAL_POSTS: Post[] = [
  {
    id: 1, author: "Javier Lorenzana", initials: "JL", isCoach: true,
    category: "Announcements", time: "2h ago",
    content: "Week 3 check-in is live. Drop your weigh-in + this week's top lift in the comments. Let's see who's ahead of schedule.",
    likes: 14, comments: 8,
  },
  {
    id: 2, author: "Marcus Chen", initials: "MC", isCoach: false,
    category: "Wins", time: "5h ago",
    content: "New bench PR — 185 lbs × 5. Three weeks in and the numbers are moving. Program is no joke.",
    likes: 31, comments: 6,
  },
  {
    id: 3, author: "Sofia Reyes", initials: "SR", isCoach: false,
    category: "Check-ins", time: "Yesterday",
    content: "Week 3 Day 2 complete. Legs were shaking by the end of the Romanian DLs but I didn't stop. First time I've finished a leg day feeling proud.",
    likes: 22, comments: 4,
  },
  {
    id: 4, author: "Daniel Park", initials: "DP", isCoach: false,
    category: "Q&A", time: "Yesterday",
    content: "Question for Javi — on upper body days, should I be hitting failure on every set or leaving 1–2 reps in reserve? Recovery has been slower this week.",
    likes: 5, comments: 3,
  },
  {
    id: 5, author: "Aiko Tanaka", initials: "AT", isCoach: false,
    category: "Check-ins", time: "2 days ago",
    content: "Day 45 done. Still here. Consistency is the whole game.",
    likes: 38, comments: 9,
  },
];

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
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0f141b] ${online ? "bg-[#86efac]" : "bg-[#2d3a4b]"}`} />
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
        <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-1">Good morning</p>
        <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white">
          {USER.name}.
        </h1>
      </div>

      {/* Phase + Streak strip */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded px-4 py-3 flex items-center justify-between">
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Day</p>
          <p className="text-2xl font-light text-white tracking-tight">{USER.day}</p>
        </div>
        <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded px-4 py-3 flex items-center justify-between">
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Phase</p>
          <p className="text-2xl font-light text-white tracking-tight">0{USER.phase}</p>
        </div>
        <button
          onClick={() => onNavigate("ranks")}
          className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded px-4 py-3 flex items-center justify-between hover:border-[#b3cdff]/40 transition-colors"
        >
          <p className="font-mono text-[8px] tracking-widest text-gray-500 uppercase">Streak</p>
          <p className="text-2xl font-light text-[#b3cdff] tracking-tight">{USER.streak}</p>
        </button>
      </div>

      {/* Today's Session */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-2">Today&apos;s Session</p>
            <h2 className="text-xl font-light tracking-[0.1em] uppercase text-white leading-tight">
              Lower Body<br />Hypertrophy
            </h2>
          </div>
          <span className="font-mono text-[8px] tracking-widest text-gray-500 uppercase border border-[#2d3a4b] px-2 py-1 rounded">
            45 min
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5 font-mono text-[9px] text-gray-400 uppercase tracking-widest">
          <div className="bg-[#0f141b] border border-[#2d3a4b] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">4</p>Exercises
          </div>
          <div className="bg-[#0f141b] border border-[#2d3a4b] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">16</p>Sets
          </div>
          <div className="bg-[#0f141b] border border-[#2d3a4b] rounded p-3 text-center">
            <p className="text-white text-base font-light mb-1">RPE 8</p>Target
          </div>
        </div>
        <Link
          href="/workout"
          className="block w-full text-center bg-[#b3cdff] text-[#0f141b] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors"
        >
          Start Session
        </Link>
      </div>

      {/* Week Progress */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-6">
        <div className="flex justify-between items-center mb-5">
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-400 uppercase">This Week</p>
          <p className="font-mono text-[8px] tracking-widest text-[#b3cdff] uppercase">4 / 7 Days</p>
        </div>
        <div className="flex gap-2">
          {weekDays.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-full aspect-square rounded-sm flex items-center justify-center ${completed[i] ? "bg-[#b3cdff]" : i === 4 ? "border-2 border-[#b3cdff] bg-transparent" : "bg-[#1a222c]"}`}>
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
        <div className="bg-[#121821] border border-[#2d3a4b] rounded p-6 flex justify-between items-center hover:border-[#b3cdff]/40 transition-colors cursor-pointer group">
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
        className="w-full bg-[#121821] border border-[#2d3a4b] rounded p-5 flex items-center justify-between hover:border-[#b3cdff]/40 transition-colors group"
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
      <div className="bg-[#121821] border-l-2 border-l-[#b3cdff] border border-[#2d3a4b] rounded p-6">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Coach&apos;s Note</p>
        <p className="text-sm font-light leading-relaxed text-gray-300">
          Control the eccentric. Drop the ego. Progression comes from tension, not just moving weight from point A to B.
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Community ───────────────────────────────────────────────────────────

function CommunityTab({ userInitials, userName, avatarColor }: { userInitials: string; userName: string; avatarColor: string }) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [composerText, setComposerText] = useState("");
  const [composerCategory, setComposerCategory] = useState<Category>("Check-ins");
  const [showComposer, setShowComposer] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const categories: Category[] = ["All", "Announcements", "Check-ins", "Wins", "Q&A"];
  const postCategories: Category[] = ["Check-ins", "Wins", "Q&A"];

  const categoryColors: Record<string, string> = {
    Announcements: "text-[#b3cdff] bg-[#b3cdff]/10 border-[#b3cdff]/30",
    "Check-ins": "text-[#86efac] bg-[#86efac]/10 border-[#86efac]/30",
    Wins: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
    "Q&A": "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/30",
  };

  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);

  const handlePost = () => {
    if (!composerText.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      author: userName,
      initials: userInitials,
      isCoach: false,
      category: composerCategory,
      time: "Just now",
      content: composerText.trim(),
      likes: 0,
      comments: 0,
    };
    setPosts(prev => [newPost, ...prev]);
    setComposerText("");
    setShowComposer(false);
    setActiveCategory("All");
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
      } else {
        next.add(postId);
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
      return next;
    });
  };

  const submitReply = (postId: number) => {
    if (!replyText.trim()) return;
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Composer trigger */}
      {!showComposer ? (
        <div
          className="bg-[#121821] border border-[#2d3a4b] rounded p-4 flex items-center gap-3 cursor-pointer hover:border-[#b3cdff]/30 transition-colors"
          onClick={() => setShowComposer(true)}
        >
          <Avatar initials={userInitials} size="sm" color={avatarColor} />
          <div className="flex-1 bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 font-mono text-[10px] text-gray-500 tracking-wide">
            Share a win, ask a question, post a check-in...
          </div>
        </div>
      ) : (
        <div className="bg-[#121821] border border-[#b3cdff]/30 rounded p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar initials={userInitials} size="sm" color={avatarColor} />
            <span className="text-sm text-white">{userName}</span>
          </div>
          <textarea
            autoFocus
            value={composerText}
            onChange={e => setComposerText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors resize-none font-light leading-relaxed"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {postCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setComposerCategory(c)}
                  className={`shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors ${
                    composerCategory === c
                      ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]"
                      : "text-gray-400 border-[#2d3a4b] hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setShowComposer(false); setComposerText(""); }}
                className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!composerText.trim()}
                className="font-mono text-[8px] tracking-widest uppercase px-4 py-2 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`shrink-0 font-mono text-[8px] tracking-[0.2em] uppercase px-3 py-2 rounded border transition-colors ${
              activeCategory === c
                ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]"
                : "text-gray-400 border-[#2d3a4b] bg-[#121821] hover:border-[#b3cdff]/30 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.map(post => (
        <div key={post.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-5 transition-colors">
          <div className="flex items-start gap-3 mb-4">
            <Avatar initials={post.initials} size="md" online={post.isCoach ? true : undefined} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">{post.author}</span>
                {post.isCoach && (
                  <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">
                    Coach
                  </span>
                )}
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${categoryColors[post.category]}`}>
                  {post.category}
                </span>
              </div>
              <p className="font-mono text-[9px] text-gray-500 mt-0.5">{post.time}</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
          <div className="flex items-center gap-5 pt-3 border-t border-[#1a222c]">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 font-mono text-[9px] transition-colors uppercase tracking-widest ${
                likedPosts.has(post.id) ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"
              }`}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill={likedPosts.has(post.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2.667L9.667 6H14l-3.333 2.667L12 13.333 8 10.667 4 13.333l1.333-4.666L2 6h4.333L8 2.667z" />
              </svg>
              {post.likes}
            </button>
            <button
              onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
              className={`flex items-center gap-1.5 font-mono text-[9px] transition-colors uppercase tracking-widest ${
                replyingTo === post.id ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"
              }`}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 10a2 2 0 01-2 2H4l-2 2V4a2 2 0 012-2h8a2 2 0 012 2v6z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {post.comments}
            </button>
          </div>
          {/* Inline reply */}
          {replyingTo === post.id && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitReply(post.id)}
                placeholder="Write a reply..."
                className="flex-1 bg-[#0f141b] border border-[#2d3a4b] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
              />
              <button
                onClick={() => submitReply(post.id)}
                disabled={!replyText.trim()}
                className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Programs ────────────────────────────────────────────────────────────

function ProgramsTab() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Your Library</p>
        <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Programs</h2>
      </div>

      {PROGRAMS.map(prog => (
        <div
          key={prog.id}
          className={`bg-[#121821] border rounded overflow-hidden ${prog.locked ? "border-[#1a222c] opacity-60" : "border-[#2d3a4b] hover:border-[#2d3a4b]/80"} transition-all`}
        >
          <div className="h-0.5 w-full" style={{ backgroundColor: prog.accentColor }} />

          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono text-[8px] tracking-widest uppercase mb-1" style={{ color: prog.accentColor }}>
                  {prog.phase}
                </p>
                <h3 className="text-base font-light tracking-[0.1em] uppercase text-white">{prog.title}</h3>
              </div>
              {prog.locked ? (
                <div className="border border-[#2d3a4b] rounded p-1.5">
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="7" width="10" height="8" rx="1" />
                    <path d="M5 7V5a3 3 0 016 0v2" strokeLinecap="round" />
                  </svg>
                </div>
              ) : prog.active ? (
                <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-1 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">
                  Active
                </span>
              ) : null}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">{prog.description}</p>

            {!prog.locked && (
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Progress</span>
                  <span className="font-mono text-[8px] text-gray-400">{prog.progress}%</span>
                </div>
                <div className="h-0.5 bg-[#1a222c] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${prog.progress}%`, backgroundColor: prog.accentColor }}
                  />
                </div>
              </div>
            )}

            {prog.locked ? (
              <Link
                href="/system"
                className="block w-full text-center font-mono text-[8px] tracking-widest uppercase py-3 rounded border border-[#1a222c] text-gray-600 hover:border-[#b3cdff]/30 hover:text-[#b3cdff] transition-colors"
              >
                Upgrade to unlock
              </Link>
            ) : (
              <Link
                href={prog.href!}
                className="block w-full text-center font-mono text-[8px] tracking-[0.25em] uppercase py-3 rounded border transition-colors"
                style={{
                  borderColor: prog.accentColor + "40",
                  color: prog.accentColor,
                }}
              >
                {prog.progress > 0 ? "Continue" : "Start"}
              </Link>
            )}
          </div>
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

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Upcoming</p>
        <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Schedule</h2>
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-4 font-mono text-[9px] text-gray-400 tracking-wide">
        <span className="text-[#b3cdff]">Every Thursday — </span>
        Group Coaching Call with Javier. 7:00 PM Manila time.
      </div>

      <div className="space-y-3">
        {EVENTS.map(event => (
          <div key={event.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-5 flex items-start gap-4 hover:border-[#2d3a4b]/80 transition-colors">
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

            <div className="w-px self-stretch bg-[#2d3a4b] mx-1" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${tagColors[event.tag]}`}>
                  {event.tag}
                </span>
              </div>
              <h3 className="text-sm font-light tracking-wide text-white mb-0.5">{event.title}</h3>
              {event.host && (
                <p className="font-mono text-[9px] text-gray-500">with {event.host}</p>
              )}
              <p className="font-mono text-[9px] text-gray-500 mt-0.5">{event.time}</p>
            </div>

            {event.tag === "LIVE" && event.meetUrl && (
              <a
                href={event.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors"
              >
                Join
              </a>
            )}
            {event.tag === "1:1" && (
              <a
                href="mailto:me@javilorenzana.com?subject=1:1 Progress Review Request"
                className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors"
              >
                Book
              </a>
            )}
          </div>
        ))}
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
          <div key={s.label} className="bg-[#121821] border border-[#2d3a4b] rounded p-4 text-center">
            <p className="text-xl font-light text-white mb-1">{s.value}</p>
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MEMBERS_LIST.map(member => (
          <div key={member.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-4 flex items-center gap-3">
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
      <div className="bg-[#121821] border border-[#b3cdff]/20 rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-4">Your Standing</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-light text-white">#{userEntry.rank}</p>
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-1">Rank</p>
          </div>
          <div className="w-px h-12 bg-[#2d3a4b]" />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Points</span>
              <span className="font-mono text-[8px] text-[#b3cdff]">{userEntry.points} / {maxPoints}</span>
            </div>
            <div className="h-1 bg-[#1a222c] rounded-full overflow-hidden">
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
                : "text-gray-400 border-[#2d3a4b] bg-[#121821] hover:text-white"
            }`}
          >
            {p === "weekly" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_60px_50px] gap-3 px-4 py-3 border-b border-[#2d3a4b]">
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
    <div className="min-h-screen bg-[#0f141b] text-white flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0a0f16] border-r border-[#2d3a4b] fixed h-full z-20">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-[#2d3a4b]">
          <ZLogo className="h-6 text-white" />
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
                    ? "bg-[#b3cdff]/10 text-[#b3cdff] border-l-2 border-[#b3cdff]"
                    : "text-gray-400 hover:text-white hover:bg-[#121821] border-l-2 border-transparent"
                }`}
              >
                <item.icon active={active} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-[#2d3a4b]">
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
        <header className="sticky top-0 z-10 bg-[#0f141b]/90 backdrop-blur border-b border-[#2d3a4b] px-5 py-4 flex items-center justify-between">
          {/* Mobile: Z mark */}
          <div className="md:hidden">
            <ZMark className="h-5 text-white" />
          </div>
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
          {activeTab === "community" && <CommunityTab userInitials={userInitials} userName={displayNameCapitalized} avatarColor={avatarColor} />}
          {activeTab === "programs" && <ProgramsTab />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "ranks" && <RanksTab />}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0f16]/95 backdrop-blur-md border-t border-[#2d3a4b] flex">
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
