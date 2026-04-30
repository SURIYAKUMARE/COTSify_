"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProjects, SavedProject } from "@/lib/local-storage";
import {
  User, Mail, Calendar, Cpu, Code, Bookmark,
  FolderOpen, TrendingUp, Clock, Search, ChevronRight,
  Edit3, Check, X, Camera, Loader2, Shield, LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.full_name || "");
      setEditAvatar(user.avatar_url || "");
    }
  }, [user]);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Guest User";
  const displayEmail = user?.email || "Not signed in";
  const avatarLetter = displayName[0]?.toUpperCase() || "G";

  const totalHW = projects.reduce((s, p) => s + (p.analysis?.hardware?.length || 0), 0);
  const totalSW = projects.reduce((s, p) => s + (p.analysis?.software?.length || 0), 0);
  const totalBM = projects.reduce((s, p) => s + (p.bookmarked_components?.length || 0), 0);
  const recentProjects = projects.slice(0, 5);

  const hwCounts: Record<string, number> = {};
  projects.forEach((p) =>
    p.analysis?.hardware?.forEach((h) => {
      const key = h.name.split(" ")[0];
      hwCounts[key] = (hwCounts[key] || 0) + 1;
    })
  );
  const topComponents = Object.entries(hwCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Handle image file upload → convert to base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setEditAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    const result = await updateProfile({
      full_name: editName.trim() || undefined,
      avatar_url: editAvatar || undefined,
    });
    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditName(user?.full_name || "");
    setEditAvatar(user?.avatar_url || "");
    setSaveError("");
    setEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-cyan-400" />
        Profile
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Profile card ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              {(editing ? editAvatar : user?.avatar_url) ? (
                <img
                  src={editing ? editAvatar : user?.avatar_url}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-gray-950 text-3xl font-bold border-2 border-cyan-500">
                  {avatarLetter}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center text-gray-950 transition-colors shadow-lg"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />
            </div>

            {/* Name / Email */}
            {editing ? (
              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Display name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-600 transition-colors"
                    placeholder="Your name"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Avatar URL (optional)</label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-600 transition-colors"
                    placeholder="https://..."
                  />
                </div>
                {saveError && (
                  <p className="text-red-400 text-xs">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold py-2 rounded-xl text-sm transition-colors"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-xl text-sm transition-colors border border-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white">{displayName}</h2>
                <p className="text-gray-400 text-sm mt-1">{displayEmail}</p>
                {user?.provider === "supabase" && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google account
                  </span>
                )}
                {saveSuccess && (
                  <p className="text-green-400 text-xs mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Profile updated!
                  </p>
                )}
              </div>
            )}

            {/* Edit button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 py-2.5 rounded-xl text-sm transition-colors mb-3"
              >
                <Edit3 className="w-4 h-4" />
                Edit profile
              </button>
            )}

            {/* Account info */}
            <div className="flex flex-col gap-2 text-sm text-gray-400 border-t border-gray-800 pt-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                Joined {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {user?.provider === "supabase" ? "Supabase Auth" : "Local / Guest"}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/50 py-2.5 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Stats
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Projects saved", value: projects.length, color: "text-cyan-400" },
                { label: "Hardware components", value: totalHW, color: "text-blue-400" },
                { label: "Software tools", value: totalSW, color: "text-purple-400" },
                { label: "Bookmarked items", value: totalBM, color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{s.label}</span>
                  <span className={`font-bold text-lg ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Activity ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Recent projects */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                Recent Projects
              </h3>
              <Link href="/dashboard" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📂</div>
                <p className="text-gray-400 text-sm mb-4">No projects yet</p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Start a project
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/search?q=${encodeURIComponent(p.project_title)}`}
                    className="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-800 rounded-xl px-4 py-3 transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.project_title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-cyan-500" />
                          {p.analysis?.hardware?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3 text-purple-500" />
                          {p.analysis?.software?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top components */}
          {topComponents.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Most Used Components
              </h3>
              <div className="flex flex-wrap gap-2">
                {topComponents.map(([name, count]) => (
                  <span key={name} className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-full">
                    {name}
                    <span className="bg-cyan-900 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {totalBM > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-yellow-400" />
                Bookmarked Components
              </h3>
              <div className="flex flex-wrap gap-2">
                {projects.flatMap((p) => p.bookmarked_components).map((name, i) => (
                  <span key={i} className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 text-sm px-3 py-1.5 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
