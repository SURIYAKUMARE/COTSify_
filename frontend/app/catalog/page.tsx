"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogProduct } from "@/lib/catalog-types";
import RouteGuard from "@/components/RouteGuard";
import { api } from "@/lib/api";
import {
  Search, SlidersHorizontal, Grid3X3, List, Star,
  ShoppingCart, GitCompare, Heart, X, ChevronDown,
  Cpu, Zap, Wrench, ExternalLink, BookOpen, TrendingDown,
  Package, Filter, ArrowUpDown,
} from "lucide-react";

const CAT_ICONS: Record<string, React.ReactNode> = {
  Electrical: <Zap className="w-4 h-4" />,
  Mechanical: <Wrench className="w-4 h-4" />,
  Tools: <Package className="w-4 h-4" />,
};

const CAT_COLORS: Record<string, string> = {
  Electrical: "bg-cyan-950 text-cyan-400 border-cyan-800",
  Mechanical: "bg-green-950 text-green-400 border-green-800",
  Tools: "bg-amber-950 text-amber-400 border-amber-800",
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const projectQuery = searchParams.get("project") || "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filtered, setFiltered] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(projectQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [compareList, setCompareList] = useState<CatalogProduct[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (projectQuery) fetchForProject(projectQuery);
    else fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/catalog/all");
      setProducts(data); setFiltered(data);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const fetchForProject = async (title: string) => {
    setLoading(true);
    try {
      const analyzeRes = await api.post("/api/analyze/", { project_title: title });
      const names = [
        ...analyzeRes.data.hardware.map((c: any) => c.name),
        ...analyzeRes.data.software.map((c: any) => c.name),
      ];
      const { data } = await api.post("/api/catalog/for-project", { component_names: names });
      setProducts(data); setFiltered(data);
    } catch { fetchAll(); }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) { fetchAll(); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/api/catalog/search?q=${encodeURIComponent(searchInput)}`);
      setProducts(data);
      applyFilters(data, selectedCategory, priceRange, sortBy);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const applyFilters = (src: CatalogProduct[], cat: string, price: [number, number], sort: string) => {
    let r = [...src];
    if (cat !== "All") r = r.filter(p => p.category === cat);
    r = r.filter(p => !p.price_inr || (p.price_inr >= price[0] && p.price_inr <= price[1]));
    if (sort === "price_asc") r.sort((a, b) => (a.price_inr || 0) - (b.price_inr || 0));
    else if (sort === "price_desc") r.sort((a, b) => (b.price_inr || 0) - (a.price_inr || 0));
    else if (sort === "rating") r.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFiltered(r);
  };

  useEffect(() => { applyFilters(products, selectedCategory, priceRange, sortBy); }, [selectedCategory, priceRange, sortBy]);

  const toggleCompare = (p: CatalogProduct) =>
    setCompareList(prev => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : prev.length < 3 ? [...prev, p] : prev);

  const toggleWishlist = (id: string) =>
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const categories = ["All", "Electrical", "Mechanical", "Tools"];
  const grouped = {
    Electrical: filtered.filter(p => p.category === "Electrical"),
    Mechanical: filtered.filter(p => p.category === "Mechanical"),
    Tools: filtered.filter(p => p.category === "Tools"),
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero search bar ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-transparent border-b border-gray-800 px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-2 justify-center mb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-white font-bold text-xl">Engineering Catalog</h1>
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">{filtered.length} products</span>
          </div>
          <p className="text-gray-400 text-sm text-center mb-6">Search components, part numbers, specifications</p>

          {/* Animated search bar */}
          <form onSubmit={handleSearch}>
            <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? "scale-[1.02]" : "scale-100"}`}>
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${searchFocused ? "shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/50" : "shadow-lg"}`} />
              <Search className={`absolute left-5 w-5 h-5 transition-colors duration-300 ${searchFocused ? "text-cyan-400" : "text-gray-500"}`} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="e.g. Arduino, ESP32, Soil Moisture Sensor..."
                className="relative w-full bg-gray-900 border border-gray-700 rounded-2xl pl-14 pr-36 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 transition-all text-sm"
              />
              <button type="submit"
                className="absolute right-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </form>

          {/* Quick category pills */}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${selectedCategory === cat ? "bg-cyan-500 text-gray-950 border-cyan-500 font-semibold" : "bg-gray-900 text-gray-400 border-gray-700 hover:border-cyan-700 hover:text-cyan-400"}`}>
                {cat !== "All" && CAT_ICONS[cat]}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className={`w-56 flex-shrink-0 flex-col gap-4 ${showFilters ? "flex" : "hidden lg:flex"}`}>
          {/* Price filter */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
              <Filter className="w-4 h-4 text-cyan-400" /> Filter by Price
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>₹0</span><span className="text-cyan-400 font-medium">₹{priceRange[1].toLocaleString()}</span>
            </div>
            <input type="range" min={0} max={10000} value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-cyan-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Min</span><span>₹10,000</span>
            </div>
          </div>

          {/* Sort */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" /> Sort By
            </div>
            {[["relevance","Relevance"],["price_asc","Price: Low → High"],["price_desc","Price: High → Low"],["rating","Best Rated"]].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 mb-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${sortBy === val ? "border-cyan-500 bg-cyan-500" : "border-gray-600 group-hover:border-cyan-600"}`}>
                  {sortBy === val && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input type="radio" name="sort" value={val} checked={sortBy === val} onChange={() => setSortBy(val)} className="hidden" />
                <span className={`text-xs transition-colors ${sortBy === val ? "text-cyan-400 font-medium" : "text-gray-400 group-hover:text-gray-300"}`}>{label}</span>
              </label>
            ))}
          </div>

          {/* Category */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
              <Cpu className="w-4 h-4 text-cyan-400" /> Category
            </div>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-xl mb-1.5 transition-all ${selectedCategory === cat ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}>
                {cat !== "All" ? CAT_ICONS[cat] : <Grid3X3 className="w-4 h-4" />}
                {cat === "All" ? "All Categories" : cat}
                <span className="ml-auto text-gray-600 text-xs">
                  {cat === "All" ? filtered.length : filtered.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-1.5 text-sm bg-gray-900 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl hover:border-cyan-700 transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <span className="text-gray-400 text-sm">
                <span className="text-white font-medium">{filtered.length}</span> products
                {selectedCategory !== "All" && <span className="text-cyan-400"> in {selectedCategory}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">View:</span>
              <button onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-gray-500 hover:text-gray-300 border border-gray-700"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-gray-500 hover:text-gray-300 border border-gray-700"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-24 text-gray-400">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-semibold mb-2">No components found</p>
              <p className="text-gray-400 text-sm">Try a different search term</p>
            </div>
          ) : selectedCategory === "All" ? (
            Object.entries(grouped).map(([cat, items]) => items.length > 0 && (
              <div key={cat} className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${CAT_COLORS[cat]}`}>
                    {CAT_ICONS[cat]}
                    {cat === "Electrical" ? "Electrical / Electronic" : cat === "Mechanical" ? "Mechanical Components" : "Tools & Consumables"}
                  </div>
                  <span className="text-gray-500 text-sm">{items.length} items</span>
                </div>
                <ProductGrid items={items} viewMode={viewMode} compareList={compareList} wishlist={wishlist} onCompare={toggleCompare} onWishlist={toggleWishlist} onView={setSelectedProduct} />
              </div>
            ))
          ) : (
            <ProductGrid items={filtered} viewMode={viewMode} compareList={compareList} wishlist={wishlist} onCompare={toggleCompare} onWishlist={toggleWishlist} onView={setSelectedProduct} />
          )}
        </div>
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800 px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            Compare ({compareList.length}/3):
          </div>
          {compareList.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs px-3 py-1.5 rounded-full">
              {p.name}
              <button onClick={() => toggleCompare(p)} className="text-cyan-500 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {compareList.length >= 2 && (
            <button className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all">
              Compare Now
            </button>
          )}
        </div>
      )}

      {/* Product modal */}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

