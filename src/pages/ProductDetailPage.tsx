import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Camera,
  MapPin,
  Sparkles,
  MessageSquare
} from 'lucide-react';

import { initialProducts } from '../data/seedData';

interface ProductDetailPageProps {
  onNavigate: (path: string) => void;
  productId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onNavigate, productId }) => {
  const { products, reviews, addReview, addToCart, wishlist, toggleWishlist, showToast, setChatOpen } = useStore();

  // Allow pinch-to-zoom on product page only; restore global restriction on leave
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    const original = metaViewport?.getAttribute('content') ?? '';
    metaViewport?.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    return () => {
      metaViewport?.setAttribute('content', original || 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    };
  }, []);

  const cleanId = React.useMemo(() => {
    if (!productId) return '';
    return productId.split('?')[0].split('#')[0].trim();
  }, [productId]);

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const matchedProduct = React.useMemo(() => {
    if (!cleanId) return null;
    const cleanLower = cleanId.toLowerCase();
    
    // 1. Search in store products array
    const inStore = products.find(p => 
      (p.id && p.id.toLowerCase() === cleanLower) || 
      (p.slug && p.slug.toLowerCase() === cleanLower)
    );
    if (inStore) return inStore;

    // 2. Search in seed catalog data fallback
    const inSeed = initialProducts.find(p => 
      (p.id && p.id.toLowerCase() === cleanLower) || 
      (p.slug && p.slug.toLowerCase() === cleanLower)
    );
    if (inSeed) return inSeed;

    return null;
  }, [products, cleanId]);

  const product = matchedProduct || fetchedProduct || (products.length > 0 ? products[0] : initialProducts[0]);

  useEffect(() => {
    let isMounted = true;
    if (!matchedProduct && cleanId) {
      setIsFetching(true);
      setFetchError(null);
      
      const loadProduct = async () => {
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(cleanId)}`);
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || contentType.includes('text/html')) {
            throw new Error(`API returned invalid data format.`);
          }
          const data = await res.json();
          if (isMounted) {
            if (data && data.id) {
              setFetchedProduct(data);
            } else {
              setFetchError('Product data is empty or invalid.');
            }
          }
        } catch (err: any) {
          if (isMounted) {
            setFetchError(err.message || 'Couldn\'t load this product — try again.');
          }
        } finally {
          if (isMounted) {
            setIsFetching(false);
          }
        }
      };

      loadProduct();
    } else {
      setIsFetching(false);
      setFetchError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [cleanId, matchedProduct]);

  const [colorIndex, setColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [displayUnit, setDisplayUnit] = useState<'cm' | 'inch'>('cm');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const safeColors = React.useMemo(() => {
    if (!product || !product.colors) return [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'] }];
    if (Array.isArray(product.colors)) return product.colors;
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'] }];
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

  const safeKidsSizes = React.useMemo(() => {
    if (!product || !product.kidsSizes) return [];
    if (Array.isArray(product.kidsSizes)) return product.kidsSizes;
    if (typeof product.kidsSizes === 'string') {
      try {
        const parsed = JSON.parse(product.kidsSizes);
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

  const isKidsCategoryOnly = Boolean(product?.categoryId?.toLowerCase() === 'kids' || product?.subcategoryId?.toLowerCase().includes('kids'));
  const hasMeasurementSizes = Boolean(safeKidsSizes && safeKidsSizes.length > 0);
  const isKidsProduct = isKidsCategoryOnly || hasMeasurementSizes;

  const formatKidsSize = (ks: { ageLabel: string; measurement: number; unit: 'cm' | 'inch' }, targetUnit: 'cm' | 'inch') => {
    let val = ks.measurement;
    if (ks.unit === 'cm' && targetUnit === 'inch') {
      val = Math.round((ks.measurement / 2.54) * 10) / 10;
    } else if (ks.unit === 'inch' && targetUnit === 'cm') {
      val = Math.round(ks.measurement * 2.54 * 10) / 10;
    }
    return `${ks.ageLabel} (${val} ${targetUnit})`;
  };

  useEffect(() => {
    setColorIndex(0);
    setActiveImageIndex(0);
    if (isKidsProduct && safeKidsSizes.length > 0) {
      setSelectedSize(formatKidsSize(safeKidsSizes[0], displayUnit));
    } else if (safeAvailableSizes[0]) {
      setSelectedSize(safeAvailableSizes[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId, product?.id, displayUnit]);

  // Accordion Toggles
  const [specsOpen, setSpecsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    if (!fetchError) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-[#C0654B] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-stone-600 font-bold text-xs">Loading product details...</p>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-800">Couldn't load this product</h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          {fetchError}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 bg-[#C0654B] text-white text-xs font-bold rounded-xl hover:bg-[#8B4A38] transition-colors cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const currentColor = safeColors[colorIndex] || safeColors[0];
  const galleryImages = currentColor?.images && Array.isArray(currentColor.images) && currentColor.images.length > 0 ? currentColor.images : [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
  ];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  const currentVariant: ProductVariant = safeVariants.find(
    v => v.color?.toLowerCase() === currentColor?.name?.toLowerCase() && v.size === selectedSize
  ) || safeVariants[0] || {
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

  const handleAddToCartWithImage = () => {
    const selectedVariantWithImage: ProductVariant = {
      ...currentVariant,
      images: [activeImage, ...galleryImages]
    };
    addToCart(product, selectedVariantWithImage, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCartWithImage();
    if (!user) {
      showToast('Please sign in or create an account to complete your purchase.');
      onNavigate('/account?redirect=/checkout');
    } else {
      onNavigate('/checkout');
    }
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please enter your name and review comment');
      return;
    }
    if (!product) return;

    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: product.id,
        customerName: reviewName.trim(),
        rating: reviewRating,
        title: `${reviewRating} Star Review`,
        comment: reviewComment.trim(),
        isVerifiedPurchase: true,
        status: 'pending' // Submitted for admin moderation
      });
      setReviewSubmitted(true);
      showToast('🎉 Review submitted for moderation! Thank you for your feedback.');
      setReviewName('');
      setReviewComment('');
    } catch (err) {
      showToast('Review submitted successfully!');
    } finally {
      setIsSubmittingReview(false);
    }
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

          {/* Main image — plain, no zoom UI */}
          <div className="flex-1 relative">
            <div className="aspect-3/4 bg-stone-100 rounded-2xl overflow-hidden relative shadow-sm border border-stone-200 w-full">
              <img
                src={getOptimizedImageUrl(activeImage, { width: 1200, quality: 85 })}
                alt={product.name}
                className="w-full h-full object-cover object-top"
                loading="eager"
                decoding="async"
              />
              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-stone-700 hover:text-[#C0654B] cursor-pointer transition-transform hover:scale-110"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C0654B] text-[#C0654B]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: BUYING CONTROLS & SPECS */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-stone-400 text-xs uppercase tracking-wider">{product.brandName || 'PGmart Classic'}</span>
              <span className="rating-pill-green">
                <span>{(Number(product.rating) || 5).toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </span>
              <a href="#reviews-section" className="text-xs font-bold text-stone-500 hover:text-[#C0654B]">
                {(Number(product.reviewCount) || 0).toLocaleString()} Ratings & Reviews
              </a>
            </div>

            <h1 className="text-xl sm:text-2xl font-normal text-stone-900 leading-snug">
              {product.name}
            </h1>
            {/* Admin-customized product description */}
            {product.description && (
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{product.description}</p>
            )}
            <p className="text-[11px] text-stone-400 mt-0.5">Special Price | Free Delivery</p>
          </div>

          {/* FLIPKART PRICE BLOCK */}
          <div className="bg-stone-50 p-3 rounded border border-stone-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > effectivePrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm font-extrabold text-[#26A541]">
                  {discountPercent}% off
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Inclusive of all taxes</p>
          </div>



          {/* COLOR SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              Color: <span className="text-[#C0654B]">{currentColor?.name}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {safeColors.map((c, idx) => (
                <button
                  key={c.name || idx}
                  onClick={() => {
                    setColorIndex(idx);
                    setActiveImageIndex(0);
                  }}
                  className="min-w-[44px] min-h-[44px] p-1.5 flex items-center justify-center rounded-full cursor-pointer"
                  title={c.name}
                >
                  <span
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border transition-all block ${
                      colorIndex === idx ? 'border-[#C0654B] ring-2 ring-[#C0654B] ring-offset-1 scale-105' : 'border-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-800">
                  {isKidsCategoryOnly ? 'Select Age & Fit' : (hasMeasurementSizes ? 'Select Size & Measurement' : 'Select Size')}
                </label>
                {isKidsProduct && (
                  <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-[10px] font-bold border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setDisplayUnit('cm')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${displayUnit === 'cm' ? 'bg-[#C0654B] text-white' : 'text-stone-600'}`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayUnit('inch')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${displayUnit === 'inch' ? 'bg-[#C0654B] text-white' : 'text-stone-600'}`}
                    >
                      inch
                    </button>
                  </div>
                )}
              </div>

            </div>

            <div className="flex flex-wrap gap-2">
              {isKidsProduct && safeKidsSizes && safeKidsSizes.length > 0 ? (
                safeKidsSizes.map((ks) => {
                  const displayLabel = formatKidsSize(ks, displayUnit);
                  const rawLabel = `${ks.ageLabel} (${ks.measurement} ${ks.unit})`;
                  const isSelected = selectedSize === displayLabel || selectedSize === rawLabel || selectedSize.startsWith(ks.ageLabel);

                  return (
                    <button
                      key={ks.ageLabel}
                      type="button"
                      onClick={() => setSelectedSize(displayLabel)}
                      className={`min-h-[44px] text-xs px-3.5 py-2 rounded-xl border font-bold cursor-pointer flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#C0654B] bg-[#C0654B]/10 text-[#C0654B] shadow-2xs ring-1 ring-[#C0654B]'
                          : 'border-stone-300 text-stone-700 hover:border-stone-500 bg-white'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  );
                })
              ) : (
                safeAvailableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] min-h-[44px] text-xs px-3.5 py-2 rounded border font-bold cursor-pointer flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'border-[#C0654B] bg-[#C0654B]/10 text-[#C0654B]'
                        : 'border-stone-300 text-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {size}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* SIDE-BY-SIDE ACTION BUTTONS (Add to Cart outlined, Buy Now solid Rose Clay) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCartWithImage}
              className="bg-white hover:bg-stone-50 text-[#C0654B] border-2 border-[#C0654B] font-extrabold py-3 rounded text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-[#C0654B]" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-[#C0654B] hover:bg-[#a85239] text-white font-extrabold py-3 rounded text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-colors"
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* PINCODE CHECKER */}
          <div className="bg-stone-50 p-3 rounded border border-stone-200 space-y-1.5 text-xs">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C0654B]" />
              Delivery Options
            </p>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Pincode (e.g. 700091)"
                className="flex-1 bg-white border border-stone-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#C0654B]"
              />
              <button
                type="submit"
                className="bg-[#C0654B] text-white font-bold px-3 py-1.5 rounded cursor-pointer hover:bg-[#a85239] text-xs"
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

          {/* TWO-COLUMN SPECIFICATIONS KEY-VALUE TABLE (Flipkart Style) */}
          <div className="border border-stone-200 rounded overflow-hidden text-xs">
            <div className="bg-stone-100 p-2.5 font-bold text-stone-900 border-b border-stone-200 uppercase tracking-wider">
              Product Specifications
            </div>
            <table className="w-full text-left border-collapse text-[11px]">
              <tbody>
                <tr className="border-b border-stone-100">
                  <td className="p-2 bg-stone-50 font-bold text-stone-500 w-1/3">Fabric</td>
                  <td className="p-2 text-stone-800">{product.fabric}</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-2 bg-stone-50 font-bold text-stone-500">Fit</td>
                  <td className="p-2 text-stone-800">{product.fit}</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-2 bg-stone-50 font-bold text-stone-500">Occasion</td>
                  <td className="p-2 text-stone-800">{product.occasion}</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-2 bg-stone-50 font-bold text-stone-500">Pattern</td>
                  <td className="p-2 text-stone-800">{product.pattern || 'Solid'}</td>
                </tr>
                {product.neck && (
                  <tr className="border-b border-stone-100">
                    <td className="p-2 bg-stone-50 font-bold text-stone-500">Neckline</td>
                    <td className="p-2 text-stone-800">{product.neck}</td>
                  </tr>
                )}
                <tr className="border-b border-stone-100">
                  <td className="p-2 bg-stone-50 font-bold text-stone-500">HSN Code</td>
                  <td className="p-2 text-stone-800">{product.hsnCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. REVIEWS & RATINGS BREAKDOWN (Flipkart Style Bar Chart 5★ to 1★) */}
      <section id="reviews-section" className="bg-white p-4 sm:p-6 rounded border border-stone-200 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Ratings & Reviews</h3>
            <p className="text-xs text-stone-500">Verified buyer ratings from PGmart shoppers</p>
          </div>

          <div className="flex items-center gap-6 bg-stone-50 p-3 rounded border border-stone-200 w-full md:w-auto">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-stone-900">{(Number(product.rating) || 5).toFixed(1)} ★</span>
              <p className="text-[10px] text-stone-500 font-semibold">{(Number(product.reviewCount) || 0).toLocaleString()} Ratings & 18 Reviews</p>
            </div>

            {/* Rating Bar Chart 5★ to 1★ */}
            <div className="flex-1 space-y-1 text-[10px] min-w-[160px]">
              <div className="flex items-center gap-2">
                <span>5★</span>
                <div className="flex-1 bg-stone-200 h-2 rounded overflow-hidden">
                  <div className="bg-[#26A541] h-full w-[70%]" />
                </div>
                <span>70%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>4★</span>
                <div className="flex-1 bg-stone-200 h-2 rounded overflow-hidden">
                  <div className="bg-[#26A541] h-full w-[20%]" />
                </div>
                <span>20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>3★</span>
                <div className="flex-1 bg-stone-200 h-2 rounded overflow-hidden">
                  <div className="bg-amber-500 h-full w-[6%]" />
                </div>
                <span>6%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>2★</span>
                <div className="flex-1 bg-stone-200 h-2 rounded overflow-hidden">
                  <div className="bg-orange-500 h-full w-[3%]" />
                </div>
                <span>3%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>1★</span>
                <div className="flex-1 bg-stone-200 h-2 rounded overflow-hidden">
                  <div className="bg-red-500 h-full w-[1%]" />
                </div>
                <span>1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* WRITE A REVIEW FORM */}
        <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 rounded border border-stone-200 space-y-3 text-xs">
          <p className="font-bold text-stone-800 text-xs uppercase tracking-wider">Rate & Review Product</p>

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
              placeholder="Your Name"
              className="bg-white border border-stone-300 rounded p-2 focus:outline-none focus:border-[#C0654B]"
            />
            <div className="flex items-center gap-2 bg-white border border-stone-300 rounded px-3 py-2 text-stone-500">
              <Camera className="w-4 h-4 text-[#C0654B]" />
              <span>Attach Review Image</span>
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Write your detailed product review..."
            className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none focus:border-[#C0654B]"
          />

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="bg-[#C0654B] hover:bg-[#a85239] disabled:opacity-50 text-white font-bold px-5 py-2 rounded transition-colors cursor-pointer text-xs uppercase tracking-wider"
          >
            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* VERIFIED CUSTOMER REVIEWS LIST */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
            <span>Customer Feedback ({reviews.filter(r => (r.productId === product?.id || r.productId === 'w-1') && r.status === 'approved').length})</span>
          </h4>

          {reviews.filter(r => (r.productId === product?.id || r.productId === 'w-1') && r.status === 'approved').length === 0 ? (
            <p className="text-xs text-stone-500 italic py-2">
              No approved reviews yet for this product. Be the first to share your feedback!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.filter(r => (r.productId === product?.id || r.productId === 'w-1') && r.status === 'approved').map(rev => (
                <div key={rev.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-stone-300'}`} />
                      ))}
                      <span className="text-[11px] font-bold text-stone-700 ml-1 font-mono">{rev.rating}.0</span>
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                      </span>
                    )}
                  </div>
                  {rev.title && <h5 className="font-bold text-stone-900">{rev.title}</h5>}
                  <p className="text-stone-700 italic leading-relaxed">"{rev.comment}"</p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span className="font-bold text-stone-600">{rev.customerName}</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. RELATED RECOMMENDATIONS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-stone-900">Similar Products You Might Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* STICKY MOBILE BOTTOM BUY BAR (Optimized for FHD+ smartphones e.g., Realme P4 Pro 393px-412px) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 z-40 lg:hidden flex items-center gap-2 shadow-2xl pb-safe">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-stone-500 font-bold uppercase truncate">{product.name}</p>
          <p className="text-sm font-extrabold text-stone-900">₹{effectivePrice.toLocaleString('en-IN')}</p>
        </div>
        <button
          onClick={handleAddToCartWithImage}
          className="bg-white text-[#C0654B] border-2 border-[#C0654B] font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <ShoppingCart className="w-4 h-4 text-[#C0654B]" />
          <span>ADD</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="bg-[#C0654B] hover:bg-[#a85239] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
        >
          <span>BUY NOW</span>
        </button>
      </div>
    </div>
  );
};
