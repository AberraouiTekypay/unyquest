"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { VENTURE_LIBRARY } from "@/engine/academy-config";

export function VentureLibraryModal() {
  const { showLibrary, closeLibrary, activeWhyKey } = useGame();
  const [selectedKey, setSelectedKey] = useState<string>(activeWhyKey || VENTURE_LIBRARY[0].key);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  if (!showLibrary) return null;

  const categories = ["ALL", ...Array.from(new Set(VENTURE_LIBRARY.map((c) => c.category)))];

  const filteredConcepts = VENTURE_LIBRARY.filter((c) => {
    const matchesCategory = activeCategory === "ALL" || c.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whyItMatters.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeConcept =
    VENTURE_LIBRARY.find((c) => c.key === selectedKey) ||
    filteredConcepts[0] ||
    VENTURE_LIBRARY[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-4xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              📚
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Venture Academy
              </span>
              <h2 id="library-modal-title" className="text-xl font-black text-zinc-100">
                Venture Knowledge Base
              </h2>
            </div>
          </div>
          <button
            onClick={closeLibrary}
            aria-label="Close library modal"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/30 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search concepts, runway, dilution, burn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  activeCategory === cat
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Concept Sidebar */}
          <div className="w-full md:w-72 border-r border-zinc-800/80 overflow-y-auto p-2 space-y-1">
            {filteredConcepts.length === 0 ? (
              <p className="text-xs text-zinc-500 p-4 text-center">No matching concepts found.</p>
            ) : (
              filteredConcepts.map((concept) => {
                const isSelected = concept.key === activeConcept.key;
                return (
                  <button
                    key={concept.key}
                    onClick={() => setSelectedKey(concept.key)}
                    className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-0.5 ${
                      isSelected
                        ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                        : "hover:bg-zinc-900 text-zinc-300 border border-transparent"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {concept.category}
                    </span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {concept.title}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Concept Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-zinc-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {activeConcept.category}
                </span>
                <h3 className="text-2xl font-black text-zinc-100">{activeConcept.title}</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                Key: {activeConcept.key}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-1.5">
                  Core Concept Definition
                </h4>
                <p className="text-zinc-200 leading-relaxed text-sm">
                  {activeConcept.definition}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1.5">
                  Why It Matters to Founders & Investors
                </h4>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {activeConcept.whyItMatters}
                </p>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1.5">
                  Real Venture Numerical Example
                </h4>
                <p className="text-amber-100/90 leading-relaxed text-xs font-mono">
                  {activeConcept.example}
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-400">In-Game Interface Mapping:</span>
                <span className="text-xs font-bold text-zinc-200">{activeConcept.inGameMetric}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>UNYQUEST Venture Academy • Build. Fund. Grow. Win.</span>
          <button
            onClick={closeLibrary}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition uppercase tracking-wider"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
}
