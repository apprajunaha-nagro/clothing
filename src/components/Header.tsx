import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MegaMenu } from './MegaMenu';
import { Search, Heart, ShoppingCart, User, ShieldCheck, Phone, MapPin, Settings, Menu, X, Sparkles, ChevronDown, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPath }) => {
  const {
    settings,
    categories,
    cart,
    wishlist,
    user,
    isAdminLoggedIn,
    setSearchModalOpen,
    setCartDrawerOpen,
    setChatOpen
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Extract User's Saved Address Pincode
  const activeAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const userPincode = activeAddress?.pincode || '700091';
  const userCity = activeAddress?.city || 'Kolkata';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* 2. MAIN HEADER BAR (Flipkart Two-Tier Pattern) */}
      <div className="bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center text-stone-700 hover:text-[#C0654B] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* BRAND LOGO (30% Increased Size) */}
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <img
                src="/src/assets/images/pgmart_logo_new.png"
                alt="PGmart Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-xl object-contain border border-stone-200/80 group-hover:scale-105 transition-all bg-white p-1 shadow-2xs"
              />
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight leading-tight flex items-center gap-1"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    background: 'linear-gradient(135deg, #C0654B 0%, #D4884A 45%, #2B2620 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <span>{settings.storeName}</span>
                </h1>
              </div>
            </div>

            {/* DOMINANT SEARCH BAR (Flipkart Center Search, ~45% width) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-6">
              <div
                onClick={() => setSearchModalOpen(true)}
                className="w-full flex items-center bg-stone-50 border border-stone-300 hover:border-[#C0654B] focus-within:border-[#C0654B] rounded-md overflow-hidden cursor-pointer transition-colors shadow-2xs group"
              >
                <div className="flex-1 px-3 py-2 text-xs text-stone-500 flex items-center justify-between">
                  <span className="truncate">Search for sarees, kurtas, dresses and more...</span>
                  <kbd className="bg-stone-200 text-stone-600 text-[10px] px-1.5 py-0.5 rounded font-mono ml-2">
                    ⌘K
                  </kbd>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSearchModalOpen(true);
                  }}
                  className="bg-[#C0654B] hover:bg-[#a85239] text-white px-4 py-2 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* RIGHT ICON CLUSTER (Account, Wishlist, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="md:hidden p-2 text-stone-700 hover:text-[#C0654B] cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Account Dropdown Trigger */}
              <button
                onClick={() => onNavigate('/account')}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-stone-100 transition-colors cursor-pointer text-stone-800"
                aria-label="Account"
              >
                <User className="w-5 h-5 text-stone-700" />
                <span className="hidden sm:inline text-xs font-bold">{user ? user.name.split(' ')[0] : 'Login'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => onNavigate('/wishlist')}
                className="relative p-2 text-stone-700 hover:text-[#C0654B] transition-colors cursor-pointer group flex items-center gap-1"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="hidden lg:inline text-xs font-semibold">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#C0654B] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Drawer Button */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-stone-700 hover:text-[#C0654B] transition-colors cursor-pointer group flex items-center gap-1"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform text-stone-800" />
                <span className="hidden lg:inline text-xs font-bold">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#C0654B] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESKTOP MEGA MENU */}
      <div className="hidden md:block">
        <MegaMenu onNavigate={onNavigate} />
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 py-4 px-4 space-y-3 text-sm animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto pb-safe">
          <p className="font-bold text-xs uppercase text-stone-400 tracking-wider px-1">Browse Categories & Types</p>
          <div className="space-y-2">
            {categories.map((cat) => {
              const isExpanded = expandedMobileCategory === cat.id;
              return (
                <div key={cat.id} className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/50">
                  <button
                    onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                    className="w-full min-h-[44px] flex items-center justify-between p-3 font-bold text-stone-900 bg-white hover:bg-stone-50 transition-colors text-left text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.name}</span>
                      {cat.id === 'women' && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-xs font-bold">NEW</span>}
                      {cat.id === 'undergarments' && <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">SOFT</span>}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#C0654B]' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white border-t border-stone-100 space-y-3 text-xs animate-fade-in">
                      <button
                        onClick={() => { onNavigate(`/category/${cat.slug}`); setMobileMenuOpen(false); }}
                        className="font-bold text-[#C0654B] hover:underline block w-full text-left py-2 min-h-[44px] flex items-center"
                      >
                        Explore All {cat.name} Products →
                      </button>

                      {cat.subcategories?.map((sub) => (
                        <div key={sub.id} className="space-y-1.5 pl-2.5 border-l-2 border-[#C0654B]/30 my-2">
                          <button
                            onClick={() => { onNavigate(`/category/${cat.slug}?sub=${sub.id}`); setMobileMenuOpen(false); }}
                            className="font-extrabold text-stone-900 uppercase tracking-wider block text-left hover:text-[#C0654B] py-1"
                          >
                            {sub.name}
                          </button>
                          <div className="grid grid-cols-1 gap-1 pt-1 pl-2">
                            {sub.types?.map((type) => (
                              <button
                                key={type.id}
                                onClick={() => { onNavigate(`/category/${cat.slug}?sub=${sub.id}&type=${type.id}`); setMobileMenuOpen(false); }}
                                className="text-stone-600 hover:text-[#C0654B] py-1.5 text-left font-medium flex items-center gap-1.5 min-h-[36px]"
                              >
                                <span className="text-stone-400">•</span>
                                <span>{type.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => { onNavigate('/category/sale'); setMobileMenuOpen(false); }}
              className="w-full text-left p-3 bg-red-50 text-red-600 rounded-lg font-bold flex items-center justify-between border border-red-200 shadow-2xs mt-3 min-h-[44px]"
            >
              <span>🔥 CLEARANCE SALE</span>
              <span className="text-xs bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full">UP TO 60% OFF</span>
            </button>

            <button
              onClick={() => { onNavigate('/blog'); setMobileMenuOpen(false); }}
              className="w-full text-left p-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg font-bold flex items-center justify-between border border-stone-200 shadow-2xs mt-2 min-h-[44px]"
            >
              <span>📖 PGmart Journal (Blog)</span>
              <span className="text-xs text-[#C0654B] font-extrabold">Read Stories →</span>
            </button>

            {/* ADMIN PORTAL MOBILE ENTRY */}
            <button
              onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
              className="w-full text-left p-3 bg-[#2B2620] text-[#E0856B] rounded-lg font-bold flex items-center justify-between border border-stone-800 shadow-xs mt-2 min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C0654B]" />
                <span className="text-white">Store Admin Portal</span>
              </div>
              <span className="text-[10px] bg-[#C0654B] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {isAdminLoggedIn ? 'Active' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
