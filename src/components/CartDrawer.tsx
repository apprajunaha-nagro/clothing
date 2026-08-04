import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { AnimatePresence, motion } from 'motion/react';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQty,
    removeFromCart,
    settings,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Note: AnimatePresence handles conditional rendering — do NOT early return null here.

  const subtotal = cart.reduce((acc, item) => {
    const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
    return acc + price * item.quantity;
  }, 0);

  const freeShippingThreshold = settings.freeShippingThreshold || 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);
    setCouponError(null);
    const res = await applyCoupon(couponCode);
    setLoadingCoupon(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
    <div className="fixed inset-0 z-50 overflow-hidden text-left">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C0654B]" />
              <h2 className="text-base font-bold text-stone-900 font-serif">Your Shopping Bag</h2>
              <span className="bg-[#F3E9E4] text-[#C0654B] font-bold text-xs px-2 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FREE SHIPPING PROGRESS BAR */}
          <div className="bg-[#F3E9E4]/80 p-3 px-5 border-b border-stone-200">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
              <span className="flex items-center gap-1.5 text-[#C0654B]">
                <Truck className="w-4 h-4" />
                {remainingForFreeShipping > 0 ? (
                  <span>Add <strong>₹{remainingForFreeShipping}</strong> more for <strong>FREE Delivery</strong></span>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 You've unlocked FREE Delivery!</span>
                )}
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C0654B] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-base">Your Bag is Empty</p>
                  <p className="text-xs text-stone-500 mt-1">Explore our latest terracotta ethnic & western collection</p>
                </div>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    onNavigate('/category/women');
                  }}
                  className="bg-[#C0654B] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md hover:bg-[#8B4A38] transition-colors cursor-pointer"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
                const rawImage = item.variant.images?.[0] || item.product.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80';
                const image = getOptimizedImageUrl(rawImage, { width: 200, quality: 75 });

                return (
                  <div key={item.id} className="flex gap-3 bg-stone-50/70 p-3 rounded-xl border border-stone-200/80">
                    <img
                      src={image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover object-top rounded-lg bg-white shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1 pr-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Size: <strong className="text-stone-800">{item.selectedSize}</strong> | Color: <strong className="text-stone-800">{item.selectedColor}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-300 rounded-md bg-white">
                          <button
                            onClick={() => updateCartQty(item.id, item.quantity - 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.id, item.quantity + 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-stone-900 text-sm">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SUMMARY & CHECKOUT FOOTER */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3 pb-safe">
              {/* COUPON SECTION */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{couponDiscount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code (e.g. WELCOME100)"
                    className="flex-1 text-xs border border-stone-300 rounded-lg px-3 py-2 uppercase tracking-wider focus:outline-none focus:border-[#C0654B]"
                  />
                  <button
                    type="submit"
                    disabled={loadingCoupon}
                    className="bg-stone-900 hover:bg-[#C0654B] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}

              {/* COST BREAKDOWN */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className={remainingForFreeShipping === 0 ? 'text-emerald-700 font-bold' : ''}>
                    {remainingForFreeShipping === 0 ? 'FREE' : `₹${settings.standardShippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="text-[#C0654B]">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  onNavigate('/checkout');
                }}
                className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white text-sm font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Products | 15-Day Easy Returns</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );
};
