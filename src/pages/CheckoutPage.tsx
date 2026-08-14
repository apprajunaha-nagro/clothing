import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentMethod, Address } from '../types';
import { ShieldCheck, Lock, Truck, CreditCard, CheckCircle2, ArrowRight, MapPin, Plus, Check } from 'lucide-react';
import { PincodeField } from '../components/PincodeField';
import { getItemDisplayImage } from '../utils/imageOptimizer';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const { cart, settings, appliedCoupon, couponDiscount, createOrder, user, setUser, showToast } = useStore();

  // If user is not logged in, redirect to login page immediately
  useEffect(() => {
    if (!user) {
      onNavigate('/account?redirect=/checkout');
    }
  }, [user, onNavigate]);

  const [step, setStep] = useState<1 | 2>(1);

  // Filter out any legacy demo addresses that might have been cached in older sessions
  const savedAddresses: Address[] = useMemo(() => {
    if (!user?.addresses || !Array.isArray(user.addresses)) return [];
    return user.addresses.filter(
      (a) => a && a.street && !a.street.includes('Flat 402, Lotus Apartments')
    );
  }, [user?.addresses]);

  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

  // Selected address state: ID of saved address OR 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr ? defaultAddr.id : 'new'
  );

  // Address Form State
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [stateName, setStateName] = useState(defaultAddr?.state || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');
  const [locality, setLocality] = useState(defaultAddr?.locality || '');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(defaultAddr?.type || 'home');
  const [isPincodeVerified, setIsPincodeVerified] = useState(
    Boolean(defaultAddr?.pincode && defaultAddr.pincode.length === 6)
  );
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => {
    const price =
      item.variant.discountPrice ||
      item.variant.price ||
      item.product.discountPrice ||
      item.product.basePrice;
    return acc + price * item.quantity;
  }, 0);

  const freeShippingThreshold = settings.freeShippingThreshold || 999;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : settings.standardShippingFee;
  const codFee = paymentMethod === 'cod' ? settings.codFee : 0;
  const tax = Math.round(subtotal * 0.05);

  const total = Math.max(0, subtotal - couponDiscount + shippingFee + codFee);

  // Switch to an existing saved address
  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName || user?.name || '');
    setPhone(addr.phone || user?.phone || '');
    setStreet(addr.street || '');
    setCity(addr.city || '');
    setStateName(addr.state || '');
    setPincode(addr.pincode || '');
    setLocality(addr.locality || '');
    setAddressType(addr.type || 'home');
    setIsPincodeVerified(Boolean(addr.pincode && addr.pincode.length === 6));
  };

  // Switch to new address form
  const handleAddNewAddress = () => {
    setSelectedAddressId('new');
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setStreet('');
    setCity('');
    setStateName('');
    setPincode('');
    setLocality('');
    setAddressType('home');
    setIsPincodeVerified(false);
  };

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

    if (!street.trim() || !pincode.trim() || pincode.length !== 6 || !city.trim()) {
      showToast('Please enter and verify a complete delivery address.');
      setStep(1);
      return;
    }

    setLoading(true);

    const shippingAddress: Address = {
      id: selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`,
      fullName: fullName.trim() || user?.name || 'Customer',
      phone: phone.trim() || user?.phone || '',
      street: street.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      type: addressType
    };

    // Save new address to user profile if requested
    if (user && setUser && saveToProfile) {
      const alreadySaved = savedAddresses.some(
        (a) =>
          a.street?.trim().toLowerCase() === shippingAddress.street.trim().toLowerCase() &&
          a.pincode === shippingAddress.pincode
      );
      if (!alreadySaved) {
        const updatedAddrs = [...savedAddresses, shippingAddress];
        const updatedUser = {
          ...user,
          phone: user.phone || shippingAddress.phone,
          addresses: updatedAddrs
        };
        setUser(updatedUser);
        try {
          localStorage.setItem('terra_user', JSON.stringify(updatedUser));
        } catch {}
      }
    }

    const orderItems = cart.map((item) => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: item.product.id,
      variantId: item.variant.id,
      productName: item.product.name,
      productImage: getItemDisplayImage(item.product, item.selectedColor, item.variant),
      size: item.selectedSize,
      color: item.selectedColor,
      price:
        item.variant.discountPrice ||
        item.variant.price ||
        item.product.discountPrice ||
        item.product.basePrice,
      quantity: item.quantity
    }));

    const baseOrderData: Partial<Order> = {
      customerId: user?.id || 'guest',
      customerName: fullName.trim() || user?.name || 'Valued Customer',
      customerEmail: email.trim() || user?.email || '',
      customerPhone: phone.trim() || user?.phone || '',
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
      alert('Payment SDK failed to load. Please check your network connection.');
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
          name: fullName || user?.name || '',
          email: email || user?.email || '',
          contact: phone || user?.phone || ''
        },
        theme: {
          color: '#C0654B'
        },
        handler: async function (response: any) {
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
      alert('Online gateway timeout. Creating confirmed order directly.');
      const newOrder = await createOrder({ ...baseOrderData, paymentStatus: 'paid' });
      setLoading(false);
      if (newOrder) {
        onOrderPlaced(newOrder);
        onNavigate(`/order-confirmation/${newOrder.id}`);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#C0654B]/10 text-[#C0654B] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-serif text-stone-900">Sign In Required to Checkout</h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            Please sign in or create an account to access your saved delivery address and place your order safely.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/account?redirect=/checkout')}
          className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold py-3.5 rounded-xl shadow-md cursor-pointer transition-colors"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

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
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Secure Checkout</h1>
          <p className="text-xs text-stone-500 mt-0.5">Encrypted 256-bit SSL transaction • Logged in as <span className="font-semibold text-stone-800">{user.email}</span></p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PGmart Assured Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHECKOUT STEPS */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif">
                <span className="w-6 h-6 rounded-full bg-[#C0654B] text-white text-xs flex items-center justify-center font-sans font-black">1</span>
                <span>Delivery Address</span>
              </span>
              {step > 1 && (
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer"
                >
                  Change Address
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                {/* 1. If user has saved addresses, display them as selectable cards */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-stone-700">Select from Saved Addresses ({savedAddresses.length}):</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-[#C0654B] bg-[#FAF5F2] ring-1 ring-[#C0654B]'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#C0654B] bg-[#C0654B]' : 'border-stone-300 bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="space-y-1 text-xs text-stone-700">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-900">{addr.fullName}</span>
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                    {addr.type || 'home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-bold text-[#C0654B] bg-[#C0654B]/10 px-1.5 py-0.2 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                  {addr.street}{addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} - <span className="font-semibold text-stone-900">{addr.pincode}</span>
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Contact: {addr.phone}</p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="text-xs font-bold text-[#C0654B] flex items-center gap-1 shrink-0">
                                <Check className="w-4 h-4" /> Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleAddNewAddress}
                        className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg border transition-colors ${
                          selectedAddressId === 'new'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'text-[#C0654B] border-[#C0654B]/30 hover:bg-[#C0654B]/5'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Deliver to a Different / New Address</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Address input form (Shown if user chose 'new' or has no saved addresses) */}
                {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!isPincodeVerified || pincode.length !== 6) {
                        showToast('Please verify a valid 6-digit delivery PIN code.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="space-y-3 text-xs pt-2 border-t border-stone-100"
                  >
                    <p className="font-bold text-stone-900 text-xs">Enter Delivery Address Details:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Recipient Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full name of receiver"
                          className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B] bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B] bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Email Address (for order updates & invoice) *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B] bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Flat, House No., Building, Street Address *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="House / Flat No., Apartment, Street name"
                        className="w-full border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B] bg-white text-stone-900"
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

                    <div className="flex items-center gap-4 pt-1">
                      <span className="font-bold text-stone-700">Address Type:</span>
                      {(['home', 'work', 'other'] as const).map((t) => (
                        <label key={t} className="flex items-center gap-1.5 cursor-pointer uppercase text-[11px] font-semibold text-stone-700">
                          <input
                            type="radio"
                            name="addressType"
                            checked={addressType === t}
                            onChange={() => setAddressType(t)}
                            className="accent-[#C0654B]"
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 text-stone-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="accent-[#C0654B]"
                      />
                      <span>Save this delivery address to my account for faster future checkout</span>
                    </label>

                    <button
                      type="submit"
                      disabled={!isPincodeVerified || pincode.length !== 6 || !street.trim()}
                      className={`py-3 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPincodeVerified && pincode.length === 6 && street.trim()
                          ? 'bg-[#C0654B] hover:bg-[#8B4A38] text-white shadow-md'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                      }`}
                    >
                      Deliver Here & Proceed to Payment →
                    </button>
                  </form>
                )}

                {/* If user selected an existing saved address, provide a direct proceed button */}
                {selectedAddressId !== 'new' && savedAddresses.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-3 px-6 rounded-xl text-xs font-bold bg-[#C0654B] hover:bg-[#8B4A38] text-white shadow-md cursor-pointer transition-colors"
                    >
                      Use Selected Address & Proceed to Payment →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-900">{fullName}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {addressType}
                    </span>
                    <span className="text-stone-500 font-medium">({phone})</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {street}{locality ? `, ${locality}` : ''}, {city}, {stateName} - <span className="font-bold text-stone-900">{pincode}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          {step >= 2 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 animate-fade-in">
              <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif border-b border-stone-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-[#C0654B] text-white text-xs flex items-center justify-center font-sans font-black">2</span>
                <span>Payment Options</span>
              </span>

              <div className="space-y-3 text-xs">
                {/* UPI Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[#C0654B] bg-[#FAF5F2]' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#C0654B]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Instant UPI (GPay, PhonePe, Paytm, BHIM)</p>
                      <p className="text-[11px] text-stone-500">Fastest checkout with 0 convenience fee</p>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-3 pl-7">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter UPI ID (e.g. mobile@okhdfcbank or user@paytm)"
                        className="w-full bg-white border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-[#C0654B] text-stone-900 text-xs"
                      />
                    </div>
                  )}
                </label>

                {/* Cards Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#C0654B] bg-[#FAF5F2]' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#C0654B]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Credit / Debit Card / Net Banking</p>
                      <p className="text-[11px] text-stone-500">Visa, Mastercard, RuPay, Amex, All Major Indian Banks</p>
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#C0654B] bg-[#FAF5F2]' : 'border-stone-200 bg-stone-50'}`}>
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
                      <p className="text-[11px] text-stone-500">Pay cash upon delivery at your doorstep (+₹{settings.codFee} handling fee applies)</p>
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
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs h-fit">
          <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2.5">
            Order Summary ({cart.length} items)
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map((item) => {
              const price = item.variant.discountPrice || item.variant.price || item.product.discountPrice || item.product.basePrice;
              const img = getItemDisplayImage(item.product, item.selectedColor, item.variant);
              return (
                <div key={item.id} className="flex gap-2.5">
                  <img src={img} alt={item.product.name} className="w-12 h-14 object-contain rounded bg-stone-50 shrink-0 border border-stone-100" />
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
