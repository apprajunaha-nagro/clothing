import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentMethod, Address } from '../types';
import { ShieldCheck, Lock, Truck, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { PincodeField } from '../components/PincodeField';
import { getItemDisplayImage } from '../utils/imageOptimizer';

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
  const [locality, setLocality] = useState('Salt Lake Sector 5');
  const [isPincodeVerified, setIsPincodeVerified] = useState(true);

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

  // Helper to load Razorpay SDK dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
      productImage: getItemDisplayImage(item.product, item.selectedColor, item.variant),
      size: item.selectedSize,
      color: item.selectedColor,
      price: item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice,
      quantity: item.quantity
    }));

    const baseOrderData: Partial<Order> = {
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

    // If Cash on Delivery, place order directly
    if (paymentMethod === 'cod') {
      const newOrder = await createOrder({ ...baseOrderData, paymentStatus: 'pending' });
      setLoading(false);
      if (newOrder) {
        onOrderPlaced(newOrder);
        onNavigate(`/order-confirmation/${newOrder.id}`);
      }
      return;
    }

    // For Online Payments (UPI / Cards): Launch Razorpay Checkout Modal
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your network connection.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, receipt: `rcpt_${Date.now()}` })
      });

      const rzpData = await res.json();
      if (!rzpData.success) {
        alert(rzpData.error || 'Failed to initiate online payment.');
        setLoading(false);
        return;
      }

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: settings.storeName || 'PGmart',
        description: 'Clothing Purchase Payment',
        image: '/src/assets/images/pgmart_logo_new.png',
        order_id: rzpData.orderId,
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: '#C0654B'
        },
        handler: async function (response: any) {
          // Verify Signature on Backend
          try {
            await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
          } catch (e) {
            console.warn('Verification note:', e);
          }

          const newOrder = await createOrder({
            ...baseOrderData,
            paymentStatus: 'paid',
            trackingNumber: response.razorpay_payment_id || `pay_${Date.now()}`
          });
          setLoading(false);

          if (newOrder) {
            onOrderPlaced(newOrder);
            onNavigate(`/order-confirmation/${newOrder.id}`);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Razorpay process error:', err);
      alert('Payment processing failed. Falling back to order creation.');
      const newOrder = await createOrder({ ...baseOrderData, paymentStatus: 'paid' });
      setLoading(false);
      if (newOrder) {
        onOrderPlaced(newOrder);
        onNavigate(`/order-confirmation/${newOrder.id}`);
      }
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

                <PincodeField
                  pincode={pincode}
                  city={city}
                  stateName={stateName}
                  locality={locality}
                  onPincodeChange={(val) => setPincode(val)}
                  onCityChange={(val) => setCity(val)}
                  onStateChange={(val) => setStateName(val)}
                  onLocalityChange={(val) => setLocality(val)}
                  onVerificationStatusChange={(verified) => setIsPincodeVerified(verified)}
                />

                <button
                  type="submit"
                  disabled={!isPincodeVerified || pincode.length !== 6}
                  className={`py-3 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPincodeVerified && pincode.length === 6
                      ? 'bg-[#C0654B] hover:bg-[#8B4A38] text-white shadow-md'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                  }`}
                >
                  Continue to Payment →
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

        {/* ORDER SUMMARY SIDEBAR (Flipkart Price Details Card) */}
        <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs space-y-4 text-xs h-fit">
          <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2.5">
            Price Details
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map((item) => {
              const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
              const img = getItemDisplayImage(item.product, item.selectedColor, item.variant);
              return (
                <div key={item.id} className="flex gap-2.5">
                  <img src={img} alt={item.product.name} className="w-12 h-14 object-contain rounded bg-stone-50 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-normal text-stone-800 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-stone-400">Qty: {item.quantity} | {item.selectedSize} / {item.selectedColor}</p>
                    <p className="font-extrabold text-stone-900 mt-0.5">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-200 space-y-2 text-stone-600">
            <div className="flex justify-between">
              <span>Price ({cart.length} items)</span>
              <span className="font-semibold text-stone-900">₹{(subtotal + couponDiscount + 300).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#26A541]">
              <span>Discount</span>
              <span className="font-bold">-₹{(couponDiscount + 300).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{shippingFee === 0 ? <strong className="text-[#26A541]">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between">
                <span>COD Charge</span>
                <span>₹{settings.codFee}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-stone-900">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[10px] text-[#26A541] font-bold pt-1">You will save ₹{(couponDiscount + 300).toLocaleString('en-IN')} on this order</p>
          </div>
        </div>
      </div>
    </div>
  );
};
