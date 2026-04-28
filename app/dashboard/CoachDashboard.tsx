"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { ProfileData } from "./MemberDashboard";
import { createClient } from "@/utils/supabase/client";

// ─── ZANA Logo ────────────────────────────────────────────────────────────────

const ZLogo = ({ className = "h-7" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" /><path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const ZMark = ({ className = "h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" /><path d="M13.7,18 L0,30 H32" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

type Member = { id: number; name: string; email: string; initials: string; plan: string; status: string; streak: number; lastSeen: string; checkin: boolean; phase: number; weight: string; goal: string };
const MEMBERS: Member[] = [
  { id: 1, name: "Priya Sharma",  email: "priya@example.com",  initials: "PS", plan: "All In",    status: "active", streak: 67, lastSeen: "Today",     checkin: true,  phase: 3, weight: "62kg",  goal: "Body recomposition" },
  { id: 2, name: "Aiko Tanaka",   email: "aiko@example.com",   initials: "AT", plan: "All In",    status: "active", streak: 45, lastSeen: "Today",     checkin: true,  phase: 2, weight: "55kg",  goal: "Strength & muscle" },
  { id: 3, name: "Marcus Chen",   email: "marcus@example.com", initials: "MC", plan: "All In",    status: "active", streak: 28, lastSeen: "Today",     checkin: false, phase: 1, weight: "82kg",  goal: "Lean bulk" },
  { id: 4, name: "Sofia Reyes",   email: "sofia@example.com",  initials: "SR", plan: "Committed", status: "active", streak: 21, lastSeen: "Yesterday", checkin: true,  phase: 1, weight: "68kg",  goal: "Fat loss" },
  { id: 5, name: "James Kim",     email: "james@example.com",  initials: "JK", plan: "Committed", status: "active", streak: 19, lastSeen: "Yesterday", checkin: false, phase: 1, weight: "75kg",  goal: "Athletic performance" },
  { id: 6, name: "Daniel Park",   email: "daniel@example.com", initials: "DP", plan: "Entry",     status: "active", streak: 12, lastSeen: "2 days ago", checkin: false, phase: 1, weight: "70kg", goal: "First cut" },
  { id: 7, name: "Ryan Nguyen",   email: "ryan@example.com",   initials: "RN", plan: "Committed", status: "active", streak: 9,  lastSeen: "3 days ago", checkin: false, phase: 1, weight: "78kg", goal: "Strength" },
  { id: 8, name: "Kevin Liu",     email: "kevin@example.com",  initials: "KL", plan: "Entry",     status: "active", streak: 5,  lastSeen: "4 days ago", checkin: false, phase: 1, weight: "73kg", goal: "General fitness" },
];

type Post = { id: number; author: string; initials: string; time: string; category: string; content: string; likes: number; liked: boolean; pinned: boolean; replies: { author: string; initials: string; content: string; isCoach: boolean }[] };
const INITIAL_POSTS: Post[] = [
  { id: 1, author: "Priya Sharma",  initials: "PS", time: "2h ago",    category: "Check-ins", content: "Week 7 Day 3 — Deadlifts felt strong. Hit 145kg × 3. Sleep has been 8hrs consistently.", likes: 18, liked: false, pinned: false, replies: [] },
  { id: 2, author: "Marcus Chen",   initials: "MC", time: "5h ago",    category: "Wins",      content: "New bench PR — 185 lbs × 5. Three weeks in and the numbers are moving.", likes: 31, liked: true, pinned: false, replies: [] },
  { id: 3, author: "Sofia Reyes",   initials: "SR", time: "Yesterday", category: "Check-ins", content: "Week 3 Day 2 complete. Legs were shaking by the end of the Romanian DLs but I didn't stop.", likes: 22, liked: false, pinned: false, replies: [] },
  { id: 4, author: "Daniel Park",   initials: "DP", time: "Yesterday", category: "Q&A",       content: "Question for Javi — on upper body days, should I be hitting failure on every set or leaving 1–2 reps in reserve?", likes: 5, liked: false, pinned: false, replies: [] },
];

type Event = { id: number; title: string; date: string; day: string; month: string; time: string; registered: number | null; tag: string; link?: string };
const INITIAL_EVENTS: Event[] = [
  { id: 1, title: "Group Coaching Call",       date: "Thu, May 1",  day: "1",  month: "May", time: "7:00 PM PHT",   registered: 9,    tag: "LIVE",     link: "https://meet.google.com" },
  { id: 2, title: "Weekly Check-In Deadline",  date: "Sun, May 4",  day: "4",  month: "May", time: "11:59 PM PHT",  registered: null, tag: "DEADLINE" },
  { id: 3, title: "1:1 Progress Review",       date: "Fri, May 9",  day: "9",  month: "May", time: "By Appointment",registered: null, tag: "1:1" },
  { id: 4, title: "Group Coaching Call",       date: "Thu, May 15", day: "15", month: "May", time: "7:00 PM PHT",   registered: 4,    tag: "LIVE",     link: "https://meet.google.com" },
];

type Program = { id: number; title: string; phase: string; members: number; avgProgress: number; active: boolean; color: string };
const INITIAL_PROGRAMS: Program[] = [
  { id: 1, title: "ZANA Training System",  phase: "Phase 1 — Foundations",  members: 8, avgProgress: 34, active: true,  color: "#b3cdff" },
  { id: 2, title: "Nutrition Blueprint",   phase: "Complete Guide",          members: 6, avgProgress: 17, active: false, color: "#86efac" },
  { id: 3, title: "Mindset Protocol",      phase: "Mental Edge Series",      members: 3, avgProgress: 0,  active: false, color: "#fbbf24" },
  { id: 4, title: "Recovery Science",      phase: "Sleep & Stress Module",   members: 2, avgProgress: 0,  active: false, color: "#f472b6" },
];

type CoachTab = "overview" | "members" | "community" | "messages" | "programs" | "schedule";

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

// ─── Shared ───────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const sz = { sm: "w-7 h-7 text-[9px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" }[size];
  const c = color ?? "#b3cdff";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-mono font-bold tracking-wider shrink-0 border`}
      style={{ color: c, borderColor: c + "40", backgroundColor: c + "15" }}
    >
      {initials}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const c: Record<string, string> = {
    "All In": "text-[#b3cdff] border-[#b3cdff]/30 bg-[#b3cdff]/10",
    "Committed": "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10",
    "Entry": "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10",
  };
  return <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${c[plan] ?? "text-gray-400 border-gray-700"}`}>{plan}</span>;
}

