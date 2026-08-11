import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Pause, Play } from 'lucide-react';
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
      {/* CLS PREVENTION CONTAINER: Reserved aspect ratio height */}
      <div className="relative w-full h-[360px] xs:h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] xl:h-[640px] md:aspect-[21/9]">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={currentSlide.id || activeSlideIndex}
            custom={direction}
            initial={(dir: number) => reducedMotion ? { opacity: 0 } : {
              x: dir > 0 ? '100%' : '-100%',
              scale: 1.08,
              opacity: 0.8
            }}
            animate={reducedMotion ? { opacity: 1 } : {
              x: '0%',
              scale: 1.0,
              opacity: 1
            }}
            exit={(dir: number) => reducedMotion ? { opacity: 0 } : {
              x: dir > 0 ? '-100%' : '100%',
              scale: 0.94,
              opacity: 0.8
            }}
            transition={reducedMotion ? { duration: 0.2 } : {
              x: { type: 'spring', stiffness: 260, damping: 26 },
              scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.4 }
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
            {/* RESPONSIVE PICTURE: Separate Mobile & Desktop Optimized Assets */}
            <picture className="w-full h-full block">
              {currentSlide.mobileImage && (
                <source
                  media="(max-width: 640px)"
                  srcSet={getOptimizedImageUrl(currentSlide.mobileImage, { width: 800, quality: 85 })}
                />
              )}
              <img
                src={getOptimizedImageUrl(currentSlide.image, { width: 1600, quality: 90 })}
                alt={currentSlide.title || "Sabhyata Hero Slide"}
                className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
                loading={activeSlideIndex === 0 ? "eager" : "lazy"}
                // @ts-ignore
                fetchPriority={activeSlideIndex === 0 ? "high" : "auto"}
              />
            </picture>

            {/* SABHYATA ELEGANT GRADIENT OVERLAY (Guarantees text legibility on all photos) */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent pointer-events-none z-10" />

            {/* OVERLAY CONTENT (Collection Name + Text + CTA Button) */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-14 z-20 flex flex-col items-start justify-end max-w-4xl text-left pointer-events-none space-y-2 sm:space-y-3">
              {currentSlide.subtitle && (
                <motion.span
                  initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="bg-[#C0654B] text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-sm shadow-md uppercase tracking-widest inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 fill-white text-white" />
                  <span>{currentSlide.subtitle}</span>
                </motion.span>
              )}

              {currentSlide.title && (
                <motion.h2
                  initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-serif text-white tracking-tight drop-shadow-lg leading-tight"
                >
                  {currentSlide.title}
                </motion.h2>
              )}

              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="pt-2 pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(currentSlide.link || '/category/women');
                  }}
                  className="bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-xl flex items-center gap-2 cursor-pointer uppercase tracking-wider transition-all hover:scale-105 active:scale-95 group/btn"
                >
                  <span>{currentSlide.buttonText || 'Discover Collection'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C0654B] group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
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
              className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 z-30 bg-white/75 hover:bg-white text-stone-900 w-11 h-11 lg:w-13 lg:h-13 rounded-full shadow-xl border border-white/60 cursor-pointer items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6 text-stone-900" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextSlide();
              }}
              className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 z-30 bg-white/75 hover:bg-white text-stone-900 w-11 h-11 lg:w-13 lg:h-13 rounded-full shadow-xl border border-white/60 cursor-pointer items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6 text-stone-900" />
            </button>
          </>
        )}

        {/* SABHYATA ELONGATED PILL INDICATORS & AUTO-PLAY PAUSE TOGGLE */}
        {slideCount > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-stone-950/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
            {/* Pause/Play status indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="text-white/80 hover:text-white mr-1 cursor-pointer transition-colors p-0.5"
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
