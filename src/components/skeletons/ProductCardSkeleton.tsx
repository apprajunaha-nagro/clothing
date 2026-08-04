import React from 'react';

/**
 * ProductCardSkeleton — bone-shimmer placeholder matching
 * the exact dimensions and layout of ProductCard.
 */
export const ProductCardSkeleton: React.FC = () => (
  <div className="group relative bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
    {/* Image area — matches aspect-4/5 */}
    <div className="relative w-full aspect-[4/5] bg-stone-200 skeleton-shimmer" />

    {/* Details block */}
    <div className="p-4 flex flex-col flex-1 gap-3">
      {/* Brand + rating row */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-stone-200 skeleton-shimmer" />
        <div className="h-3 w-10 rounded bg-stone-200 skeleton-shimmer" />
      </div>
      {/* Product title — 2 lines */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-stone-200 skeleton-shimmer" />
        <div className="h-3.5 w-3/4 rounded bg-stone-200 skeleton-shimmer" />
      </div>
      {/* Color swatches */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-4 h-4 rounded-full bg-stone-200 skeleton-shimmer" />
        ))}
      </div>
      {/* Size pills */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-5 w-7 rounded bg-stone-200 skeleton-shimmer" />
        ))}
      </div>
      {/* Price + button */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
        <div className="space-y-1">
          <div className="h-4 w-16 rounded bg-stone-200 skeleton-shimmer" />
          <div className="h-2.5 w-12 rounded bg-stone-100 skeleton-shimmer" />
        </div>
        <div className="h-9 w-16 rounded-lg bg-stone-200 skeleton-shimmer" />
      </div>
    </div>
  </div>
);
