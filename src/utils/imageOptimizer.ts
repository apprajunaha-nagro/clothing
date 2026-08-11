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
 * Ensures exact image resolution matching the user's selected variant or color
 * across Cart, Checkout, Order Placement, Order Confirmation, and Account History.
 */
export function getItemDisplayImage(
  product?: any,
  selectedColor?: string,
  variant?: any
): string {
  // 1. Check if variant has valid non-empty images array
  if (variant?.images && variant.images.length > 0 && variant.images[0]) {
    return variant.images[0];
  }

  // 2. Search product.colors for the matching color name selected by user
  const colorToMatch = selectedColor || variant?.color;
  if (colorToMatch && product?.colors && product.colors.length > 0) {
    const matchedColor = product.colors.find(
      (c: any) => c.name.toLowerCase() === colorToMatch.toLowerCase()
    );
    if (matchedColor?.images && matchedColor.images.length > 0 && matchedColor.images[0]) {
      return matchedColor.images[0];
    }
  }

  // 3. Fallback to product.colors[0] or product.variants[0]
  if (product?.colors?.[0]?.images?.[0]) {
    return product.colors[0].images[0];
  }
  if (product?.variants?.[0]?.images?.[0]) {
    return product.variants[0].images[0];
  }

  return DEFAULT_FALLBACK_IMAGE;
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
