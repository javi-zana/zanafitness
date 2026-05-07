"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const ZanaLogo = ({ className = "h-5" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const TOTAL_SCREENS = 7; // 0..6 question screens (welcome is -1, confirmation is 7)

const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#b0e455]/50 transition-colors";
const labelCls = "block text-xs font-medium text-white/40 uppercase tracking-wider mb-2";
const textareaCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#b0e455]/50 transition-colors resize-none leading-relaxed";

type PhotoSlot = 'front' | 'side' | 'back';

type IntakeForm = {
  // Basics
  first_name: string;
  gender: string;
  age: string;
  height_cm: string;
  location: string;
  occupation: string;
  work_schedule: string;

  // Starting metrics
  starting_weight_kg: string;
  starting_body_fat_pct: string;

  // Goal
  mirror_goal: string;
  target_date: string;

  // Training
  training_years: string;
  training_frequency_per_week: string;
  training_current_state: string;
  training_access: string;
  training_equipment: string;
  training_injuries: string;

  // Diet
  diet_typical_day: string;
  diet_meals_per_day: string;
  diet_who_cooks: string;
  diet_restrictions: string;
  diet_dislikes: string;
  diet_alcohol_frequency: string;
  diet_supplements: string;
  diet_eating_out_frequency: string;

  // Lifestyle
  lifestyle_sleep_hours: string;
  lifestyle_sleep_quality: string;
  lifestyle_stress_level: string;
  lifestyle_travel_frequency: string;
  lifestyle_energy_level: string;

  // Catch-all
  intake_notes: string;
};

const empty: IntakeForm = {
  first_name: '', gender: '', age: '', height_cm: '', location: '', occupation: '', work_schedule: '',
  starting_weight_kg: '', starting_body_fat_pct: '',
  mirror_goal: '', target_date: '',
  training_years: '', training_frequency_per_week: '', training_current_state: '', training_access: '', training_equipment: '', training_injuries: '',
  diet_typical_day: '', diet_meals_per_day: '', diet_who_cooks: '', diet_restrictions: '', diet_dislikes: '', diet_alcohol_frequency: '', diet_supplements: '', diet_eating_out_frequency: '',
  lifestyle_sleep_hours: '', lifestyle_sleep_quality: '', lifestyle_stress_level: '', lifestyle_travel_frequency: '', lifestyle_energy_level: '',
  intake_notes: '',
};

function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all ${
        selected
          ? 'border-[#b0e455] bg-[#b0e455]/10 text-[#b0e455]'
          : 'border-white/10 bg-white/4 text-white/60 hover:border-white/25 hover:text-white/80'
      }`}>
      {label}
    </button>
  );
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        selected
          ? 'border-[#b0e455] bg-[#b0e455]/10 text-[#b0e455]'
          : 'border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/70'
      }`}>
      {label}
    </button>
  );
}

// Convert a numeric form field to DB value (null if blank)
const num = (v: string): number | null => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v: string): string | null => (v.trim() === '' ? null : v.trim());

// Map IntakeForm → profiles row partial (snake_case)
function toProfileRow(f: IntakeForm) {
  return {
    first_name: str(f.first_name),
    gender: str(f.gender),
    age: num(f.age),
    height_cm: num(f.height_cm),
    location: str(f.location),
    occupation: str(f.occupation),
    work_schedule: str(f.work_schedule),
    starting_weight_kg: num(f.starting_weight_kg),
    starting_body_fat_pct: num(f.starting_body_fat_pct),
    mirror_goal: str(f.mirror_goal),
    target_date: str(f.target_date),
    training_years: str(f.training_years),
    training_frequency_per_week: num(f.training_frequency_per_week),
    training_current_state: str(f.training_current_state),
    training_access: str(f.training_access),
    training_equipment: str(f.training_equipment),
    training_injuries: str(f.training_injuries),
    diet_typical_day: str(f.diet_typical_day),
    diet_meals_per_day: num(f.diet_meals_per_day),
    diet_who_cooks: str(f.diet_who_cooks),
    diet_restrictions: str(f.diet_restrictions),
    diet_dislikes: str(f.diet_dislikes),
    diet_alcohol_frequency: str(f.diet_alcohol_frequency),
    diet_supplements: str(f.diet_supplements),
    diet_eating_out_frequency: str(f.diet_eating_out_frequency),
    lifestyle_sleep_hours: num(f.lifestyle_sleep_hours),
    lifestyle_sleep_quality: str(f.lifestyle_sleep_quality),
    lifestyle_stress_level: num(f.lifestyle_stress_level),
    lifestyle_travel_frequency: str(f.lifestyle_travel_frequency),
    lifestyle_energy_level: str(f.lifestyle_energy_level),
    intake_notes: str(f.intake_notes),
  };
}

