/* ════════════════════════════════════════════════════════════════
  app/admin/profile/page.tsx  —  Admin Profile Settings
  Connected to Supabase Auth + profiles table.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useEffect, useRef }  from "react";
import { useNotifications }             from "@/context/NotificationContext";
import { useTheme }                     from "@/context/ThemeContext";
import { useAuth }                      from "@/context/AuthContext";
import { supabase }                     from "@/lib/supabase";
import { uploadAvatarToStorage }        from "@/lib/avatar-storage";
import PageTransition                   from "@/components/ui/PageTransition";
import {
  Mail, Lock, Camera, Save, Scissors, CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "croch_admin_profile";

interface AdminProfile {
  name:   string;
  email:  string;
  avatar: string | null;
}

const DEFAULT: AdminProfile = { name: "Amna (Admin)", email: "amnamubeen516@gmail.com", avatar: null };

export default function AdminProfilePage() {
  const db = supabase as any;
  const { theme } = useTheme();
  const { adminUser, user } = useAuth();
  const isDark = theme === "dark";
  const cardBg = isDark ? "rgba(28,18,8,0.8)" : "rgba(255,248,243,0.96)";
  const inputBg = isDark ? "rgba(42,22,10,0.8)" : "rgba(255,255,255,0.96)";
  const headingColor = isDark ? "#F2E9DE" : "#2C1A0E";
  const labelColor = isDark ? "#7A5A48" : "#6B4C3B";
  const textColor = isDark ? "#C8B89A" : "#3D2B1F";
  const borderColor = isDark ? "rgba(201,160,40,0.15)" : "rgba(61,43,31,0.15)";

  const INPUT = "w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#C9A028] transition";
  const LABEL = "block text-[10px] uppercase tracking-widest mb-1.5 font-semibold";

  const { addToast }   = useNotifications();
  const fileRef        = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [saving,   setSaving]  = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fallback = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setProfile(JSON.parse(saved));
          return;
        }
      } catch {
        // Ignore parse errors and use default.
      }

      setProfile({
        name: adminUser?.name ?? user?.name ?? DEFAULT.name,
        email: adminUser?.email ?? user?.email ?? DEFAULT.email,
        avatar: user?.avatar ?? DEFAULT.avatar,
      });
    };

    const uid = user?.id ?? adminUser?.id;
    if (!uid) {
      fallback();
      return;
    }

    void (async () => {
      const { data, error } = await db
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        fallback();
        return;
      }

      setProfile({
        name: data?.full_name ?? adminUser?.name ?? user?.name ?? DEFAULT.name,
        email: adminUser?.email ?? user?.email ?? DEFAULT.email,
        avatar: data?.avatar_url ?? user?.avatar ?? DEFAULT.avatar,
      });
    })();
  }, [adminUser?.email, adminUser?.id, adminUser?.name, db, user?.avatar, user?.email, user?.id, user?.name]);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file.", "warning");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Avatar image must be under 5 MB.", "warning");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setProfile(p => ({ ...p, avatar: ev.target?.result as string ?? null }));
    reader.readAsDataURL(file);
    addToast("Avatar selected. Click Save Profile to upload.", "info");
  }

  async function saveProfile() {
    const uid = user?.id ?? adminUser?.id;
    if (!uid) {
      addToast("Session missing. Please sign in again.", "error");
      return;
    }

    if (!profile.name.trim() || !profile.email.trim()) {
      addToast("Name and email are required.", "warning");
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        const uploaded = await uploadAvatarToStorage(uid, avatarFile);
        avatarUrl = uploaded.publicUrl;
      }

      const { error: authError } = await supabase.auth.updateUser({
        email: profile.email.trim(),
        data: {
          full_name: profile.name.trim(),
          avatar_url: avatarUrl,
        },
      });
      if (authError) throw authError;

      const { error: profileError } = await db
        .from("profiles")
        .upsert({
          id: uid,
          full_name: profile.name.trim(),
          avatar_url: avatarUrl,
        }, { onConflict: "id" });
      if (profileError) throw profileError;

      const syncedProfile = { ...profile, avatar: avatarUrl };
      setProfile(syncedProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedProfile));
      setAvatarFile(null);
      addToast("Profile saved successfully!", "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to update profile right now.";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!password.current) { addToast("Enter your current password.", "warning"); return; }
    if (password.next.length < 8) { addToast("New password must be at least 8 characters.", "warning"); return; }
    if (password.next !== password.confirm) { addToast("Passwords don't match.", "error"); return; }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.next });
      if (error) throw error;

      setPassword({ current: "", next: "", confirm: "" });
      addToast("Password changed successfully.", "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to update password right now.";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition className="p-4 md:p-6 pb-16 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl" style={{ color: headingColor }}>Profile Settings</h1>
        <p className="text-xs mt-1" style={{ color: labelColor }}>Manage your admin account details</p>
      </div>

      {/* Avatar + Identity */}
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
        <h2 className="font-display text-base mb-5 pb-2" style={{ color: headingColor, borderBottom: `1px solid ${isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.1)"}` }}>Identity</h2>

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
            <p className="font-semibold" style={{ color: headingColor }}>{profile.name}</p>
            <p className="text-xs" style={{ color: labelColor }}>{profile.email}</p>
            <p className="text-[10px] mt-1" style={{ color: isDark ? "#4A3020" : "#8D6A54" }}>Croch_et Masterpiece · Administrator</p>
          </div>
        </div>

        <div className="space-y-4">
          <div><label className={LABEL} style={{ color: labelColor }}>Display Name</label>
            <input type="text" className={INPUT} style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div><label className={LABEL} style={{ color: labelColor }}>Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
              <input type="email" className={INPUT + " pl-9"} style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A028] text-[#1C1208] text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition">
          <Save size={15} /> {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
        <h2 className="font-display text-base mb-5 pb-2" style={{ color: headingColor, borderBottom: `1px solid ${isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.1)"}` }}>Change Password</h2>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password",     key: "next"    },
            { label: "Confirm Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className={LABEL} style={{ color: labelColor }}>{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
                <input type="password" className={INPUT + " pl-9"}
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
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
        <p className="mt-3 text-[10px]" style={{ color: isDark ? "#4A3020" : "#8D6A54" }}>
          Password changes are applied through Supabase Auth.
        </p>
      </div>
    </PageTransition>
  );
}
