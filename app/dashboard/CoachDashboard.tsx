"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProfileData } from "./MemberDashboard";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MEMBERS = [
  { id: 1, name: "Priya Sharma", email: "priya@example.com", initials: "PS", plan: "All In", status: "active", streak: 67, lastSeen: "Today", checkin: true },
  { id: 2, name: "Aiko Tanaka", email: "aiko@example.com", initials: "AT", plan: "All In", status: "active", streak: 45, lastSeen: "Today", checkin: true },
  { id: 3, name: "Marcus Chen", email: "marcus@example.com", initials: "MC", plan: "All In", status: "active", streak: 28, lastSeen: "Today", checkin: false },
  { id: 4, name: "Sofia Reyes", email: "sofia@example.com", initials: "SR", plan: "Committed", status: "active", streak: 21, lastSeen: "Yesterday", checkin: true },
  { id: 5, name: "James Kim", email: "james@example.com", initials: "JK", plan: "Committed", status: "active", streak: 19, lastSeen: "Yesterday", checkin: false },
  { id: 6, name: "Daniel Park", email: "daniel@example.com", initials: "DP", plan: "Entry", status: "active", streak: 12, lastSeen: "2 days ago", checkin: false },
  { id: 7, name: "Ryan Nguyen", email: "ryan@example.com", initials: "RN", plan: "Committed", status: "active", streak: 9, lastSeen: "3 days ago", checkin: false },
  { id: 8, name: "Kevin Liu", email: "kevin@example.com", initials: "KL", plan: "Entry", status: "active", streak: 5, lastSeen: "4 days ago", checkin: false },
];

const CHECKIN_POSTS = [
  { id: 1, author: "Priya Sharma", initials: "PS", time: "2h ago", category: "Check-ins", content: "Week 7 Day 3 — Deadlifts felt strong. Hit 145kg × 3. Sleep has been 8hrs consistently.", likes: 18, comments: 5 },
  { id: 2, author: "Marcus Chen", initials: "MC", time: "5h ago", category: "Wins", content: "New bench PR — 185 lbs × 5. Three weeks in and the numbers are moving.", likes: 31, comments: 6 },
  { id: 3, author: "Sofia Reyes", initials: "SR", time: "Yesterday", category: "Check-ins", content: "Week 3 Day 2 complete. Legs were shaking by the end of the Romanian DLs but I didn't stop.", likes: 22, comments: 4 },
  { id: 4, author: "Daniel Park", initials: "DP", time: "Yesterday", category: "Q&A", content: "Question for Javi — on upper body days, should I be hitting failure on every set or leaving 1–2 reps in reserve?", likes: 5, comments: 3 },
];