function ProductGrid({ items, viewMode, compareList, wishlist, onCompare, onWishlist, onView }: {
  items: CatalogProduct[]; viewMode: "grid" | "list";
  compareList: CatalogProduct[]; wishlist: Set<string>;
  onCompare: (p: CatalogProduct) => void;
  onWishlist: (id: string) => void;
  onView: (p: CatalogProduct) => void;
}) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {items.map(p => <ProductListCard key={p.id} product={p} inCompare={!!compareList.find(x => x.id === p.id)} inWishlist={wishlist.has(p.id)} onCompare={() => onCompare(p)} onWishlist={() => onWishlist(p.id)} onView={() => onView(p)} />)}
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(p => <ProductGridCard key={p.id} product={p} inCompare={!!compareList.find(x => x.id === p.id)} inWishlist={wishlist.has(p.id)} onCompare={() => onCompare(p)} onWishlist={() => onWishlist(p.id)} onView={() => onView(p)} />)}
    </div>
  );
}

function ProductGridCard({ product, inCompare, inWishlist, onCompare, onWishlist, onView }: {
  product: CatalogProduct; inCompare: boolean; inWishlist: boolean;
  onCompare: () => void; onWishlist: () => void; onView: () => void;
}) {
  const catClass = CAT_COLORS[product.category] || "bg-gray-800 text-gray-400 border-gray-700";
  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-cyan-700 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-800 p-4 flex items-center justify-center h-44 cursor-pointer" onClick={onView}>
        <img src={product.image_url} alt={product.name} className="max-h-36 max-w-full object-contain"
          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/160x160/1f2937/06b6d4?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
        <button onClick={e => { e.stopPropagation(); onWishlist(); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${inWishlist ? "bg-pink-500 text-white" : "bg-gray-700/80 text-gray-400 hover:bg-pink-500/20 hover:text-pink-400"}`}>
          <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
        </button>
        <div className={`absolute top-3 left-3 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${catClass}`}>
          {CAT_ICONS[product.category]}
          {product.subcategory}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-500 text-xs mb-1">Part: {product.part_number}</p>
        <h3 className="text-white font-semibold text-sm mb-2 leading-snug cursor-pointer hover:text-cyan-400 transition-colors line-clamp-2" onClick={onView}>
          {product.name}
        </h3>
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
              ))}
            </div>
            <span className="text-gray-500 text-xs">({product.reviews?.toLocaleString()})</span>
          </div>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-cyan-400">{product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "POA"}</span>
            {product.price_usd && <span className="text-gray-500 text-xs">${product.price_usd}</span>}
          </div>
          <div className={`text-xs mb-3 font-medium ${product.availability === "in_stock" ? "text-green-400" : "text-red-400"}`}>
            {product.availability === "in_stock" ? `● In Stock (${product.stock_qty || "Available"})` : "● Out of Stock"}
          </div>
          <a href={Object.values(product.buy_urls)[0]} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all mb-2">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </a>
          <button onClick={onCompare}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs border transition-all ${inCompare ? "bg-cyan-950 text-cyan-400 border-cyan-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:border-cyan-700 hover:text-cyan-400"}`}>
            <GitCompare className="w-3.5 h-3.5" />
            {inCompare ? "Remove" : "+ Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductListCard({ product, inCompare, inWishlist, onCompare, onWishlist, onView }: {
  product: CatalogProduct; inCompare: boolean; inWishlist: boolean;
  onCompare: () => void; onWishlist: () => void; onView: () => void;
}) {
  const catClass = CAT_COLORS[product.category] || "bg-gray-800 text-gray-400 border-gray-700";
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-cyan-700 rounded-2xl p-4 flex gap-4 transition-all">
      <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={onView}>
        <img src={product.image_url} alt={product.name} className="max-h-20 max-w-20 object-contain"
          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1f2937/06b6d4?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${catClass}`}>
            {CAT_ICONS[product.category]}{product.subcategory}
          </span>
          <span className="text-gray-500 text-xs">Part: {product.part_number}</span>
        </div>
        <h3 className="text-white font-semibold text-sm mb-1 cursor-pointer hover:text-cyan-400 transition-colors" onClick={onView}>{product.name}</h3>
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(product.specifications).slice(0, 3).map(([k, v]) => (
            <span key={k} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full"><b>{k}:</b> {v}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-xl font-bold text-cyan-400">{product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "POA"}</div>
        <div className={`text-xs font-medium ${product.availability === "in_stock" ? "text-green-400" : "text-red-400"}`}>
          {product.availability === "in_stock" ? "In Stock" : "Out of Stock"}
        </div>
        <a href={Object.values(product.buy_urls)[0]} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all">
          <ShoppingCart className="w-3.5 h-3.5" /> Buy
        </a>
        <button onClick={onCompare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${inCompare ? "bg-cyan-950 text-cyan-400 border-cyan-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:border-cyan-700"}`}>
          <GitCompare className="w-3 h-3" />{inCompare ? "Remove" : "Compare"}
        </button>
        <button onClick={onWishlist}
          className={`p-1.5 rounded-lg transition-colors ${inWishlist ? "text-pink-400" : "text-gray-600 hover:text-pink-400"}`}>
          <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-cyan-950/50 to-blue-950/50">
          <div>
            <h2 className="text-white font-bold text-lg">{product.name}</h2>
            <p className="text-gray-400 text-xs">Part No: {product.part_number} · {product.manufacturer}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-900 rounded-2xl p-6 flex items-center justify-center mb-4 h-52">
                <img src={product.image_url} alt={product.name} className="max-h-44 max-w-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/200x200/111827/06b6d4?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-cyan-400">{product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "POA"}</span>
                {product.price_usd && <span className="text-gray-500 text-sm">${product.price_usd} USD</span>}
              </div>
              <div className={`text-sm font-medium mb-4 ${product.availability === "in_stock" ? "text-green-400" : "text-red-400"}`}>
                {product.availability === "in_stock" ? `● In Stock — ${product.stock_qty || "Available"} units` : "● Out of Stock"}
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(product.buy_urls).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${platform === "Amazon" ? "bg-amber-500 hover:bg-amber-400 text-gray-950" : platform === "Flipkart" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"}`}>
                    <ExternalLink className="w-4 h-4" /> Buy on {platform}
                  </a>
                ))}
                {product.datasheet_url && (
                  <a href={product.datasheet_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all">
                    <BookOpen className="w-4 h-4" /> Download Datasheet
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{product.description}</p>
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Specifications
              </h4>
              <div className="bg-gray-900 rounded-xl overflow-hidden mb-5">
                {Object.entries(product.specifications).map(([k, v], i) => (
                  <div key={k} className={`flex text-xs px-4 py-2.5 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}`}>
                    <span className="text-gray-400 font-medium w-2/5">{k}</span>
                    <span className="text-white w-3/5">{v}</span>
                  </div>
                ))}
              </div>
              {product.alternatives.length > 0 && (
                <>
                  <h4 className="text-white font-semibold text-sm mb-3">Alternatives</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.alternatives.map(alt => (
                      <span key={alt} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full">{alt}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <RouteGuard>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <CatalogContent />
      </Suspense>
    </RouteGuard>
  );
}
