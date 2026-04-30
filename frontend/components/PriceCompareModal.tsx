"use client";
import { useEffect, useState } from "react";
import { Component, PriceComparison, comparePrices, OnlineProduct } from "@/lib/api";
import { X, TrendingDown, Star, ExternalLink, Loader2, ShoppingCart } from "lucide-react";

interface Props {
  component: Component | null;
  onClose: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  Amazon: "bg-orange-950 text-orange-400 border-orange-800",
  Flipkart: "bg-blue-950 text-blue-400 border-blue-800",
  "Robu.in": "bg-green-950 text-green-400 border-green-800",
};

export default function PriceCompareModal({ component, onClose }: Props) {
  const [data, setData] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!component) return;
    setData(null);
    setError("");
    setLoading(true);
    comparePrices(component.name, component.search_query)
      .then(setData)
      .catch(() => setError("Failed to fetch prices. Please try again."))
      .finally(() => setLoading(false));
  }, [component]);

  if (!component) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-white font-semibold text-lg">{component.name}</h2>
            <p className="text-gray-400 text-sm">Price comparison across platforms</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Fetching prices...
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center py-8">{error}</div>
          )}

          {data && (
            <div className="flex flex-col gap-4">
              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3">
                {data.lowest_price && (
                  <div className="bg-green-950/50 border border-green-800 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium mb-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Lowest Price
                    </div>
                    <p className="text-white font-bold text-lg">₹{data.lowest_price.price}</p>
                    <p className="text-gray-400 text-xs">{data.lowest_price.platform}</p>
                  </div>
                )}
                {data.best_rated && (
                  <div className="bg-yellow-950/50 border border-yellow-800 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium mb-1">
                      <Star className="w-3.5 h-3.5" /> Best Rated
                    </div>
                    <p className="text-white font-bold text-lg">{data.best_rated.rating}★</p>
                    <p className="text-gray-400 text-xs">{data.best_rated.platform}</p>
                  </div>
                )}
              </div>

              {/* Product list */}
              <div className="flex flex-col gap-3">
                {data.products.map((product, i) => (
                  <ProductRow key={i} product={product} isLowest={product === data.lowest_price} isBestRated={product === data.best_rated} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, isLowest, isBestRated }: { product: OnlineProduct; isLowest: boolean; isBestRated: boolean }) {
  const colorClass = PLATFORM_COLORS[product.platform] || "bg-gray-800 text-gray-300 border-gray-700";

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 ${isLowest ? "border-green-700" : isBestRated ? "border-yellow-700" : "border-gray-800"}`}>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-14 h-14 rounded-lg object-cover bg-gray-800 flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>{product.platform}</span>
          {isLowest && <span className="text-xs px-2 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800">Lowest</span>}
          {isBestRated && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-950 text-yellow-400 border border-yellow-800">Best rated</span>}
        </div>
        <p className="text-white text-sm font-medium truncate">{product.name}</p>
        <div className="flex items-center gap-3 mt-1">
          {product.price ? (
            <span className="text-cyan-400 font-bold">₹{product.price}</span>
          ) : (
            <span className="text-gray-500 text-sm">Price unavailable</span>
          )}
          {product.rating && (
            <span className="text-yellow-400 text-xs flex items-center gap-0.5">
              <Star className="w-3 h-3" /> {product.rating}
              {product.reviews_count && <span className="text-gray-500 ml-1">({product.reviews_count.toLocaleString()})</span>}
            </span>
          )}
          <span className={`text-xs ${product.availability === "in_stock" ? "text-green-400" : product.availability === "out_of_stock" ? "text-red-400" : "text-gray-500"}`}>
            {product.availability === "in_stock" ? "In stock" : product.availability === "out_of_stock" ? "Out of stock" : "Check availability"}
          </span>
        </div>
      </div>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs bg-cyan-900 hover:bg-cyan-800 text-cyan-300 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Buy
      </a>
    </div>
  );
}