type CoachTab = "overview" | "members" | "community" | "programs" | "schedule";

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({ path, active }: { path: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-7 h-7 text-[9px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" }[size];
  return (
    <div className={`${sz} rounded-full bg-[#1e2d3d] border border-[#2d3a4b] flex items-center justify-center font-mono font-bold text-[#b3cdff] tracking-wider shrink-0`}>
      {initials}
    </div>
  );
}

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

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#121821] border border-[#2d3a4b] rounded p-5">
      <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-2">{label}</p>
      <p className="text-3xl font-light tracking-tight" style={{ color: accent ?? "#ffffff" }}>{value}</p>
      {sub && <p className="font-mono text-[9px] text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ coachName }: { coachName: string }) {
  const pendingCheckins = MEMBERS.filter(m => !m.checkin).length;
  const activeToday = MEMBERS.filter(m => m.lastSeen === "Today").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-1">Coach View</p>
        <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white">
          {coachName}.
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Members" value={MEMBERS.length} sub="active subscriptions" />
        <StatCard label="Active Today" value={activeToday} sub="logged in" accent="#86efac" />
        <StatCard label="Check-ins Due" value={pendingCheckins} sub="awaiting response" accent="#fbbf24" />
        <StatCard label="Avg Streak" value="26d" sub="across all members" accent="#b3cdff" />
      </div>

      {/* Pending check-ins */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[#fbbf24] uppercase">Pending Check-ins</p>
          <span className="font-mono text-[8px] text-gray-500">{pendingCheckins} members</span>
        </div>
        {MEMBERS.filter(m => !m.checkin).map((m, i) => (
          <div key={m.id} className={`flex items-center gap-3 px-5 py-3 ${i < MEMBERS.filter(x => !x.checkin).length - 1 ? "border-b border-[#0f141b]" : ""}`}>
            <Avatar initials={m.initials} size="sm" />
            <div className="flex-1">
              <p className="text-sm text-white">{m.name}</p>
              <p className="font-mono text-[9px] text-gray-500">Last seen {m.lastSeen} · {m.streak}d streak</p>
            </div>
            <PlanBadge plan={m.plan} />
          </div>
        ))}
      </div>

      {/* Recent activity feed */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Recent Activity</p>
        </div>
        {CHECKIN_POSTS.slice(0, 3).map((post, i) => (
          <div key={post.id} className={`flex items-start gap-3 px-5 py-4 ${i < 2 ? "border-b border-[#0f141b]" : ""}`}>
            <Avatar initials={post.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-white">{post.author}</p>
                <span className="font-mono text-[7px] text-gray-500">{post.time}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next call */}
      <div className="bg-[#121821] border border-[#86efac]/20 rounded p-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-widest text-[#86efac] uppercase mb-1">Next Coaching Call</p>
          <p className="text-base font-light text-white uppercase tracking-wide">Thursday, May 1</p>
          <p className="font-mono text-[9px] text-gray-500 mt-0.5">7:00 PM Manila time · 9 members registered</p>
        </div>
        <button className="font-mono text-[8px] tracking-widest uppercase px-4 py-3 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors shrink-0">
          Start Call
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const plans = ["All", "All In", "Committed", "Entry"];
  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "All" || m.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm"
        />
        <div className="flex gap-2">
          {plans.map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`font-mono text-[8px] tracking-widest uppercase px-3 py-2.5 rounded border transition-colors shrink-0 ${planFilter === p ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_100px_80px_80px_60px] gap-4 px-5 py-3 border-b border-[#2d3a4b]">
          {["Member", "Plan", "Streak", "Last Seen", "Check-in"].map(h => (
            <p key={h} className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center font-mono text-[9px] text-gray-500 uppercase tracking-widest">No members found</p>
        )}

        {filtered.map((m, i) => (
          <div
            key={m.id}
            className={`flex flex-col sm:grid sm:grid-cols-[1fr_100px_80px_80px_60px] gap-2 sm:gap-4 px-5 py-4 items-start sm:items-center hover:bg-[#0f141b] transition-colors ${i < filtered.length - 1 ? "border-b border-[#0f141b]" : ""}`}
          >
            {/* Member */}
            <div className="flex items-center gap-3">
              <Avatar initials={m.initials} size="sm" />
              <div>
                <p className="text-sm text-white">{m.name}</p>
                <p className="font-mono text-[9px] text-gray-500">{m.email}</p>
              </div>
            </div>
            {/* Plan */}
            <div><PlanBadge plan={m.plan} /></div>
            {/* Streak */}
            <p className="font-mono text-sm text-[#b3cdff]">{m.streak}d</p>
            {/* Last seen */}
            <p className="font-mono text-[9px] text-gray-400">{m.lastSeen}</p>
            {/* Check-in */}
            <div>
              {m.checkin
                ? <span className="w-5 h-5 rounded-full bg-[#86efac]/10 border border-[#86efac]/30 flex items-center justify-center">
                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="#86efac" strokeWidth="1.5"><path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                : <span className="w-5 h-5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                  </span>
              }
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[8px] text-gray-600 text-center uppercase tracking-widest">
        {filtered.length} of {MEMBERS.length} members
      </p>
    </div>
  );
}

// ─── Tab: Community ───────────────────────────────────────────────────────────

function CommunityTab() {
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("Announcements");
  const categories = ["Announcements", "General", "Check-ins", "Wins", "Q&A"];

  const categoryColors: Record<string, string> = {
    Announcements: "text-[#b3cdff] bg-[#b3cdff]/10 border-[#b3cdff]/30",
    "Check-ins": "text-[#86efac] bg-[#86efac]/10 border-[#86efac]/30",
    Wins: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
    "Q&A": "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/30",
    General: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Coach post composer */}
      <div className="bg-[#121821] border border-[#b3cdff]/20 rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-4">Post as Coach</p>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setPostCategory(c)}
              className={`shrink-0 font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 rounded border transition-colors ${postCategory === c ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="Write an announcement, share guidance, answer a question..."
          value={postContent}
          onChange={e => setPostContent(e.target.value)}
          className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 transition-colors resize-none font-light leading-relaxed"
        />
        <div className="flex justify-end mt-3">
          <button
            disabled={!postContent.trim()}
            className="font-mono text-[8px] tracking-[0.25em] uppercase px-5 py-2.5 bg-[#b3cdff] text-[#0f141b] rounded hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      {CHECKIN_POSTS.map(post => (
        <div key={post.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-5">
          <div className="flex items-start gap-3 mb-4">
            <Avatar initials={post.initials} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{post.author}</p>
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${categoryColors[post.category] ?? categoryColors.General}`}>
                  {post.category}
                </span>
              </div>
              <p className="font-mono text-[9px] text-gray-500">{post.time}</p>
            </div>
            {/* Coach reply button */}
            <button className="shrink-0 font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors">
              Reply
            </button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
          <div className="flex items-center gap-5 pt-3 border-t border-[#1a222c]">
            <span className="font-mono text-[9px] text-gray-500">{post.likes} likes</span>
            <span className="font-mono text-[9px] text-gray-500">{post.comments} comments</span>
            <span className="w-1 h-1 rounded-full bg-[#2d3a4b]" />
            <button className="font-mono text-[9px] text-[#b3cdff] hover:text-white transition-colors uppercase tracking-widest">
              Pin post
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Programs ────────────────────────────────────────────────────────────

function ProgramsTab() {
  const programs = [
    { title: "ZANA Training System", phase: "Phase 1 — Foundations", members: 8, avgProgress: 34, active: true },
    { title: "Nutrition Blueprint", phase: "Complete Guide", members: 6, avgProgress: 17, active: false },
    { title: "Mindset Protocol", phase: "Mental Edge Series", members: 3, avgProgress: 0, active: false },
    { title: "Recovery Science", phase: "Sleep & Stress Module", members: 2, avgProgress: 0, active: false },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Content Library</p>
          <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Programs</h2>
        </div>
        <button className="font-mono text-[8px] tracking-widest uppercase px-4 py-2.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors">
          + Add Program
        </button>
      </div>

      {programs.map(prog => (
        <div key={prog.title} className="bg-[#121821] border border-[#2d3a4b] rounded p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-[8px] tracking-widest text-[#b3cdff] uppercase mb-1">{prog.phase}</p>
              <h3 className="text-base font-light tracking-[0.1em] uppercase text-white">{prog.title}</h3>
            </div>
            <div className="flex gap-2">
              {prog.active && (
                <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-1 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">
                  Active
                </span>
              )}
              <button className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors">
                Edit
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6 font-mono text-[9px] text-gray-400 mb-3">
            <span>{prog.members} members enrolled</span>
            <span>Avg progress: {prog.avgProgress}%</span>
          </div>
          <div className="h-0.5 bg-[#1a222c] rounded-full overflow-hidden">
            <div className="h-full bg-[#b3cdff] rounded-full" style={{ width: `${prog.avgProgress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Schedule ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const events = [
    { id: 1, title: "Group Coaching Call", date: "Thu, May 1", time: "7:00 PM PHT", registered: 9, tag: "LIVE", tagColor: "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10" },
    { id: 2, title: "Weekly Check-In Deadline", date: "Sun, May 4", time: "11:59 PM PHT", registered: null, tag: "DEADLINE", tagColor: "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10" },
    { id: 3, title: "1:1 Progress Review", date: "Fri, May 9", time: "By Appointment", registered: null, tag: "1:1", tagColor: "text-[#b3cdff] border-[#b3cdff]/30 bg-[#b3cdff]/10" },
    { id: 4, title: "Group Coaching Call", date: "Thu, May 15", time: "7:00 PM PHT", registered: 4, tag: "LIVE", tagColor: "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Upcoming</p>
          <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Schedule</h2>
        </div>
        <button className="font-mono text-[8px] tracking-widest uppercase px-4 py-2.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors">
          + Add Event
        </button>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-5 flex items-center gap-4">
            <div className="text-center min-w-[48px]">
              <p className="font-mono text-[8px] text-gray-500 uppercase leading-tight">{event.date.split(",")[0]}</p>
              <p className="font-mono text-xl font-light text-white leading-tight">{event.date.split(" ")[1]}</p>
              <p className="font-mono text-[8px] text-gray-500 uppercase leading-tight">{event.date.split(" ")[2]}</p>
            </div>
            <div className="w-px self-stretch bg-[#2d3a4b]" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${event.tagColor}`}>{event.tag}</span>
              </div>
              <p className="text-sm font-light text-white">{event.title}</p>
              <p className="font-mono text-[9px] text-gray-500">{event.time}{event.registered ? ` · ${event.registered} registered` : ""}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors">
                Edit
              </button>
              {event.tag === "LIVE" && (
                <button className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors">
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Coach Dashboard ─────────────────────────────────────────────────────

const NAV: { id: CoachTab; label: string; iconPath: string }[] = [
  { id: "overview", label: "Overview", iconPath: "M3 12L12 3l9 9v9H3v-9zM9 21V12h6v9" },
  { id: "members", label: "Members", iconPath: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { id: "community", label: "Community", iconPath: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { id: "programs", label: "Programs", iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { id: "schedule", label: "Schedule", iconPath: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
];

export default function CoachDashboard({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<CoachTab>("overview");

  const coachName = profile?.email?.split("@")[0] ?? "Coach";
  const currentLabel = NAV.find(n => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#0f141b] text-white flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0a0f16] border-r border-[#2d3a4b] fixed h-full z-20">
        <div className="px-6 py-8 border-b border-[#2d3a4b]">
          <p className="font-mono text-lg font-black tracking-[0.3em] text-white uppercase">ZANA</p>
          <p className="font-mono text-[8px] tracking-[0.4em] text-[#b3cdff] uppercase mt-0.5">Coach Portal</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all border-l-2 ${
                  active ? "bg-[#b3cdff]/10 text-[#b3cdff] border-[#b3cdff]" : "text-gray-400 hover:text-white hover:bg-[#121821] border-transparent"
                }`}
              >
                <Icon path={item.iconPath} active={active} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Coach badge + profile */}
        <div className="p-4 border-t border-[#2d3a4b]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#b3cdff]/10 border border-[#b3cdff]/30 flex items-center justify-center font-mono text-[9px] font-bold text-[#b3cdff] shrink-0">
              {coachName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate capitalize">{coachName}</p>
              <span className="font-mono text-[7px] tracking-widest uppercase text-[#b3cdff]">Coach</span>
            </div>
            <Link href="/profile" className="text-gray-500 hover:text-white transition-colors shrink-0">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[#0f141b]/90 backdrop-blur border-b border-[#2d3a4b] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="font-mono text-sm font-black tracking-[0.3em] text-white uppercase md:hidden">ZANA</p>
            <span className="hidden md:block font-mono text-[10px] tracking-[0.3em] text-gray-400 uppercase">{currentLabel}</span>
            <span className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 border border-[#b3cdff]/30 text-[#b3cdff] bg-[#b3cdff]/5 rounded-sm">
              Coach
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg viewBox="0 0 20 20" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 17a1.5 1.5 0 003 0" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/profile">
              <div className="w-7 h-7 rounded-full bg-[#b3cdff]/10 border border-[#b3cdff]/30 flex items-center justify-center font-mono text-[9px] font-bold text-[#b3cdff]">
                {coachName[0]?.toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-5 pb-28 md:pb-8">
          {activeTab === "overview" && <OverviewTab coachName={coachName} />}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "community" && <CommunityTab />}
          {activeTab === "programs" && <ProgramsTab />}
          {activeTab === "schedule" && <ScheduleTab />}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0f16]/95 backdrop-blur-md border-t border-[#2d3a4b] flex">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-[#b3cdff]" : "text-gray-500"}`}
            >
              <Icon path={item.iconPath} active={active} />
              <span className="font-mono text-[7px] tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
