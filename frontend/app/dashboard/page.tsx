"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProjects, deleteProjectLocal, SavedProject } from "@/lib/local-storage";
import RouteGuard from "@/components/RouteGuard";
import {
  LayoutDashboard, Search, Trash2, Bookmark, Cpu, Code,
  Clock, ExternalLink, TrendingUp, Zap, Package, Star,
  ChevronRight, Plus, Activity, BarChart2, Layers,
  ArrowUpRight, Calendar, Filter, Grid, List,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    setMounted(true);
  }, []);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteProjectLocal(id);
    setProjects(getProjects());
    setDeletingId(null);
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Engineer";
  const totalHW = projects.reduce((s, p) => s + (p.analysis?.hardware?.length || 0), 0);
  const totalSW = projects.reduce((s, p) => s + (p.analysis?.software?.length || 0), 0);
  const totalBM = projects.reduce((s, p) => s + (p.bookmarked_components?.length || 0), 0);
  const avgComponents = projects.length ? Math.round((totalHW + totalSW) / projects.length) : 0;

  const filtered = filter === "bookmarked"
    ? projects.filter(p => p.bookmarked_components?.length > 0)
    : projects;

  const STATS = [
    { label: "Total Projects", value: projects.length, icon: <Layers className="w-5 h-5" />, color: "from-cyan-500 to-blue-600", bg: "bg-cyan-950/50", border: "border-cyan-800/50", text: "text-cyan-400" },
    { label: "Hardware Parts", value: totalHW, icon: <Cpu className="w-5 h-5" />, color: "from-blue-500 to-purple-600", bg: "bg-blue-950/50", border: "border-blue-800/50", text: "text-blue-400" },
    { label: "Software Tools", value: totalSW, icon: <Code className="w-5 h-5" />, color: "from-purple-500 to-pink-600", bg: "bg-purple-950/50", border: "border-purple-800/50", text: "text-purple-400" },
    { label: "Bookmarked", value: totalBM, icon: <Bookmark className="w-5 h-5" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-950/50", border: "border-amber-800/50", text: "text-amber-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-gray-950 font-bold text-lg">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{displayName}</span>
              </h1>
              <p className="text-gray-500 text-sm">
                {projects.length === 0 ? "Start your first project" : `${projects.length} project${projects.length > 1 ? "s" : ""} saved`}
              </p>
            </div>
          </div>
        </div>
        <Link href="/search"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:scale-105">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <div key={s.label}
            className={`relative overflow-hidden ${s.bg} border ${s.border} rounded-2xl p-5 group hover:scale-[1.02] transition-all`}
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${s.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${s.color} mb-3 shadow-lg`}>
              <div className="text-white">{s.icon}</div>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className="text-gray-400 text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Activity bar ───────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Project Activity
            </h3>
            <span className="text-gray-500 text-xs">Avg {avgComponents} components/project</span>
          </div>
          <div className="flex items-end gap-2 h-16">
            {projects.slice(0, 12).map((p, i) => {
              const total = (p.analysis?.hardware?.length || 0) + (p.analysis?.software?.length || 0);
              const maxTotal = Math.max(...projects.map(x => (x.analysis?.hardware?.length || 0) + (x.analysis?.software?.length || 0)), 1);
              const height = Math.max(20, (total / maxTotal) * 100);
              return (
                <div key={p.id} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" title={p.project_title}>
                  <div className="relative w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-500 opacity-70 group-hover:opacity-100 transition-all"
                    style={{ height: `${height}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                      {total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />Hardware</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Software</span>
          </div>
        </div>
      )}

      {/* ── Projects section ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          Saved Projects
          {filtered.length > 0 && (
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">{filtered.length}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
            {[["all", "All"], ["bookmarked", "Bookmarked"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filter === val ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                {label}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-gray-700 text-white" : "text-gray-500"}`}>
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-gray-700 text-white" : "text-gray-500"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent)] pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              {filter === "bookmarked" ? "No bookmarked projects" : "No projects yet"}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              {filter === "bookmarked" ? "Bookmark components while searching to see them here" : "Search for a project and save it to build your collection"}
            </p>
            <Link href="/search"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              <Zap className="w-4 h-4" />
              Analyze a project
            </Link>
          </div>
        </div>
      )}

      {/* Grid view */}
      {filtered.length > 0 && view === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i}
              onDelete={handleDelete} deleting={deletingId === project.id} />
          ))}
        </div>
      )}

      {/* List view */}
      {filtered.length > 0 && view === "list" && (
        <div className="flex flex-col gap-3">
          {filtered.map((project, i) => (
            <ProjectListRow key={project.id} project={project}
              onDelete={handleDelete} deleting={deletingId === project.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gradient colors per project index ────────────────────────────────────────
const CARD_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-blue-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];

function ProjectCard({ project, index, onDelete, deleting }: {
  project: SavedProject; index: number;
  onDelete: (id: string) => void; deleting: boolean;
}) {
  const hw = project.analysis?.hardware?.length || 0;
  const sw = project.analysis?.software?.length || 0;
  const bm = project.bookmarked_components?.length || 0;
  const date = new Date(project.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const initials = project.project_title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
              {project.project_title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
          </div>
        </div>

        {/* Summary */}
        {project.analysis?.summary && (
          <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
            {project.analysis.summary}
          </p>
        )}

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-xs bg-cyan-950/60 text-cyan-400 border border-cyan-900 px-2.5 py-1 rounded-full">
            <Cpu className="w-3 h-3" />{hw} hardware
          </span>
          <span className="flex items-center gap-1 text-xs bg-purple-950/60 text-purple-400 border border-purple-900 px-2.5 py-1 rounded-full">
            <Code className="w-3 h-3" />{sw} software
          </span>
          {bm > 0 && (
            <span className="flex items-center gap-1 text-xs bg-amber-950/60 text-amber-400 border border-amber-900 px-2.5 py-1 rounded-full">
              <Bookmark className="w-3 h-3" />{bm}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/search?q=${encodeURIComponent(project.project_title)}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-cyan-700 py-2 rounded-xl transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Open
          </Link>
          <button onClick={() => onDelete(project.id)} disabled={deleting}
            className="flex items-center justify-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/50 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectListRow({ project, onDelete, deleting }: {
  project: SavedProject;
  onDelete: (id: string) => void; deleting: boolean;
}) {
  const hw = project.analysis?.hardware?.length || 0;
  const sw = project.analysis?.software?.length || 0;
  const bm = project.bookmarked_components?.length || 0;
  const date = new Date(project.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-cyan-800/50 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:bg-gray-900/80">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        {project.project_title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate group-hover:text-cyan-300 transition-colors">{project.project_title}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-500" />{hw}</span>
          <span className="flex items-center gap-1"><Code className="w-3 h-3 text-purple-500" />{sw}</span>
          {bm > 0 && <span className="flex items-center gap-1"><Bookmark className="w-3 h-3 text-amber-500" />{bm}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/search?q=${encodeURIComponent(project.project_title)}`}
          className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-2 rounded-xl transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </Link>
        <button onClick={() => onDelete(project.id)} disabled={deleting}
          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
