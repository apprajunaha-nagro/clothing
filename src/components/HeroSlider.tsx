import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    setActiveSlideIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveSlideIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // 3. Auto-Play Timer (Pauses on Hover / Touch-Hold / Reduced Motion)
  useEffect(() => {
    if (slideCount <= 1 || isPaused || reducedMotion) return;

    const timer = setInterval(() => {
      handleNextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [slideCount, isPaused, reducedMotion, handleNextSlide]);

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
      aria-label="Hero Collection Photo Slideshow"
    >
      {/* CLS PREVENTION CONTAINER: 16:5 aspect ratio hero banner slider container */}
      <div className="relative w-full aspect-[16/5] min-h-[160px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[350px] overflow-hidden transition-all duration-300">
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
      </div>
    </section>
  );
};
