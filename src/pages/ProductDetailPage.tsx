import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Camera,
  MapPin,
  Sparkles
} from 'lucide-react';

interface ProductDetailPageProps {
  onNavigate: (path: string) => void;
  productId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onNavigate, productId }) => {
  const { products, addToCart, wishlist, toggleWishlist, setSizeChartCategory, showToast } = useStore();

  const product = products.find(p => p.id === productId || p.slug === productId) || products[0];

  const [colorIndex, setColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.availableSizes?.[0] || 'M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  useEffect(() => {
    setColorIndex(0);
    setActiveImageIndex(0);
    if (product?.availableSizes?.[0]) {
      setSelectedSize(product.availableSizes[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId, product?.id]);

  // Accordion Toggles
  const [specsOpen, setSpecsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) return null;

  const currentColor = product.colors[colorIndex] || product.colors[0];
  const galleryImages = currentColor?.images && currentColor.images.length > 0 ? currentColor.images : [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
  ];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  const currentVariant: ProductVariant = product.variants.find(
    v => v.color.toLowerCase() === currentColor?.name.toLowerCase() && v.size === selectedSize
  ) || product.variants[0] || {
    id: `${product.id}-v`,
    productId: product.id,
    size: selectedSize,
    color: currentColor?.name || 'Default',
    colorHex: currentColor?.hex || '#C0654B',
    sku: `${product.id}-SKU`,
    price: product.basePrice,
    discountPrice: product.discountPrice,
    stock: 12,
    images: [activeImage]
  };

  const effectivePrice = currentVariant.discountPrice || currentVariant.price || product.discountPrice || product.basePrice;
  const originalPrice = currentVariant.price || product.basePrice;
  const discountPercent = product.discountPercent || (originalPrice > effectivePrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0);

  const isWishlisted = wishlist.includes(product.id);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeResult(`Delivery available at ${pincode}! Expected delivery in 3-5 working days. Cash on Delivery available.`);
    } else {
      setPincodeResult('Please enter a valid 6-digit Indian PIN code (e.g., 700091).');
    }
  };

  const handleBuyNow = () => {
    addToCart(product, currentVariant, quantity);
    onNavigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    showToast('Review submitted for moderation! Thank you for your feedback.');
    setReviewName('');
    setReviewComment('');
  };

  const relatedProducts = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-left">
      {/* 1. MAIN PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT: GALLERY WITH THUMBNAILS */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px]">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#C0654B]' : 'border-stone-200'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img, { width: 160, quality: 75 })}
                  alt="Thumbnail"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 aspect-3/4 bg-stone-100 rounded-2xl overflow-hidden relative shadow-sm border border-stone-200">
            <img
              src={getOptimizedImageUrl(activeImage, { width: 1000, quality: 80 })}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              loading="eager"
              decoding="async"
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center text-stone-700 hover:text-[#C0654B] cursor-pointer transition-transform hover:scale-110"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C0654B] text-[#C0654B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* RIGHT: BUYING CONTROLS & SPECS */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#C0654B] uppercase tracking-widest">{product.brandName}</span>
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-stone-500 mt-1">SKU: {currentVariant.sku} | HSN Code: {product.hsnCode}</p>
          </div>

          {/* PRICE & TAX BADGE */}
          <div className="bg-[#F3E9E4]/60 p-4 rounded-xl border border-stone-200 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > effectivePrice && (
                  <span className="text-sm sm:text-base text-stone-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#C0654B] text-white text-xs font-bold px-2.5 py-0.5 rounded-sm">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Inclusive of GST ({product.gstPercent}%) & All Taxes</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
              In Stock ({currentVariant.stock} available)
            </span>
          </div>

          {/* COLOR SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800">
              Color: <span className="text-[#C0654B]">{currentColor?.name}</span>
            </label>
            <div className="flex gap-2">
              {(product.colors || []).map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setColorIndex(idx);
                    setActiveImageIndex(0);
                  }}
                  style={{ backgroundColor: c.hex }}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                    colorIndex === idx ? 'border-[#C0654B] ring-2 ring-[#C0654B] ring-offset-2 scale-110' : 'border-stone-300'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR WITH SIZE CHART GUIDE LINK */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">Select Size</label>
              <button
                onClick={() => setSizeChartCategory(product.categoryId)}
                className="text-xs font-bold text-[#C0654B] underline flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart Guide</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(product.availableSizes || []).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-xs px-4 py-2.5 min-w-[44px] min-h-[44px] rounded-xl border font-bold cursor-pointer transition-all flex items-center justify-center ${
                    selectedSize === size
                      ? 'border-[#C0654B] bg-[#F3E9E4] text-[#C0654B] shadow-xs'
                      : 'border-stone-300 text-stone-700 hover:border-stone-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={() => addToCart(product, currentVariant, quantity)}
                className="flex-1 bg-[#2B2620] hover:bg-stone-800 text-white font-bold py-3.5 min-h-[48px] rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 min-h-[48px] rounded-xl shadow-lg text-xs sm:text-sm cursor-pointer transition-colors"
              >
                BUY IT NOW
              </button>
            </div>
          </div>

          {/* MOBILE STICKY BOTTOM BUY BAR */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 px-4 pb-safe shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
            <div>
              <p className="text-[10px] text-stone-500 font-medium line-clamp-1">{product.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-stone-900 text-sm">₹{effectivePrice.toLocaleString('en-IN')}</span>
                {originalPrice > effectivePrice && (
                  <span className="text-[10px] text-stone-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => addToCart(product, currentVariant, quantity)}
                className="bg-[#2B2620] hover:bg-stone-800 text-white font-bold px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-4 py-2.5 min-h-[44px] rounded-xl text-xs cursor-pointer shadow-md"
              >
                BUY NOW
              </button>
            </div>
          </div>

          {/* PINCODE CHECKER */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C0654B]" />
              Check Delivery & COD Availability
            </p>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode (e.g. 700091)"
                className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C0654B]"
              />
              <button
                type="submit"
                className="bg-stone-900 text-white font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#C0654B] text-xs"
              >
                Check
              </button>
            </form>
            {pincodeResult && (
              <p className={`text-[11px] font-semibold mt-1 ${pincodeResult.includes('valid') ? 'text-red-600' : 'text-emerald-700'}`}>
                {pincodeResult}
              </p>
            )}
          </div>

          {/* AI STYLIST INTERACTIVE PROMPT */}
          <div className="bg-[#FAF7F5] border border-[#C0654B]/20 p-4 rounded-xl space-y-2.5 text-xs">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C0654B]" />
              Need help styling this garment?
            </p>
            <p className="text-stone-600 leading-relaxed">
              Consult our AI Stylist for trend checks, accessory recommendations, sizing advice, or customized looks.
            </p>
            <button
              onClick={() => onNavigate('/ai-stylist')}
              className="w-full bg-[#C0654B] text-white hover:bg-stone-900 font-bold py-2 rounded-lg cursor-pointer transition-colors text-center block"
            >
              Consult AI Fashion Stylist
            </button>
          </div>

          {/* ACCORDION SECTIONS */}
          <div className="border-t border-stone-200 divide-y divide-stone-200 text-xs">
            {/* Specs */}
            <div className="py-3">
              <button
                onClick={() => setSpecsOpen(!specsOpen)}
                className="w-full flex items-center justify-between font-bold text-stone-900 cursor-pointer"
              >
                <span>Product Specifications & Fabric</span>
                {specsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {specsOpen && (
                <div className="pt-3 grid grid-cols-2 gap-2 text-stone-600 leading-relaxed">
                  <p><strong>Fabric:</strong> {product.fabric}</p>
                  <p><strong>Fit:</strong> {product.fit}</p>
                  <p><strong>Occasion:</strong> {product.occasion}</p>
                  <p><strong>Pattern:</strong> {product.pattern || 'Solid'}</p>
                  {product.neck && <p><strong>Neck:</strong> {product.neck}</p>}
                  {product.sleeve && <p><strong>Sleeve:</strong> {product.sleeve}</p>}
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className="py-3">
              <button
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full flex items-center justify-between font-bold text-stone-900 cursor-pointer"
              >
                <span>Shipping & 15-Day Return Policy</span>
                {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {shippingOpen && (
                <p className="pt-3 text-stone-600 leading-relaxed">
                  Free shipping on orders above ₹999. Delivered in 3-5 business days. 15-day hassle-free doorstep return pickup available for non-innerwear garments.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. REVIEWS & RATINGS BREAKDOWN */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-stone-500">Verified buyer feedback & star ratings</p>
          </div>

          <div className="flex items-center gap-3 bg-[#F3E9E4] px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-[#C0654B]">{product.rating}</span>
            <div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-[10px] text-stone-600 font-bold">{product.reviewCount} Verified Ratings</p>
            </div>
          </div>
        </div>

        {/* WRITE A REVIEW FORM */}
        <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 sm:p-6 rounded-xl border border-stone-200 space-y-3 text-xs">
          <p className="font-bold text-stone-800 text-sm">Write a Review for {product.name}</p>

          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-medium">Your Rating:</span>
            <div className="flex text-amber-500 gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}>
                  <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-stone-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Your Full Name"
              className="bg-white border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
            />
            <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-500">
              <Camera className="w-4 h-4 text-[#C0654B]" />
              <span>Attach Review Photo (Optional)</span>
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Describe fit, fabric quality, color accuracy..."
            className="w-full bg-white border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
          />

          <button
            type="submit"
            className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Submit Verified Review
          </button>
        </form>
      </section>

      {/* 3. RELATED RECOMMENDATIONS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold font-serif text-stone-900">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
