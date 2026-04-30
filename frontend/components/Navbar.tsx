"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Cpu, Search, LayoutDashboard, User, LogOut, BookOpen } from "lucide-react";

export default function Navbar() {
  const path = usePathname();
  const { user, signOut } = useAuth();

  const active = (href: string) =>
    path.startsWith(href)
      ? "text-cyan-400 bg-gray-800"
      : "text-gray-400 hover:text-white hover:bg-gray-800/50";

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            COTsify
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/search" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${active("/search")}`}>
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <Link href="/catalog" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${active("/catalog")}`}>
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>
          <Link href="/dashboard" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${active("/dashboard")}`}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link href="/profile" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${active("/profile")}`}>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="hidden sm:flex items-center gap-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-gray-950 text-xs font-bold">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </div>
                {user.full_name || user.email.split("@")[0]}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="ml-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-4 py-1.5 rounded-full transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
