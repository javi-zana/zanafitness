"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import BottomNav from "@/components/BottomNav";

// ─── Logo ─────────────────────────────────────────────────────────────────────

const ZMark = ({ className = "h-5" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  { hex: "#b0e455", label: "Lime" },
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

function getInitials(firstName: string, nickname: string, email: string): string {
  const source = firstName.trim() || nickname.trim() || email.split("@")[0];
  const parts = source.split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 overflow-hidden">
      <div className="px-5 py-3 border-b border-[#b0e455]/8">
        <p className="text-xs font-semibold text-[#edf5e2]/40 uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#edf5e2]/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#0f1a0c] border border-[#b0e455]/12 rounded-xl px-4 py-3 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition-colors";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const photoRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form state
  const [currentEmail, setCurrentEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState("#b0e455");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setCurrentEmail(user.email ?? "");
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, nickname, avatar_color, avatar_url, fitness_goal, instagram, tiktok, bio")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setNickname(profile.nickname ?? "");
        setAvatarColor(profile.avatar_color ?? "#b0e455");
        setAvatarUrl(profile.avatar_url ?? null);
        setFitnessGoal(profile.fitness_goal ?? "");
        setInstagram(profile.instagram ?? "");
        setTiktok(profile.tiktok ?? "");
        setBio(profile.bio ?? "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Photo upload ───────────────────────────────────────────────────────────

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);
    setUploadingPhoto(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingPhoto(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(path);
      const busted = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(busted);
      await supabase.from("profiles").upsert(
        { id: user.id, avatar_url: publicUrl },
        { onConflict: "id" }
      );
    } else {
      setError("Photo upload failed — make sure the profile-photos storage bucket exists.");
    }

    setUploadingPhoto(false);
    e.target.value = "";
  }

  // ─── Save profile ───────────────────────────────────────────────────────────

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setEmailNotice("");
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: firstName.trim() || null,
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

    if (email.trim() && email.trim() !== currentEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
      if (emailError) {
        setError("Could not update email: " + emailError.message);
        setSaving(false);
        return;
      }
      setEmailNotice(`A confirmation link has been sent to ${email.trim()}.`);
      setEmail(currentEmail);
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── Change password ────────────────────────────────────────────────────────

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

  const initials = getInitials(firstName, nickname, currentEmail);
  const displayName = firstName.trim() || nickname.trim() || currentEmail.split("@")[0];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f1a0c] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#b0e455]/30 border-t-[#b0e455] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] lg:pl-64">
      <BottomNav />

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-[#b0e455]/8 sticky top-0 z-10 bg-[#0f1a0c]/95 backdrop-blur">
        <Link href="/dashboard" className="text-[#edf5e2] lg:hidden">
          <ZMark className="h-5" />
        </Link>
        <p className="text-xs font-semibold text-[#edf5e2]/40 uppercase tracking-widest">Profile</p>
        <button
          onClick={handleSignOut}
          className="text-xs text-[#edf5e2]/35 hover:text-[#f87171] transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-8 space-y-5 pb-20">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2"
                style={{ borderColor: avatarColor + "50" }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-2 select-none"
                style={{
                  color: avatarColor,
                  borderColor: avatarColor + "50",
                  backgroundColor: avatarColor + "18",
                }}
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#b0e455] text-[#0f1a0c] flex items-center justify-center shadow-lg hover:bg-[#c9f070] transition-colors disabled:opacity-60"
            >
              {uploadingPhoto ? (
                <div className="w-3.5 h-3.5 border-2 border-[#0f1a0c]/30 border-t-[#0f1a0c] rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div className="text-center">
            <p className="text-base font-semibold">{displayName}</p>
            <p className="text-xs text-[#edf5e2]/35 mt-0.5">{currentEmail}</p>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSave}>

        {/* Personal info */}
        <Section title="Personal">
          <Field label="First name">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Your first name"
              className={inputCls}
            />
          </Field>
          <Field label="Display name">
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="How you appear to others"
              className={inputCls}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the community a bit about yourself..."
              rows={3}
              maxLength={200}
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <p className="text-[10px] text-[#edf5e2]/25 text-right mt-1">{bio.length}/200</p>
          </Field>
        </Section>

        {/* Account */}
        <Section title="Account">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          {emailNotice && (
            <div className="bg-[#b0e455]/8 border border-[#b0e455]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#b0e455] leading-relaxed">{emailNotice}</p>
            </div>
          )}
        </Section>

        {/* Fitness goal */}
        <Section title="Fitness Goal">
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setFitnessGoal(fitnessGoal === g ? "" : g)}
                className={`px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                  fitnessGoal === g
                    ? "bg-[#b0e455]/10 border-[#b0e455]/50 text-[#b0e455]"
                    : "bg-[#0f1a0c] border-[#b0e455]/10 text-[#edf5e2]/45 hover:border-[#b0e455]/25 hover:text-[#edf5e2]/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Section>

        {/* Socials */}
        <Section title="Socials">
          <Field label="Instagram">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#edf5e2]/25">@</span>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className={`${inputCls} pl-8`}
              />
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#f472b6]/50 absolute right-4 top-1/2 -translate-y-1/2">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
          </Field>
          <Field label="TikTok">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#edf5e2]/25">@</span>
              <input
                type="text"
                value={tiktok}
                onChange={e => setTiktok(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className={`${inputCls} pl-8`}
              />
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#edf5e2]/25 absolute right-4 top-1/2 -translate-y-1/2">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
              </svg>
            </div>
          </Field>
        </Section>

        {/* Profile color */}
        <Section title="Profile Color">
          <p className="text-xs text-[#edf5e2]/35 -mt-1">Used for your avatar when no photo is set.</p>
          <div className="grid grid-cols-8 gap-2 pt-1">
            {COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => setAvatarColor(c.hex)}
                className="aspect-square rounded-full border-2 transition-all duration-200 hover:scale-110"
                style={{
                  borderColor: avatarColor === c.hex ? c.hex : "transparent",
                  boxShadow: avatarColor === c.hex ? `0 0 0 2px ${c.hex}35` : "none",
                }}
              >
                <span className="block w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </Section>

        {/* Feedback */}
        {error && (
          <div className="bg-[#f87171]/8 border border-[#f87171]/25 rounded-xl px-4 py-3">
            <p className="text-sm text-[#f87171]">{error}</p>
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Profile"}
        </button>

        </form>

        {/* Password */}
        <Section title="Change Password">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <Field label="New password">
              <input
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Confirm password">
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputCls}
              />
            </Field>
            {passwordError && (
              <div className="bg-[#f87171]/8 border border-[#f87171]/25 rounded-xl px-4 py-3">
                <p className="text-xs text-[#f87171]">{passwordError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="w-full border border-[#b0e455]/20 text-[#edf5e2]/70 text-sm font-medium py-3.5 rounded-2xl hover:border-[#b0e455]/40 hover:text-[#b0e455] transition-colors disabled:opacity-40"
            >
              {passwordSaving ? "Updating..." : passwordSaved ? "Password Updated ✓" : "Update Password"}
            </button>
          </form>
        </Section>

        {/* Footer */}
        <div className="pt-2 space-y-3 text-center">
          <a
            href="mailto:hello@zanafitness.com"
            className="block text-xs text-[#edf5e2]/25 hover:text-[#b0e455] transition-colors"
          >
            Support — hello@zanafitness.com
          </a>
          <p className="text-[10px] text-[#edf5e2]/15 uppercase tracking-widest">
            © 2026 ZANA Fitness
          </p>
        </div>

      </div>
    </main>
  );
}
