/**
 * Utility functions for global image optimization.
 * Optimizes image URLs (especially Unsplash and web images) by injecting:
 * - WebP format conversion (fm=webp / auto=format)
 * - Quality compression (q=75)
 * - Dynamic width scaling (w=...)
 */

export interface OptimizeImageOptions {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'auto';
  fit?: 'crop' | 'max' | 'scale';
}

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fm=webp&fit=crop&w=800&q=75';

/**
 * Returns an optimized WebP image URL with proper sizing and compression flags.
 */
export function getOptimizedImageUrl(
  url?: string,
  options: OptimizeImageOptions = {}
): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;

  const { width = 800, quality = 75, format = 'webp', fit = 'crop' } = options;

  try {
    // If it's an Unsplash URL, manipulate search parameters directly
    if (url.includes('images.unsplash.com')) {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('fm', format === 'auto' ? 'webp' : format);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('q', quality.toString());
      parsedUrl.searchParams.set('w', width.toString());
      parsedUrl.searchParams.set('fit', fit);
      return parsedUrl.toString();
    }

    // For other CDN or relative URLs, return as is or append params if supported
    return url;
  } catch {
    return url || DEFAULT_FALLBACK_IMAGE;
  }
}

/**
 * Generate responsive srcset string for Unsplash or supported image CDNs.
 */
export function generateSrcSet(url: string, widths: number[] = [320, 640, 800, 1024, 1200]): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return undefined;

  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}