// Map a fetched profile row → IntakeForm (for resume)
function fromProfileRow(p: Record<string, unknown>): IntakeForm {
  const s = (k: string) => (p[k] == null ? '' : String(p[k]));
  return {
    first_name: s('first_name'), gender: s('gender'), age: s('age'), height_cm: s('height_cm'),
    location: s('location'), occupation: s('occupation'), work_schedule: s('work_schedule'),
    starting_weight_kg: s('starting_weight_kg'), starting_body_fat_pct: s('starting_body_fat_pct'),
    mirror_goal: s('mirror_goal'), target_date: s('target_date'),
    training_years: s('training_years'), training_frequency_per_week: s('training_frequency_per_week'),
    training_current_state: s('training_current_state'), training_access: s('training_access'),
    training_equipment: s('training_equipment'), training_injuries: s('training_injuries'),
    diet_typical_day: s('diet_typical_day'), diet_meals_per_day: s('diet_meals_per_day'),
    diet_who_cooks: s('diet_who_cooks'), diet_restrictions: s('diet_restrictions'),
    diet_dislikes: s('diet_dislikes'), diet_alcohol_frequency: s('diet_alcohol_frequency'),
    diet_supplements: s('diet_supplements'), diet_eating_out_frequency: s('diet_eating_out_frequency'),
    lifestyle_sleep_hours: s('lifestyle_sleep_hours'), lifestyle_sleep_quality: s('lifestyle_sleep_quality'),
    lifestyle_stress_level: s('lifestyle_stress_level'), lifestyle_travel_frequency: s('lifestyle_travel_frequency'),
    lifestyle_energy_level: s('lifestyle_energy_level'),
    intake_notes: s('intake_notes'),
  };
}

