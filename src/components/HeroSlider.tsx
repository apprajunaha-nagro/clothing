import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useReducedMotion } from '../utils/useReducedMotion';
import { Banner } from '../types';
import { initialBanners } from '../data/seedData';

interface HeroSliderProps {
  onNavigate: (path: string) => void;
}

const AUTO_PLAY_INTERVAL = 4500; // 4.5 seconds auto-advance

export const HeroSlider: React.FC<HeroSliderProps> = ({ onNavigate }) => {
  const { banners } = useStore();
  const reducedMotion = useReducedMotion();

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Resolve Active Hero Banners from Store or Fallback Seed
  const heroSlides: Banner[] = React.useMemo(() => {
    const storeHero = banners.filter(b => b.position === 'hero' && b.isActive !== false);
    if (storeHero.length > 0) {
      return [...storeHero].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    const seedHero = initialBanners.filter(b => b.position === 'hero' && b.isActive !== false);
    return seedHero.length > 0 ? seedHero : initialBanners.slice(0, 4);
  }, [banners]);

  const slideCount = heroSlides.length;
  const currentSlide = heroSlides[activeSlideIndex] || heroSlides[0];

  // 2. Navigation Handlers
  const handleNextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setDirection(1);
    setActiveSlideIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setDirection(-1);
    setActiveSlideIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const handleGoToSlide = useCallback((index: number) => {
    if (index === activeSlideIndex) return;
    setDirection(index > activeSlideIndex ? 1 : -1);
    setActiveSlideIndex(index);
  }, [activeSlideIndex]);

  // 3. Auto-Play Timer (Pauses on Hover / Touch-Hold / Reduced Motion)
  useEffect(() => {
    if (slideCount <= 1 || isPaused || reducedMotion) return;

    const timer = setInterval(() => {
      handleNextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [slideCount, isPaused, reducedMotion, handleNextSlide]);

  // 4. Keyboard Navigation (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  if (!currentSlide || slideCount === 0) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full max-w-full overflow-hidden bg-stone-950 select-none shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-label="Sabhyata Hero Collection Slideshow"
    >
      {/* CLS PREVENTION CONTAINER: Dynamic aspect ratio & responsive height across all screen sizes */}
      <div className="relative w-full h-[220px] min-h-[220px] xs:h-[280px] sm:h-[380px] md:h-[460px] lg:h-[540px] xl:h-[600px] 2xl:h-[650px] aspect-[16/9] xs:aspect-[16/10] sm:aspect-[16/8] md:aspect-[21/9] transition-all duration-300">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentSlide.id || activeSlideIndex}
            initial={reducedMotion ? { opacity: 0 } : {
              opacity: 0,
              scale: 1.05,
            }}
            animate={reducedMotion ? { opacity: 1 } : {
              opacity: 1,
              scale: 1.0,
            }}
            exit={reducedMotion ? { opacity: 0 } : {
              opacity: 0,
              scale: 0.98,
            }}
            transition={reducedMotion ? { duration: 0.3 } : {
              opacity: { duration: 0.65, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            }}
            drag={reducedMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) handleNextSlide();
              else if (info.offset.x > 40) handlePrevSlide();
            }}
            onClick={() => onNavigate(currentSlide.link || '/category/women')}
            className="absolute inset-0 w-full h-full cursor-pointer touch-pan-y group overflow-hidden"
          >
            {/* RESPONSIVE PICTURE: Dynamically optimized for Mobile (320px–640px), Tablet (641px–1024px), Desktop (1025px+) */}
            <picture className="w-full h-full block">
              <source
                media="(max-width: 640px)"
                srcSet={getOptimizedImageUrl(currentSlide.mobileImage || currentSlide.image, { width: 800, quality: 90 })}
              />
              <source
                media="(max-width: 1024px)"
                srcSet={getOptimizedImageUrl(currentSlide.image, { width: 1200, quality: 90 })}
              />
              <img
                src={getOptimizedImageUrl(currentSlide.image, { width: 1800, quality: 92 })}
                alt={currentSlide.title || "PGmart Hero Photo Slide"}
                className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-103"
                loading={activeSlideIndex === 0 ? "eager" : "lazy"}
                // @ts-ignore
                fetchPriority={activeSlideIndex === 0 ? "high" : "auto"}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* DESKTOP FLOATING LEFT / RIGHT ARROW CONTROLS (Hidden on Mobile) */}
        {slideCount > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevSlide();
              }}
              className="hidden md:flex absolute top-1/2 left-5 -translate-y-1/2 z-30 bg-stone-900/60 hover:bg-white text-white hover:text-stone-900 w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-2xl border border-white/30 cursor-pointer items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextSlide();
              }}
              className="hidden md:flex absolute top-1/2 right-5 -translate-y-1/2 z-30 bg-stone-900/60 hover:bg-white text-white hover:text-stone-900 w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-2xl border border-white/30 cursor-pointer items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* MERAKI STYLE SLIDE COUNTER & ELONGATED PILL INDICATORS */}
        {slideCount > 1 && (
          <div className="absolute bottom-5 right-5 sm:right-10 z-30 flex items-center gap-3 bg-stone-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
            {/* Meraki Slide Counter (e.g., 01 / 04) */}
            <span className="text-white/90 font-mono font-bold text-xs tracking-wider border-r border-white/20 pr-3">
              {String(activeSlideIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
            </span>

            {/* Pause/Play status indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="text-white/80 hover:text-white cursor-pointer transition-colors p-0.5"
              aria-label={isPaused ? "Resume auto slideshow" : "Pause auto slideshow"}
              title={isPaused ? "Resume auto slideshow" : "Pause auto slideshow"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {heroSlides.map((_, idx) => {
              const isActive = activeSlideIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#C0654B] w-8 sm:w-10 shadow-xs'
                      : 'bg-white/50 hover:bg-white w-2.5'
                  }`}
                  aria-label={`Go to slide ${idx + 1} of ${slideCount}`}
                  aria-current={isActive ? 'true' : 'false'}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
