import React from 'react';

/**
 * PageLoadingSkeleton — full-page skeleton used as the Suspense fallback
 * while a lazily-loaded route chunk is downloading.
 * Shows a header bar + hero placeholder + product grid skeleton.
 */
export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#FAF7F5] animate-pulse-subtle">
    {/* Hero banner placeholder */}
    <div className="w-full h-[340px] xs:h-[380px] sm:h-[420px] md:h-[480px] bg-stone-200 skeleton-shimmer" />

    {/* Content area */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Section heading */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-stone-200 skeleton-shimmer" />
        <div className="h-7 w-48 rounded bg-stone-200 skeleton-shimmer" />
      </div>

      {/* Product grid — 8 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="w-full aspect-[4/5] bg-stone-200 skeleton-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-3/4 rounded bg-stone-200 skeleton-shimmer" />
              <div className="h-3 w-full rounded bg-stone-200 skeleton-shimmer" />
              <div className="h-4 w-1/3 rounded bg-stone-200 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