type ExistingPhoto = { id: string; photo_url: string; slot: PhotoSlot | null };

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(-1);   // -1 = welcome, 0..6 = questions, 7 = confirmation
  const [form, setForm] = useState<IntakeForm>(empty);
  const [photos, setPhotos] = useState<Record<PhotoSlot, ExistingPhoto | null>>({ front: null, side: null, back: null });
  const [uploadingSlot, setUploadingSlot] = useState<PhotoSlot | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Resume: load existing profile + before photos
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const [{ data: profile }, { data: existingPhotos }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('progress_photos')
          .select('id, photo_url, storage_path')
          .eq('member_id', user.id)
          .eq('photo_type', 'before')
          .order('created_at', { ascending: true }),
      ]);

      if (profile?.onboarded_at) { router.replace('/dashboard'); return; }

      if (profile) setForm(fromProfileRow(profile));

      // Map photos by slot — storage_path encodes the slot ("before-front-...", etc.)
      const slotMap: Record<PhotoSlot, ExistingPhoto | null> = { front: null, side: null, back: null };
      for (const p of existingPhotos ?? []) {
        const path = String(p.storage_path);
        const match = path.match(/before-(front|side|back)-/);
        if (match) {
          const slot = match[1] as PhotoSlot;
          if (!slotMap[slot]) slotMap[slot] = { id: String(p.id), photo_url: String(p.photo_url), slot };
        }
      }
      setPhotos(slotMap);

      // Stamp onboarding_started_at on first visit
      if (!profile?.onboarding_started_at) {
        await supabase.from('profiles').update({ onboarding_started_at: new Date().toISOString() }).eq('id', user.id);
      }

      setBootstrapping(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) =>
    setForm(f => ({ ...f, [field]: value }));

  // Save the partial form to profiles. Returns true if save succeeded.
  const saveProgress = async (): Promise<boolean> => {
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Session expired. Please sign in again.'); return false; }
    const { error: upErr } = await supabase
      .from('profiles')
      .update(toProfileRow(form))
      .eq('id', user.id);
    if (upErr) { setError(upErr.message); return false; }
    return true;
  };

  const advance = async () => {
    setSaving(true);
    const ok = await saveProgress();
    setSaving(false);
    if (!ok) return;
    if (step < TOTAL_SCREENS) setStep(s => s + 1);
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setError('Session expired.'); return; }
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ ...toProfileRow(form), onboarded_at: new Date().toISOString() })
      .eq('id', user.id);
    setSaving(false);
    if (upErr) { setError(upErr.message); return; }
    router.replace('/dashboard');
  };

  // ── Photo upload (uses /api/upload-progress-photo with photo_type=before) ────
  const photoInputRefs = {
    front: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  };

  const handlePhotoChange = async (slot: PhotoSlot, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Replace existing photo for this slot
    const existing = photos[slot];
    if (existing) {
      await fetch('/api/upload-progress-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id }),
      });
    }

    setUploadingSlot(slot);
    setError('');

    // Re-name file so storage_path includes the slot, lets us round-trip on resume.
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const renamedFile = new File([file], `before-${slot}.${ext}`, { type: file.type });

    const fd = new FormData();
    fd.append('file', renamedFile);
    fd.append('photo_type', 'before');

    try {
      const res = await fetch('/api/upload-progress-photo', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setPhotos(p => ({ ...p, [slot]: { id: json.photo.id, photo_url: json.photo.photo_url, slot } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingSlot(null);
      if (e.target) e.target.value = '';
    }
  };

  const removePhoto = async (slot: PhotoSlot) => {
    const existing = photos[slot];
    if (!existing) return;
    setUploadingSlot(slot);
    await fetch('/api/upload-progress-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: existing.id }),
    });
    setPhotos(p => ({ ...p, [slot]: null }));
    setUploadingSlot(null);
  };

  // ── Validation per step ──────────────────────────────────────────────────────
  const canContinue = () => {
    if (step === 0) return !!(form.first_name.trim() && form.gender && form.age && form.height_cm);
    if (step === 1) return !!form.starting_weight_kg;
    if (step === 2) return !!(form.mirror_goal.trim() && form.target_date);
    if (step === 3) return !!(form.training_years && form.training_frequency_per_week && form.training_access);
    if (step === 4) return !!form.diet_typical_day.trim();
    if (step === 5) return !!(form.lifestyle_sleep_hours && form.lifestyle_stress_level);
    if (step === 6) return true; // optional notes
    return true;
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (bootstrapping) {
    return (
      <main className="min-h-screen bg-[#0b1509] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/15 border-t-[#b0e455] rounded-full animate-spin" />
      </main>
    );
  }

  // ── Welcome ────────────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <ZanaLogo className="h-4 text-white/40" />
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full space-y-8">
            <span className="inline-flex items-center gap-2 bg-[#b0e455]/8 border border-[#b0e455]/15 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
              <p className="text-xs font-medium text-[#b0e455]">Welcome to Zana</p>
            </span>
            <div className="space-y-5">
              <h1 className="font-display leading-tight" style={{ fontSize: 'clamp(36px, 6vw, 52px)' }}>
                Let's build<br />your system.
              </h1>
              <div className="space-y-4 text-[15px] text-white/55 leading-relaxed">
                <p>This is your intake. Your coach will use it to design the program around you — your body, your schedule, your food, your life.</p>
                <p>Plan for about <span className="text-white/80">15 minutes</span>. Be honest and specific. Your progress saves automatically as you go.</p>
              </div>
            </div>
            <button onClick={() => setStep(0)}
              className="inline-flex items-center gap-2 bg-[#b0e455] text-[#0f1a0c] font-semibold px-8 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-sm">
              Start
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Confirmation ───────────────────────────────────────────────────────────
  if (step === TOTAL_SCREENS) {
    return (
      <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <ZanaLogo className="h-4 text-white/40" />
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center space-y-7">
            <div className="w-14 h-14 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-6 h-6">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight">You're all set,<br />{form.first_name || 'there'}.</h1>
              <p className="text-base text-white/55 leading-relaxed">
                Your coach has everything they need.
              </p>
              <p className="text-sm text-white/35 leading-relaxed">
                Your program will be ready in your dashboard within 48 hours.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button onClick={submit} disabled={saving}
              className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40">
              {saving ? 'Saving…' : 'Enter Dashboard'}
            </button>
            <button onClick={() => setStep(s => s - 1)}
              className="w-full text-sm text-white/25 hover:text-white/50 transition-colors py-2">
              ← Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Question screens ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">

      <div className="px-6 pt-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-0.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#b0e455] rounded-full transition-all duration-400"
              style={{ width: `${((step + 1) / TOTAL_SCREENS) * 100}%` }} />
          </div>
          <span className="text-[11px] text-white/25 font-mono shrink-0">{step + 1} / {TOTAL_SCREENS}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex-1 space-y-6">

          {/* ── 0: Basics ── */}
          {step === 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">The basics.</h2>
                <p className="text-sm text-white/35">Stuff your coach needs to calibrate everything else.</p>
              </div>
              <div>
                <label className={labelCls}>First name *</label>
                <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
                  placeholder="Marco" className={inputCls} autoComplete="given-name" />
              </div>
              <div>
                <label className={labelCls}>Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['male', 'female'].map(opt => (
                    <Pill key={opt} label={opt[0].toUpperCase() + opt.slice(1)} selected={form.gender === opt} onClick={() => set('gender', opt)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Age *</label>
                  <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                    placeholder="29" className={inputCls} min={13} max={99} />
                </div>
                <div>
                  <label className={labelCls}>Height (cm) *</label>
                  <input type="number" value={form.height_cm} onChange={e => set('height_cm', e.target.value)}
                    placeholder="178" className={inputCls} min={100} max={250} step="0.1" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Where are you based?</label>
                <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="Singapore" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Occupation</label>
                <input type="text" value={form.occupation} onChange={e => set('occupation', e.target.value)}
                  placeholder="e.g. Finance manager at a bank" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Work schedule</label>
                <textarea value={form.work_schedule} rows={3} onChange={e => set('work_schedule', e.target.value)}
                  placeholder="e.g. 9–7 most days, calls in the evening, early mornings on Tuesdays."
                  className={textareaCls} />
              </div>
            </>
          )}

          {/* ── 1: Starting metrics ── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Where you're starting from.</h2>
                <p className="text-sm text-white/35">Baseline so we can track progress. Photos help more than numbers.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Current weight (kg) *</label>
                  <input type="number" value={form.starting_weight_kg} onChange={e => set('starting_weight_kg', e.target.value)}
                    placeholder="78.5" className={inputCls} step="0.1" min={30} max={300} />
                </div>
                <div>
                  <label className={labelCls}>Body fat % (estimate)</label>
                  <input type="number" value={form.starting_body_fat_pct} onChange={e => set('starting_body_fat_pct', e.target.value)}
                    placeholder="22" className={inputCls} step="0.1" min={3} max={60} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Starting photos</label>
                <p className="text-[11px] text-white/30 mb-3">
                  Front, side, and back — neutral lighting, fitted clothes or shorts. Optional but recommended.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['front', 'side', 'back'] as PhotoSlot[]).map(slot => {
                    const photo = photos[slot];
                    const isUploading = uploadingSlot === slot;
                    return (
                      <div key={slot} className="space-y-2">
                        <input type="file" accept="image/*" capture="environment"
                          ref={photoInputRefs[slot]} className="hidden"
                          onChange={e => handlePhotoChange(slot, e)} />
                        {photo ? (
                          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.photo_url} alt={slot} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePhoto(slot)}
                              disabled={isUploading}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition disabled:opacity-50">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => photoInputRefs[slot].current?.click()}
                            disabled={isUploading}
                            className="w-full aspect-[3/4] rounded-2xl border border-dashed border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5 transition flex flex-col items-center justify-center gap-2 disabled:opacity-50">
                            {isUploading ? (
                              <div className="w-4 h-4 border-2 border-white/20 border-t-[#b0e455] rounded-full animate-spin" />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-white/30">
                                <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
                              </svg>
                            )}
                          </button>
                        )}
                        <p className="text-center text-[11px] uppercase tracking-wider text-white/30 font-mono">{slot}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── 2: Goal ── */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Your goal.</h2>
                <p className="text-sm text-white/35">Specific outcomes. We work backwards from here.</p>
              </div>
              <div>
                <label className={labelCls}>Mirror goal — what does success look like? *</label>
                <textarea value={form.mirror_goal} rows={6} onChange={e => set('mirror_goal', e.target.value)}
                  placeholder="e.g. Lean and visibly defined. Shirt off at Bali in October without thinking twice — clothes fitting, lifts going up, energy through the day."
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Target date *</label>
                <input type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)}
                  className={inputCls} />
              </div>
            </>
          )}

          {/* ── 3: Training ── */}
          {step === 3 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Training.</h2>
                <p className="text-sm text-white/35">Where you're at and what you have access to.</p>
              </div>
              <div>
                <label className={labelCls}>Years training *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['<1', '1–3', '3–5', '5+'].map(opt => (
                    <Pill key={opt} label={opt} selected={form.training_years === opt} onClick={() => set('training_years', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Sessions per week (current) *</label>
                <div className="grid grid-cols-7 gap-2">
                  {[0,1,2,3,4,5,6].map(n => (
                    <Pill key={n} label={String(n)} selected={form.training_frequency_per_week === String(n)}
                      onClick={() => set('training_frequency_per_week', String(n))} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>What does your training look like today?</label>
                <textarea value={form.training_current_state} rows={4} onChange={e => set('training_current_state', e.target.value)}
                  placeholder="e.g. Mostly chest + arms 3x/week, skip legs, no real plan, classes once in a while."
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Training access *</label>
                <div className="space-y-2">
                  {[
                    'Full commercial gym',
                    'Hotel / building gym (basic equipment)',
                    'Home gym (full setup)',
                    'Home — minimal equipment / bodyweight',
                    'Mix (gym + travel)',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.training_access === opt} onClick={() => set('training_access', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Equipment available (notes)</label>
                <textarea value={form.training_equipment} rows={2} onChange={e => set('training_equipment', e.target.value)}
                  placeholder="e.g. Barbell rack, dumbbells to 30kg, cable machine, no leg press."
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Injuries / limitations</label>
                <textarea value={form.training_injuries} rows={3} onChange={e => set('training_injuries', e.target.value)}
                  placeholder="Anything we should work around — bad knee, lower back, shoulder, etc."
                  className={textareaCls} />
              </div>
            </>
          )}

          {/* ── 4: Diet ── */}
          {step === 4 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Diet.</h2>
                <p className="text-sm text-white/35">Be real — we build food habits around how you actually eat.</p>
              </div>
              <div>
                <label className={labelCls}>Typical day of eating *</label>
                <textarea value={form.diet_typical_day} rows={6} onChange={e => set('diet_typical_day', e.target.value)}
                  placeholder={'Breakfast: …\nLunch: …\nDinner: …\nSnacks: …'}
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Meals per day</label>
                <div className="grid grid-cols-6 gap-2">
                  {[1,2,3,4,5,6].map(n => (
                    <Pill key={n} label={String(n)} selected={form.diet_meals_per_day === String(n)}
                      onClick={() => set('diet_meals_per_day', String(n))} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Who handles the food?</label>
                <div className="space-y-2">
                  {[
                    'I cook all my meals',
                    'I cook most, eat out sometimes',
                    'Mix of cooking, takeout, and eating out',
                    'Mostly takeout / restaurants',
                    'Someone else cooks (partner, family, helper)',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.diet_who_cooks === opt} onClick={() => set('diet_who_cooks', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Restrictions / allergies</label>
                <textarea value={form.diet_restrictions} rows={2} onChange={e => set('diet_restrictions', e.target.value)}
                  placeholder="e.g. Lactose intolerant, halal, vegetarian, gluten-free, etc."
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Foods you hate or won't eat</label>
                <textarea value={form.diet_dislikes} rows={2} onChange={e => set('diet_dislikes', e.target.value)}
                  placeholder="e.g. No fish, no broccoli, can't stand cottage cheese."
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Alcohol</label>
                <div className="space-y-2">
                  {[
                    'Never',
                    'Rarely (special occasions)',
                    '1–3 drinks per week',
                    '4–7 drinks per week',
                    '8+ drinks per week',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.diet_alcohol_frequency === opt} onClick={() => set('diet_alcohol_frequency', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Eating out / social meals</label>
                <div className="space-y-2">
                  {[
                    'Rarely (1–2 per month)',
                    'Sometimes (1–2 per week)',
                    'Often (3–5 per week)',
                    'Constantly (6+ per week)',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.diet_eating_out_frequency === opt} onClick={() => set('diet_eating_out_frequency', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Current supplements</label>
                <textarea value={form.diet_supplements} rows={2} onChange={e => set('diet_supplements', e.target.value)}
                  placeholder="e.g. Whey protein post-workout, creatine 5g daily, vitamin D, fish oil."
                  className={textareaCls} />
              </div>
            </>
          )}

          {/* ── 5: Lifestyle ── */}
          {step === 5 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Lifestyle.</h2>
                <p className="text-sm text-white/35">The rest of your life — sleep, stress, travel.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Avg sleep (hours) *</label>
                  <input type="number" value={form.lifestyle_sleep_hours} onChange={e => set('lifestyle_sleep_hours', e.target.value)}
                    placeholder="6.5" className={inputCls} step="0.5" min={0} max={24} />
                </div>
                <div>
                  <label className={labelCls}>Stress level (1–10) *</label>
                  <input type="number" value={form.lifestyle_stress_level} onChange={e => set('lifestyle_stress_level', e.target.value)}
                    placeholder="7" className={inputCls} min={1} max={10} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Sleep quality</label>
                <div className="space-y-2">
                  {[
                    'Great — wake up rested',
                    'Decent — usually fine',
                    'Inconsistent — depends on the night',
                    'Poor — wake up tired most days',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.lifestyle_sleep_quality === opt} onClick={() => set('lifestyle_sleep_quality', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Travel frequency</label>
                <div className="space-y-2">
                  {[
                    'Rarely (a few times a year)',
                    'Occasional (monthly)',
                    'Frequent (every other week)',
                    'Constantly (weekly travel)',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.lifestyle_travel_frequency === opt} onClick={() => set('lifestyle_travel_frequency', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Daytime energy</label>
                <div className="space-y-2">
                  {[
                    'High — sharp all day',
                    'Up and down — afternoon dip',
                    'Tired most of the day',
                    'Wired but exhausted',
                  ].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={form.lifestyle_energy_level === opt} onClick={() => set('lifestyle_energy_level', opt)} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── 6: Anything else ── */}
          {step === 6 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">Anything else?</h2>
                <p className="text-sm text-white/35">Optional. Anything your coach should know that didn't fit above.</p>
              </div>
              <textarea value={form.intake_notes} rows={6}
                onChange={e => set('intake_notes', e.target.value)}
                placeholder="e.g. I'm getting married in November. I have a bad knee, jumping is out. I'm not motivated by numbers, more by how I feel."
                className={textareaCls} />
            </>
          )}

        </div>

        {/* Navigation */}
        <div className="pt-8 space-y-3">
          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          <button type="button" onClick={advance} disabled={!canContinue() || saving}
            className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving ? 'Saving…' : step === TOTAL_SCREENS - 1 ? 'Review' : 'Continue'}
            {!saving && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button type="button" onClick={() => setStep(s => s - 1 < -1 ? -1 : s - 1)}
            className="w-full text-sm text-white/25 hover:text-white/50 transition-colors py-2">
            ← Back
          </button>
          <Link href="/login" className="block text-center text-[11px] text-white/20 hover:text-white/40 transition-colors pt-2">
            Sign out
          </Link>
        </div>
      </div>
    </main>
  );
}
