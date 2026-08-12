import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Order, Address } from '../types';
import { 
  User as UserIcon, Package, Heart, MapPin, CreditCard, Settings, LogOut, 
  LayoutDashboard, ChevronRight, Check, Plus, Edit2, Trash2, ShieldCheck, 
  Crown, Clock, CheckCircle2, Truck, AlertTriangle, AlertCircle, X, Lock, Bell, Sparkles, ShoppingBag, RotateCcw, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PincodeField } from '../components/PincodeField';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

type TabType = 'overview' | 'orders' | 'returns' | 'wishlist' | 'addresses' | 'profile' | 'payments' | 'settings' | 'logout';

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, setUser, orders, wishlist, products, showToast, addToCart, toggleWishlist, logoutUser, loginUser, requestOrderReturn, updateOrderStatus } = useStore();
  
  // Read tab from query string if available (e.g. /account?tab=wishlist)
  const queryTab = new URLSearchParams(window.location.search).get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(queryTab || 'overview');

  // Auth form state for logged-out state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // ─── STATE FOR ADDRESS MANAGEMENT ──────────────────────────────────────────
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      fullName: user?.name || 'Priya Sharma',
      phone: user?.phone || '+91 98765 43210',
      street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      type: 'home',
      isDefault: true
    },
    {
      id: 'addr-2',
      fullName: user?.name || 'Priya Sharma',
      phone: user?.phone || '+91 98765 43210',
      street: 'Kapda Patti, Jharia',
      city: 'Dhanbad',
      state: 'Jharkhand',
      pincode: '828111',
      type: 'work',
      isDefault: false
    }
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    locality: '',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false
  });
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);
  const [addressFormError, setAddressFormError] = useState<string | null>(null);

  // ─── STATE FOR PROFILE FORM ────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Priya Sharma',
    email: user?.email || 'priya.sharma@example.com',
    phone: user?.phone || '+91 98765 43210',
    gender: user?.gender || 'Female',
    dob: user?.dob || '1996-08-15'
  });

  // ─── STATE FOR PAYMENT METHODS ────────────────────────────────────────────
  const [savedPayments, setSavedPayments] = useState([
    { id: 'pay-1', type: 'UPI', details: 'priya.sharma@okicici', default: true },
    { id: 'pay-2', type: 'HDFC Bank Credit Card', details: '•••• •••• •••• 4242', expiry: '08/28', default: false }
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');

  // ─── STATE FOR ACCOUNT SETTINGS ───────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [notifications, setNotifications] = useState({ orderUpdates: true, promoEmail: true, whatsappOffers: true });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ─── STATE FOR ORDER DETAIL VIEW ──────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);

  // Wishlist Products list
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // ─── ADDRESS HANDLERS ──────────────────────────────────────────────────────
  const handleOpenAddressModal = (addr?: Address) => {
    setAddressFormError(null);
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        locality: addr.locality || '',
        type: addr.type,
        isDefault: !!addr.isDefault
      });
      setIsPincodeVerified(addr.pincode.length === 6);
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: user?.name || '',
        phone: user?.phone || '+91 98765 43210',
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        locality: '',
        type: 'home',
        isDefault: addresses.length === 0
      });
      setIsPincodeVerified(false);
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressFormError(null);

    // Step 1: Mandatory basic fields check
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street) {
      setAddressFormError('Please fill in all required fields (Name, Phone, Street Address).');
      return;
    }

    // Step 2: Mandatory 6-digit pincode check & API verification
    if (addressForm.pincode.length !== 6 || !isPincodeVerified) {
      setAddressFormError('Please enter a valid, verified pincode before continuing.');
      return;
    }

    // Step 3: Mandatory Locality/Area check
    if (!addressForm.locality) {
      setAddressFormError('Please select your locality from the list.');
      return;
    }

    // Step 4: Defensive check for city & state
    if (!addressForm.city || !addressForm.state) {
      setAddressFormError("Your address details don't match this pincode. Please re-verify.");
      return;
    }

    let updatedAddrs = [...addresses];
    if (addressForm.isDefault) {
      updatedAddrs = updatedAddrs.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updatedAddrs = updatedAddrs.map(a => 
        a.id === editingAddress.id ? { ...a, ...addressForm } : a
      );
      showToast('Address updated successfully!');
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        ...addressForm
      };
        updatedAddrs.push(newAddr);
        showToast('New delivery address added!');
    }

    setAddresses(updatedAddrs);
    if (setUser) {
      setUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev, addresses: updatedAddrs };
        try { localStorage.setItem('terra_user', JSON.stringify(updatedUser)); } catch {}
        return updatedUser;
      });
    }
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    if (setUser) {
      setUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev, addresses: updated };
        try { localStorage.setItem('terra_user', JSON.stringify(updatedUser)); } catch {}
        return updatedUser;
      });
    }
    showToast('Address removed.');
  };

  // ─── PROFILE UPDATE HANDLER ────────────────────────────────────────────────
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile details updated successfully!');
  };

  // ─── PASSWORD UPDATE HANDLER ──────────────────────────────────────────────
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('New passwords do not match!');
      return;
    }
    showToast('Password changed successfully.');
    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
  };

  // ─── STATE FOR ORDER RETURN / EXCHANGE MODAL ──────────────────────────────────────────
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [returnReason, setReturnReason] = useState('Size too small / large');
  const [exchangeSize, setExchangeSize] = useState('M');
  const [exchangeColor, setExchangeColor] = useState('');
  const [returnComments, setReturnComments] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: Heart },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile Details', icon: UserIcon },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  // ─── IF LOGGED OUT: DISPLAY SIGN IN / CREATE ACCOUNT CHOICE ───────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] font-sans text-left py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Branding Banner */}
          <div className="bg-[#2B2620] text-white p-8 rounded-3xl shadow-xl text-center space-y-3 relative overflow-hidden border border-stone-800">
            <div className="w-14 h-14 rounded-full bg-[#C0654B] text-white font-bold text-xl flex items-center justify-center font-serif mx-auto shadow-md">
              PG
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-100">Welcome to PGmart</h1>
            <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
              Sign in or create an account to track orders, manage delivery addresses, and redeem Terra Club loyalty points.
            </p>
          </div>

          {/* Auth Card Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            {/* Mode Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#C0654B] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#C0654B] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!signInEmail) {
                    setAuthError('Please enter your email or phone number.');
                    return;
                  }
                  loginUser('Priya Sharma', signInEmail, '+91 98765 43210');
                  showToast('Welcome back! Signed in successfully.');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Email Address or Phone Number</label>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="priya.sharma@example.com or 9876543210"
                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <label className="flex items-center gap-1.5 font-medium text-stone-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#C0654B]" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => showToast('Password reset link sent to your email!')} className="text-[#C0654B] font-bold hover:underline cursor-pointer">
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                >
                  Sign In to Account
                </button>
              </form>
            ) : (
              /* CREATE NEW ACCOUNT FORM */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (signUpPassword && signUpPassword !== signUpConfirmPassword) {
                    setAuthError('Passwords do not match.');
                    return;
                  }
                  loginUser(signUpName || 'New Member', signUpEmail || 'user@pgmart.in', signUpPhone || '+91 98765 43210');
                  showToast('Account created successfully! Welcome to PGmart.');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Ananya Roy"
                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Mobile Phone (+91) *</label>
                  <input
                    type="text"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#C0654B] text-stone-900 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                >
                  Create PGmart Account
                </button>
              </form>
            )}

            {/* Express Demo Login CTA */}
            <div className="pt-4 border-t border-stone-100 text-center space-y-3">
              <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block">Or Express 1-Click Login</span>
              <button
                type="button"
                onClick={() => {
                  loginUser('Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210');
                  showToast('Signed in as Demo User Priya Sharma!');
                }}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-stone-300 flex items-center justify-center gap-2"
              >
                <span>⚡ Express Demo Login (Priya Sharma)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] font-sans text-left pb-16">
      {/* PAGE HEADER STRIP */}
      <div className="bg-[#2B2620] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#C0654B] uppercase tracking-widest">MY ACCOUNT</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-100">User Dashboard</h1>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-[#C0654B]/20 text-[#E0856B] hover:bg-[#C0654B] hover:text-white px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#C0654B]/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* ─── SIDEBAR NAVIGATION (Collapses into horizontal scroll bar on mobile) ─── */}
          <aside className="md:col-span-3 w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-2 sm:p-3 overflow-hidden">
            {/* User Mini Avatar Header */}
            <div className="p-3 border-b border-stone-100 mb-2 hidden md:flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#C0654B] text-white font-bold font-serif text-lg flex items-center justify-center border-2 border-stone-200 shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-stone-900 text-sm truncate">{user?.name}</h3>
                <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Tabs list */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar py-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                const isLogout = t.id === 'logout';

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLogout) {
                        setIsLogoutModalOpen(true);
                      } else {
                        setActiveTab(t.id as TabType);
                        setSelectedOrder(null);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#C0654B] text-white shadow-md'
                        : isLogout
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isLogout ? 'text-red-500' : 'text-[#C0654B]'}`} />
                      <span>{t.label}</span>
                    </span>
                    <ChevronRight className={`w-4 h-4 hidden md:block opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ─── MAIN CONTENT DISPLAY AREA ─── */}
          <main className="md:col-span-9 w-full space-y-6">
            <AnimatePresence mode="wait">
              
              {/* 1. OVERVIEW SECTION */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* HERO MEMBER CARD */}
                  <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-stone-800">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#C0654B] text-white font-bold text-2xl flex items-center justify-center font-serif shadow-md border-2 border-stone-700 shrink-0">
                        {user?.name.charAt(0) || 'U'}
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold font-serif">{user?.name}</h2>
                        <p className="text-xs text-stone-300">{user?.email} • {profileForm.phone}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            <Crown className="w-3 h-3 text-amber-400" />
                            PGMART GOLD CLUB MEMBER
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">Member since 2026</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-800/90 p-4 rounded-2xl border border-stone-700 text-center min-w-[200px] shadow-inner">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Loyalty Rewards</p>
                      <p className="text-3xl font-extrabold text-[#C0654B]">{user?.points || 350} <span className="text-xs text-amber-400 font-bold">PTS</span></p>
                      <p className="text-[10px] text-stone-400 mt-0.5">₹{(user?.points || 350)} voucher ready to redeem</p>
                    </div>
                  </div>

                  {/* QUICK STATS CARDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                      onClick={() => setActiveTab('orders')}
                      className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-[#C0654B] transition-all cursor-pointer space-y-1 group"
                    >
                      <p className="text-stone-500 text-xs font-bold">Total Orders</p>
                      <p className="text-2xl font-extrabold text-stone-900 group-hover:text-[#C0654B]">{orders.length}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">1 active shipment</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('wishlist')}
                      className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-[#C0654B] transition-all cursor-pointer space-y-1 group"
                    >
                      <p className="text-stone-500 text-xs font-bold">Wishlist Items</p>
                      <p className="text-2xl font-extrabold text-stone-900 group-hover:text-[#C0654B]">{wishlist.length}</p>
                      <p className="text-[10px] text-stone-400">Saved items</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('addresses')}
                      className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-[#C0654B] transition-all cursor-pointer space-y-1 group"
                    >
                      <p className="text-stone-500 text-xs font-bold">Saved Addresses</p>
                      <p className="text-2xl font-extrabold text-stone-900 group-hover:text-[#C0654B]">{addresses.length}</p>
                      <p className="text-[10px] text-stone-400">Primary: Dhanbad</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('profile')}
                      className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-[#C0654B] transition-all cursor-pointer space-y-1 group"
                    >
                      <p className="text-stone-500 text-xs font-bold">Account Health</p>
                      <p className="text-2xl font-extrabold text-emerald-600">100%</p>
                      <p className="text-[10px] text-stone-400">Verified Profile</p>
                    </div>
                  </div>

                  {/* RECENT ORDERS QUICK SECTION */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold font-serif text-stone-900 text-base">Recent Orders</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer"
                      >
                        View All Orders ({orders.length}) →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-stone-500">No recent orders found.</p>
                    ) : (
                      <div className="space-y-3 text-xs">
                        {orders.slice(0, 2).map((ord) => (
                          <div key={ord.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-stone-900">Order #{ord.orderNumber}</p>
                              <p className="text-stone-500 text-[11px]">Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-stone-900">₹{ord.total.toLocaleString('en-IN')}</span>
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. MY ORDERS SECTION */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-900">My Orders & Shipments</h2>
                      <p className="text-xs text-stone-500">Track live orders and view order history.</p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 text-base">No Orders Placed Yet</h3>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          Looks like you haven't placed any fashion orders yet. Explore our handcrafted sarees and ethnic wear!
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('/category/women')}
                        className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    orders.map((order) => {
                      const isExpanded = selectedOrder?.id === order.id;

                      return (
                        <div key={order.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5 text-xs">
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                            <div>
                              <span className="font-bold text-stone-900 text-sm font-serif">Order #{order.orderNumber}</span>
                              <p className="text-stone-500 text-[11px]">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-stone-900 text-base">₹{order.total.toLocaleString('en-IN')}</span>
                              <span className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* INTERACTIVE TRACKING STEPPER TIMELINE */}
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
                            <p className="font-bold text-stone-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#C0654B]" /> Courier Tracking Timeline
                            </p>

                            <div className="grid grid-cols-5 gap-1 text-center relative py-2">
                              {['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                const activeIndex = order.status === 'delivered' ? 4 : order.status === 'shipped' ? 2 : 1;
                                const isDone = idx <= activeIndex;

                                return (
                                  <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                                      isDone ? 'bg-[#C0654B] text-white shadow-xs' : 'bg-stone-200 text-stone-500'
                                    }`}>
                                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ORDER ITEMS THUMBNAILS */}
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/60 border border-stone-100">
                                <div className="flex items-center gap-3">
                                  <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-stone-200 shrink-0" />
                                  <div>
                                    <p className="font-bold text-stone-900">{item.productName}</p>
                                    <p className="text-stone-500 text-[11px]">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                            <button
                              onClick={() => setSelectedOrder(isExpanded ? null : order)}
                              className="text-stone-700 hover:text-[#C0654B] font-bold text-xs underline cursor-pointer"
                            >
                              {isExpanded ? 'Hide Details' : 'View Full Details & Address'}
                            </button>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. CANCEL ORDER BUTTON: Active until order is shipped (pending, confirmed, processing) */}
                              {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`CONFIRM ORDER CANCELLATION:\n\nAre you sure you want to CANCEL Order #${order.orderNumber}? This will cancel your order.`)) {
                                      updateOrderStatus(order.id, 'cancelled');
                                      showToast(`Order #${order.orderNumber} has been cancelled successfully.`);
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-2xs"
                                >
                                  <span>Cancel Order</span>
                                </button>
                              )}

                              {/* 2. SHIPPED STATUS BADGE: Cancel button automatically turns off once admin ships product */}
                              {order.status === 'shipped' && (
                                <span className="bg-sky-50 text-sky-800 border border-sky-300 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Shipped & In Transit (Cancellation Closed)</span>
                                </span>
                              )}

                              {/* 3. DELIVERED STATUS: Only Return Request option opens */}
                              {order.status === 'delivered' && (
                                order.returnStatus && order.returnStatus !== 'none' ? (
                                  <span className={`font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 border ${
                                    order.returnStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                    order.returnStatus === 'rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                                    'bg-amber-50 text-amber-900 border-amber-300'
                                  }`}>
                                    <RotateCcw className="w-3.5 h-3.5 text-[#C0654B]" />
                                    <span>
                                      ↩ Return Requested ({order.returnStatus.replace('_', ' ').toUpperCase()})
                                    </span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setReturnModalOrder(order)}
                                    className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Request Return</span>
                                  </button>
                                )
                              )}

                              {/* 4. CANCELLED STATUS BADGE */}
                              {order.status === 'cancelled' && (
                                <span className="bg-red-50 text-red-800 border border-red-200 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1">
                                  <span>❌ Order Cancelled</span>
                                </span>
                              )}

                              <button
                                onClick={() => onNavigate(`/order-confirmation/${order.id}`)}
                                className="bg-[#2B2620] hover:bg-[#C0654B] text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs"
                              >
                                View Tax Invoice
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED DETAILS */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-stone-200 text-stone-700 space-y-2 bg-stone-50 p-4 rounded-xl">
                              <p className="font-bold text-stone-900">Shipping Address:</p>
                              <p className="text-stone-600">{order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                              <p className="text-stone-600 font-mono">Payment Method: {order.paymentMethod.toUpperCase()}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* 2.5. RETURNS & EXCHANGES SECTION */}
              {activeTab === 'returns' && (
                <motion.div
                  key="returns"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-900">Returns & Refund Requests</h2>
                      <p className="text-xs text-stone-500">Track active return requests and eligible delivered items (7-Day Hassle-Free Policy).</p>
                    </div>
                  </div>

                  {/* Summary policy box */}
                  <div className="bg-gradient-to-r from-stone-900 to-[#2B2620] text-white p-5 rounded-3xl border border-stone-800 shadow-md flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C0654B] text-white flex items-center justify-center shrink-0">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">7-Day Free Pickup Guarantee</h4>
                        <p className="text-[11px] text-stone-300">Instant refund directly to your original payment method or UPI bank account.</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] bg-white/10 text-stone-200 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/10 shrink-0">
                      Zero Return Charges
                    </span>
                  </div>

                  {/* Return Eligible Orders List */}
                  {orders.filter(o => o.status === 'delivered' || (o.returnStatus && o.returnStatus !== 'none')).length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                        <RotateCcw className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 text-base">No Return Eligible Delivered Packages</h3>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          Return requests become active once your package is delivered to your address.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        View Order Status
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.filter(o => o.status === 'delivered' || (o.returnStatus && o.returnStatus !== 'none')).map((order) => (
                        <div key={order.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                            <div>
                              <span className="font-bold text-stone-900 text-sm font-serif">Order #{order.orderNumber}</span>
                              <p className="text-stone-500 text-[11px]">Delivered on {new Date(order.updatedAt).toLocaleDateString()}</p>
                            </div>

                            {order.returnStatus && order.returnStatus !== 'none' ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full text-[10px] uppercase">
                                ↩ Return Requested ({order.returnStatus.replace('_', ' ')})
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-[10px] uppercase">
                                ✓ Eligible for Return
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center gap-3">
                                  <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-stone-200 shrink-0" />
                                  <div>
                                    <p className="font-bold text-stone-900">{item.productName}</p>
                                    <p className="text-stone-500 text-[11px]">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {/* Action CTA */}
                          <div className="pt-2 flex justify-end">
                            {order.returnStatus && order.returnStatus !== 'none' ? (
                              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-stone-700 w-full text-left space-y-1">
                                <p className="font-bold text-stone-900">Pickup Details:</p>
                                <p className="text-stone-600">Reason: {order.returnReason}</p>
                                <p className="text-emerald-700 font-medium pt-1">🚚 Our doorstep courier representative will arrive within 24-48 hours.</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReturnModalOrder(order)}
                                className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span>Request Return</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 3. MY WISHLIST SECTION */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-900">My Wishlist ({wishlistProducts.length})</h2>
                      <p className="text-xs text-stone-500">Your saved apparel items.</p>
                    </div>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 text-base">Your Wishlist is Empty</h3>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          Save your favorite sarees, kurtas, and dresses to review or buy later.
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('/category/women')}
                        className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        Explore Fashion Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistProducts.map((prod) => (
                        <div key={prod.id} className="relative group">
                          <ProductCard product={prod} onNavigate={onNavigate} />
                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => {
                                if (prod.variants && prod.variants[0]) {
                                  addToCart(prod, prod.variants[0], 1);
                                  showToast(`${prod.name} added to cart!`);
                                }
                              }}
                              className="flex-1 bg-[#2B2620] hover:bg-[#C0654B] text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Move to Cart</span>
                            </button>
                            <button
                              onClick={() => toggleWishlist(prod.id)}
                              className="p-2 border border-stone-300 hover:border-red-500 hover:text-red-500 text-stone-600 rounded-xl transition-colors cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 4. SAVED ADDRESSES SECTION */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-900">Saved Shipping Addresses</h2>
                      <p className="text-xs text-stone-500">Manage your home, office, and family delivery locations.</p>
                    </div>
                    <button
                      onClick={() => handleOpenAddressModal()}
                      className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative text-xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-stone-900 text-sm font-serif">{addr.fullName}</span>
                            <span className="bg-stone-100 text-stone-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                              {addr.type}
                            </span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-stone-500">Phone: <strong>{addr.phone}</strong></p>
                          {addr.isDefault && (
                            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              ✓ Default Shipping Address
                            </span>
                          )}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <button
                            onClick={() => handleOpenAddressModal(addr)}
                            className="text-[#C0654B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-stone-400 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 5. PROFILE DETAILS SECTION */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-6 text-xs"
                >
                  <div>
                    <h2 className="text-xl font-bold font-serif text-stone-900">Personal Profile Details</h2>
                    <p className="text-xs text-stone-500">Update your account identity, email, and contact details.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Mobile Phone (+91)</label>
                        <input
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Gender</label>
                        <select
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={profileForm.dob}
                          onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* 6. PAYMENT METHODS SECTION */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-900">Manage Saved Payment Methods</h2>
                      <p className="text-xs text-stone-500">Saved UPI VPA IDs and Credit/Debit cards for 1-click checkout.</p>
                    </div>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Payment</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedPayments.map((pay) => (
                      <div key={pay.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative text-xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-stone-900 text-sm font-serif">{pay.type}</span>
                            {pay.default && (
                              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-stone-800 font-mono text-sm">{pay.details}</p>
                          {pay.expiry && <p className="text-stone-500 text-[11px]">Expires: {pay.expiry}</p>}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex justify-end">
                          <button
                            onClick={() => {
                              setSavedPayments(prev => prev.filter(p => p.id !== pay.id));
                              showToast('Payment method removed.');
                            }}
                            className="text-stone-400 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 7. ACCOUNT SETTINGS SECTION */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-xs"
                >
                  {/* Password Change */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-4">
                    <h3 className="font-bold text-stone-900 font-serif text-base flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#C0654B]" /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPass}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPass}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs"
                        />
                      </div>
                      <button type="submit" className="bg-[#2B2620] hover:bg-[#C0654B] text-white font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
                        Update Password
                      </button>
                    </form>
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-4">
                    <h3 className="font-bold text-stone-900 font-serif text-base flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#C0654B]" /> Notification Preferences
                    </h3>
                    <div className="space-y-3 max-w-md">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 cursor-pointer">
                        <span>Order updates via SMS & WhatsApp</span>
                        <input
                          type="checkbox"
                          checked={notifications.orderUpdates}
                          onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                          className="accent-[#C0654B] w-4 h-4"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 cursor-pointer">
                        <span>Promotional Emails & Seasonal Catalog Launches</span>
                        <input
                          type="checkbox"
                          checked={notifications.promoEmail}
                          onChange={(e) => setNotifications({ ...notifications, promoEmail: e.target.checked })}
                          className="accent-[#C0654B] w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50/50 p-6 rounded-3xl border border-red-200 space-y-3">
                    <h3 className="font-bold text-red-900 font-serif text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone
                    </h3>
                    <p className="text-red-700 text-xs">Permanently delete your PGmart account and loyalty data.</p>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ─── ADDRESS FORM MODAL ─── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 text-xs max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner if validation fails */}
            {addressFormError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{addressFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C0654B]"
                />
              </div>

              {/* 2. Mobile Phone */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Mobile Phone (+91) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C0654B]"
                />
              </div>

              {/* 3. Reusable PincodeField Component (Pincode -> Locality Dropdown -> City (read-only) -> State (read-only)) */}
              <PincodeField
                pincode={addressForm.pincode}
                city={addressForm.city}
                stateName={addressForm.state}
                locality={addressForm.locality}
                onPincodeChange={(val) => setAddressForm(prev => ({ ...prev, pincode: val }))}
                onCityChange={(val) => setAddressForm(prev => ({ ...prev, city: val }))}
                onStateChange={(val) => setAddressForm(prev => ({ ...prev, state: val }))}
                onLocalityChange={(val) => setAddressForm(prev => ({ ...prev, locality: val }))}
                onVerificationStatusChange={(verified) => setIsPincodeVerified(verified)}
                showRequiredError={!addressForm.pincode && !!addressFormError}
              />

              {/* 7. Address Line 1 / Street */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Flat / House No. / Building / Street <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Apartments"
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C0654B]"
                />
              </div>

              {/* 8. Address Line 2 (Optional) */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Landmark / Line 2 <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  placeholder="e.g. Near Salt Lake Sector 5 Metro"
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C0654B]"
                />
              </div>

              {/* 9. Address Type */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">Address Type</label>
                <div className="flex gap-4">
                  {['home', 'work', 'other'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer uppercase font-bold text-[10px]">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={addressForm.type === type}
                        onChange={() => setAddressForm({ ...addressForm, type: type as any })}
                        className="accent-[#C0654B]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 10. Default Address Toggle */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-[#C0654B]"
                />
                <span className="font-bold text-stone-700">Set as default shipping address</span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPincodeVerified}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isPincodeVerified
                      ? 'bg-[#C0654B] hover:bg-[#8B4A38] text-white shadow-md'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                  }`}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD PAYMENT MODAL ─── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">Add UPI Virtual Address</h3>
            <div>
              <label className="block font-bold text-stone-700 mb-1">UPI VPA ID (e.g. username@upi)</label>
              <input
                type="text"
                placeholder="name@okicici / mobile@paytm"
                value={newUpiId}
                onChange={(e) => setNewUpiId(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-3 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newUpiId) {
                    setSavedPayments(prev => [...prev, { id: `pay-${Date.now()}`, type: 'UPI', details: newUpiId, default: false }]);
                    showToast('UPI VPA linked successfully!');
                    setIsPaymentModalOpen(false);
                    setNewUpiId('');
                  }
                }}
                className="px-4 py-2 bg-[#C0654B] text-white rounded-xl font-bold"
              >
                Link UPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-xs text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Confirm Logout</h3>
              <p className="text-stone-500 mt-1">Are you sure you want to log out of your PGmart account?</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-5 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-700 cursor-pointer"
              >
                Stay Logged In
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setIsLogoutModalOpen(false);
                  showToast('You have been logged out.');
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE ACCOUNT CONFIRMATION MODAL ─── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-xs text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Delete PGmart Account?</h3>
              <p className="text-stone-500 mt-1">This action is permanent. All saved addresses, wishlist items, and loyalty points (350 PTS) will be permanently deleted.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-700 cursor-pointer"
              >
                Keep Account
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setIsDeleteModalOpen(false);
                  showToast('Your account and stored data have been permanently deleted.');
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── RETURN / EXCHANGE REQUEST MODAL ─── */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 font-sans text-left animate-fade-in">
          <div className="bg-white p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-5 text-xs shadow-2xl relative border border-stone-200">
            <button
              onClick={() => setReturnModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-[#C0654B]/10 text-[#C0654B] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Request Item Return</h3>
                <p className="text-[11px] text-stone-500">Order #{returnModalOrder.orderNumber} • Delivered Item</p>
              </div>
            </div>

            {/* Select Reason */}
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-800">1. Reason for Return *</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-3 bg-white text-stone-900 font-medium focus:outline-none focus:border-[#C0654B]"
              >
                <option value="Size too small / large">Size too small / large</option>
                <option value="Item defective or damaged">Item defective or damaged</option>
                <option value="Fabric / Quality not as expected">Fabric / Quality not as expected</option>
                <option value="Received wrong color or item">Received wrong color or item</option>
                <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
              </select>
            </div>

            {/* Step 4: Additional Comments */}
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-800">Additional Instructions (Optional)</label>
              <textarea
                rows={2}
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                placeholder="e.g. Please call before pickup or pick up between 10am-2pm..."
                className="w-full border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#C0654B]"
              />
            </div>

            {/* Address Verification Box */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1 text-[11px]">
              <span className="font-bold text-stone-900 block">Doorstep Pickup Location:</span>
              <p className="text-stone-600 truncate">
                {returnModalOrder.shippingAddress.fullName}, {returnModalOrder.shippingAddress.street}, {returnModalOrder.shippingAddress.city} - {returnModalOrder.shippingAddress.pincode}
              </p>
              <span className="text-emerald-700 font-bold block pt-0.5">✓ Free reverse courier pickup included with zero extra fee</span>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-700 cursor-pointer hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(`CONFIRM RETURN REQUEST:\n\nAre you sure you want to submit a RETURN request for Order #${returnModalOrder.orderNumber}? Doorstep pickup will be scheduled within 24-48 hours.`);
                  if (!confirmed) return;
                  requestOrderReturn(returnModalOrder.id, 'return', returnReason, {
                    comments: returnComments
                  });
                  setReturnModalOrder(null);
                }}
                className="px-6 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
