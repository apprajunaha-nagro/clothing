import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onToggleCompare, isCompared = false }) => {
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useStore();

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes[0] || 'M');

  const currentColor = product.colors[selectedColorIndex] || product.colors[0];
  const primaryImage = currentColor?.images[0] || product.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';

  const isWishlisted = wishlist.includes(product.id);

  // Find matching variant
  const currentVariant: ProductVariant = product.variants.find(
    v => v.color.toLowerCase() === currentColor?.name.toLowerCase() && v.size === selectedSize
  ) || product.variants[0] || {
    id: `${product.id}-default`,
    productId: product.id,
    size: selectedSize,
    color: currentColor?.name || 'Default',
    colorHex: currentColor?.hex || '#C0654B',
    sku: `${product.id}-SKU`,
    price: product.basePrice,
    discountPrice: product.discountPrice,
    stock: 10,
    images: [primaryImage]
  };

  const effectivePrice = currentVariant.discountPrice || currentVariant.price || product.discountPrice || product.basePrice;
  const originalPrice = currentVariant.price || product.basePrice;
  const discountPercent = product.discountPercent || (originalPrice > effectivePrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0);

  return (
    <div className="group relative bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* BADGES (Discount, Tags) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
        {discountPercent > 0 && (
          <span className="bg-[#C0654B] text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-xs uppercase">
            {discountPercent}% OFF
          </span>
        )}
        {product.tags.includes('bestseller') && (
          <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
            BESTSELLER
          </span>
        )}
        {product.tags.includes('new_arrival') && (
          <span className="bg-[#2B2620] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
            NEW
          </span>
        )}
        {product.tags.includes('curves_plus_size') && (
          <span className="bg-rose-100 text-[#C0654B] text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
            CURVES
          </span>
        )}
      </div>

      {/* WISHLIST BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 min-w-[44px] min-h-[44px] rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-[#C0654B] shadow-sm transition-transform hover:scale-110 cursor-pointer"
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C0654B] text-[#C0654B]' : ''}`} />
      </button>

      {/* PRODUCT IMAGE GALLERY */}
      <div
        className="relative aspect-4/5 overflow-hidden bg-stone-100 cursor-pointer border-b border-stone-100"
        onClick={() => onNavigate(`/product/${product.id}`)}
      >
        <img
          src={getOptimizedImageUrl(primaryImage, { width: 600, quality: 75 })}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* QUICK VIEW OVERLAY BUTTON */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-stone-900 text-xs font-bold py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C0654B]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white text-left">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="font-semibold text-[#C0654B] tracking-wider uppercase">
              {product.brandName || 'Terra & Clay'}
            </span>
            {onToggleCompare && (
              <label 
                className="flex items-center gap-1 cursor-pointer select-none border border-stone-200 bg-stone-50/80 px-1.5 py-0.5 rounded-sm hover:bg-[#F3E9E4] hover:border-[#C0654B]/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isCompared}
                  onChange={() => onToggleCompare(product)}
                  className="w-3 h-3 accent-[#C0654B] cursor-pointer rounded-xs"
                />
                <span className={`text-[9px] font-bold tracking-wide uppercase ${isCompared ? 'text-[#C0654B]' : 'text-stone-500'}`}>
                  Compare
                </span>
              </label>
            )}
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-bold text-stone-700 text-[10px]">{product.rating}</span>
              <span className="text-stone-400 text-[9px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onNavigate(`/product/${product.id}`)}
            className="font-medium text-stone-800 text-xs sm:text-sm line-clamp-2 hover:text-[#C0654B] transition-colors cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* COLOR SWATCHES */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 my-2">
              {product.colors.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColorIndex(idx)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-4 h-4 rounded-full border border-stone-300 transition-transform cursor-pointer ${
                    selectedColorIndex === idx ? 'ring-2 ring-[#C0654B] ring-offset-1 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
              <span className="text-[10px] text-stone-400 ml-1">
                {product.colors[selectedColorIndex]?.name}
              </span>
            </div>
          )}

          {/* SIZES QUICK PICK */}
          <div className="flex flex-wrap gap-1 my-2">
            {(product.availableSizes || []).slice(0, 5).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] px-1.5 py-0.5 rounded-xs border cursor-pointer transition-colors ${
                  selectedSize === size
                    ? 'border-[#C0654B] bg-[#F3E9E4] text-[#C0654B] font-bold'
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* PRICE & ADD TO BAG */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-stone-900 text-sm sm:text-base">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > effectivePrice && (
                <span className="text-stone-400 text-xs line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[9px] text-stone-400">Incl. all taxes</p>
          </div>

          <button
            onClick={() => addToCart(product, currentVariant, 1)}
            className="bg-[#2B2620] hover:bg-[#C0654B] text-white p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            aria-label="Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
