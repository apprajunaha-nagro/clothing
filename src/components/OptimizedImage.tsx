import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  /** If true: eager load + fetchpriority="high" (use for LCP / above-the-fold images) */
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  sizes?: string;
}

/**
 * OptimizedImage — blur-up progressive image loader.
 *
 * 1. Shows a skeleton shimmer while the full image loads.
 * 2. Loads a tiny 20px blur placeholder immediately (if Unsplash URL).
 * 3. Crossfades from blur-placeholder → full image on load.
 * 4. Falls back gracefully on error.
 * 5. Supports fetchpriority="high" for LCP images via `priority` prop.
 */
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
  const imgRef = useRef<HTMLImageElement>(null);

  // Derive URLs
  const activeSrc = hasError ? fallbackSrc : src;
  const optimizedSrc = getOptimizedImageUrl(activeSrc, { width, quality });
  const srcSet = !hasError ? generateSrcSet(src) : undefined;

  // Blur-up placeholder: ultra-tiny 20px version of the same image
  const blurSrc =
    activeSrc.includes('images.unsplash.com')
      ? getOptimizedImageUrl(activeSrc, { width: 20, quality: 10 })
      : undefined;

  // Check if browser already decoded from cache (prevents flash on back-nav)
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) setHasError(true);
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton shimmer — visible until full image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-0" aria-hidden="true" />
      )}

      {/* Blur-up placeholder (only for Unsplash CDN URLs) */}
      {blurSrc && !isLoaded && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center scale-110"
          style={{ filter: 'blur(12px)' }}
        />
      )}

      {/* Full-resolution image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // fetchpriority improves LCP for above-the-fold images
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        onLoad={handleLoad}
        onError={handleError}
        className={`relative z-10 transition-opacity duration-400 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ transitionDuration: '350ms' }}
        {...props}
      />
    </div>
  );
};
