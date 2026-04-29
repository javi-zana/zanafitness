"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// ─── ZANA Logos ───────────────────────────────────────────────────────────────

const ZMark = ({ className = "h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

// ─── Avatar color swatches ────────────────────────────────────────────────────

const COLORS = [
  { hex: "#b3cdff", label: "Blue" },
  { hex: "#86efac", label: "Green" },
  { hex: "#fbbf24", label: "Gold" },
  { hex: "#f472b6", label: "Pink" },
  { hex: "#fb923c", label: "Orange" },
  { hex: "#a78bfa", label: "Purple" },
  { hex: "#f87171", label: "Red" },
  { hex: "#e2e8f0", label: "White" },
];

const GOALS = [
  "Build Muscle",
  "Lose Fat",
  "Body Recomposition",
  "Improve Athletic Performance",
  "Increase Strength",
  "General Fitness",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(nickname: string, email: string): string {
  const source = nickname.trim() || email.split("@")[0];
  const parts = source.split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Form state
  const [currentEmail, setCurrentEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState("#b3cdff");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setCurrentEmail(user.email ?? "");
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_color, fitness_goal, instagram, tiktok, bio")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNickname(profile.nickname ?? "");
        setAvatarColor(profile.avatar_color ?? "#b3cdff");
        setFitnessGoal(profile.fitness_goal ?? "");
        setInstagram(profile.instagram ?? "");
        setTiktok(profile.tiktok ?? "");
        setBio(profile.bio ?? "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setEmailNotice("");
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Upsert profile fields (creates the row if it doesn't exist yet)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        nickname: nickname.trim() || null,
        avatar_color: avatarColor,
        fitness_goal: fitnessGoal || null,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        bio: bio.trim() || null,
      }, { onConflict: "id" });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    // Email change goes through Supabase auth confirmation flow
    if (email.trim() && email.trim() !== currentEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
      if (emailError) {
        setError("Could not update email: " + emailError.message);
        setSaving(false);
        return;
      }
      setEmailNotice(`A confirmation link has been sent to ${email.trim()}. Click it to confirm your new email.`);
      setEmail(currentEmail); // revert display until confirmed
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters."); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) { setPasswordError(error.message); }
    else {
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = getInitials(nickname, currentEmail);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#2d4060] sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur">
        <Link href="/dashboard" className="text-white">
          <ZMark className="h-5" />
        </Link>
        <p className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Profile</p>
        <button
          onClick={handleSignOut}
          className="font-mono text-[9px] tracking-widest uppercase text-gray-500 hover:text-[#f87171] transition-colors"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Avatar preview */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-mono font-bold tracking-wider border-2 transition-all duration-300"
            style={{
              color: avatarColor,
              borderColor: avatarColor + "40",
              backgroundColor: avatarColor + "15",
            }}
          >
            {initials}
          </div>
          <div className="text-center">
            <p className="text-base font-light tracking-[0.1em] uppercase text-white">
              {nickname.trim() || currentEmail.split("@")[0]}
            </p>
            <p className="font-mono text-[9px] text-gray-500 mt-0.5">{currentEmail}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Nickname */}
          <div className="space-y-2">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="How you appear in the community"
              className="w-full bg-[#1e2d42] border border-[#2d4060] rounded px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#1e2d42] border border-[#2d4060] rounded px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
            />
            <p className="font-mono text-[8px] text-gray-600 tracking-wide">
              Changing your email sends a confirmation link to the new address.
            </p>
          </div>

          {/* Avatar color */}
          <div className="space-y-3">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Profile Color</label>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setAvatarColor(c.hex)}
                  className="aspect-square rounded-full border-2 transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: c.hex + "25",
                    borderColor: avatarColor === c.hex ? c.hex : "transparent",
                    boxShadow: avatarColor === c.hex ? `0 0 0 2px ${c.hex}40` : "none",
                  }}
                >
                  <span
                    className="block w-full h-full rounded-full"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
            <p className="font-mono text-[8px] text-gray-600 tracking-wide">
              Selected: <span style={{ color: avatarColor }}>{COLORS.find(c => c.hex === avatarColor)?.label ?? avatarColor}</span>
            </p>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-2">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFitnessGoal(fitnessGoal === g ? "" : g)}
                  className={`px-3 py-2.5 rounded border text-left font-mono text-[9px] tracking-wide uppercase transition-colors ${
                    fitnessGoal === g
                      ? "bg-[#b3cdff]/10 border-[#b3cdff]/50 text-[#b3cdff]"
                      : "bg-[#1e2d42] border-[#2d4060] text-gray-400 hover:border-[#b3cdff]/30 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
              maxLength={200}
              className="w-full bg-[#1e2d42] border border-[#2d4060] rounded px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm leading-relaxed resize-none"
            />
            <p className="font-mono text-[8px] text-gray-600 text-right">{bio.length}/200</p>
          </div>

          {/* Socials */}
          <div className="space-y-3">
            <label className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase">Socials</label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-500">@</span>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value.replace(/^@/, ""))}
                placeholder="Instagram username"
                className="w-full bg-[#1e2d42] border border-[#2d4060] rounded pl-8 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]/60" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-500">@</span>
              <input
                type="text"
                value={tiktok}
                onChange={e => setTiktok(e.target.value.replace(/^@/, ""))}
                placeholder="TikTok username"
                className="w-full bg-[#1e2d42] border border-[#2d4060] rounded pl-8 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded px-4 py-3">
              <p className="font-mono text-[9px] text-[#f87171] tracking-wider">{error}</p>
            </div>
          )}
          {emailNotice && (
            <div className="bg-[#b3cdff]/10 border border-[#b3cdff]/30 rounded px-4 py-3">
              <p className="font-mono text-[9px] text-[#b3cdff] tracking-wider leading-relaxed">{emailNotice}</p>
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#b3cdff] text-[#0f141b] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>

        </form>

        {/* Password section */}
        <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-[#2d4060] pt-8">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-gray-400 uppercase mb-1">Set Password</p>
            <p className="font-mono text-[8px] text-gray-600 tracking-wide">Set or change your login password.</p>
          </div>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-[#1e2d42] border border-[#2d4060] rounded px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1e2d42] border border-[#2d4060] rounded px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-light text-sm tracking-wide"
          />
          {passwordError && (
            <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded px-4 py-3">
              <p className="font-mono text-[9px] text-[#f87171] tracking-wider">{passwordError}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={passwordSaving || !newPassword}
            className="w-full bg-[#1e2d3d] border border-[#2d4060] text-white font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:border-[#b3cdff]/40 hover:text-[#b3cdff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {passwordSaving ? "Saving..." : passwordSaved ? "Password Updated ✓" : "Set Password"}
          </button>
        </form>

        {/* Divider + support */}
        <div className="border-t border-[#2d4060] pt-6 space-y-3 text-center">
          <a
            href="mailto:hello@zanafitness.com"
            className="block font-mono text-[9px] tracking-widest uppercase text-gray-600 hover:text-[#b3cdff] transition-colors"
          >
            Support — hello@zanafitness.com
          </a>
          <p className="font-mono text-[8px] text-[#1a222c] uppercase tracking-widest">
            © 2026 ZANA Fitness
          </p>
        </div>

      </div>
    </main>
  );
}
