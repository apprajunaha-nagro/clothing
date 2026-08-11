import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { Sparkles, Flame, Award, Crown, ArrowRight, Star, Heart, CheckCircle2, Instagram, Camera, MessageSquare, MapPin, Truck, RotateCcw, ShieldCheck, Lock } from 'lucide-react';
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

  // Specific Product Rails (Admin Controlled)
  const dealsOfTheDay = React.useMemo(() => {
    const adminDeals = products.filter(p => p.isDealOfTheDay || p.tags?.includes('deal_of_the_day'));
    if (adminDeals.length > 0) return adminDeals;
    const minDisc = settings.dealsMinDiscount ?? 20;
    return products.filter(p => p.discountPercent && p.discountPercent >= minDisc).slice(0, 10);
  }, [products, settings.dealsMinDiscount]);

  const trendingSarees = React.useMemo(() => {
    return products.filter(p => p.categoryId === 'women' || p.subcategoryId.includes('saree')).slice(0, 8);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    return products.filter(p => p.tags.includes('new_arrival') || p.tags.includes('bestseller')).slice(0, 8);
  }, [products]);

  const activeAdBanners = React.useMemo(() => {
    return banners.filter(b => (b.position === 'ad_banner' || b.position === 'promo_strip') && b.isActive);
  }, [banners]);

  return (
    <div className="bg-stone-100 min-h-screen pb-12 space-y-4 text-left">
      {/* 1. REUSABLE HERO SLIDER (Sabhyata Premium Style) */}
      <HeroSlider onNavigate={onNavigate} />

      {/* 2. CATEGORY ICON STRIP (Only 4 Departments) */}
      <section className="bg-white border-y border-stone-200 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-6 text-center">
            {categoryTiles.map((tile) => (
              <button
                key={tile.name}
                onClick={() => onNavigate(`/category/${tile.slug}`)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-stone-100 border border-stone-200 group-hover:border-[#C0654B] p-0.5 overflow-hidden transition-all group-hover:scale-105 shadow-2xs flex items-center justify-center">
                  <img
                    src={tile.img}
                    alt={tile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-stone-800 group-hover:text-[#C0654B] text-center leading-tight">
                  {tile.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DEALS OF THE DAY RAIL (Admin Controlled with Countdown Timer) */}
      {settings.dealsEnabled !== false && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-2xs">
            {/* Rail Header Bar */}
            <div className="bg-[#C0654B] text-white p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-xl font-black uppercase tracking-tight">
                  {settings.dealsTitle || 'Deals of the Day'}
                </h2>
                <DealCountdownTimer
                  initialHours={settings.dealsTimerHours ?? 14}
                  initialMinutes={settings.dealsTimerMinutes ?? 22}
                />
              </div>
              <button
                onClick={() => onNavigate('/category/women?tag=sale')}
                className="bg-white text-[#C0654B] hover:bg-stone-100 font-extrabold text-xs px-3 py-1.5 rounded shadow-2xs uppercase tracking-wider cursor-pointer"
              >
                View All Deals
              </button>
            </div>

            {/* Product Rail (Horizontal Scroll) */}
            <div className="p-3 sm:p-4 overflow-x-auto no-scrollbar">
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
            <button
              onClick={() => onNavigate('/category/women')}
              className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="p-3 sm:p-4 overflow-x-auto no-scrollbar">
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

          {/* 4 SUBSECTIONS: Women's, Men's, Kids', Innerwear */}
          {[
            { id: 'women', title: "Women's Fashion", subtitle: 'Sarees, Kurtas, Western Dresses & Ethnic Accessories', slug: 'women' },
            { id: 'men', title: "Men's Fashion", subtitle: 'Formal Shirts, Executive Blazers & Festival Kurta Sets', slug: 'men' },
            { id: 'kids', title: "Kids' Fashion", subtitle: 'Infant Wear, Girls Festive Frocks & Boys Outfits', slug: 'kids' },
            { id: 'undergarments', title: 'Innerwear & Lingerie', subtitle: 'Breathable Cotton Bras, Trunks, Briefs & Luxe Loungewear', slug: 'undergarments' },
          ].map((sub) => {
            const catProds = products.filter(p => p.categoryId === sub.id);
            // Group by subcategory to ensure diverse styles are represented
            const styleMap = new Map<string, Product[]>();
            catProds.forEach(p => {
              const key = p.subcategoryId || p.typeId || 'general';
              if (!styleMap.has(key)) styleMap.set(key, []);
              styleMap.get(key)!.push(p);
            });

            const picked: Product[] = [];
            styleMap.forEach(prods => {
              if (prods.length > 0) picked.push(prods[0]);
            });
            for (const p of catProds) {
              if (picked.length >= 6) break;
              if (!picked.some(item => item.id === p.id)) picked.push(p);
            }
            const displayItems = picked.length >= 6 ? picked.slice(0, 6) : (catProds.length >= 6 ? catProds.slice(0, 6) : (picked.length > 0 ? picked : catProds));

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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

      {/* 7. TRUST BADGES ROW (Above Footer) */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-md p-4 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">100% Original</h4>
                <p className="text-[11px] text-stone-500">Direct from heritage weavers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">Free Shipping</h4>
                <p className="text-[11px] text-stone-500">On all orders over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">Easy 7-Day Returns</h4>
                <p className="text-[11px] text-stone-500">Hassle-free exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-[#C0654B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">100% Secure Payments</h4>
                <p className="text-[11px] text-stone-500">UPI, Cards, Netbanking & COD</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

