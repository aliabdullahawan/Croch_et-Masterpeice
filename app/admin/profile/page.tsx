/* ════════════════════════════════════════════════════════════════
   app/admin/profile/page.tsx  —  Admin Profile Settings
   Reads/writes from localStorage.
   TODO: Replace with Supabase Auth + profiles table when connected.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useEffect, useRef }  from "react";
import { useNotifications }             from "@/context/NotificationContext";
import PageTransition                   from "@/components/ui/PageTransition";
import {
  User, Mail, Lock, Camera, Save, Scissors, CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "croch_admin_profile";

interface AdminProfile {
  name:   string;
  email:  string;
  avatar: string | null;
}

const DEFAULT: AdminProfile = { name: "Amna (Admin)", email: "amnamubeen516@gmail.com", avatar: null };

const INPUT = "w-full px-4 py-2.5 bg-[rgba(42,22,10,0.8)] border border-[rgba(201,160,40,0.15)] rounded-xl text-sm text-[#C8B89A] placeholder-[#4A3020] outline-none focus:border-[#C9A028] transition";
const LABEL = "block text-[10px] uppercase tracking-widest text-[#7A5A48] mb-1.5 font-semibold";

export default function AdminProfilePage() {
  const { addToast }   = useNotifications();
  const fileRef        = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [saving,   setSaving]  = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved));
    } catch { /* noop */ }
  }, []);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfile(p => ({ ...p, avatar: ev.target?.result as string ?? null }));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setSaving(true);
    /* TODO: Supabase Auth — await supabase.auth.updateUser({ email: profile.email }) */
    /* TODO: Supabase — await supabase.from('profiles').upsert({ id: user.id, full_name: profile.name, avatar_url: ... }) */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    addToast("Profile saved successfully!", "success");
  }

  async function changePassword() {
    if (!password.current) { addToast("Enter your current password.", "warning"); return; }
    if (password.next.length < 8) { addToast("New password must be at least 8 characters.", "warning"); return; }
    if (password.next !== password.confirm) { addToast("Passwords don't match.", "error"); return; }
    setSaving(true);
    /* TODO: Supabase Auth — await supabase.auth.updateUser({ password: password.next }) */
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setPassword({ current: "", next: "", confirm: "" });
    addToast("Password changed! (Note: connects to Supabase Auth when enabled)", "success");
  }

  return (
    <PageTransition className="p-4 md:p-6 pb-16 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[#F2E9DE]">Profile Settings</h1>
        <p className="text-xs text-[#7A5A48] mt-1">Manage your admin account details</p>
      </div>

      {/* Avatar + Identity */}
      <div className="bg-[rgba(28,18,8,0.8)] border border-[rgba(201,160,40,0.12)] rounded-2xl p-6">
        <h2 className="font-display text-base text-[#F2E9DE] mb-5 border-b border-[rgba(201,160,40,0.1)] pb-2">Identity</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[rgba(201,160,40,0.1)] border-2 border-[rgba(201,160,40,0.2)] flex items-center justify-center">
              {profile.avatar
                ? (
                  // Avatar preview is generated from local FileReader data URL.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                )
                : <Scissors size={28} className="text-[#C9A028]" />
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C9A028] flex items-center justify-center hover:bg-[#E2B84A] transition shadow">
              <Camera size={13} className="text-[#1C1208]" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <p className="font-semibold text-[#F2E9DE]">{profile.name}</p>
            <p className="text-xs text-[#7A5A48]">{profile.email}</p>
            <p className="text-[10px] text-[#4A3020] mt-1">Croch_et Masterpiece · Administrator</p>
          </div>
        </div>

        <div className="space-y-4">
          <div><label className={LABEL}>Display Name</label>
            <input type="text" className={INPUT} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div><label className={LABEL}>Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A48]" />
              <input type="email" className={INPUT + " pl-9"} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A028] text-[#1C1208] text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition">
          <Save size={15} /> {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-[rgba(28,18,8,0.8)] border border-[rgba(201,160,40,0.12)] rounded-2xl p-6">
        <h2 className="font-display text-base text-[#F2E9DE] mb-5 border-b border-[rgba(201,160,40,0.1)] pb-2">Change Password</h2>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password",     key: "next"    },
            { label: "Confirm Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className={LABEL}>{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A48]" />
                <input type="password" className={INPUT + " pl-9"}
                  value={password[key as keyof typeof password]}
                  onChange={e => setPassword(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={changePassword} disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(201,160,40,0.3)] text-[#C9A028] text-sm font-semibold hover:bg-[rgba(201,160,40,0.1)] disabled:opacity-60 transition">
          <CheckCircle size={15} /> {saving ? "Updating…" : "Update Password"}
        </button>
        <p className="mt-3 text-[10px] text-[#4A3020]">
          TODO: Password changes require Supabase Auth to be connected.
        </p>
      </div>
    </PageTransition>
  );
}
