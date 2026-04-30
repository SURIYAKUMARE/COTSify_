"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProjects, SavedProject } from "@/lib/local-storage";
import {
  User, Mail, Calendar, Cpu, Code, Bookmark,
  FolderOpen, TrendingUp, Clock, Search, ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Guest User";
  const displayEmail = user?.email || "guest@cotsify.local";
  const avatarLetter = displayName[0].toUpperCase();

  const totalHW = projects.reduce((s, p) => s + (p.analysis?.hardware?.length || 0), 0);
  const totalSW = projects.reduce((s, p) => s + (p.analysis?.software?.length || 0), 0);
  const totalBM = projects.reduce((s, p) => s + (p.bookmarked_components?.length || 0), 0);
  const recentProjects = projects.slice(0, 5);

  // Most searched categories from hardware
  const hwCounts: Record<string, number> = {};
  projects.forEach((p) =>
    p.analysis?.hardware?.forEach((h) => {
      const key = h.name.split(" ")[0];
      hwCounts[key] = (hwCounts[key] || 0) + 1;
    })
  );
  const topComponents = Object.entries(hwCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-cyan-400" />
        Profile
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left – Profile card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Avatar + info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-gray-950">{avatarLetter}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <p className="text-gray-400 text-sm mt-1">COTsify Explorer</p>

            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <Mail className="w-4 h-4" />
                {displayEmail}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-4 h-4" />
                Joined {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            </div>

            <Link
              href="/auth/signup"
              className="mt-5 block w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Create account to sync
            </Link>
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

        {/* Right – Activity */}
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
                  <span
                    key={name}
                    className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-full"
                  >
                    {name}
                    <span className="bg-cyan-900 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarked components */}
          {totalBM > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-yellow-400" />
                Bookmarked Components
              </h3>
              <div className="flex flex-wrap gap-2">
                {projects.flatMap((p) => p.bookmarked_components).map((name, i) => (
                  <span
                    key={i}
                    className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 text-sm px-3 py-1.5 rounded-full"
                  >
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
