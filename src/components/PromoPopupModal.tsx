import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, X, Gift, ArrowRight } from 'lucide-react';

interface PromoPopupModalProps {
  onNavigate?: (path: string) => void;
}

export const PromoPopupModal: React.FC<PromoPopupModalProps> = ({ onNavigate }) => {
  const { settings, coupons } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExitPopup, setIsExitPopup] = useState(false);

  // Welcome Popup Timer
  useEffect(() => {
    if (settings.promoPopupEnabled === false) return;
    const dismissed = sessionStorage.getItem('pgmart_promo_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setIsExitPopup(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [settings.promoPopupEnabled]);

  // Exit Intent Listener
  useEffect(() => {
    if (!settings.exitPopupEnabled) return;
    const exitDismissed = sessionStorage.getItem('pgmart_exit_dismissed');
    if (exitDismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
        setIsExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [settings.exitPopupEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    if (isExitPopup) {
      sessionStorage.setItem('pgmart_exit_dismissed', 'true');
    } else {
      sessionStorage.setItem('pgmart_promo_dismissed', 'true');
    }
  };

  const handleClaim = () => {
    handleClose();
    if (onNavigate) {
      onNavigate('/category/women?tag=deal_of_the_day');
    }
  };

  if (!isOpen) return null;

  const activeCoupon = coupons.find(c => c.isActive) || { code: 'FESTIVE20' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-[#C0654B] to-[#8B4A38] p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
            <Gift className="w-6 h-6 text-amber-200" />
          </div>
          <span className="inline-block bg-white/20 backdrop-blur-xs text-[10px] font-extrabold tracking-widest uppercase px-3 py-0.5 rounded-full">
            {isExitPopup ? 'WAIT! SPECIAL DISCOUNT BEFORE YOU GO' : 'EXCLUSIVE WELCOME GIFT'}
          </span>
          <h3 className="text-xl font-bold font-serif leading-tight">
            {isExitPopup
              ? 'Don’t leave empty handed!'
              : (settings.popupTitle || 'Festive Grand Bonanza! 🎉')}
          </h3>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs font-semibold text-stone-600">
          <p className="text-sm font-medium text-stone-700 leading-relaxed">
            {isExitPopup
              ? 'Use coupon code below for instant flat discount + FREE Express Delivery to your doorstep.'
              : (settings.popupOffer || 'Get Flat 20% off on your first traditional ethnic wear order.')}
          </p>

          {/* Coupon Code Strip */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3 flex items-center justify-between gap-3 text-stone-900">
            <div className="text-left">
              <span className="text-[10px] text-amber-800 font-mono uppercase font-bold block">Exclusive Promo Code</span>
              <span className="text-base font-mono font-black text-[#C0654B] tracking-wider">{activeCoupon.code}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(activeCoupon.code);
              }}
              className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-[11px] font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Copy Code
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleClaim}
              className="w-full py-3 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Explore Festive Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="text-[11px] text-stone-400 hover:text-stone-600 font-medium py-1 cursor-pointer"
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
