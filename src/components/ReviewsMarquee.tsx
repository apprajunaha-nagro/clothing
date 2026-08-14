import React from 'react';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, Sparkles, MessageSquare, Quote, Heart, ArrowRight } from 'lucide-react';
import { Review } from '../types';

interface ReviewsMarqueeProps {
  onNavigate?: (path: string) => void;
}

export const ReviewsMarquee: React.FC<ReviewsMarqueeProps> = ({ onNavigate }) => {
  const { reviews, products } = useStore();

  // Filter only approved reviews for public storefront
  const approvedReviews = React.useMemo(() => {
    const list = reviews.filter(r => r.status === 'approved');
    // If fewer than 4 approved, backfill so the continuous marquee stays rich and seamless
    if (list.length === 0) return [];
    return list;
  }, [reviews]);

  if (approvedReviews.length === 0) return null;

  // Duplicate list to achieve infinite seamless loop
  const marqueeItems = [...approvedReviews, ...approvedReviews, ...approvedReviews];

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-stone-50 via-[#FAF7F5] to-[#F3E9E4] border-t border-b border-stone-200 text-left">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-[#C0654B]/10 text-[#C0654B] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Buyer Experiences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 tracking-tight">
          Loved by 50,000+ Verified Customers
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-light">
          Discover why shoppers across India trust PGmart for genuine handcrafted handlooms, premium fits, and fast delivery.
        </p>
      </div>

      {/* Marquee Track Container with Gradient Edge Masks */}
      <div className="relative w-full overflow-hidden group">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAF7F5] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAF7F5] to-transparent z-10 pointer-events-none" />

        {/* Continuous Right-to-Left Animated Rail */}
        <div className="flex gap-4 sm:gap-6 animate-marquee group-hover:[animation-play-state:paused] w-max py-2 select-none">
          {marqueeItems.map((rev, idx) => {
            const product = products.find(p => p.id === rev.productId);
            return (
              <div
                key={`${rev.id}-${idx}`}
                className="w-[300px] sm:w-[360px] bg-white rounded-2xl p-5 border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 shrink-0 relative overflow-hidden group/card hover:-translate-y-1"
              >
                {/* Decorative subtle corner quote */}
                <Quote className="absolute top-3 right-3 w-8 h-8 text-[#C0654B]/10 group-hover/card:text-[#C0654B]/20 transition-colors pointer-events-none" />

                {/* Top Row: Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-stone-700 ml-1.5 font-mono">
                      {rev.rating}.0
                    </span>
                  </div>

                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                {/* Review Headline & Body Text */}
                <div className="space-y-1.5 flex-1">
                  {rev.title && (
                    <h4 className="font-bold font-serif text-stone-900 text-sm leading-snug line-clamp-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-stone-600 text-xs leading-relaxed italic line-clamp-3">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Bottom Row: Customer & Linked Product */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#C0654B]/15 text-[#C0654B] font-bold text-xs flex items-center justify-center font-serif shrink-0 shadow-2xs">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-stone-900 text-xs truncate">
                        {rev.customerName}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {product && (
                    <button
                      type="button"
                      onClick={() => onNavigate?.(`/product/${product.id}`)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#C0654B] hover:text-[#8B4A38] group-hover/card:underline cursor-pointer shrink-0 truncate max-w-[130px]"
                      title={product.name}
                    >
                      <span className="truncate">{product.name}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </section>
  );
};
