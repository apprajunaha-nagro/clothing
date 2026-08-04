import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

/**
 * ProductGridSkeleton — renders N ProductCardSkeleton items in a responsive grid
 * matching the ProductListingPage and HomePage featured grid layout.
 */
export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  columns = 4,
}) => {
  const colClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${colClass} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
