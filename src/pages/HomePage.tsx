import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { Sparkles, Flame, Award, Crown, ArrowRight, Star, Heart, CheckCircle2, Instagram, Camera, MessageSquare, MapPin, Truck, RotateCcw, ShieldCheck, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

// Countdown Timer Component for Deals of the Day
const DealCountdownTimer: React.FC<{ initialHours?: number; initialMinutes?: number }> = ({ initialHours = 14, initialMinutes = 22 }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: initialHours, minutes: initialMinutes, seconds: 45 });

  useEffect(() => {
    setTimeLeft({ hours: initialHours, minutes: initialMinutes, seconds: 45 });
  }, [initialHours, initialMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: initialHours || 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialHours]);

  return (
    <div className="flex items-center gap-1 text-xs font-bold text-rose-100 bg-[#a34b32] px-2.5 py-1 rounded">
      <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      <span>Ending in:</span>
      <span className="font-mono bg-stone-900 text-white px-1.5 py-0.5 rounded text-[11px]">
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { banners, categories, brands, products, settings, showToast, setChatOpen } = useStore();

  // Category Icon Strip tiles (Only 4 main departments)
  const categoryTiles = [
    { name: "Women's Fashion", slug: 'women', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80' },
    { name: "Men's Fashion", slug: 'men', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=250&q=80' },
    { name: "Kids' Fashion", slug: 'kids', img: '/images/kids_department_nano_banana.png' },
    { name: "Innerwear & Lingerie", slug: 'undergarments', img: '/images/innerwear_department_new.png' },
  ];

  // Scroll refs for horizontal product rails
  const dealsScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const newArrivalsScrollRef = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Specific Product Rails (Guaranteed Minimum 20 Products Each)
  const dealsOfTheDay = React.useMemo(() => {
    const tagged = products.filter(p => p.isDealOfTheDay || (Array.isArray(p.tags) && p.tags.includes('deal_of_the_day')));
    if (tagged.length >= 20) return tagged.slice(0, 30);
    
    const taggedIds = new Set(tagged.map(p => p.id));
    const minDisc = settings.dealsMinDiscount ?? 10;
    const fallback = products
      .filter(p => !taggedIds.has(p.id) && (p.discountPercent ? p.discountPercent >= minDisc : true))
      .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    
    return [...tagged, ...fallback].slice(0, 30);
  }, [products, settings.dealsMinDiscount]);

  const trendingSarees = React.useMemo(() => {
    const primary = products.filter(p => p.categoryId === 'women' || (p.subcategoryId && p.subcategoryId.includes('saree')));
    if (primary.length >= 20) return primary.slice(0, 30);

    const primaryIds = new Set(primary.map(p => p.id));
    const secondary = products.filter(p => !primaryIds.has(p.id));
    return [...primary, ...secondary].slice(0, 30);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    const targetCount = Math.max(20, settings.newArrivalsMaxItems || 20);
    const tagged = products.filter(p => Array.isArray(p.tags) && p.tags.includes('new_arrival'));
    if (tagged.length >= targetCount) return tagged.slice(0, targetCount);

    const taggedIds = new Set(tagged.map(p => p.id));
    const sortedNewest = [...products]
      .filter(p => !taggedIds.has(p.id))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return [...tagged, ...sortedNewest].slice(0, targetCount);
  }, [products, settings.newArrivalsMaxItems]);

  const activeAdBanners = React.useMemo(() => {
    return banners.filter(b => (b.position === 'ad_banner' || b.position === 'promo_strip') && b.isActive);
  }, [banners]);

  return (
    <div className="space-y-6 sm:space-y-8 bg-stone-100/60 pb-12 font-sans text-left">
      {/* 1. HERO BANNER CAROUSEL SLIDER */}
      <HeroSlider banners={banners} onNavigate={onNavigate} />

      {/* 2. ICON STRIP CATEGORIES TILES */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
          {categoryTiles.map((tile) => (
            <button
              key={tile.slug}
              onClick={() => onNavigate(`/category/${tile.slug}`)}
              className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200 cursor-pointer text-left group"
            >
              <img
                src={getOptimizedImageUrl(tile.img, { width: 100, quality: 80 })}
                alt={tile.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm group-hover:text-[#C0654B] transition-colors">{tile.name}</h3>
                <p className="text-[10px] text-stone-500 font-medium">Explore & Buy →</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROMO STRIP AD BANNER */}
      {settings.adBannerEnabled !== false && activeAdBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6">
          <div
            onClick={() => onNavigate(activeAdBanners[0].link || '/category/women')}
            className="relative rounded-2xl overflow-hidden bg-stone-900 text-white p-5 sm:p-8 cursor-pointer group shadow-md"
          >
            <img
              src={getOptimizedImageUrl(activeAdBanners[0].image, { width: 1400, quality: 85 })}
              alt={activeAdBanners[0].title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
            />
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="bg-[#C0654B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                EXCLUSIVE FESTIVE OFFER
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold font-serif">{activeAdBanners[0].title}</h2>
              {activeAdBanners[0].subtitle && (
                <p className="text-xs sm:text-sm text-stone-200 font-medium">{activeAdBanners[0].subtitle}</p>
              )}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold px-4 py-2 rounded-xl text-xs shadow-md group-hover:bg-[#C0654B] group-hover:text-white transition-colors">
                  <span>{activeAdBanners[0].buttonText || 'EXPLORE COLLECTION'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. DEALS OF THE DAY RAIL (Admin Controlled) */}
      {settings.dealsEnabled !== false && dealsOfTheDay.length > 0 && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-2xs">
            <div className="bg-[#8B3E2F] text-white p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>{settings.dealsTitle || 'Deals of the Day'}</span>
                </h2>
                <DealCountdownTimer initialHours={settings.dealsTimerHours} initialMinutes={settings.dealsTimerMinutes} />
              </div>
              <div className="flex items-center gap-3">
                {/* Scroll Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRail(dealsScrollRef, 'left')}
                    aria-label="Scroll left"
                    className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail(dealsScrollRef, 'right')}
                    aria-label="Scroll right"
                    className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onNavigate('/category/all?tag=deal_of_the_day')}
                  className="text-xs font-bold text-amber-300 hover:underline cursor-pointer ml-1"
                >
                  View All Deals →
                </button>
              </div>
            </div>
            <div ref={dealsScrollRef} className="p-3 sm:p-4 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex gap-3 sm:gap-4 w-max">
                {dealsOfTheDay.map((prod) => (
                  <div key={prod.id} className="w-[170px] sm:w-[210px] shrink-0">
                    <ProductCard product={prod} onNavigate={onNavigate} hideBadges={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. TRENDING SAREES RAIL */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-2xs">
          <div className="bg-stone-900 text-white p-3 sm:p-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight">Trending in Sarees & Ethnic</h2>
            <div className="flex items-center gap-3">
              {/* Scroll Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollRail(trendingScrollRef, 'left')}
                  aria-label="Scroll left"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRail(trendingScrollRef, 'right')}
                  aria-label="Scroll right"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => onNavigate('/category/women')}
                className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer ml-1"
              >
                View All →
              </button>
            </div>
          </div>
          <div ref={trendingScrollRef} className="p-3 sm:p-4 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex gap-3 sm:gap-4 w-max">
              {trendingSarees.map((prod) => (
                <div key={prod.id} className="w-[170px] sm:w-[210px] shrink-0">
                  <ProductCard product={prod} onNavigate={onNavigate} hideBadges={true} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 NEW ARRIVALS */}
      {settings.newArrivalsEnabled !== false && newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-2xs">
            <div className="bg-gradient-to-r from-[#2B2620] via-[#3a332c] to-[#2B2620] text-white p-3 sm:p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#C0654B] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                    {settings.newArrivalsBadge || 'JUST ARRIVED'}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    {settings.newArrivalsTitle || 'New Arrivals'}
                  </h2>
                </div>
                {settings.newArrivalsSubtitle && (
                  <p className="text-[11px] text-stone-300 mt-0.5 hidden sm:block">
                    {settings.newArrivalsSubtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Scroll Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRail(newArrivalsScrollRef, 'left')}
                    aria-label="Scroll left"
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail(newArrivalsScrollRef, 'right')}
                    aria-label="Scroll right"
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onNavigate('/category/all?tag=new_arrival')}
                  className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer shrink-0 ml-1"
                >
                  View All New Arrivals →
                </button>
              </div>
            </div>

            <div ref={newArrivalsScrollRef} className="p-3 sm:p-4 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex gap-3 sm:gap-4 w-max">
                {newArrivals.map((prod) => (
                  <div key={prod.id} className="w-[170px] sm:w-[210px] shrink-0">
                    <ProductCard product={prod} onNavigate={onNavigate} hideBadges={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. RECOMMENDED FOR YOU (4 Subsections: Women's Fashion, Men's Fashion, Kids' Fashion, Innerwear & Lingerie) */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-md p-3 sm:p-5 shadow-2xs space-y-6">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C0654B]" />
                <span>Recommended For You</span>
              </h2>
              <p className="text-xs text-stone-500">Handpicked trending styles curated across all 4 core departments</p>
            </div>
          </div>

          {/* 4 SUBSECTIONS: Women's, Men's, Kids', Innerwear (Minimum 12 Products Each) */}
          {[
            { id: 'women', title: "Women's Fashion", subtitle: 'Sarees, Kurtas, Western Dresses & Ethnic Accessories', slug: 'women' },
            { id: 'men', title: "Men's Fashion", subtitle: 'Formal Shirts, Executive Blazers & Festival Kurta Sets', slug: 'men' },
            { id: 'kids', title: "Kids' Fashion", subtitle: 'Infant Wear, Girls Festive Frocks & Boys Outfits', slug: 'kids' },
            { id: 'undergarments', title: 'Innerwear & Lingerie', subtitle: 'Breathable Cotton Bras, Trunks, Briefs & Luxe Loungewear', slug: 'undergarments' },
          ].map((sub) => {
            const catProds = products.filter(p => p.categoryId === sub.id || (p.subcategoryId && p.subcategoryId.includes(sub.id)));
            const picked: Product[] = [...catProds];

            // If category has fewer than 12 products, backfill with general catalog items so minimum 12 items are guaranteed
            if (picked.length < 12) {
              const pickedIds = new Set(picked.map(p => p.id));
              const remaining = products.filter(p => !pickedIds.has(p.id));
              picked.push(...remaining);
            }

            const displayItems = picked.slice(0, 12);

            return (
              <div key={sub.id} className="space-y-3 pt-4 first:pt-0 border-t border-stone-200/70 first:border-0">
                <div className="flex items-center justify-between bg-stone-50 p-2.5 px-3 rounded border border-stone-200/80">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900">{sub.title}</h3>
                    <p className="text-[11px] text-stone-500">{sub.subtitle}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`/category/${sub.slug}`)}
                    className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    View All {sub.title} →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {displayItems.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                      hideBadges={true}
                      hideColorAndSize={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. VALUE PROPOSITION STRIP (Ultra-Clean Modern Floating Pills) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#C0654B] transition-all group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[#F3E9E4] text-[#C0654B] flex items-center justify-center shrink-0 group-hover:bg-[#C0654B] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">100% Original</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">Direct from heritage weavers</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#C0654B] transition-all group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[#F3E9E4] text-[#C0654B] flex items-center justify-center shrink-0 group-hover:bg-[#C0654B] group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">Free Shipping</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">On all orders over ₹999</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#C0654B] transition-all group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[#F3E9E4] text-[#C0654B] flex items-center justify-center shrink-0 group-hover:bg-[#C0654B] group-hover:text-white transition-colors">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">Easy 7-Day Returns</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">Hassle-free exchange policy</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#C0654B] transition-all group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[#F3E9E4] text-[#C0654B] flex items-center justify-center shrink-0 group-hover:bg-[#C0654B] group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">100% Secure Payments</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">UPI, Cards, Netbanking & COD</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

