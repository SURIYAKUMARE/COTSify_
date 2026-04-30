"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProjects, deleteProjectLocal, SavedProject } from "@/lib/local-storage";
import { LayoutDashboard, Search, Trash2, Bookmark, Cpu, Code, Clock, ExternalLink, User } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Guest User";
  const displayEmail = user?.email || "Not signed in";
  const avatarLetter = displayName[0]?.toUpperCase() || "G";

  useEffect(() => {
    setProjects(getProjects());
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteProjectLocal(id);
    setProjects(getProjects());
    setDeletingId(null);
  };

  const totalHardware = projects.reduce((sum, p) => sum + (p.analysis?.hardware?.length || 0), 0);
  const totalSoftware = projects.reduce((sum, p) => sum + (p.analysis?.software?.length || 0), 0);
  const totalBookmarks = projects.reduce((sum, p) => sum + (p.bookmarked_components?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-cyan-400" />
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your saved projects and profile</p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Search className="w-4 h-4" />
          New search
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border border-cyan-800/50 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-gray-950 text-2xl font-bold flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={displayName} className="w-20 h-20 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
            ) : (
              <span className="text-2xl font-bold">{avatarLetter}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2">{displayName}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {displayEmail}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-bold text-cyan-400">{projects.length}</div>
                <div className="text-xs text-gray-500 mt-1">Projects</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-bold text-purple-400">{totalHardware + totalSoftware}</div>
                <div className="text-xs text-gray-500 mt-1">Components</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-bold text-yellow-400">{totalBookmarks}</div>
                <div className="text-xs text-gray-500 mt-1">Bookmarks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Saved Projects</h2>
      </div>

      {loading ? (
        <div className="text-gray-400 py-12 text-center">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-white mb-2">No saved projects yet</h2>
          <p className="text-gray-400 text-sm mb-6">Search for a project and save it to see it here.</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Start searching →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              deleting={deletingId === project.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  deleting,
}: {
  project: SavedProject;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const hw = project.analysis?.hardware?.length || 0;
  const sw = project.analysis?.software?.length || 0;
  const bookmarks = project.bookmarked_components?.length || 0;
  const date = new Date(project.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-2">{project.project_title}</h3>
          {project.analysis?.summary && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.analysis.summary}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1.5 bg-cyan-950/50 text-cyan-400 px-2.5 py-1 rounded-full">
              <Cpu className="w-3.5 h-3.5" />
              {hw} hardware
            </span>
            <span className="flex items-center gap-1.5 bg-purple-950/50 text-purple-400 px-2.5 py-1 rounded-full">
              <Code className="w-3.5 h-3.5" />
              {sw} software
            </span>
            {bookmarks > 0 && (
              <span className="flex items-center gap-1.5 bg-yellow-950/50 text-yellow-400 px-2.5 py-1 rounded-full">
                <Bookmark className="w-3.5 h-3.5" />
                {bookmarks} bookmarked
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {date}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/search?q=${encodeURIComponent(project.project_title)}`}
            className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg transition-colors border border-gray-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </Link>
          <button
            onClick={() => onDelete(project.id)}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs bg-red-950/50 hover:bg-red-950 text-red-400 px-4 py-2.5 rounded-lg transition-colors border border-red-900 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
