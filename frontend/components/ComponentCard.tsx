"use client";
import { Component } from "@/lib/api";
import { Cpu, Code, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";

interface Props {
  component: Component;
  bookmarked: boolean;
  onToggleBookmark: (name: string) => void;
  onCompare: (component: Component) => void;
}

export default function ComponentCard({ component, bookmarked, onToggleBookmark, onCompare }: Props) {
  const isHardware = component.category === "hardware";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-cyan-800 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${isHardware ? "bg-cyan-950 text-cyan-400" : "bg-purple-950 text-purple-400"}`}>
            {isHardware ? <Cpu className="w-4 h-4" /> : <Code className="w-4 h-4" />}
          </span>
          <div>
            <h3 className="text-white font-medium text-sm leading-tight">{component.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isHardware ? "bg-cyan-950 text-cyan-400" : "bg-purple-950 text-purple-400"}`}>
              {component.category}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggleBookmark(component.name)}
          className="text-gray-500 hover:text-yellow-400 transition-colors flex-shrink-0"
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {bookmarked ? <BookmarkCheck className="w-4 h-4 text-yellow-400" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed">{component.description}</p>

      {component.quantity > 1 && (
        <p className="text-xs text-gray-500">Qty: {component.quantity}</p>
      )}

      <button
        onClick={() => onCompare(component)}
        className="mt-auto flex items-center justify-center gap-1.5 text-xs bg-gray-800 hover:bg-cyan-900 text-gray-300 hover:text-cyan-300 border border-gray-700 hover:border-cyan-700 rounded-lg py-2 transition-all"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Compare prices
      </button>
    </div>
  );
}
