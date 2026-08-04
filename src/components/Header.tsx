import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MegaMenu } from './MegaMenu';
import { Search, Heart, ShoppingBag, User, ShieldCheck, Phone, MapPin, Settings, Menu, X, Sparkles, ChevronDown } from 'lucide-react';

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
    setCartDrawerOpen
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* 1. TOP ANNOUNCEMENT STRIP (Shoppers Stop / Pantaloons Style) */}
      <div className="bg-[#2B2620] text-stone-200 text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-[#C0654B] text-white font-bold px-2 py-0.5 rounded-xs text-[10px] uppercase">
              FESTIVE OFFER
            </span>
            <span className="hidden sm:inline">Flat ₹200 OFF on orders above ₹999 | Code: <strong className="text-white">WELCOME100</strong></span>
          </div>
          <div className="flex items-center space-x-4">
            <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#C0654B]" />
              <span className="hidden md:inline">{settings.contactPhone}</span>
            </a>
            <span className="text-stone-600">|</span>
            <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors cursor-pointer">
              Track Order
            </button>
            <span className="text-stone-600">|</span>
            {isAdminLoggedIn ? (
              <button
                onClick={() => onNavigate('/admin')}
                className="text-[#C0654B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/admin/login')}
                className="hover:text-white transition-colors text-stone-400 cursor-pointer"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-700 hover:text-[#C0654B] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* BRAND LOGO */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <img
              src="/src/assets/images/pgmart_logo_new.png"
              alt="PGmart Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain border border-stone-200/80 shadow-xs group-hover:scale-105 transition-all bg-white p-0.5"
            />
            <div>
              <h1
                className="text-xl sm:text-2xl font-black tracking-tight leading-tight flex items-center gap-1.5"
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
              <p className="text-[9px] sm:text-[10px] tracking-wide text-[#6B6259] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{settings.tagline}</span>
              </p>
            </div>
          </div>

          {/* SEARCH BAR INPUT (Triggers Search Modal) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6">
            <div
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center gap-3 bg-stone-50 border border-stone-200 hover:border-[#C0654B] rounded-full px-4 py-2.5 text-xs text-stone-500 cursor-pointer transition-all shadow-xs"
            >
              <Search className="w-4 h-4 text-[#C0654B]" />
              <span className="flex-1 truncate">Search Sarees, Kurtas, Western Dresses...</span>
              <kbd className="hidden lg:inline-block bg-stone-200 text-stone-600 text-[10px] px-2 py-0.5 rounded-sm font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* USER ACTIONS (Wishlist, Cart, Account) */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Search icon mobile */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-700 hover:text-[#C0654B] cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('/wishlist')}
              className="relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center text-stone-700 hover:text-[#C0654B] transition-colors cursor-pointer group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-[10px] font-medium mt-0.5">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#C0654B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* AI Stylist */}
            <button
              onClick={() => onNavigate('/ai-stylist')}
              className="relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center text-stone-700 hover:text-[#C0654B] transition-colors cursor-pointer group"
              aria-label="AI Stylist"
            >
              <Sparkles className="w-5 h-5 text-[#C0654B] group-hover:scale-110 transition-transform animate-pulse" />
              <span className="hidden lg:inline text-[10px] font-medium mt-0.5 text-[#C0654B]">AI Stylist</span>
            </button>

            {/* Cart Drawer Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center text-stone-700 hover:text-[#C0654B] transition-colors cursor-pointer group"
              aria-label="Cart Bag"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-[10px] font-medium mt-0.5">Bag</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C0654B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <button
              onClick={() => onNavigate('/account')}
              className="flex items-center gap-2 p-1 min-h-[44px] rounded-full hover:bg-stone-100 transition-colors cursor-pointer text-stone-700"
              aria-label="Account"
            >
              <div className="w-8 h-8 rounded-full bg-[#F3E9E4] border border-[#C0654B]/30 flex items-center justify-center text-[#C0654B] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-stone-900 leading-none">{user ? user.name.split(' ')[0] : 'Account'}</p>
                <p className="text-[10px] text-stone-500">{user ? `${user.points} pts` : 'Sign In'}</p>
              </div>
            </button>
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
