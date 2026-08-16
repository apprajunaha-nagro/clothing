import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';
import { ReviewsMarquee } from '../components/ReviewsMarquee';
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

  // Category tiles under hero banner (Strictly Women, Men, Kids, Innerwear & Lingerie)
  const categoryTiles = React.useMemo(() => {
    const targetCategories = [
      {
        id: 'women',
        name: 'Women',
        defaultImg: '/src/assets/images/anarkali_aqua_turquoise_floral.png'
      },
      {
        id: 'men',
        name: 'Men',
        defaultImg: '/src/assets/images/men_kurta_teal_embroidered.jpg'
      },
      {
        id: 'kids',
        name: 'Kids',
        defaultImg: '/src/assets/images/kids_department_nano_banana.png'
      },
      {
        id: 'undergarments',
        name: 'Innerwear & Lingerie',
        defaultImg: '/src/assets/images/innerwear_department_new.png'
      }
    ];

    return targetCategories.map(item => {
      const match = categories?.find(c => c.id === item.id || c.slug === item.id);
      return {
        name: item.name,
        slug: match?.slug || item.id,
        img: match?.image || item.defaultImg
      };
    });
  }, [categories]);

  // Scroll refs for horizontal product rails
  const dealsScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const newArrivalsScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRefs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {
    women: useRef<HTMLDivElement>(null),
    men: useRef<HTMLDivElement>(null),
    kids: useRef<HTMLDivElement>(null),
    undergarments: useRef<HTMLDivElement>(null),
  };

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Dynamic Featured Clothing Brands (Controlled via Admin Portal Marketing Suite)
  const activeBrandsToDisplay = React.useMemo(() => {
    const activeList = brands.filter(b => b.isActive !== false);
    const limit = settings.brandsMaxItems || 20;
    return activeList.slice(0, limit);
  }, [brands, settings.brandsMaxItems]);

  // Specific Product Rails (Deals of the Day & New Arrivals from Admin Customization)
  const dealsOfTheDay = React.useMemo(() => {
    const tagged = products.filter(p => p.isDealOfTheDay || (Array.isArray(p.tags) && p.tags.includes('deal_of_the_day')));
    if (tagged.length > 0) {
      const taggedIds = new Set(tagged.map(p => p.id));
      const minDisc = settings.dealsMinDiscount ?? 10;
      const fallback = products
        .filter(p => !taggedIds.has(p.id) && (p.discountPercent ? p.discountPercent >= minDisc : true))
        .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      return [...tagged, ...fallback].slice(0, 30);
    }
    
    const minDisc = settings.dealsMinDiscount ?? 10;
    return products
      .filter(p => (p.discountPercent ? p.discountPercent >= minDisc : true))
      .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
      .slice(0, 30);
  }, [products, settings.dealsMinDiscount]);

  const trendingSarees = React.useMemo(() => {
    const primary = products.filter(p => p.categoryId === 'women' || (p.subcategoryId && p.subcategoryId.includes('saree')));
    if (primary.length >= 20) return primary.slice(0, 30);

    const primaryIds = new Set(primary.map(p => p.id));
    const secondary = products.filter(p => !primaryIds.has(p.id));
    return [...primary, ...secondary].slice(0, 30);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    const maxItems = settings.newArrivalsMaxItems || 10;
    const tagged = products.filter(p => Array.isArray(p.tags) && p.tags.includes('new_arrival'));
    if (tagged.length >= maxItems) return tagged.slice(0, maxItems);

    const taggedIds = new Set(tagged.map(p => p.id));
    const sortedNewest = [...products]
      .filter(p => !taggedIds.has(p.id))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return [...tagged, ...sortedNewest].slice(0, maxItems);
  }, [products, settings.newArrivalsMaxItems]);

  const activeAdBanners = React.useMemo(() => {
    return banners.filter(b => (b.position === 'ad_banner' || b.position === 'promo_strip') && b.isActive);
  }, [banners]);

  return (
    <div className="space-y-6 sm:space-y-8 bg-stone-100/60 pb-12 font-sans text-left">
      {/* 1. HERO BANNER CAROUSEL SLIDER */}
      <HeroSlider banners={banners} onNavigate={onNavigate} />

      {/* 2. CATEGORIES SECTION (DIRECTLY BELOW HERO BANNER) */}
      <div className="-mt-3 sm:-mt-5 relative z-10 max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-stone-200/90 shadow-md">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
            {categoryTiles.map((tile) => (
              <button
                key={tile.slug}
                onClick={() => onNavigate(`/category/${tile.slug}`)}
                className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg hover:bg-stone-50 transition-all cursor-pointer group text-center"
              >
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-stone-200 group-hover:border-[#C0654B] shadow-2xs group-hover:shadow-sm transition-all mb-1.5 shrink-0 bg-stone-100">
                  <img
                    src={getOptimizedImageUrl(tile.img, { width: 200, quality: 85 })}
                    alt={tile.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-stone-900 text-[11px] sm:text-sm group-hover:text-[#C0654B] transition-colors tracking-tight leading-tight">
                  {tile.name}
                </h3>
              </button>
            ))}
          </div>
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

      {/* 5.3 20 FEATURED CLOTHING BRANDS MARQUEE (ADMIN CONTROLLED IN MARKETING SUITE) */}
      {settings.brandsEnabled !== false && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#C0654B] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  {settings.brandsBadge || 'OFFICIAL BRANDS'}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-stone-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C0654B]" />
                  <span>{settings.brandsTitle || 'Featured Clothing Brands'}</span>
                </h2>
              </div>
              {settings.brandsSubtitle && (
                <span className="text-xs text-stone-500 font-medium hidden sm:inline-block">
                  {settings.brandsSubtitle}
                </span>
              )}
            </div>

            {/* INFINITE 360 DEGREE CONTINUOUS MARQUEE (RIGHT TO LEFT - NO SIDE BLUR) */}
            <div className="overflow-hidden w-full relative py-1">
              <div
                className="flex gap-6 sm:gap-8 animate-marquee w-max py-2"
                style={{ animationDuration: `${settings.brandsSpeed || 35}s` }}
              >
                {[...activeBrandsToDisplay, ...activeBrandsToDisplay].map((brand, idx) => (
                  <div
                    key={`${brand.id}-${idx}`}
                    className="flex flex-col items-center justify-center group cursor-default shrink-0 select-none"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#C0654B] via-amber-400 to-[#8B3E2F] shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white bg-stone-100"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-extrabold text-stone-800 group-hover:text-[#C0654B] truncate max-w-[95px] text-center mt-2 transition-colors">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* 6. RECOMMENDED FOR YOU (4 Sub-category Themes: Women's, Men's, Kids', Innerwear with 12 Products Each) */}
      <section className="max-w-7xl mx-auto px-1 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-1 sm:p-6 shadow-xs space-y-3 sm:space-y-6">
          <div className="border-b border-stone-200 pb-2.5 sm:pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2 sm:px-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#C0654B] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  CURATED FOR YOU
                </span>
                <h2 className="text-base sm:text-2xl font-extrabold font-serif text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C0654B]" />
                  <span>Recommended Collections</span>
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Handpicked trending styles & bestselling outfits curated across all 4 core departments</p>
            </div>
          </div>

          {/* 4 DISTINCTLY THEMED SUBCATEGORY SECTIONS */}
          {[
            {
              id: 'women',
              title: "Women's Ethnic & Festive Collection",
              subtitle: 'Handcrafted Sarees, Silk Kurtas, Designer Dresses & Festive Outfits',
              slug: 'women',
              badge: "HERITAGE ETHNIC",
              gradient: 'from-[#541D12] via-[#8B3E2F] to-[#C0654B]',
              borderAccent: 'border-[#C0654B]/40 bg-stone-50/40',
              btnColor: 'text-amber-200 hover:text-white',
              IconComp: Sparkles
            },
            {
              id: 'men',
              title: "Men's Executive & Casual Wear",
              subtitle: 'Formal Shirts, Executive Blazers, Jackets & Festival Kurta Sets',
              slug: 'men',
              badge: "EXECUTIVE EDIT",
              gradient: 'from-[#0A1324] via-[#1B2A4A] to-[#2C416A]',
              borderAccent: 'border-[#2C416A]/40 bg-stone-50/40',
              btnColor: 'text-sky-200 hover:text-white',
              IconComp: Crown
            },
            {
              id: 'kids',
              title: "Kids' Festive & Daily Wear",
              subtitle: 'Infant Wear, Girls Festive Frocks & Boys Party Kurta Pyjamas',
              slug: 'kids',
              badge: "LITTLE CHAMPIONS",
              gradient: 'from-[#3B2204] via-[#784A12] to-[#B46B12]',
              borderAccent: 'border-[#B46B12]/40 bg-stone-50/40',
              btnColor: 'text-amber-200 hover:text-white',
              IconComp: Star
            },
            {
              id: 'undergarments',
              title: 'Luxe Innerwear & Lingerie',
              subtitle: 'Breathable Cotton Bras, Trunks, Briefs & Soft Luxe Loungewear',
              slug: 'undergarments',
              badge: "ULTIMATE COMFORT",
              gradient: 'from-[#190C16] via-[#3B1933] to-[#5C2B4E]',
              borderAccent: 'border-[#5C2B4E]/40 bg-stone-50/40',
              btnColor: 'text-rose-200 hover:text-white',
              IconComp: Heart
            },
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
            const SubIcon = sub.IconComp;

            return (
              <div key={sub.id} className={`rounded-xl border ${sub.borderAccent} overflow-hidden shadow-2xs space-y-0`}>
                {/* THEMED HEADER BANNER */}
                <div className={`bg-gradient-to-r ${sub.gradient} text-white p-2.5 sm:p-4 flex items-center justify-between flex-wrap gap-2`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0">
                      <SubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="bg-white/20 text-white text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded tracking-wider uppercase backdrop-blur-xs">
                          {sub.badge}
                        </span>
                        <h3 className="text-xs sm:text-base font-extrabold uppercase tracking-tight">{sub.title}</h3>
                      </div>
                      <p className="text-[11px] text-stone-200/90 font-medium mt-0.5 hidden sm:block">{sub.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onNavigate(`/category/${sub.slug}`)}
                      className={`text-[11px] sm:text-xs font-bold ${sub.btnColor} underline underline-offset-2 cursor-pointer whitespace-nowrap ml-1 flex items-center gap-1`}
                    >
                      <span>Explore Department</span>
                      <ArrowRight className="w-3.5 h-3.5 inline-block" />
                    </button>
                  </div>
                </div>

                {/* VERTICAL PRODUCT LIST GRID */}
                <div className="p-1 sm:p-5 bg-white grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-4">
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

      {/* 7. ANIMATED REVIEWS & TESTIMONIALS STRIP (RIGHT-TO-LEFT MARQUEE, JUST ABOVE OUR STORY) */}
      <ReviewsMarquee onNavigate={onNavigate} />
    </div>
  );
};

