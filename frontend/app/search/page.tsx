"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeProject, compareBulk, AnalyzeResponse, Component, PriceComparison } from "@/lib/api";
import { saveProjectLocal } from "@/lib/local-storage";
import ComponentCard from "@/components/ComponentCard";
import PriceCompareModal from "@/components/PriceCompareModal";
import NearbyStoresPanel from "@/components/NearbyStoresPanel";
import { Search, Loader2, Cpu, Code, MapPin, BarChart3, Save, CheckCircle, AlertCircle, BookOpen } from "lucide-react";

type Tab = "hardware" | "software" | "stores" | "compare";

function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("hardware");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (query) handleSearch(query);
  }, []);

  const handleSearch = async (title: string) => {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setComparisons([]);
    setSaved(false);
    try {
      const data = await analyzeProject(title);
      setResult(data);
      setActiveTab("hardware");
      // Auto-fetch price comparisons for hardware
      setLoadingCompare(true);
      const bulk = await compareBulk(data.hardware.slice(0, 8));
      setComparisons(bulk);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
      setLoadingCompare(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    handleSearch(inputValue);
  };

  const toggleBookmark = (name: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      saveProjectLocal(result.project_title, result, Array.from(bookmarked));
      setSaved(true);
    } catch {
      setError("Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const allComponents = result ? [...result.hardware, ...result.software] : [];
  const storeComponent = allComponents[0];

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "hardware", label: "Hardware", icon: <Cpu className="w-4 h-4" />, count: result?.hardware.length },
    { id: "software", label: "Software", icon: <Code className="w-4 h-4" />, count: result?.software.length },
    { id: "stores", label: "Nearby Stores", icon: <MapPin className="w-4 h-4" /> },
    { id: "compare", label: "Price Compare", icon: <BarChart3 className="w-4 h-4" />, count: comparisons.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-center mb-6">What are you building?</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Smart Irrigation System using IoT"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analyze
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p>Analyzing project with AI...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{result.project_title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{result.summary}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" />{result.hardware.length} hardware</span>
                  <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5 text-purple-400" />{result.software.length} software</span>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors ${saved ? "bg-green-950 text-green-400 border border-green-800" : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"}`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved!" : "Save project"}
              </button>
              <a
                href={`/catalog?project=${encodeURIComponent(result.project_title)}`}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white border border-red-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View in Catalog
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-cyan-900 text-cyan-400" : "bg-gray-800 text-gray-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "hardware" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {result.hardware.map((c) => (
                <ComponentCard key={c.name} component={c} bookmarked={bookmarked.has(c.name)} onToggleBookmark={toggleBookmark} onCompare={setSelectedComponent} />
              ))}
            </div>
          )}

          {activeTab === "software" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {result.software.map((c) => (
                <ComponentCard key={c.name} component={c} bookmarked={bookmarked.has(c.name)} onToggleBookmark={toggleBookmark} onCompare={setSelectedComponent} />
              ))}
            </div>
          )}

          {activeTab === "stores" && storeComponent && (
            <div>
              <p className="text-gray-400 text-sm mb-4">Showing nearby electronics stores. Allow location access when prompted.</p>
              <NearbyStoresPanel componentName={storeComponent.name} />
            </div>
          )}

          {activeTab === "compare" && (
            <div>
              {loadingCompare ? (
                <div className="flex items-center gap-2 text-gray-400 py-8">
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching prices...
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {comparisons.map((comp) => (
                    <CompareRow key={comp.component_name} comparison={comp} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Price compare modal */}
      <PriceCompareModal component={selectedComponent} onClose={() => setSelectedComponent(null)} />
    </div>
  );
}

function CompareRow({ comparison }: { comparison: PriceComparison }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white font-semibold">{comparison.component_name}</h3>
        <div className="flex gap-2 flex-wrap">
          {comparison.lowest_price && (
            <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-2 py-1 rounded-full">
              Lowest: ₹{comparison.lowest_price.price} on {comparison.lowest_price.platform}
            </span>
          )}
          {comparison.best_rated && (
            <span className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-800 px-2 py-1 rounded-full">
              Best rated: {comparison.best_rated.rating}★ on {comparison.best_rated.platform}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
              <th className="text-left pb-2">Platform</th>
              <th className="text-left pb-2">Product</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Rating</th>
              <th className="text-right pb-2">Status</th>
              <th className="text-right pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {comparison.products.map((p, i) => (
              <tr key={i} className="border-b border-gray-800/50 last:border-0">
                <td className="py-2.5 pr-4 text-gray-300 font-medium whitespace-nowrap">{p.platform}</td>
                <td className="py-2.5 pr-4 text-gray-400 max-w-xs truncate">{p.name}</td>
                <td className="py-2.5 pr-4 text-right font-bold text-cyan-400 whitespace-nowrap">
                  {p.price ? `₹${p.price}` : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right text-yellow-400 whitespace-nowrap">
                  {p.rating ? `${p.rating}★` : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                  <span className={`text-xs ${p.availability === "in_stock" ? "text-green-400" : p.availability === "out_of_stock" ? "text-red-400" : "text-gray-500"}`}>
                    {p.availability === "in_stock" ? "In stock" : p.availability === "out_of_stock" ? "Out of stock" : "Unknown"}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap">
                    Buy →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
