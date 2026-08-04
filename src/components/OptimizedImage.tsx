import React, { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  quality = 75,
  priority = false,
  className = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  sizes,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(hasError ? fallbackSrc : src, { width, quality });
  const srcSet = !hasError ? generateSrcSet(src) : undefined;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Loading Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200/70 animate-pulse z-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-[#C0654B] rounded-full animate-spin opacity-50" />
        </div>
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
};
