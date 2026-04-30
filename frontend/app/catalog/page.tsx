"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogProduct } from "@/lib/catalog-types";
import CatalogProductCard from "@/components/CatalogProductCard";
import CatalogFilters from "@/components/CatalogFilters";
import { api } from "@/lib/api";

function CatalogContent() {
  const searchParams = useSearchParams();
  const projectQuery = searchParams.get("project") || "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filtered, setFiltered] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(projectQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [compareList, setCompareList] = useState<CatalogProduct[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    if (projectQuery) fetchForProject(projectQuery);
    else fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/catalog/all");
      setProducts(data);
      setFiltered(data);
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
      setProducts(data);
      setFiltered(data);
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

  const applyFilters = (
    source: CatalogProduct[],
    cat: string,
    price: [number, number],
    sort: string
  ) => {
    let result = [...source];
    if (cat !== "All") result = result.filter(p => p.category === cat);
    result = result.filter(p => !p.price_inr || (p.price_inr >= price[0] && p.price_inr <= price[1]));
    if (sort === "price_asc") result.sort((a, b) => (a.price_inr || 0) - (b.price_inr || 0));
    else if (sort === "price_desc") result.sort((a, b) => (b.price_inr || 0) - (a.price_inr || 0));
    else if (sort === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFiltered(result);
  };

  useEffect(() => { applyFilters(products, selectedCategory, priceRange, sortBy); }, [selectedCategory, priceRange, sortBy]);

  const toggleCompare = (p: CatalogProduct) => {
    setCompareList(prev => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : prev.length < 3 ? [...prev, p] : prev);
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const categories = ["All", "Electrical", "Mechanical", "Tools"];
  const grouped = {
    Electrical: filtered.filter(p => p.category === "Electrical"),
    Mechanical: filtered.filter(p => p.category === "Mechanical"),
    Tools: filtered.filter(p => p.category === "Tools"),
  };

  return (
    <div style={{ fontFamily: "Times New Roman, serif", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#cc0000", color: "white", padding: "0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: 2 }}>COTsify</div>
            <div style={{ fontSize: 12, opacity: 0.85, borderLeft: "1px solid rgba(255,255,255,0.4)", paddingLeft: 16 }}>Engineering Component Catalog</div>
          </div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 0, flex: 1, maxWidth: 600 }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search components, part numbers, specifications..."
              style={{ flex: 1, padding: "10px 16px", border: "none", fontSize: 14, fontFamily: "Times New Roman, serif", outline: "none" }}
            />
            <button type="submit" style={{ background: "#333", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "Times New Roman, serif", fontWeight: "bold" }}>
              SEARCH
            </button>
          </form>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {filtered.length} products found
          </div>
        </div>
      </div>

      {/* Sub-header nav */}
      <div style={{ background: "#222", color: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: "10px 20px", background: selectedCategory === cat ? "#cc0000" : "transparent", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "Times New Roman, serif", borderRight: "1px solid #444" }}>
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "0 8px" }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>View:</span>
            <button onClick={() => setViewMode("grid")} style={{ background: viewMode === "grid" ? "#cc0000" : "transparent", color: "white", border: "1px solid #555", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Grid</button>
            <button onClick={() => setViewMode("list")} style={{ background: viewMode === "list" ? "#cc0000" : "transparent", color: "white", border: "1px solid #555", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>List</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", display: "flex", gap: 24 }}>
        {/* Sidebar filters */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "white", border: "1px solid #ddd", padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: "bold", fontSize: 14, borderBottom: "2px solid #cc0000", paddingBottom: 8, marginBottom: 12 }}>FILTER BY PRICE</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Max: ₹{priceRange[1].toLocaleString()}</div>
            <input type="range" min={0} max={10000} value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              style={{ width: "100%", accentColor: "#cc0000" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666" }}>
              <span>₹0</span><span>₹10,000</span>
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #ddd", padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: "bold", fontSize: 14, borderBottom: "2px solid #cc0000", paddingBottom: 8, marginBottom: 12 }}>SORT BY</div>
            {[["relevance","Relevance"],["price_asc","Price: Low to High"],["price_desc","Price: High to Low"],["rating","Best Rated"]].map(([val, label]) => (
              <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="radio" name="sort" value={val} checked={sortBy === val} onChange={() => setSortBy(val)} style={{ accentColor: "#cc0000" }} />
                {label}
              </label>
            ))}
          </div>

          <div style={{ background: "white", border: "1px solid #ddd", padding: 16 }}>
            <div style={{ fontWeight: "bold", fontSize: 14, borderBottom: "2px solid #cc0000", paddingBottom: 8, marginBottom: 12 }}>AVAILABILITY</div>
            {["In Stock", "All Items"].map(opt => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="radio" name="avail" defaultChecked={opt === "In Stock"} style={{ accentColor: "#cc0000" }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 80, fontSize: 16, color: "#666" }}>
              Loading catalog...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80, background: "white", border: "1px solid #ddd" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>No components found</div>
              <div style={{ color: "#666" }}>Try a different search term or browse all categories</div>
            </div>
          ) : selectedCategory === "All" ? (
            // Grouped by category
            Object.entries(grouped).map(([cat, items]) => items.length > 0 && (
              <div key={cat} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#cc0000", color: "white", padding: "6px 16px", fontSize: 14, fontWeight: "bold", letterSpacing: 1 }}>
                    {cat === "Electrical" ? "ELECTRICAL / ELECTRONIC COMPONENTS" : cat === "Mechanical" ? "MECHANICAL COMPONENTS" : "TOOLS & CONSUMABLES"}
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>{items.length} items</div>
                </div>
                <div style={{ display: viewMode === "grid" ? "grid" : "flex", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", flexDirection: "column", gap: 16 }}>
                  {items.map(p => (
                    <ProductCard key={p.id} product={p} viewMode={viewMode}
                      inCompare={!!compareList.find(x => x.id === p.id)}
                      inWishlist={wishlist.has(p.id)}
                      onCompare={() => toggleCompare(p)}
                      onWishlist={() => toggleWishlist(p.id)}
                      onView={() => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: viewMode === "grid" ? "grid" : "flex", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", flexDirection: "column", gap: 16 }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} viewMode={viewMode}
                  inCompare={!!compareList.find(x => x.id === p.id)}
                  inWishlist={wishlist.has(p.id)}
                  onCompare={() => toggleCompare(p)}
                  onWishlist={() => toggleWishlist(p.id)}
                  onView={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#222", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, zIndex: 100 }}>
          <span style={{ fontWeight: "bold", fontSize: 14 }}>COMPARE ({compareList.length}/3):</span>
          {compareList.map(p => (
            <span key={p.id} style={{ background: "#cc0000", padding: "4px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              {p.name}
              <button onClick={() => toggleCompare(p)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>x</button>
            </span>
          ))}
          {compareList.length >= 2 && (
            <button style={{ marginLeft: "auto", background: "#cc0000", color: "white", border: "none", padding: "8px 20px", cursor: "pointer", fontFamily: "Times New Roman, serif", fontWeight: "bold" }}>
              COMPARE NOW
            </button>
          )}
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

function ProductCard({ product, viewMode, inCompare, inWishlist, onCompare, onWishlist, onView }: {
  product: CatalogProduct; viewMode: "grid" | "list";
  inCompare: boolean; inWishlist: boolean;
  onCompare: () => void; onWishlist: () => void; onView: () => void;
}) {
  const catColor = product.category === "Electrical" ? "#0066cc" : product.category === "Mechanical" ? "#006633" : "#cc6600";

  if (viewMode === "list") {
    return (
      <div style={{ background: "white", border: "1px solid #ddd", padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <img src={product.image_url} alt={product.name} style={{ width: 100, height: 100, objectFit: "contain", border: "1px solid #eee", flexShrink: 0 }}
          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ background: catColor, color: "white", fontSize: 10, padding: "2px 8px", fontWeight: "bold" }}>{product.category.toUpperCase()}</span>
            <span style={{ fontSize: 11, color: "#666" }}>Part No: {product.part_number}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4, cursor: "pointer", color: "#cc0000" }} onClick={onView}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#444", marginBottom: 8, lineHeight: 1.5 }}>{product.description}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {Object.entries(product.specifications).slice(0, 4).map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, background: "#f0f0f0", padding: "2px 8px", border: "1px solid #ddd" }}><b>{k}:</b> {v}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#cc0000" }}>{product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "POA"}</div>
          {product.price_usd && <div style={{ fontSize: 12, color: "#666" }}>${product.price_usd}</div>}
          <div style={{ fontSize: 11, color: product.availability === "in_stock" ? "#006600" : "#cc0000", marginBottom: 8 }}>
            {product.availability === "in_stock" ? `In Stock (${product.stock_qty || "Available"})` : "Out of Stock"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <a href={Object.values(product.buy_urls)[0]} target="_blank" rel="noopener noreferrer"
              style={{ background: "#cc0000", color: "white", padding: "8px 16px", textDecoration: "none", fontSize: 13, fontWeight: "bold", textAlign: "center", display: "block" }}>
              BUY NOW
            </a>
            <button onClick={onCompare} style={{ background: inCompare ? "#333" : "white", color: inCompare ? "white" : "#333", border: "1px solid #333", padding: "6px 12px", cursor: "pointer", fontSize: 12, fontFamily: "Times New Roman, serif" }}>
              {inCompare ? "REMOVE" : "+ COMPARE"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", border: "1px solid #ddd", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ position: "absolute", top: 8, left: 8, background: catColor, color: "white", fontSize: 10, padding: "2px 8px", fontWeight: "bold", zIndex: 1 }}>
        {product.subcategory.toUpperCase()}
      </div>
      <button onClick={onWishlist} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 18, zIndex: 1 }}>
        {inWishlist ? "♥" : "♡"}
      </button>
      <div style={{ padding: 16, display: "flex", justifyContent: "center", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={onView}>
        <img src={product.image_url} alt={product.name} style={{ width: 160, height: 160, objectFit: "contain" }}
          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/160x160?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
      </div>
      <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Part No: {product.part_number}</div>
        <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6, cursor: "pointer", color: "#cc0000", lineHeight: 1.3 }} onClick={onView}>{product.name}</div>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 8, lineHeight: 1.4, flex: 1 }}>{product.description.slice(0, 80)}...</div>
        {product.rating && (
          <div style={{ fontSize: 12, color: "#f90", marginBottom: 8 }}>
            {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            <span style={{ color: "#666", marginLeft: 4 }}>({product.reviews?.toLocaleString()})</span>
          </div>
        )}
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#cc0000", marginBottom: 4 }}>
          {product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "Price on Application"}
        </div>
        <div style={{ fontSize: 11, color: product.availability === "in_stock" ? "#006600" : "#cc0000", marginBottom: 12 }}>
          {product.availability === "in_stock" ? "In Stock" : "Out of Stock"}
        </div>
        <a href={Object.values(product.buy_urls)[0]} target="_blank" rel="noopener noreferrer"
          style={{ background: "#cc0000", color: "white", padding: "8px", textDecoration: "none", fontSize: 13, fontWeight: "bold", textAlign: "center", display: "block", marginBottom: 6 }}>
          ADD TO CART
        </a>
        <button onClick={onCompare}
          style={{ background: inCompare ? "#333" : "white", color: inCompare ? "white" : "#333", border: "1px solid #ccc", padding: "6px", cursor: "pointer", fontSize: 12, fontFamily: "Times New Roman, serif", width: "100%" }}>
          {inCompare ? "REMOVE FROM COMPARE" : "+ ADD TO COMPARE"}
        </button>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", maxWidth: 900, width: "100%", maxHeight: "90vh", overflow: "auto", fontFamily: "Times New Roman, serif" }}>
        <div style={{ background: "#cc0000", color: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", fontSize: 16 }}>PRODUCT DETAILS</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>x</button>
        </div>
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          <div>
            <img src={product.image_url} alt={product.name} style={{ width: "100%", border: "1px solid #eee" }}
              onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/280x280?text=${encodeURIComponent(product.name.split(" ")[0])}`; }} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(product.buy_urls).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ background: platform === "Amazon" ? "#ff9900" : platform === "Flipkart" ? "#2874f0" : "#cc0000", color: "white", padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: "bold", textAlign: "center", display: "block" }}>
                  BUY ON {platform.toUpperCase()}
                </a>
              ))}
              {product.datasheet_url && (
                <a href={product.datasheet_url} target="_blank" rel="noopener noreferrer"
                  style={{ background: "#333", color: "white", padding: "8px", textDecoration: "none", fontSize: 12, textAlign: "center", display: "block" }}>
                  DOWNLOAD DATASHEET
                </a>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Part Number: <b>{product.part_number}</b> | Manufacturer: <b>{product.manufacturer}</b></div>
            <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#222" }}>{product.name}</h2>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#cc0000", marginBottom: 4 }}>
              {product.price_inr ? `₹${product.price_inr.toLocaleString()}` : "Price on Application"}
              {product.price_usd && <span style={{ fontSize: 14, color: "#666", marginLeft: 8 }}>(${product.price_usd} USD)</span>}
            </div>
            <div style={{ fontSize: 13, color: product.availability === "in_stock" ? "#006600" : "#cc0000", marginBottom: 16, fontWeight: "bold" }}>
              {product.availability === "in_stock" ? `In Stock - ${product.stock_qty || "Available"} units` : "Out of Stock"}
            </div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 16 }}>{product.description}</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 10, color: "#cc0000", borderBottom: "2px solid #cc0000", paddingBottom: 4 }}>TECHNICAL SPECIFICATIONS</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "6px 12px", background: "#f5f5f5", fontWeight: "bold", width: "40%" }}>{k}</td>
                      <td style={{ padding: "6px 12px" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.alternatives.length > 0 && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 10, color: "#cc0000", borderBottom: "2px solid #cc0000", paddingBottom: 4 }}>ALTERNATIVE COMPONENTS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {product.alternatives.map(alt => (
                    <span key={alt} style={{ background: "#f0f0f0", border: "1px solid #ddd", padding: "4px 12px", fontSize: 12 }}>{alt}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "Times New Roman, serif", textAlign: "center", padding: 80 }}>Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}

