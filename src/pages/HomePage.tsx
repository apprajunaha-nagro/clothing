import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { Sparkles, Flame, ChevronRight, ChevronLeft, Award, Crown, ArrowRight, Star, Heart, CheckCircle2, Instagram, Camera, MessageSquare, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { banners, categories, brands, products, showToast, setChatOpen } = useStore();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'women' | 'men' | 'kids' | 'undergarments'>('all');
  const [activeOccasionFilter, setActiveOccasionFilter] = useState<string>('all');
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<number>(1);

  const heroBanners = banners.filter(b => b.position === 'hero' && b.isActive);
  const activeBanners = heroBanners.length > 0 ? heroBanners : banners;
  const currentHero = activeBanners[activeBannerIndex] || activeBanners[0];

  // Auto slide every 3 seconds from right to left
  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBanners.length, isHovered]);

  const handleNextSlide = () => {
    setDirection(1);
    setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrevSlide = () => {
    setDirection(-1);
    setActiveBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const featuredProducts = React.useMemo(() => {
    if (activeTab !== 'all') {
      return products.filter(p => p.categoryId === activeTab);
    }
    
    // When activeTab === 'all', interleave products across women, men, kids, undergarments
    const womenProds = products.filter(p => p.categoryId === 'women');
    const menProds = products.filter(p => p.categoryId === 'men');
    const kidsProds = products.filter(p => p.categoryId === 'kids');
    const innerwearProds = products.filter(p => p.categoryId === 'undergarments');

    const mixed: Product[] = [];
    const maxLen = Math.max(womenProds.length, menProds.length, kidsProds.length, innerwearProds.length);

    for (let i = 0; i < maxLen; i++) {
      if (womenProds[i]) mixed.push(womenProds[i]);
      if (menProds[i]) mixed.push(menProds[i]);
      if (kidsProds[i]) mixed.push(kidsProds[i]);
      if (innerwearProds[i]) mixed.push(innerwearProds[i]);
    }

    return mixed.length > 0 ? mixed : products;
  }, [products, activeTab]);

  const occasionFilters = [
    { id: 'all', label: 'All Moments' },
    { id: 'traditional', label: 'Festive & Weddings' },
    { id: 'executive', label: 'Work & Power' },
    { id: 'celebration', label: 'Parties & Gala' },
    { id: 'casual', label: 'Casual & Loungewear' },
  ];

  const occasions = [
    {
      id: 'ethnic-festive',
      title: 'Ethnic & Festive Splendor',
      subtitle: 'Handcrafted Heritage Collection',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      slug: 'Ethnic Wear',
      desc: 'Pure Silk Sarees, Zari Anarkalis & Heavily Embroidered Lehengas',
      tag: 'HERITAGE FAVOURITES',
      count: '350+ Designs',
      category: 'traditional',
    },
    {
      id: 'wedding-couture',
      title: 'Royal Wedding Couture',
      subtitle: 'Grand Bridal & Groom Edits',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      slug: 'Wedding Wear',
      desc: 'Banarasi Brocades, Velvet Sherwanis & Regal Dupattas',
      tag: 'LUXURY BRIDAL',
      count: '140+ Outfits',
      category: 'traditional',
    },
    {
      id: 'modern-workwear',
      title: 'Executive & Power Suits',
      subtitle: 'Sharp Boardroom Statements',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
      slug: 'Work Wear',
      desc: 'Tailored Linen Blazers, Formal Trousers & Crisp Shirts',
      tag: 'TAILORED FIT',
      count: '190+ Styles',
      category: 'executive',
    },
    {
      id: 'cocktail-gala',
      title: 'Cocktail & Evening Glam',
      subtitle: 'High-Fashion Party Outfits',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
      slug: 'Party Wear',
      desc: 'Satin Slip Dresses, Velvet Tuxedos & Sequin Party Blazers',
      tag: 'NIGHTOUT SPECIAL',
      count: '220+ Looks',
      category: 'celebration',
    },
    {
      id: 'weekend-resort',
      title: 'Weekend Casual & Resort',
      subtitle: 'Breezy Everyday Fashion',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
      slug: 'Casual Wear',
      desc: 'Pastel Co-ords, Breathable Linens & Oversized Cotton Tees',
      tag: 'ESSENTIAL CASUALS',
      count: '310+ Basics',
      category: 'casual',
    },
    {
      id: 'luxe-loungewear',
      title: 'Luxe Lounge & Athleisure',
      subtitle: 'Ultra-Soft Micro-Modal Fits',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
      slug: 'Active & Loungewear',
      desc: 'Seamless Soft Bralettes, Modal Pyjama Sets & Active Leggings',
      tag: 'PURE COMFORT',
      count: '160+ Items',
      category: 'casual',
    },
  ];

  const filteredOccasions = occasions.filter(occ => {
    if (activeOccasionFilter === 'all') return true;
    return occ.category === activeOccasionFilter;
  });

  const lookbookItems = [
    {
      id: 'lb-1',
      username: 'ananya_ethnic',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      location: 'Kolkata, WB',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Hand-Woven Royal Banarasi Silk Saree',
      productPrice: '₹3,499',
      likes: '2.4k',
      comments: '184',
      tag: 'Festive Luxury',
      link: '/category/women?sub=w-ethnic',
      isVerified: true,
    },
    {
      id: 'lb-2',
      username: 'kabir_vogue',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      location: 'Mumbai, MH',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Executive Tailored Linen Power Suit',
      productPrice: '₹4,999',
      likes: '1.8k',
      comments: '112',
      tag: 'Corporate Power',
      link: '/category/women?sub=w-formal',
      isVerified: true,
    },
    {
      id: 'lb-3',
      username: 'priya_sharma',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      location: 'Jaipur, RJ',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Rose Clay Zari Anarkali Suit',
      productPrice: '₹2,899',
      likes: '3.1k',
      comments: '246',
      tag: 'Wedding Season',
      link: '/category/women?type=wt-anarkali',
      isVerified: true,
    },
    {
      id: 'lb-4',
      username: 'rohit_velour',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      location: 'New Delhi, DL',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Velvet Evening Gala Tuxedo',
      productPrice: '₹5,499',
      likes: '1.5k',
      comments: '98',
      tag: 'Gala Night',
      link: '/category/men?sub=m-formal',
      isVerified: true,
    },
    {
      id: 'lb-5',
      username: 'tanya_resort',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      location: 'Goa, GA',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Pastel Summer Resort Co-ord Set',
      productPrice: '₹1,999',
      likes: '2.1k',
      comments: '164',
      tag: 'Resort Chic',
      link: '/category/women?sub=w-western',
      isVerified: true,
    },
    {
      id: 'lb-6',
      username: 'meera_luxe',
      userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      location: 'Bengaluru, KA',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
      outfitTitle: 'Ultra-Soft Micro-Modal Lounge Fit',
      productPrice: '₹1,499',
      likes: '1.9k',
      comments: '135',
      tag: 'Pure Comfort',
      link: '/category/undergarments',
      isVerified: true,
    },
  ];

  return (
    <div className="space-y-12 pb-16 text-left">
      {/* 1. HERO SLIDER BANNER */}
      {/* 1. HERO SLIDER BANNER */}
      {currentHero && (
        <section 
          className="relative bg-stone-950 text-white overflow-hidden h-[340px] xs:h-[380px] sm:h-[420px] md:h-[480px] lg:h-[540px] xl:h-[580px] w-full flex items-center group select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Top Edge Auto-Play Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/15 z-30 overflow-hidden">
            <motion.div
              key={`${activeBannerIndex}-${isHovered}`}
              initial={{ width: '0%' }}
              animate={{ width: isHovered ? '0%' : '100%' }}
              transition={{
                duration: isHovered ? 0 : 3,
                ease: 'linear',
              }}
              className="h-full bg-[#C0654B] shadow-[0_0_8px_#C0654B]"
            />
          </div>

          {/* Background Image Slide with Directional Motion */}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={currentHero.id || activeBannerIndex}
              custom={direction}
              initial={(dir: number) => ({
                x: dir > 0 ? '100%' : '-100%',
                opacity: 0,
                scale: 1.05
              })}
              animate={{
                x: '0%',
                opacity: 1,
                scale: 1
              }}
              exit={(dir: number) => ({
                x: dir > 0 ? '-100%' : '100%',
                opacity: 0,
                scale: 0.95
              })}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full flex items-center justify-end"
            >
              {/* Soft ambient background fill matching photo colors */}
              <img
                src={getOptimizedImageUrl(currentHero.image, { width: 400, quality: 50 })}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-40 scale-110 pointer-events-none"
                loading="eager"
                decoding="async"
              />
              {/* Main image - object-cover on mobile, object-contain on desktop */}
              <img
                src={getOptimizedImageUrl(currentHero.image, { width: 1200, quality: 80 })}
                alt={currentHero.title}
                className="relative z-0 h-full w-full object-cover object-center md:object-contain md:object-right brightness-110 contrast-105"
                loading="eager"
                decoding="async"
              />
              {/* Responsive Gradient Overlay - Bottom-up on mobile, Left-to-Right on desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent md:bg-gradient-to-r md:from-stone-950 md:via-stone-950/75 md:to-transparent w-full md:w-3/5 pointer-events-none z-1" />
            </motion.div>
          </AnimatePresence>

          {/* Hero Banner Text Content with Staggered Motion */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentHero.id || activeBannerIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg space-y-2.5 sm:space-y-3 pointer-events-auto"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.35 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#C0654B] text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>SEASONAL EDIT 2026</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="font-serif text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md"
                >
                  {currentHero.title}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-md line-clamp-3 sm:line-clamp-none"
                >
                  {currentHero.subtitle}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.4 }}
                  className="pt-1 flex flex-wrap gap-2.5 sm:gap-3"
                >
                  <button
                    onClick={() => onNavigate(currentHero.link)}
                    className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{currentHero.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('/category/sale')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer"
                  >
                    EXPLORE OFFERS
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Arrow Controls - Positioned at bottom corners to avoid text overlap */}
          <button
            onClick={handlePrevSlide}
            className="absolute bottom-12 sm:bottom-14 left-3 sm:left-5 z-20 bg-stone-900/70 hover:bg-[#C0654B] text-white p-2 sm:p-2.5 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all border border-white/20 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute bottom-12 sm:bottom-14 right-3 sm:right-5 z-20 bg-stone-900/70 hover:bg-[#C0654B] text-white p-2 sm:p-2.5 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all border border-white/20 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slider Controls Bar (Counter + Active Dots + Pause Hint) */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3 bg-stone-950/60 px-3.5 sm:px-4 py-1.5 rounded-full backdrop-blur-md border border-white/15 shadow-xl">
            {/* Slide Index Counter */}
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-stone-300 border-r border-white/20 pr-2 sm:pr-2.5">
              0{activeBannerIndex + 1} <span className="text-stone-500">/</span> 0{activeBanners.length}
            </span>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeBannerIndex ? 1 : -1);
                    setActiveBannerIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeBannerIndex === idx ? 'bg-[#C0654B] w-5 sm:w-6' : 'bg-white/40 hover:bg-white/80 w-2'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Hover Status */}
            {isHovered && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-[#C0654B] tracking-wider pl-2 border-l border-white/20">
                Paused
              </span>
            )}
          </div>
        </section>
      )}

      {/* 2. TOP CATEGORIES SHOWCASE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-stone-200 pb-4 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0654B]/10 border border-[#C0654B]/30 text-[#C0654B] text-xs font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CURATED DEPARTMENTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
              Explore By Department
            </h2>
            <p className="text-sm text-stone-500 font-light mt-1">
              Handpicked fashion edits across Women, Men, Kids & Breathable Innerwear collections.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/category/women')}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-[#C0654B] hover:text-white text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-stone-200"
          >
            <span>View All Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Grid: Each department card spans equal width (25% on desktop, 50% on tablet) filling 100% area with no empty space */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {categories.map((cat) => {
            let catImg = cat.image;
            if (cat.id === 'kids') {
              catImg = '/src/assets/images/kids_department_nano_banana.png';
            } else if (cat.id === 'undergarments') {
              catImg = '/src/assets/images/innerwear_department_new.png';
            }

            return (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/category/${cat.slug}`)}
                className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#C0654B]/15 transition-all duration-500 cursor-pointer min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] bg-stone-950 flex flex-col justify-end p-6 sm:p-8 text-white border border-stone-200/80"
              >
                {/* Background Image with smooth hover scale */}
                <img
                  src={catImg}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
                />

                {/* Ambient Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent group-hover:via-stone-950/15 transition-all duration-500" />

                {/* Department Name Only */}
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight group-hover:text-amber-200 transition-colors duration-300 drop-shadow-md">
                    {cat.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* 4. FEATURED PRODUCTS SHOWCASE WITH TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 border-b border-stone-200 pb-3 gap-4">
          <div>
            <p className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">HANDPICKED STYLES</p>
            <h2 className="text-2xl font-bold font-serif text-stone-900">Featured Collections</h2>
          </div>

          {/* TABS */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'women', label: "Women's" },
              { id: 'men', label: "Men's" },
              { id: 'kids', label: "Kids'" },
              { id: 'undergarments', label: 'Innerwear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#2B2620] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 5. SHOP BY BRAND STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">SIGNATURE HOUSES</p>
          <h2 className="text-2xl font-bold font-serif text-stone-900">Shop By Brand Label</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => onNavigate(`/category/women?brand=${brand.id}`)}
              className="p-5 bg-white border border-stone-200 rounded-xl hover:border-[#C0654B] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-14 h-14 object-cover rounded-full border border-stone-200 group-hover:scale-110 transition-transform mb-3"
              />
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-[#C0654B] transition-colors">{brand.name}</h3>
              <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">{brand.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SHOP BY OCCASION SPOTLIGHT - LUXURY REDESIGN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden border border-stone-800 space-y-8">
          
          {/* Ambient Glowing Backdrop Accents */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C0654B]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-800/80 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0654B]/20 border border-[#C0654B]/40 text-[#E0856B] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Style Rail
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-stone-100">
                Shop By Occasion
              </h2>
              <p className="text-sm sm:text-base text-stone-400 font-light">
                Hand-curated luxury ensembles crafted for grand celebrations, high-stakes boardrooms, night galas & effortless weekend living.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {occasionFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveOccasionFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                    activeOccasionFilter === filter.id
                      ? 'bg-[#C0654B] text-white shadow-lg shadow-[#C0654B]/30 ring-2 ring-[#C0654B]/50 font-semibold'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white border border-stone-700/50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Grid Layout */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOccasions.map((occ, idx) => {
                const isHeroCard = activeOccasionFilter === 'all' && idx === 0;
                return (
                  <motion.div
                    key={occ.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => onNavigate(`/category/women?occasion=${encodeURIComponent(occ.slug)}`)}
                    className={`group relative rounded-2xl overflow-hidden border border-stone-800 hover:border-[#C0654B]/80 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#C0654B]/10 ${
                      isHeroCard ? 'md:col-span-2 lg:col-span-2 min-h-[360px] lg:min-h-[420px]' : 'min-h-[360px] lg:min-h-[420px]'
                    }`}
                  >
                    {/* Background Image with Zoom on Hover */}
                    <img
                      src={occ.image}
                      alt={occ.title}
                      className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out opacity-75 group-hover:opacity-90 absolute inset-0"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent group-hover:via-stone-950/20 transition-all duration-500" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-stone-950/60 backdrop-blur-md border border-white/10 text-amber-200 shadow-xs">
                        {occ.tag}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-md text-stone-300 border border-white/5">
                        {occ.count}
                      </span>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white z-10 space-y-2">
                      <span className="text-xs font-semibold text-[#E0856B] uppercase tracking-widest font-mono">
                        {occ.subtitle}
                      </span>
                      <h3 className={`font-serif font-bold leading-tight group-hover:text-amber-200 transition-colors duration-300 ${
                        isHeroCard ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                      }`}>
                        {occ.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-300 font-light line-clamp-2 leading-relaxed opacity-90">
                        {occ.desc}
                      </p>

                      {/* Action Link */}
                      <div className="pt-3 flex items-center justify-between border-t border-white/15 mt-2">
                        <span className="text-xs font-bold text-[#C0654B] group-hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                          Explore Collection
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </span>
                        <span className="text-[10px] text-stone-400 group-hover:text-stone-200 font-mono tracking-widest uppercase">
                          Curated Edit
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom Banner Strip */}
          <div className="relative z-10 bg-stone-900/80 backdrop-blur-md rounded-xl p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#C0654B]/20 text-[#E0856B]">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200 uppercase tracking-wider">Custom Outfit Styling</p>
                <p className="text-xs text-stone-400">Need personal recommendations for a specific upcoming event?</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C0654B] to-[#a85038] hover:from-[#a85038] hover:to-[#8c3d27] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask Live Chat Assistant
            </button>
          </div>

        </div>
      </section>

      {/* 7. INSTAGRAM & COMMUNITY LOOKBOOK GALLERY - INFINITE RIGHT TO LEFT 360 MARQUEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 overflow-hidden">
        
        {/* Section Header with Social Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-5 gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-pink-300/40 text-pink-700 text-xs font-bold uppercase tracking-widest">
              <Camera className="w-3.5 h-3.5 text-pink-600" />
              #PGMARTSTYLE 360° COMMUNITY WALL
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
              Community Style Lookbook
            </h2>
            <p className="text-sm text-stone-500 font-light">
              Real fashion lovers, real moments. Tag <strong className="font-semibold text-stone-800">@pgmart.fashion</strong> on Instagram to get featured in our continuous style reel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col text-right pr-3 border-r border-stone-200 font-mono">
              <span className="text-xs font-bold text-stone-900">12.4K+ Posts</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Live Reel</span>
            </div>

            <button
              onClick={() => showToast('Tag @pgmart.fashion on Instagram or upload your outfit photo in your Account dashboard!')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2B2620] to-stone-800 hover:from-[#C0654B] hover:to-[#a85038] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-pink-300" />
              <span>Upload Your Look</span>
            </button>
          </div>
        </div>

        {/* 360° Infinite Continuous Motion Carousel (Right-to-Left) */}
        <div className="relative w-full overflow-hidden py-2 group/marquee select-none">
          <div className="flex gap-6 w-max animate-marquee">
            {/* Duplicated array to create a seamless infinite 360° loop */}
            {[...lookbookItems, ...lookbookItems].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onNavigate(item.link)}
                className="group relative rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/80 shadow-md hover:shadow-2xl hover:shadow-[#C0654B]/20 transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[420px] sm:min-h-[460px] w-[300px] sm:w-[340px] lg:w-[360px] shrink-0"
              >
                {/* Image with zoom on hover */}
                <img
                  src={item.image}
                  alt={item.outfitTitle}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
                />

                {/* Gradient Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-stone-950/60 group-hover:via-stone-950/20 transition-all duration-500" />

                {/* Top Creator Header Card */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 bg-stone-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xs">
                    <img
                      src={item.userAvatar}
                      alt={item.username}
                      className="w-7 h-7 rounded-full object-cover border border-amber-300/50"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white leading-none">@{item.username}</span>
                        {item.isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 fill-sky-400/20" />}
                      </div>
                      <span className="text-[9px] text-stone-300 font-mono flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#E0856B]" />
                        {item.location}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C0654B] text-white shadow-xs">
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Card Info & Tagged Product Banner */}
                <div className="relative z-10 p-5 space-y-3">
                  
                  {/* Outfit Info Box */}
                  <div className="bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 group-hover:border-[#C0654B]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#E0856B] uppercase tracking-widest">TAGGED STYLE</span>
                      <span className="text-xs font-black text-amber-300 font-mono">{item.productPrice}</span>
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                      {item.outfitTitle}
                    </h3>
                  </div>

                  {/* Social Stats & Shop CTA */}
                  <div className="flex items-center justify-between pt-1 text-white text-xs">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-stone-300">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                        {item.comments}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-white group-hover:text-[#E0856B] uppercase tracking-wider flex items-center gap-1 transition-colors">
                      Shop Look
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
};
