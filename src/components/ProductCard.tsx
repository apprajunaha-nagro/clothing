import React, { useState, useCallback } from 'react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Eye, ShoppingCart, Star, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useReducedMotion } from '../utils/useReducedMotion';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
  hideBadges?: boolean;
  hideColorAndSize?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, onNavigate, onToggleCompare, isCompared = false, hideBadges = false, hideColorAndSize = false }) => {
    const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useStore();
    const reducedMotion = useReducedMotion();

    const safeColors = React.useMemo(() => {
      if (!product || !product.colors) return [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'] }];
      if (Array.isArray(product.colors)) return product.colors;
      if (typeof product.colors === 'string') {
        try {
          const parsed = JSON.parse(product.colors);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'] }];
    }, [product]);

    const safeVariants = React.useMemo(() => {
      if (!product || !product.variants) return [];
      if (Array.isArray(product.variants)) return product.variants;
      if (typeof product.variants === 'string') {
        try {
          const parsed = JSON.parse(product.variants);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    }, [product]);

    const safeAvailableSizes = React.useMemo(() => {
      if (!product || !product.availableSizes) return ['Free Size'];
      if (Array.isArray(product.availableSizes)) return product.availableSizes;
      if (typeof product.availableSizes === 'string') {
        try {
          const parsed = JSON.parse(product.availableSizes);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return ['Free Size'];
    }, [product]);

    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>(safeAvailableSizes[0] || 'M');
    const [addedToCart, setAddedToCart] = useState(false);
    const [wishlistPulse, setWishlistPulse] = useState(false);

    const currentColor = safeColors[selectedColorIndex] || safeColors[0];
    const primaryImage =
      (currentColor?.images && Array.isArray(currentColor.images) ? currentColor.images[0] : null) ||
      (safeColors[0]?.images && Array.isArray(safeColors[0].images) ? safeColors[0].images[0] : null) ||
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';

    const isWishlisted = wishlist.includes(product.id);

    // Find matching variant
    const currentVariant: ProductVariant =
      safeVariants.find(
        v =>
          v.color?.toLowerCase() === currentColor?.name?.toLowerCase() &&
          v.size === selectedSize
      ) ||
      safeVariants[0] || {
        id: `${product.id}-default`,
        productId: product.id,
        size: selectedSize,
        color: currentColor?.name || 'Default',
        colorHex: currentColor?.hex || '#C0654B',
        sku: `${product.id}-SKU`,
        price: product.basePrice,
        discountPrice: product.discountPrice,
        stock: 10,
        images: [primaryImage],
      };

    const effectivePrice =
      currentVariant.discountPrice ||
      currentVariant.price ||
      product.discountPrice ||
      product.basePrice;
    const originalPrice = currentVariant.price || product.basePrice;
    const discountPercent =
      product.discountPercent ||
      (originalPrice > effectivePrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : 0);

    // Add-to-cart with ✓ feedback animation
    const handleAddToCart = useCallback(() => {
      const variantWithImage: ProductVariant = {
        ...currentVariant,
        images: [primaryImage]
      };
      addToCart(product, variantWithImage, 1);
      if (!reducedMotion) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1200);
      }
    }, [addToCart, product, currentVariant, primaryImage, reducedMotion]);

    // Wishlist with pulse animation
    const handleWishlistToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleWishlist(product.id);
        if (!reducedMotion) {
          setWishlistPulse(true);
          setTimeout(() => setWishlistPulse(false), 400);
        }
      },
      [toggleWishlist, product.id, reducedMotion]
    );

    return (
      <div
        className="group relative bg-white border border-stone-200 rounded-md overflow-hidden shadow-2xs hover:shadow-md transition-shadow duration-200 flex flex-col h-full select-none"
        onClick={() => onNavigate(`/product/${product.id}`)}
      >
        {/* TOP OVERLAYS: PGmart Assured / Bestseller Badge */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start pointer-events-none">
          {!hideBadges && (
            <span className="pgmart-assured-badge shadow-2xs">
              ✦ PGmart Assured
            </span>
          )}
          {!hideBadges && product.tags.includes('bestseller') && (
            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider shadow-2xs">
              BESTSELLER
            </span>
          )}
        </div>

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-500 hover:text-[#C0654B] shadow-xs cursor-pointer transition-transform hover:scale-110"
          style={
            reducedMotion
              ? {}
              : {
                  transition: 'transform 0.15s ease',
                  transform: wishlistPulse ? 'scale(1.25)' : 'scale(1)',
                }
          }
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#C0654B] text-[#C0654B]' : ''
            }`}
          />
        </button>

        {/* PRODUCT IMAGE CONTAINER (Flipkart style contain/fit on crisp white bg) */}
        <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-white cursor-pointer border-b border-stone-100 flex items-center justify-center p-0.5 sm:p-2">
          <img
            src={getOptimizedImageUrl(primaryImage, { width: 450, quality: 75 })}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
            decoding="async"
          />

          {/* QUICK VIEW HOVER OVERLAY */}
          <div className="absolute inset-x-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex">
            <button
              onClick={e => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="w-full bg-white/95 hover:bg-stone-900 hover:text-white text-stone-900 text-xs font-bold py-1.5 rounded shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#C0654B]" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* DETAILS SECTION (Dense Flipkart hierarchy) */}
        <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between bg-white text-left">
          <div>
            {/* Brand / Short Descriptor */}
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="font-bold text-stone-400 uppercase tracking-wide truncate max-w-[120px]">
                {product.brandName || 'PGmart Classic'}
              </span>
              {onToggleCompare && (
                <label
                  className="flex items-center gap-1 cursor-pointer select-none text-[10px] text-stone-500 hover:text-[#C0654B]"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isCompared}
                    onChange={() => onToggleCompare(product)}
                    className="w-3 h-3 accent-[#C0654B] cursor-pointer rounded-xs"
                  />
                  <span>Compare</span>
                </label>
              )}
            </div>

            {/* Title (1-2 lines, clean sans-serif) */}
            <h3 className="font-normal text-stone-800 text-xs sm:text-sm line-clamp-1 group-hover:text-[#C0654B] transition-colors mb-1.5">
              {product.name}
            </h3>

            {/* RATING BADGE (Signature Flipkart Green Pill) */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="rating-pill-green">
                <span>{(Number(product.rating) || 5).toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </span>
              <span className="text-[11px] font-semibold text-stone-400">
                ({(Number(product.reviewCount) || 0).toLocaleString()})
              </span>
            </div>
          </div>

          <div>
            {/* COLOR SWATCHES */}
            {!hideColorAndSize && product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {product.colors.slice(0, 4).map((c, idx) => (
                  <button
                    key={c.name}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedColorIndex(idx);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-3.5 h-3.5 rounded-full border border-stone-300 transition-transform cursor-pointer ${
                      selectedColorIndex === idx
                        ? 'ring-2 ring-[#C0654B] ring-offset-1 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-stone-400 font-medium ml-0.5">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* FLIPKART PRICE ROW: ₹799  ₹1,499  47% off */}
            <div className="flex items-baseline flex-wrap gap-1.5 my-1">
              <span className="font-extrabold text-stone-900 text-sm sm:text-base tracking-tight">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > effectivePrice && (
                <span className="text-xs text-stone-400 line-through font-normal">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#26A541]">
                  {discountPercent}% off
                </span>
              )}
            </div>

            {/* ACTION ROW */}
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-medium">
                Free Delivery
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#C0654B]/10 hover:bg-[#C0654B] text-[#C0654B] hover:text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
