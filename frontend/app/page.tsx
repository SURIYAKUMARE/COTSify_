"use client";
import Link from "next/link";
import { Cpu, Search, MapPin, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: <Cpu className="w-5 h-5" />, title: "AI Component Extraction", desc: "Paste any project title and get a full BOM — hardware and software — in seconds." },
  { icon: <MapPin className="w-5 h-5" />, title: "Local Store Finder", desc: "Discover nearby electronics shops with ratings, distance, and live hours." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Price Comparison", desc: "Compare prices across Amazon, Flipkart, Robu.in and more side-by-side." },
  { icon: <Shield className="w-5 h-5" />, title: "Project History", desc: "Save searches, bookmark components, and revisit past projects anytime." },
];

const EXAMPLES = [
  "Smart Irrigation System using IoT",
  "Line Following Robot",
  "Home Automation with Raspberry Pi",
  "Gesture Controlled Robotic Arm",
  "Air Quality Monitoring Station",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-powered component sourcing
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Source every component for{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              any project
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Enter a project title. COTsify identifies required hardware and software, finds local stores near you, and compares prices across platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <Search className="w-4 h-4" />
              Try it now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full transition-colors border border-gray-700"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Example queries */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-4">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex) => (
              <Link
                key={ex}
                href={`/search?q=${encodeURIComponent(ex)}`}
                className="text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-800 text-gray-300 hover:text-cyan-300 px-3 py-1.5 rounded-full transition-all"
              >
                {ex}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 border-t border-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Everything you need to plan a project</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl w-fit mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center border-t border-gray-900">
        <h2 className="text-3xl font-bold mb-4">Ready to build something?</h2>
        <p className="text-gray-400 mb-8">Sign up free and start sourcing components in minutes.</p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Get started for free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
