"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Cpu, Search, MapPin, BarChart3, Shield, Zap, ArrowRight, BookOpen, Bot, Loader2 } from "lucide-react";

const FEATURES = [
  { icon: <Cpu className="w-5 h-5" />, title: "AI Component Extraction", desc: "Paste any project title and get a full BOM — hardware and software — in seconds.", color: "from-cyan-500 to-blue-500" },
  { icon: <MapPin className="w-5 h-5" />, title: "Local Store Finder", desc: "Discover nearby electronics shops with ratings, distance, and live hours.", color: "from-blue-500 to-purple-500" },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Price Comparison", desc: "Compare prices across Amazon, Flipkart, Robu.in and more side-by-side.", color: "from-purple-500 to-pink-500" },
  { icon: <Shield className="w-5 h-5" />, title: "Project History", desc: "Save searches, bookmark components, and revisit past projects anytime.", color: "from-pink-500 to-cyan-500" },
];

const EXAMPLES = [
  "Smart Irrigation System using IoT",
  "Line Following Robot",
  "Home Automation with Raspberry Pi",
  "Gesture Controlled Robotic Arm",
  "Air Quality Monitoring Station",
];

const STATS = [
  { value: "500+", label: "Components" },
  { value: "3", label: "Platforms" },
  { value: "AI", label: "Powered" },
  { value: "Free", label: "Forever" },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Cpu className="w-7 h-7 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">COTsify</span>
        </div>
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  return (
    <div className="flex flex-col relative">

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.25),transparent)]" />
          {/* Secondary glow bottom-right */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_90%,rgba(59,130,246,0.15),transparent)]" />
          {/* Purple accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_60%,rgba(139,92,246,0.10),transparent)]" />

          {/* Animated glowing orbs */}
          <div className="hero-glow absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="hero-glow absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" style={{ animationDelay: "2s" }} />
          <div className="hero-glow absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: "4s" }} />

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />

          {/* Diagonal accent lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30%" x2="100%" y2="70%" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="0" y1="60%" x2="100%" y2="20%" stroke="url(#lineGrad)" strokeWidth="0.5" />
            <line x1="20%" y1="0" x2="80%" y2="100%" stroke="url(#lineGrad)" strokeWidth="0.5" />
          </svg>

          {/* Floating circuit nodes */}
          {[
            { top: "15%", left: "8%", size: 6, delay: "0s" },
            { top: "25%", left: "92%", size: 4, delay: "1s" },
            { top: "70%", left: "5%", size: 5, delay: "2s" },
            { top: "80%", left: "88%", size: 6, delay: "0.5s" },
            { top: "45%", left: "95%", size: 3, delay: "3s" },
            { top: "55%", left: "3%", size: 4, delay: "1.5s" },
          ].map((node, i) => (
            <div key={i} className="absolute rounded-full bg-cyan-400 hero-glow"
              style={{ top: node.top, left: node.left, width: node.size, height: node.size, animationDelay: node.delay, opacity: 0.4 }} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            AI-powered engineering component sourcing
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-white">Source every</span>
            <br />
            <span className="gradient-text">component</span>
            <br />
            <span className="text-white">for any project</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter a project title. COTsify identifies required hardware and software,
            finds local stores near you, and compares prices across platforms instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
              <Search className="w-4 h-4" />
              Start analyzing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-gray-900/80 hover:bg-gray-800 text-white px-8 py-4 rounded-full transition-all border border-gray-700 hover:border-cyan-700 backdrop-blur-sm">
              <BookOpen className="w-4 h-4" />
              Browse catalog
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 sm:gap-16">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
      </section>

      {/* ── Example queries ────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-5">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex) => (
              <Link key={ex} href={`/search?q=${encodeURIComponent(ex)}`}
                className="text-sm glass-card hover:border-cyan-600/50 text-gray-300 hover:text-cyan-300 px-4 py-2 rounded-full transition-all hover:scale-105">
                {ex}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(6,182,212,0.05),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to plan a project
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">From idea to sourced components in under 30 seconds.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 hover:border-cyan-600/40 transition-all hover:-translate-y-1 group">
                <div className={`p-2.5 bg-gradient-to-br ${f.color} rounded-xl w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{f.icon}</div>
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-14">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter project title", desc: "Type any project name like 'Smart Irrigation System' or 'Line Following Robot'", icon: "✏️" },
              { step: "02", title: "AI analyzes it", desc: "GPT-4 extracts every required hardware and software component automatically", icon: "🤖" },
              { step: "03", title: "Source & compare", desc: "Find nearby stores, compare prices across Amazon, Flipkart, Robu.in instantly", icon: "🛒" },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-cyan-500 tracking-widest mb-2">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Assistant promo ─────────────────────────────────────────────── */}
      <section className="px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Meet COTsify AI
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Ask anything about components, wiring, prices, or project planning.
                Your personal engineering assistant is always available.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {["What components for a drone?", "Arduino vs ESP32?", "Cheapest motor driver?"].map((q) => (
                  <span key={q} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full">{q}</span>
                ))}
              </div>
              <p className="text-cyan-400 text-sm">Click the chat button in the bottom-right corner →</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-24 text-center relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />
        <div className="relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to build something?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of students and developers who source components smarter with COTsify.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-10 py-4 rounded-full transition-all shadow-lg shadow-cyan-500/25 hover:scale-105">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 glass-card hover:border-cyan-600/50 text-white px-10 py-4 rounded-full transition-all">
              Try without account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="gradient-text">COTsify</span>
          </div>
          <p className="text-gray-600 text-sm">Smart component sourcing for engineers and makers</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/search" className="hover:text-cyan-400 transition-colors">Search</Link>
            <Link href="/catalog" className="hover:text-cyan-400 transition-colors">Catalog</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
