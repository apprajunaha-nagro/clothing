import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { MegaMenu } from './MegaMenu';
import { Search, Heart, ShoppingCart, User, ShieldCheck, Phone, MapPin, Settings, Menu, X, Sparkles, ChevronDown, MessageSquare } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPath }) => {
  const {
    settings,
    categories,
    products,
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
  const [headerQuery, setHeaderQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Auto-close mobile navigation drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerQuery.trim()) {
      setIsSearchFocused(false);
      onNavigate(`/category/all?search=${encodeURIComponent(headerQuery.trim())}`);
    }
  };

  const matchingSuggestions = headerQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(headerQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(headerQuery.toLowerCase()) ||
        p.fabric.toLowerCase().includes(headerQuery.toLowerCase()) ||
        p.occasion.toLowerCase().includes(headerQuery.toLowerCase()) ||
        p.brandName.toLowerCase().includes(headerQuery.toLowerCase())
      ).slice(0, 5)
    : [];

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

            {/* DOMINANT INTERACTIVE SEARCH BAR (Flipkart Center Search, ~45% width) */}
            <div className="relative hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-6">
              <form
                onSubmit={handleHeaderSearchSubmit}
                className="w-full flex items-center bg-stone-50 border border-stone-300 focus-within:border-[#C0654B] rounded-md overflow-hidden transition-colors shadow-2xs group"
              >
                <div className="flex-1 px-3 py-1.5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={headerQuery}
                    onChange={(e) => setHeaderQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search for sarees, kurtas, dresses, suits, innerwear..."
                    className="w-full bg-transparent text-xs sm:text-sm text-stone-900 focus:outline-none placeholder-stone-400 font-medium"
                  />
                  {headerQuery ? (
                    <button
                      type="button"
                      onClick={() => setHeaderQuery('')}
                      className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-block bg-stone-200 text-stone-600 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">
                      ⌘K
                    </kbd>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#C0654B] hover:bg-[#a85239] text-white px-4 py-2.5 flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold text-xs"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>

              {/* LIVE AUTOCOMPLETE DROPDOWN */}
              {isSearchFocused && headerQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden text-left">
                  <div className="p-2 border-b border-stone-100 bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Instant Product Results ({matchingSuggestions.length})</span>
                    <span className="text-stone-400">Press Enter to view all</span>
                  </div>
                  {matchingSuggestions.length === 0 ? (
                    <div className="p-4 text-xs text-stone-500 text-center">
                      No exact match found for "{headerQuery}". Press Enter or click search to view all results.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                      {matchingSuggestions.map(p => {
                        const img = getOptimizedImageUrl(
                          p.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80',
                          { width: 120, quality: 75 }
                        );
                        return (
                          <div
                            key={p.id}
                            onMouseDown={() => {
                              setHeaderQuery('');
                              setIsSearchFocused(false);
                              onNavigate(`/product/${p.id}`);
                            }}
                            className="flex items-center gap-3 p-2.5 hover:bg-[#F3E9E4]/60 cursor-pointer transition-colors"
                          >
                            <img
                              src={img}
                              alt={p.name}
                              className="w-10 h-12 object-cover rounded bg-stone-100 shrink-0"
                            />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-stone-500">{p.brandName} • {p.categoryName || 'Apparel'}</p>
                              <p className="text-xs font-extrabold text-[#C0654B]">₹{(p.discountPrice || p.basePrice).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onMouseDown={handleHeaderSearchSubmit}
                    className="w-full p-2 bg-[#F3E9E4] hover:bg-[#e8d7cf] text-[#C0654B] text-xs font-extrabold text-center block cursor-pointer transition-colors"
                  >
                    View All Matching Results for "{headerQuery}" →
                  </button>
                </div>
              )}
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
              onClick={() => { onNavigate('/wishlist'); setMobileMenuOpen(false); }}
              className="w-full text-left p-3 bg-rose-50/70 hover:bg-rose-100/70 text-stone-900 rounded-lg font-bold flex items-center justify-between border border-rose-200/80 shadow-2xs mt-2 min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C0654B] fill-[#C0654B]/20" />
                <span>My Saved Wishlist</span>
              </span>
              <span className="text-xs bg-[#C0654B] text-white font-extrabold px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
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
