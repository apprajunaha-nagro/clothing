import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Star, Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface QuickViewModalProps {
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate }) => {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWishlist, setSizeChartCategory } = useStore();

  const [colorIndex, setColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!quickViewProduct) return null;

  const currentColor = quickViewProduct.colors[colorIndex] || quickViewProduct.colors[0];
  const activeSize = selectedSize || quickViewProduct.availableSizes[0] || 'M';

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  const variant = quickViewProduct.variants.find(
    v => v.color.toLowerCase() === currentColor?.name.toLowerCase() && v.size === activeSize
  ) || quickViewProduct.variants[0] || {
    id: `${quickViewProduct.id}-q`,
    productId: quickViewProduct.id,
    size: activeSize,
    color: currentColor?.name || 'Default',
    colorHex: currentColor?.hex || '#C0654B',
    sku: `${quickViewProduct.id}-SKU`,
    price: quickViewProduct.basePrice,
    discountPrice: quickViewProduct.discountPrice,
    stock: 10,
    images: [currentColor?.images[0] || '']
  };

  const effectivePrice = variant.discountPrice || variant.price || quickViewProduct.discountPrice || quickViewProduct.basePrice;
  const originalPrice = variant.price || quickViewProduct.basePrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-12 text-left flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-scale-up z-10 grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* IMAGE PREVIEW */}
        <div className="bg-stone-100 aspect-3/4 relative overflow-hidden">
          <img
            src={getOptimizedImageUrl(currentColor?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', { width: 800, quality: 75 })}
            alt={quickViewProduct.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* CONTENT */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-bold text-[#C0654B] uppercase tracking-wider">
                {quickViewProduct.brandName}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{quickViewProduct.rating}</span>
              </div>
            </div>

            <h2 className="text-lg font-bold text-stone-900 font-serif leading-tight">
              {quickViewProduct.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-stone-900">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > effectivePrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs bg-rose-100 text-[#C0654B] font-bold px-2 py-0.5 rounded-sm">
                In Stock ({variant.stock} left)
              </span>
            </div>

            <p className="text-xs text-stone-600 line-clamp-3 mt-3 leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Colors */}
            <div className="mt-4">
              <p className="text-xs font-bold text-stone-700 mb-1.5">Color: {currentColor?.name}</p>
              <div className="flex gap-2">
                {(quickViewProduct.colors || []).map((c, idx) => (
                  <button
                    key={c.name}
                    onClick={() => setColorIndex(idx)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full border border-stone-300 transition-transform cursor-pointer ${
                      colorIndex === idx ? 'ring-2 ring-[#C0654B] ring-offset-2 scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-stone-700">Size</span>
                <button
                  onClick={() => setSizeChartCategory(quickViewProduct.categoryId)}
                  className="text-[#C0654B] font-semibold underline cursor-pointer text-[11px]"
                >
                  Size Chart Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(quickViewProduct.availableSizes || []).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs px-3 py-1.5 rounded-md border font-semibold cursor-pointer transition-colors ${
                      activeSize === size
                        ? 'border-[#C0654B] bg-[#F3E9E4] text-[#C0654B]'
                        : 'border-stone-300 text-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const activeImg = currentColor?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80';
                  const variantWithImage = { ...variant, images: [activeImg] };
                  addToCart(quickViewProduct, variantWithImage, 1);
                  setQuickViewProduct(null);
                }}
                className="flex-1 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ADD TO CART</span>
              </button>

              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className="p-3 border border-stone-300 rounded-xl hover:border-[#C0654B] hover:text-[#C0654B] transition-colors cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C0654B] text-[#C0654B]' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                const pid = quickViewProduct.id;
                setQuickViewProduct(null);
                onNavigate(`/product/${pid}`);
              }}
              className="w-full text-center text-xs font-bold text-stone-600 hover:text-[#C0654B] underline py-1"
            >
              View Full Product Details & Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