// ─── Member Detail Slide-over ─────────────────────────────────────────────────

function MemberPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#121821] border-l border-[#2d3a4b] h-full overflow-y-auto flex flex-col z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b] sticky top-0 bg-[#121821]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase">Member Profile</p>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar initials={member.initials} size="lg" />
            <div>
              <p className="text-base font-light text-white uppercase tracking-wide">{member.name}</p>
              <p className="font-mono text-[9px] text-gray-500 mt-0.5">{member.email}</p>
              <div className="mt-1"><PlanBadge plan={member.plan} /></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Streak", value: `${member.streak}d`, color: "#b3cdff" },
              { label: "Phase", value: `0${member.phase}`, color: "#fff" },
              { label: "Weight", value: member.weight, color: "#fff" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f141b] border border-[#2d3a4b] rounded p-3 text-center">
                <p className="text-base font-light" style={{ color: s.color }}>{s.value}</p>
                <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0f141b] border border-[#2d3a4b] rounded p-4">
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mb-1">Goal</p>
            <p className="text-sm text-white">{member.goal}</p>
          </div>

          <div className="bg-[#0f141b] border border-[#2d3a4b] rounded p-4">
            <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mb-2">Last Check-in</p>
            <div className="flex items-center gap-2">
              {member.checkin
                ? <><span className="w-2 h-2 rounded-full bg-[#86efac]" /><p className="font-mono text-[9px] text-[#86efac]">Submitted this week</p></>
                : <><span className="w-2 h-2 rounded-full bg-[#fbbf24]" /><p className="font-mono text-[9px] text-[#fbbf24]">Pending — {member.lastSeen}</p></>
              }
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href={`mailto:${member.email}?subject=ZANA Check-In`}
              className="flex items-center justify-center gap-2 w-full font-mono text-[8px] tracking-[0.25em] uppercase py-3 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="1" /><path d="M1 4l7 5 7-5" strokeLinecap="round" /></svg>
              Email Member
            </a>
            <button
              onClick={onClose}
              className="w-full font-mono text-[8px] tracking-[0.25em] uppercase py-3 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#121821] border border-[#2d3a4b] rounded z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase">{title}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ coachName, onTabChange }: { coachName: string; onTabChange: (t: CoachTab) => void }) {
  const pendingCheckins = MEMBERS.filter(m => !m.checkin).length;
  const activeToday = MEMBERS.filter(m => m.lastSeen === "Today").length;
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {selectedMember && <MemberPanel member={selectedMember} onClose={() => setSelectedMember(null)} />}

      <div>
        <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-1">Coach Dashboard</p>
        <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white">Welcome, {coachName}.</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: MEMBERS.length, sub: "active", color: "#fff", onClick: () => onTabChange("members") },
          { label: "Active Today",   value: activeToday,   sub: "online",  color: "#86efac", onClick: () => onTabChange("members") },
          { label: "Check-ins Due",  value: pendingCheckins, sub: "pending", color: "#fbbf24", onClick: () => onTabChange("members") },
          { label: "Avg Streak",     value: "26d", sub: "all members", color: "#b3cdff", onClick: undefined },
        ].map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            className={`bg-[#121821] border border-[#2d3a4b] rounded p-5 text-left transition-colors ${s.onClick ? "hover:border-[#b3cdff]/30 cursor-pointer" : "cursor-default"}`}
          >
            <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-2">{s.label}</p>
            <p className="text-3xl font-light tracking-tight" style={{ color: s.color }}>{s.value}</p>
            <p className="font-mono text-[9px] text-gray-500 mt-1">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Pending check-ins */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[#fbbf24] uppercase">Pending Check-ins</p>
          <button onClick={() => onTabChange("members")} className="font-mono text-[8px] text-[#b3cdff] hover:text-white transition-colors uppercase tracking-widest">View all →</button>
        </div>
        {MEMBERS.filter(m => !m.checkin).map((m, i, arr) => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(m)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#0f141b] transition-colors ${i < arr.length - 1 ? "border-b border-[#0f141b]" : ""}`}
          >
            <Avatar initials={m.initials} size="sm" />
            <div className="flex-1">
              <p className="text-sm text-white">{m.name}</p>
              <p className="font-mono text-[9px] text-gray-500">Last seen {m.lastSeen} · {m.streak}d streak</p>
            </div>
            <PlanBadge plan={m.plan} />
          </button>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3a4b]">
          <p className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Recent Activity</p>
          <button onClick={() => onTabChange("community")} className="font-mono text-[8px] text-[#b3cdff] hover:text-white transition-colors uppercase tracking-widest">View all →</button>
        </div>
        {INITIAL_POSTS.slice(0, 3).map((post, i) => (
          <div key={post.id} className={`flex items-start gap-3 px-5 py-4 ${i < 2 ? "border-b border-[#0f141b]" : ""}`}>
            <Avatar initials={post.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs text-white">{post.author}</p>
                <span className="font-mono text-[7px] text-gray-500">{post.time}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mt-0.5 line-clamp-2">{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next call CTA */}
      <div className="bg-[#121821] border border-[#86efac]/20 rounded p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[8px] tracking-widest text-[#86efac] uppercase mb-1">Next Coaching Call</p>
          <p className="text-base font-light text-white uppercase tracking-wide">Thursday, May 1</p>
          <p className="font-mono text-[9px] text-gray-500 mt-0.5">7:00 PM PHT · 9 members registered</p>
        </div>
        <a
          href="https://meet.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[8px] tracking-widest uppercase px-5 py-3 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors"
        >
          Start Call
        </a>
      </div>
    </div>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({ coachEmail }: { coachEmail: string }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePlan, setInvitePlan] = useState("Entry");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inviteError, setInviteError] = useState("");

  const filtered = MEMBERS.filter(m => {
    const q = search.toLowerCase();
    return (planFilter === "All" || m.plan === planFilter) &&
      (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteStatus("loading");
    setInviteError("");
    const res = await fetch("/api/invite-member", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-coach-email": coachEmail },
      body: JSON.stringify({ email: inviteEmail.trim(), plan: invitePlan }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteStatus("error");
      setInviteError(data.error ?? "Something went wrong.");
    } else {
      setInviteStatus("success");
      setTimeout(() => {
        setShowInvite(false);
        setInviteEmail("");
        setInvitePlan("Entry");
        setInviteStatus("idle");
      }, 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {selectedMember && <MemberPanel member={selectedMember} onClose={() => setSelectedMember(null)} />}

      {/* Invite modal */}
      {showInvite && (
        <Modal title="Invite Member" onClose={() => { setShowInvite(false); setInviteStatus("idle"); setInviteError(""); }}>
          <div className="space-y-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="member@email.com"
              className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-light text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              {["Entry", "Committed", "All In"].map(p => (
                <button key={p} onClick={() => setInvitePlan(p)}
                  className={`font-mono text-[8px] tracking-widest uppercase py-2.5 rounded border transition-colors ${invitePlan === p ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
                >{p}</button>
              ))}
            </div>
            {inviteError && <p className="font-mono text-[8px] text-[#f87171]">{inviteError}</p>}
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteStatus === "loading" || inviteStatus === "success"}
              className="w-full font-mono text-[8px] tracking-[0.25em] uppercase py-3 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40"
            >
              {inviteStatus === "loading" ? "Sending..." : inviteStatus === "success" ? "Invite Sent ✓" : "Send Invite"}
            </button>
            <p className="font-mono text-[8px] text-gray-600 text-center">
              They&apos;ll receive a login link by email. Their plan will be set to <span className="text-gray-400">{invitePlan}</span>.
            </p>
          </div>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {["All", "All In", "Committed", "Entry"].map(p => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className={`font-mono text-[8px] tracking-widest uppercase px-3 py-2.5 rounded border transition-colors shrink-0 ${planFilter === p ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
            >{p}</button>
          ))}
          <button onClick={() => setShowInvite(true)}
            className="font-mono text-[8px] tracking-widest uppercase px-3 py-2.5 rounded border border-[#b3cdff]/30 text-[#b3cdff] hover:bg-[#b3cdff]/10 transition-colors shrink-0">
            + Invite
          </button>
        </div>
      </div>

      <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_70px_90px_60px_36px] gap-3 px-5 py-3 border-b border-[#2d3a4b]">
          {["Member", "Plan", "Streak", "Last Seen", "Check-in", ""].map(h => (
            <p key={h} className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{h}</p>
          ))}
        </div>
        {filtered.length === 0 && <p className="px-5 py-8 text-center font-mono text-[9px] text-gray-500 uppercase tracking-widest">No members found</p>}
        {filtered.map((m, i) => (
          <div key={m.id} className={`flex flex-col sm:grid sm:grid-cols-[1fr_100px_70px_90px_60px_36px] gap-2 sm:gap-3 px-5 py-4 items-start sm:items-center hover:bg-[#0f141b] transition-colors cursor-pointer ${i < filtered.length - 1 ? "border-b border-[#0f141b]" : ""}`}
            onClick={() => setSelectedMember(m)}>
            <div className="flex items-center gap-3">
              <Avatar initials={m.initials} size="sm" />
              <div>
                <p className="text-sm text-white">{m.name}</p>
                <p className="font-mono text-[9px] text-gray-500">{m.email}</p>
              </div>
            </div>
            <PlanBadge plan={m.plan} />
            <p className="font-mono text-sm text-[#b3cdff]">{m.streak}d</p>
            <p className="font-mono text-[9px] text-gray-400">{m.lastSeen}</p>
            <div>
              {m.checkin
                ? <span className="w-5 h-5 rounded-full bg-[#86efac]/10 border border-[#86efac]/30 flex items-center justify-center"><svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="#86efac" strokeWidth="1.5"><path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                : <span className="w-5 h-5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" /></span>
              }
            </div>
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        ))}
      </div>
      <p className="font-mono text-[8px] text-gray-600 text-center uppercase tracking-widest">{filtered.length} of {MEMBERS.length} members · Click any row to view details</p>
    </div>
  );
}

// ─── Tab: Community ───────────────────────────────────────────────────────────

function CommunityTab({ coachName }: { coachName: string }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("Announcements");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const CATEGORY_COLORS: Record<string, string> = {
    Announcements: "text-[#b3cdff] bg-[#b3cdff]/10 border-[#b3cdff]/30",
    "Check-ins":   "text-[#86efac] bg-[#86efac]/10 border-[#86efac]/30",
    Wins:          "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
    "Q&A":         "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/30",
    General:       "text-gray-400 bg-gray-400/10 border-gray-400/30",
  };

  const submitPost = () => {
    if (!postContent.trim()) return;
    const initials = coachName.slice(0, 2).toUpperCase();
    setPosts(prev => [{
      id: Date.now(), author: coachName, initials, time: "Just now",
      category: postCategory, content: postContent,
      likes: 0, liked: false, pinned: false, replies: []
    }, ...prev]);
    setPostContent("");
  };

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const togglePin = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
  };

  const submitReply = (postId: number) => {
    if (!replyText.trim()) return;
    const initials = coachName.slice(0, 2).toUpperCase();
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, replies: [...p.replies, { author: coachName, initials, content: replyText, isCoach: true }] }
      : p
    ));
    setReplyText("");
    setReplyingTo(null);
  };

  const sorted = [...posts].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Composer */}
      <div className="bg-[#121821] border border-[#b3cdff]/20 rounded p-5">
        <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Post as Coach</p>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {["Announcements", "General", "Check-ins", "Wins", "Q&A"].map(c => (
            <button key={c} onClick={() => setPostCategory(c)}
              className={`shrink-0 font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 rounded border transition-colors ${postCategory === c ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
            >{c}</button>
          ))}
        </div>
        <textarea rows={3} placeholder="Share an announcement, insight, or reply to your members..."
          value={postContent} onChange={e => setPostContent(e.target.value)}
          className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 transition-colors resize-none leading-relaxed"
        />
        <div className="flex justify-end mt-3">
          <button onClick={submitPost} disabled={!postContent.trim()}
            className="font-mono text-[8px] tracking-[0.25em] uppercase px-5 py-2.5 bg-[#b3cdff] text-[#0f141b] rounded hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >Post</button>
        </div>
      </div>

      {sorted.map(post => (
        <div key={post.id} className={`bg-[#121821] border rounded p-5 ${post.pinned ? "border-[#b3cdff]/30" : "border-[#2d3a4b]"}`}>
          {post.pinned && (
            <div className="flex items-center gap-1.5 mb-3">
              <svg viewBox="0 0 12 12" className="w-3 h-3 text-[#b3cdff]" fill="currentColor"><path d="M9.5 2L10 6.5H7.5V10H4.5V6.5H2L2.5 2H9.5Z" /></svg>
              <span className="font-mono text-[7px] tracking-widest uppercase text-[#b3cdff]">Pinned</span>
            </div>
          )}
          <div className="flex items-start gap-3 mb-3">
            <Avatar initials={post.initials} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{post.author}</p>
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General}`}>{post.category}</span>
                <span className="font-mono text-[7px] text-gray-600">{post.time}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>

          {/* Replies */}
          {post.replies.length > 0 && (
            <div className="mb-4 pl-4 border-l-2 border-[#2d3a4b] space-y-3">
              {post.replies.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Avatar initials={r.initials} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white">{r.author}</p>
                      {r.isCoach && <span className="font-mono text-[7px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">Coach</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline reply box */}
          {replyingTo === post.id && (
            <div className="mb-4 flex gap-2">
              <textarea rows={2} placeholder="Write your reply..."
                value={replyText} onChange={e => setReplyText(e.target.value)}
                className="flex-1 bg-[#0f141b] border border-[#2d3a4b] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 resize-none"
              />
              <div className="flex flex-col gap-1">
                <button onClick={() => submitReply(post.id)} disabled={!replyText.trim()}
                  className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 bg-[#b3cdff] text-[#0f141b] rounded hover:bg-white transition-colors disabled:opacity-30"
                >Send</button>
                <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                  className="font-mono text-[8px] tracking-widest uppercase px-3 py-2 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors"
                >Cancel</button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-[#1a222c]">
            <button onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${post.liked ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"}`}
            >
              <svg viewBox="0 0 14 14" className="w-3 h-3" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M7 12.5S1 8.5 1 4.5a3 3 0 016 0 3 3 0 016 0c0 4-6 8-6 8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {post.likes}
            </button>
            <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] hover:text-white transition-colors"
            >
              <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 9a2 2 0 01-2 2H3l-2 2V3a2 2 0 012-2h8a2 2 0 012 2v6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Reply
            </button>
            <button onClick={() => togglePin(post.id)}
              className={`ml-auto font-mono text-[9px] uppercase tracking-widest transition-colors ${post.pinned ? "text-[#b3cdff]" : "text-gray-500 hover:text-[#b3cdff]"}`}
            >{post.pinned ? "Unpin" : "Pin"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Programs ────────────────────────────────────────────────────────────

function ProgramsTab({ coachId }: { coachId: string }) {
  const supabase = createClient();
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [contents, setContents] = useState<Record<number, ContentBlock[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newType, setNewType] = useState<ContentType>("workout");
  const [newTitle, setNewTitle] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newBody, setNewBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgPhase, setNewProgPhase] = useState("");

  const toggleExpand = async (progId: number) => {
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

  const addContent = async (progId: number) => {
    if (!newTitle.trim()) return;
    setSaving(true);
    setSaveError("");
    const { data, error } = await supabase
      .from("program_content")
      .insert({
        program_id: progId,
        coach_id: coachId,
        type: newType,
        title: newTitle.trim(),
        label: newLabel.trim() || null,
        body: newBody.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) setContents(prev => ({ ...prev, [progId]: [...(prev[progId] ?? []), data] }));
    setNewTitle(""); setNewLabel(""); setNewBody(""); setAddingTo(null);
  };

  const deleteContent = async (blockId: string, progId: number) => {
    await supabase.from("program_content").delete().eq("id", blockId);
    setContents(prev => ({ ...prev, [progId]: (prev[progId] ?? []).filter(b => b.id !== blockId) }));
  };

  const addProgram = () => {
    if (!newProgTitle.trim()) return;
    setPrograms(prev => [...prev, { id: Date.now(), title: newProgTitle, phase: newProgPhase || "New Program", members: 0, avgProgress: 0, active: false, color: "#b3cdff" }]);
    setNewProgTitle(""); setNewProgPhase(""); setShowAddProgram(false);
  };

  const inputCls = "w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-light text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {showAddProgram && (
        <Modal title="Add Program" onClose={() => setShowAddProgram(false)}>
          <div className="space-y-3">
            <input value={newProgTitle} onChange={e => setNewProgTitle(e.target.value)} placeholder="Program title" className={inputCls} />
            <input value={newProgPhase} onChange={e => setNewProgPhase(e.target.value)} placeholder="Phase / subtitle" className={inputCls} />
            <button onClick={addProgram} disabled={!newProgTitle.trim()} className="w-full font-mono text-[8px] tracking-[0.25em] uppercase py-3 bg-[#b3cdff] text-[#0f141b] rounded hover:bg-white transition-colors disabled:opacity-30">Add Program</button>
          </div>
        </Modal>
      )}

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Content Library</p>
          <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Programs</h2>
        </div>
        <button onClick={() => setShowAddProgram(true)} className="font-mono text-[8px] tracking-widest uppercase px-4 py-2.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors">+ Add Program</button>
      </div>

      {programs.map(prog => (
        <div key={prog.id} className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
          <div className="h-0.5 w-full" style={{ backgroundColor: prog.color }} />

          {/* Clickable header */}
          <button
            onClick={() => toggleExpand(prog.id)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1a222c]/60 transition-colors"
          >
            <div>
              <p className="font-mono text-[8px] tracking-widest uppercase mb-1" style={{ color: prog.color }}>{prog.phase}</p>
              <h3 className="text-base font-light tracking-[0.1em] uppercase text-white">{prog.title}</h3>
              <p className="font-mono text-[9px] text-gray-500 mt-1">{prog.members} enrolled · Avg {prog.avgProgress}%</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {prog.active && <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[#b3cdff]/10 text-[#b3cdff] border border-[#b3cdff]/30">Active</span>}
              <svg viewBox="0 0 16 16" className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expanded === prog.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </button>

          {/* Expanded section */}
          {expanded === prog.id && (
            <div className="border-t border-[#2d3a4b] px-5 pt-4 pb-5 space-y-3">
              {loadingId === prog.id ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-[#b3cdff]/20 border-t-[#b3cdff] rounded-full animate-spin" />
                </div>
              ) : (contents[prog.id] ?? []).length === 0 ? (
                <p className="font-mono text-[9px] text-gray-600 text-center py-4 uppercase tracking-widest">No content yet.</p>
              ) : (
                <div className="space-y-3">
                  {(contents[prog.id] ?? []).map(block => {
                    const meta = CONTENT_META[block.type];
                    return (
                      <div key={block.id} className="bg-[#0f141b] border border-[#2d3a4b] rounded p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded border" style={{ color: meta.color, borderColor: meta.color + "40", backgroundColor: meta.color + "10" }}>
                                {meta.label}
                              </span>
                              {block.label && <span className="font-mono text-[8px] text-gray-500">{block.label}</span>}
                            </div>
                            <p className="text-sm font-medium text-white mb-1">{block.title}</p>
                            {block.body && (
                              block.type === "video"
                                ? <a href={block.body} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-[#b3cdff] hover:underline break-all">{block.body}</a>
                                : <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{block.body}</p>
                            )}
                          </div>
                          <button onClick={() => deleteContent(block.id, prog.id)} className="shrink-0 text-gray-600 hover:text-[#f87171] transition-colors mt-0.5">
                            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M3 5h10M6 5V3h4v2M12 5l-1 9H5L4 5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add content form */}
              {addingTo === prog.id ? (
                <div className="space-y-3 bg-[#0f141b] border border-[#b3cdff]/20 rounded p-4">
                  <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-2">Add Content Block</p>

                  {/* Type selector */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(Object.keys(CONTENT_META) as ContentType[]).map(t => (
                      <button key={t} type="button" onClick={() => setNewType(t)}
                        className={`font-mono text-[8px] tracking-wide uppercase py-2 rounded border transition-colors ${newType === t ? "text-[#0f141b] border-transparent font-bold" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}
                        style={newType === t ? { backgroundColor: CONTENT_META[t].color } : {}}
                      >
                        {CONTENT_META[t].label}
                      </button>
                    ))}
                  </div>

                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title — e.g. Push Day A, Week 3 Meals, Phase Notes" className={inputCls} />
                  <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Week / Day label (optional) — e.g. Week 3, Day 2" className={inputCls} />
                  <textarea
                    value={newBody} onChange={e => setNewBody(e.target.value)}
                    placeholder={newType === "video" ? "Paste video URL here" : "Write the full content — exercises, sets, reps, macros, notes..."}
                    rows={6}
                    className={`${inputCls} resize-none leading-relaxed`}
                  />

                  {saveError && <p className="font-mono text-[8px] text-[#f87171]">{saveError}</p>}

                  <div className="flex gap-2">
                    <button onClick={() => { setAddingTo(null); setNewTitle(""); setNewLabel(""); setNewBody(""); setSaveError(""); }}
                      className="flex-1 font-mono text-[8px] tracking-widest uppercase py-2.5 border border-[#2d3a4b] text-gray-400 rounded hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => addContent(prog.id)} disabled={!newTitle.trim() || saving}
                      className="flex-1 font-mono text-[8px] tracking-widest uppercase py-2.5 bg-[#b3cdff] text-[#0f141b] rounded font-bold hover:bg-white transition-colors disabled:opacity-40">
                      {saving ? "Saving..." : "Save Block"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(prog.id)}
                  className="w-full font-mono text-[8px] tracking-widest uppercase py-3 border border-dashed border-[#2d3a4b] text-gray-500 rounded hover:border-[#b3cdff]/40 hover:text-[#b3cdff] transition-colors">
                  + Add Content Block
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Schedule ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newTag, setNewTag] = useState("LIVE");
  const [newLink, setNewLink] = useState("");

  const TAG_COLORS: Record<string, string> = {
    LIVE:     "text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10",
    DEADLINE: "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10",
    "1:1":    "text-[#b3cdff] border-[#b3cdff]/30 bg-[#b3cdff]/10",
    PROGRAM:  "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10",
  };

  const addEvent = () => {
    if (!newTitle.trim() || !newDate.trim()) return;
    const parts = newDate.split(" ");
    setEvents(prev => [...prev, {
      id: Date.now(), title: newTitle, date: newDate,
      day: parts[1]?.replace(",","") ?? "—", month: parts[2] ?? "",
      time: newTime || "TBD", registered: null, tag: newTag,
      link: newLink || undefined,
    }]);
    setNewTitle(""); setNewDate(""); setNewTime(""); setNewLink(""); setShowAdd(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {showAdd && (
        <Modal title="Add Event" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Event title" className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm" />
            <input value={newDate} onChange={e => setNewDate(e.target.value)} placeholder="Date (e.g. Thu, May 22)" className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm" />
            <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Time (e.g. 7:00 PM PHT)" className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm" />
            <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="Meeting link (optional)" className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/40 font-mono text-sm" />
            <div className="flex gap-2">
              {["LIVE","DEADLINE","1:1","PROGRAM"].map(t => (
                <button key={t} onClick={() => setNewTag(t)} className={`flex-1 font-mono text-[8px] tracking-widest uppercase py-2 rounded border transition-colors ${newTag === t ? "bg-[#b3cdff] text-[#0f141b] border-[#b3cdff]" : "text-gray-400 border-[#2d3a4b] hover:text-white"}`}>{t}</button>
              ))}
            </div>
            <button onClick={addEvent} disabled={!newTitle.trim() || !newDate.trim()} className="w-full font-mono text-[8px] tracking-[0.25em] uppercase py-3 bg-[#b3cdff] text-[#0f141b] rounded hover:bg-white transition-colors disabled:opacity-30">Add Event</button>
          </div>
        </Modal>
      )}

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-gray-500 uppercase mb-1">Upcoming</p>
          <h2 className="text-lg font-light tracking-[0.12em] uppercase text-white">Schedule</h2>
        </div>
        <button onClick={() => setShowAdd(true)} className="font-mono text-[8px] tracking-widest uppercase px-4 py-2.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors">+ Add Event</button>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-[#121821] border border-[#2d3a4b] rounded p-5 flex items-center gap-4">
            <div className="text-center min-w-[44px]">
              <p className="font-mono text-[7px] text-gray-500 uppercase leading-tight">{event.date.split(",")[0]}</p>
              <p className="font-mono text-xl font-light text-white leading-tight">{event.day}</p>
              <p className="font-mono text-[7px] text-gray-500 uppercase leading-tight">{event.month}</p>
            </div>
            <div className="w-px self-stretch bg-[#2d3a4b]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${TAG_COLORS[event.tag] ?? TAG_COLORS.PROGRAM}`}>{event.tag}</span>
              </div>
              <p className="text-sm font-light text-white truncate">{event.title}</p>
              <p className="font-mono text-[9px] text-gray-500">{event.time}{event.registered != null ? ` · ${event.registered} registered` : ""}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {event.link && event.tag === "LIVE" && (
                <a href={event.link} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#86efac]/30 text-[#86efac] rounded hover:bg-[#86efac]/10 transition-colors"
                >Start</a>
              )}
              {event.link && event.tag === "1:1" && (
                <a href={event.link} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#b3cdff]/30 text-[#b3cdff] rounded hover:bg-[#b3cdff]/10 transition-colors"
                >Open</a>
              )}
              <button
                onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
                className="font-mono text-[7px] tracking-widest uppercase px-2.5 py-1.5 border border-[#2d3a4b] text-gray-500 rounded hover:text-[#f87171] hover:border-[#f87171]/30 transition-colors"
              >Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Messages ────────────────────────────────────────────────────────────

type CoachConversation = {
  id: string; participant_1: string; participant_2: string; last_message_at: string;
  other: { id: string; name: string; initials: string; color: string; role: string };
  last_preview: string;
};
type CoachDM = { id: string; conversation_id: string; sender_id: string; content: string; created_at: string };
type CoachMemberProfile = { id: string; name: string; initials: string; color: string; role: string };

function coachDmInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function CoachMessagesTab({ userId, userName, userInitials, avatarColor }: {
  userId: string; userName: string; userInitials: string; avatarColor: string;
}) {
  const supabase = createClient();
  const [convs, setConvs] = useState<CoachConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachDM[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [allMembers, setAllMembers] = useState<CoachMemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const activeConv = convs.find(c => c.id === activeId) ?? null;

  useEffect(() => { if (userId) loadConvs(); }, [userId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    channelRef.current?.unsubscribe();
    channelRef.current = supabase.channel(`coach-dm-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as CoachDM]);
          setConvs(prev => prev.map(c => c.id === activeId ? { ...c, last_preview: (payload.new as CoachDM).content } : c));
        })
      .subscribe();
    return () => { channelRef.current?.unsubscribe(); };
  }, [activeId]);

  async function loadConvs() {
    setLoadingConvs(true);
    const { data: raw } = await supabase.from("conversations").select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    if (!raw?.length) { setConvs([]); setLoadingConvs(false); return; }
    const otherIds = raw.map(c => c.participant_1 === userId ? c.participant_2 : c.participant_1);
    const { data: profiles } = await supabase.from("profiles").select("id, nickname, email, avatar_color, role").in("id", otherIds);
    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
    const { data: lastMsgs } = await supabase.from("direct_messages").select("conversation_id, content")
      .in("conversation_id", raw.map(c => c.id)).order("created_at", { ascending: false });
    const previewMap: Record<string, string> = {};
    for (const m of lastMsgs ?? []) { if (!previewMap[m.conversation_id]) previewMap[m.conversation_id] = m.content; }
    setConvs(raw.map(c => {
      const othId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const p = profileMap[othId];
      const name = p?.nickname || p?.email?.split("@")[0] || "Member";
      return { ...c, other: { id: othId, name, initials: coachDmInitials(name), color: p?.avatar_color ?? "#b3cdff", role: p?.role ?? "member" }, last_preview: previewMap[c.id] ?? "" };
    }));
    setLoadingConvs(false);
  }

  async function loadMessages(convId: string) {
    setLoadingMsgs(true);
    const { data } = await supabase.from("direct_messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoadingMsgs(false);
  }

  async function loadMembers() {
    const res = await fetch(`/api/profiles?exclude=${userId}`);
    const { profiles } = await res.json();
    setAllMembers((profiles ?? []).map((p: { id: string; nickname?: string; email?: string; avatar_color?: string; role?: string }) => {
      const name = p.nickname || p.email?.split("@")[0] || "User";
      return { id: p.id, name, initials: coachDmInitials(name), color: p.avatar_color ?? "#b3cdff", role: p.role ?? "member" };
    }));
  }

  async function openOrCreateConv(otherId: string) {
    const [p1, p2] = [userId, otherId].sort();
    const { data: existing } = await supabase.from("conversations").select("id").eq("participant_1", p1).eq("participant_2", p2).maybeSingle();
    if (existing) { setActiveId(existing.id); }
    else {
      const { data: created } = await supabase.from("conversations").insert({ participant_1: p1, participant_2: p2 }).select().single();
      if (created) { setActiveId(created.id); await loadConvs(); }
    }
    setShowPicker(false); setSearch("");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !activeId) return;
    setInput("");
    const { data, error } = await supabase.from("direct_messages").insert({ conversation_id: activeId, sender_id: userId, content: text }).select().single();
    if (!error && data) {
      setMessages(prev => [...prev, data]);
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeId);
      setConvs(prev => prev.map(c => c.id === activeId ? { ...c, last_preview: text } : c));
    }
  }

  const filteredMembers = allMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-130px)] md:h-[calc(100dvh-80px)] flex border border-[#2d3a4b] rounded overflow-hidden relative">
      {/* Conversation list */}
      <div className={`w-full md:w-72 shrink-0 bg-[#0a0f16] border-r border-[#2d3a4b] flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-3.5 border-b border-[#2d3a4b] flex items-center justify-between">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-gray-400">Messages</p>
          <button onClick={() => { setShowPicker(true); loadMembers(); }}
            className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" strokeLinecap="round" /></svg>New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && <div className="flex justify-center py-8"><div className="w-4 h-4 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" /></div>}
          {!loadingConvs && convs.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="font-mono text-[8px] tracking-widest uppercase text-gray-600">No conversations yet</p>
              <button onClick={() => { setShowPicker(true); loadMembers(); }} className="mt-3 font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors">Message a member →</button>
            </div>
          )}
          {convs.map(conv => (
            <button key={conv.id} onClick={() => setActiveId(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#1a222c] ${activeId === conv.id ? "bg-[#b3cdff]/5 border-l-2 border-l-[#b3cdff]" : "hover:bg-[#121821]"}`}>
              <Avatar initials={conv.other.initials} size="sm" color={conv.other.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs text-white font-medium truncate">{conv.other.name}</p>
                  {conv.other.role === "member" && <span className="font-mono text-[6px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#86efac]/10 text-[#86efac] border border-[#86efac]/30 shrink-0">Member</span>}
                </div>
                <p className="font-mono text-[9px] text-gray-500 truncate">{conv.last_preview || "No messages yet"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeId ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            <div className="px-4 py-3.5 border-b border-[#2d3a4b] flex items-center gap-3 bg-[#0a0f16]">
              <button onClick={() => setActiveId(null)} className="md:hidden text-gray-400 hover:text-white transition-colors mr-1">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 3L4 8l6 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <Avatar initials={activeConv.other.initials} size="sm" color={activeConv.other.color} />
              <div>
                <p className="text-sm text-white font-medium">{activeConv.other.name}</p>
                <p className={`font-mono text-[8px] tracking-widest uppercase ${activeConv.other.role === "coach" ? "text-[#b3cdff]" : "text-[#86efac]"}`}>{activeConv.other.role === "coach" ? "Coach" : "Member"}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs && <div className="flex justify-center py-8"><div className="w-4 h-4 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" /></div>}
              {!loadingMsgs && messages.length === 0 && <div className="text-center py-12"><p className="font-mono text-[8px] tracking-widest uppercase text-gray-600">No messages yet. Start the conversation.</p></div>}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === userId;
                const prevMsg = messages[i - 1];
                const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && <div className="w-7 shrink-0">{showAvatar && <Avatar initials={activeConv.other.initials} size="sm" color={activeConv.other.color} />}</div>}
                    <div className={`max-w-[72%] md:max-w-sm flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-[#b3cdff] text-[#0f141b] rounded-br-sm" : "bg-[#1a222c] text-white rounded-bl-sm"}`}>{msg.content}</div>
                      <p className="font-mono text-[8px] text-gray-600 px-1">{new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-[#2d3a4b] flex gap-2 bg-[#0a0f16]">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={`Message ${activeConv.other.name}...`}
                className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
              />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#b3cdff] text-[#0f141b] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40 shrink-0">
                <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1l7 7-7 7M1 8h14" /></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <svg viewBox="0 0 48 48" className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 30H5a2 2 0 01-2-2V8a2 2 0 012-2h38a2 2 0 012 2v20a2 2 0 01-2 2h-8l-8 8v-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600">Select a conversation</p>
            <button onClick={() => { setShowPicker(true); loadMembers(); }} className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors">or message a member →</button>
          </div>
        )}
      </div>

      {/* Member picker */}
      {showPicker && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-[#121821] border border-[#2d3a4b] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2d3a4b] flex items-center justify-between">
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-gray-400">New Message</p>
              <button onClick={() => { setShowPicker(false); setSearch(""); }} className="text-gray-500 hover:text-white transition-colors">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="px-4 py-3 border-b border-[#2d3a4b]">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors" />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 && <p className="font-mono text-[9px] tracking-widest uppercase text-gray-600 text-center py-8">No members found</p>}
              {filteredMembers.map(m => (
                <button key={m.id} onClick={() => openOrCreateConv(m.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#1a222c] transition-colors text-left border-b border-[#1a222c] last:border-0">
                  <Avatar initials={m.initials} size="sm" color={m.color} />
                  <div>
                    <p className="text-sm text-white">{m.name}</p>
                    <p className="font-mono text-[8px] tracking-widest uppercase text-[#86efac]">Member</p>
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

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV: { id: CoachTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { id: "overview",  label: "Overview",  icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg> },
  { id: "members",   label: "Members",   icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" /></svg> },
  { id: "community", label: "Community", icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "messages",  label: "Messages",  icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" /></svg> },
  { id: "programs",  label: "Programs",  icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><path d="M4 6h16M4 10h16M4 14h16M4 18h10" strokeLinecap="round" /></svg> },
  { id: "schedule",  label: "Schedule",  icon: a => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.5} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg> },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

function getCoachInitials(nickname: string, email: string): string {
  const source = nickname.trim() || email.split("@")[0];
  const parts = source.split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function CoachDashboard({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<CoachTab>("overview");
  const coachNickname = profile?.nickname ?? "";
  const coachEmail = profile?.email ?? "";
  const coachName = coachNickname || coachEmail.split("@")[0] || "Coach";
  // coachEmail is passed to API calls that require coach identity verification
  const initials = getCoachInitials(coachNickname, coachEmail);
  const avatarColor = profile?.avatar_color ?? "#b3cdff";
  const coachId = profile?.id ?? "";

  return (
    <div className="min-h-screen bg-[#0f141b] text-white flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0a0f16] border-r border-[#2d3a4b] fixed h-full z-20">
        <div className="px-6 py-7 border-b border-[#2d3a4b]">
          <ZLogo className="h-5 text-white mb-1" />
          <p className="font-mono text-[8px] tracking-[0.4em] text-[#b3cdff] uppercase mt-2">Coach Portal</p>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-0.5">
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all border-l-2 ${active ? "bg-[#b3cdff]/10 text-[#b3cdff] border-[#b3cdff]" : "text-gray-400 hover:text-white hover:bg-[#121821] border-transparent"}`}
              >
                {item.icon(active)}
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2d3a4b]">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} size="sm" color={avatarColor} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate capitalize">{coachName}</p>
              <span className="font-mono text-[7px] tracking-widest uppercase text-[#b3cdff]">Coach</span>
            </div>
            <Link href="/profile" className="text-gray-500 hover:text-white transition-colors shrink-0">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[#0f141b]/95 backdrop-blur border-b border-[#2d3a4b] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZMark className="h-5 text-white md:hidden" />
            <span className="hidden md:block font-mono text-[10px] tracking-[0.3em] text-gray-400 uppercase">{NAV.find(n=>n.id===activeTab)?.label}</span>
            <span className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 border border-[#b3cdff]/30 text-[#b3cdff] bg-[#b3cdff]/5 rounded-sm">Coach</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Avatar initials={initials} size="sm" color={avatarColor} />
            </Link>
          </div>
        </header>

        <div className="flex-1 p-5 pb-28 md:pb-8">
          {activeTab === "overview"  && <OverviewTab  coachName={coachName} onTabChange={setActiveTab} />}
          {activeTab === "members"   && <MembersTab coachEmail={coachEmail} />}
          {activeTab === "community" && <CommunityTab coachName={coachName} />}
          {activeTab === "messages"  && <CoachMessagesTab userId={coachId} userName={coachName} userInitials={initials} avatarColor={avatarColor} />}
          {activeTab === "programs"  && <ProgramsTab coachId={coachId} />}
          {activeTab === "schedule"  && <ScheduleTab />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0f16]/95 backdrop-blur-md border-t border-[#2d3a4b] flex">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-[#b3cdff]" : "text-gray-500"}`}
            >
              {item.icon(active)}
              <span className="font-mono text-[7px] tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
