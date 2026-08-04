import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentMethod, Address } from '../types';
import { ShieldCheck, Lock, Truck, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const { cart, settings, appliedCoupon, couponDiscount, createOrder, user } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [street, setStreet] = useState('Flat 402, Lotus Apartments, Salt Lake Sector 5');
  const [city, setCity] = useState('Kolkata');
  const [stateName, setStateName] = useState('West Bengal');
  const [pincode, setPincode] = useState('700091');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('priya@upi');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
    return acc + price * item.quantity;
  }, 0);

  const freeShippingThreshold = settings.freeShippingThreshold || 999;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : settings.standardShippingFee;
  const codFee = paymentMethod === 'cod' ? settings.codFee : 0;
  const tax = Math.round(subtotal * 0.05);

  const total = Math.max(0, subtotal - couponDiscount + shippingFee + codFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      street,
      city,
      state: stateName,
      pincode,
      type: 'home'
    };

    const orderItems = cart.map(item => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: item.product.id,
      variantId: item.variant.id,
      productName: item.product.name,
      productImage: item.variant.images[0] || item.product.colors[0]?.images[0] || '',
      size: item.selectedSize,
      color: item.selectedColor,
      price: item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice,
      quantity: item.quantity
    }));

    const orderData: Partial<Order> = {
      customerId: user?.id || 'guest',
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      items: orderItems,
      subtotal,
      discount: couponDiscount,
      shippingFee,
      tax,
      total,
      paymentMethod,
      couponCode: appliedCoupon?.code
    };

    const newOrder = await createOrder(orderData);
    setLoading(false);

    if (newOrder) {
      onOrderPlaced(newOrder);
      onNavigate(`/order-confirmation/${newOrder.id}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">Your Bag is Empty</h2>
        <p className="text-xs text-stone-500">Please add clothing items to your bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/category/women')}
          className="bg-[#C0654B] text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer"
        >
          GO TO STOREFRONT
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Secure Checkout</h1>
        <p className="text-xs text-stone-500 mt-0.5">Encrypted 256-bit SSL transaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHECKOUT STEPS */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif">
                <span className="w-6 h-6 rounded-full bg-[#C0654B] text-white text-xs flex items-center justify-center">1</span>
                Shipping Address
              </span>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#C0654B] cursor-pointer">
                  Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <form onSubmit={() => setStep(2)} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address (for order updates & invoice)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Flat, House No., Building, Street</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  CONTINUE TO PAYMENT
                </button>
              </form>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>{fullName}</strong> ({phone})<br />
                {street}, {city}, {stateName} - {pincode}
              </p>
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          {step >= 2 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif border-b border-stone-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-[#C0654B] text-white text-xs flex items-center justify-center">2</span>
                Payment Options
              </span>

              <div className="space-y-3 text-xs">
                {/* UPI Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[#C0654B] bg-[#F3E9E4]/50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#C0654B]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Instant UPI (GPay, PhonePe, Paytm)</p>
                      <p className="text-[11px] text-stone-500">Fastest checkout with 0 convenience fee</p>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-3 pl-7">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter Virtual Payment Address VPA"
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 focus:outline-none focus:border-[#C0654B]"
                      />
                    </div>
                  )}
                </label>

                {/* Cards Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#C0654B] bg-[#F3E9E4]/50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#C0654B]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Credit / Debit Card</p>
                      <p className="text-[11px] text-stone-500">Visa, Mastercard, RuPay, Amex</p>
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#C0654B] bg-[#F3E9E4]/50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#C0654B]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500">Pay cash at doorstep (+₹{settings.codFee} COD fee applies)</p>
                    </div>
                  </div>
                </label>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'PROCESSING ORDER...' : `PAY ₹${total.toLocaleString('en-IN')} & PLACE ORDER`}</span>
              </button>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs h-fit">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-200 pb-3">
            Order Item Summary ({cart.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => {
              const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
              const img = item.variant.images[0] || item.product.colors[0]?.images[0] || '';
              return (
                <div key={item.id} className="flex gap-3">
                  <img src={img} alt={item.product.name} className="w-12 h-14 object-cover rounded-md bg-stone-100 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-stone-500">Qty: {item.quantity} | {item.selectedSize} / {item.selectedColor}</p>
                    <p className="font-bold text-stone-900 mt-0.5">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between">
                <span>COD Handling Charge</span>
                <span>₹{settings.codFee}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-[#C0654B]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
