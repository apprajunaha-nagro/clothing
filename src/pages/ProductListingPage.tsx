import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, X, ChevronRight, Check, Grid, List, Sparkles, ArrowLeftRight, Scale, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { useDebounce } from '../utils/useDebounce';

interface ProductListingPageProps {
  onNavigate: (path: string) => void;
  categorySlug?: string;
  queryString?: string;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({ onNavigate, categorySlug = 'women', queryString = '' }) => {
  const { categories, brands, products, filters, setFilters, resetFilters, wishlist, showToast, addToCart } = useStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  // Local price state — debounced before applying to context so the grid
  // doesn't re-render on every pixel of slider movement.
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 300);

  // Sync debounced value to global filter state
  useEffect(() => {
    setFilters(prev => ({ ...prev, maxPrice: debouncedMaxPrice }));
  }, [debouncedMaxPrice, setFilters]);

  // Keep local slider in sync if filters are reset externally
  useEffect(() => {
    setLocalMaxPrice(filters.maxPrice);
  }, [filters.maxPrice]);

  const handleToggleCompare = (product: Product) => {
    setComparedProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }
      if (prev.length >= 2) {
        showToast("You can compare up to 2 items at a time. Please deselect one first.");
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const handleClearCompare = () => {
    setComparedProductIds([]);
  };

  // Split raw query string and raw slug
  let rawSlug = categorySlug;
  let rawQuery = queryString;

  if (rawSlug.includes('?')) {
    const parts = rawSlug.split('?');
    rawSlug = parts[0];
    rawQuery = parts[1] + (rawQuery ? '&' + rawQuery : '');
  }

  const queryParams = new URLSearchParams(rawQuery);
  const subParam = queryParams.get('sub') || queryParams.get('subcategoryId');
  const typeParam = queryParams.get('type') || queryParams.get('typeId');
  const brandParam = queryParams.get('brand') || queryParams.get('brandId');
  const occasionParam = queryParams.get('occasion');
  const tagParam = queryParams.get('tag');
  const ageParam = queryParams.get('age');
  const searchParam = queryParams.get('search') || queryParams.get('q');

  // MATCH CATEGORY, SUBCATEGORY, TYPE, BRAND
  const allSubcategories = categories.flatMap(c => c.subcategories || []);
  const allTypes = allSubcategories.flatMap(s => s.types || []);

  const currentType = typeParam
    ? allTypes.find(t => t.id === typeParam || t.slug === typeParam || t.id.toLowerCase().includes(typeParam.toLowerCase()) || t.name.toLowerCase().includes(typeParam.toLowerCase()))
    : allTypes.find(t => t.slug === rawSlug || t.id === rawSlug);

  const currentSubcategory = subParam
    ? allSubcategories.find(s => s.id === subParam || s.slug === subParam || s.id.toLowerCase().includes(subParam.toLowerCase()) || s.name.toLowerCase().includes(subParam.toLowerCase()))
    : (currentType ? allSubcategories.find(s => s.id === currentType.subcategoryId) : allSubcategories.find(s => s.slug === rawSlug || s.id === rawSlug));

  const currentCategory = categories.find(c => c.slug === rawSlug || c.id === rawSlug) ||
    categories.find(c => c.id === currentSubcategory?.categoryId) ||
    categories[0];

  const currentBrand = brandParam
    ? brands.find(b => b.id === brandParam || b.slug === brandParam || b.name.toLowerCase().includes(brandParam.toLowerCase()))
    : null;

  // DYNAMIC SECTION HEADER TITLE, BANNER & BADGE
  let sectionTitle = currentCategory?.name || 'All Fashion Catalog';
  let sectionSubtitle = currentCategory?.metaDesc || 'Hand-curated sarees, kurtas, western dresses, formal suits, and innerwear essentials.';
  let sectionBanner = currentCategory?.banner || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';
  let sectionBadge = 'DEPARTMENT EDIT';

  if (tagParam === 'wishlist') {
    sectionTitle = 'My Saved Wishlist';
    sectionSubtitle = 'Your favorite bookmarked sarees, suits, dresses, and innerwear.';
    sectionBadge = `${wishlist.length} SAVED ITEMS`;
  } else if (currentType) {
    sectionTitle = currentType.name;
    sectionSubtitle = `Dedicated specialist section for ${currentType.name}. Handpicked fabrics, fine stitching, and perfect fits.`;
    sectionBadge = `${currentSubcategory?.name || 'PRODUCT TYPE'}`;
  } else if (currentSubcategory) {
    sectionTitle = currentSubcategory.name;
    sectionSubtitle = `Dedicated ${currentSubcategory.name} collection featuring 100% genuine products with fast delivery.`;
    sectionBadge = `${currentCategory?.name || 'SUBCATEGORY'}`;
  } else if (occasionParam) {
    sectionTitle = `${occasionParam} Collection`;
    sectionSubtitle = `Hand-curated outfits designed specifically for ${occasionParam}.`;
    sectionBadge = 'OCCASION EDIT';
  } else if (tagParam === 'sale' || rawSlug === 'sale') {
    sectionTitle = 'Clearance Sale & Hot Deals';
    sectionSubtitle = 'Flat 30% to 60% OFF on festive sarees, kurtas, western wear, and soft innerwear.';
    sectionBadge = 'UP TO 60% OFF';
  } else if (tagParam === 'new_arrival' || rawSlug === 'new-arrivals') {
    sectionTitle = 'New Arrivals & Fresh Drops';
    sectionSubtitle = 'Latest trends and newly launched styles updated daily across all departments.';
    sectionBadge = 'NEW IN STORE';
  } else if (tagParam === 'bestseller' || rawSlug === 'bestsellers') {
    sectionTitle = 'Best Sellers & Top Picks';
    sectionSubtitle = 'Our highest-rated, top-purchased customer favorites.';
    sectionBadge = 'MOST LOVED';
  } else if (tagParam === 'curves_plus_size' || rawSlug === 'curves') {
    sectionTitle = 'CURVES - Plus Size Collection';
    sectionSubtitle = 'Flattering cuts and generous silhouettes in sizes XL, XXL, 3XL, and Free Size.';
    sectionBadge = 'PLUS SIZE EDIT';
  } else if (currentBrand) {
    sectionTitle = currentBrand.name;
    sectionSubtitle = currentBrand.description || `Official catalog of ${currentBrand.name} apparel.`;
    sectionBadge = 'BRAND SPOTLIGHT';
  }

  // Colors available across all products
  const availableColors = [
    { name: 'Rose Clay', hex: '#C0654B' },
    { name: 'Navy Blue', hex: '#1B2A4A' },
    { name: 'Golden Olive', hex: '#808000' },
    { name: 'Dusty Rose', hex: '#D8A0A6' },
    { name: 'Charcoal', hex: '#2F4F4F' },
    { name: 'Beige', hex: '#F5F5DC' }
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const availableOccasions = ['Casual Wear', 'Festive Wear', 'Work Wear', 'Party Wear', 'Wedding Wear', 'Active & Loungewear'];

  // FILTER LOGIC
  const filteredProducts = products.filter((p) => {
    // Wishlist tag special section
    if (tagParam === 'wishlist') {
      return wishlist.includes(p.id);
    }

    // Main category match (skip if 'all', 'sale', 'new-arrivals', 'bestsellers', 'curves')
    if (rawSlug && !['all', 'sale', 'new-arrivals', 'bestsellers', 'curves', 'ethnic', 'western'].includes(rawSlug)) {
      if (currentCategory?.id && p.categoryId !== currentCategory.id) return false;
    }

    // Special category / tag filters
    if (rawSlug === 'sale' || tagParam === 'sale') {
      if (!p.tags.includes('sale') && !p.discountPrice && (!p.discountPercent || p.discountPercent <= 0)) return false;
    }
    if (rawSlug === 'new-arrivals' || tagParam === 'new_arrival') {
      if (!p.tags.includes('new_arrival')) return false;
    }
    if (rawSlug === 'bestsellers' || tagParam === 'bestseller') {
      if (!p.tags.includes('bestseller') && p.rating < 4.5) return false;
    }
    if (rawSlug === 'curves' || tagParam === 'curves_plus_size' || filters.plusSizeOnly) {
      if (!p.tags.includes('curves_plus_size') && !p.availableSizes.some(s => ['XL', 'XXL', '3XL', 'Free Size'].includes(s))) return false;
    }

    // Subcategory match
    if (subParam) {
      const matchSubId = currentSubcategory?.id || subParam;
      if (p.subcategoryId !== matchSubId && !p.subcategoryId.toLowerCase().includes(subParam.toLowerCase())) return false;
    }

    // Product Type match
    if (currentType) {
      if (p.typeId !== currentType.id) return false;
    } else if (typeParam) {
      const matchTypeId = currentType?.id || typeParam;
      if (p.typeId !== matchTypeId && !p.typeId.toLowerCase().includes(typeParam.toLowerCase())) return false;
    }
    if (filters.types && filters.types.length > 0) {
      if (!p.typeId || !filters.types.some(tId => p.typeId === tId || p.typeId.toLowerCase().includes(tId.toLowerCase()))) return false;
    }

    // Brand match
    if (brandParam) {
      const matchBrandId = currentBrand?.id || brandParam;
      if (p.brandId !== matchBrandId && !p.brandName.toLowerCase().includes(brandParam.toLowerCase())) return false;
    }

    // Occasion match
    if (occasionParam) {
      const occLower = occasionParam.toLowerCase();
      if (!p.occasion.toLowerCase().includes(occLower) && !p.name.toLowerCase().includes(occLower)) return false;
    }

    // Age band match (for Kids)
    if (ageParam) {
      const ageLower = ageParam.toLowerCase();
      if (!p.tags.some(t => t.toLowerCase().includes(ageLower)) && !p.name.toLowerCase().includes(ageLower) && !p.description.toLowerCase().includes(ageLower)) {
        if (ageLower === 'toddler' && !p.availableSizes.some(s => ['1-2Y', '2-3Y', 'S'].includes(s))) return false;
      }
    }

    // Search query match
    const activeSearch = searchParam || filters.searchQuery;
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q) ||
                            p.fabric.toLowerCase().includes(q) ||
                            p.occasion.toLowerCase().includes(q) ||
                            p.brandName.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Sidebar filters
    if (filters.occasions.length > 0 && !filters.occasions.some(o => p.occasion.toLowerCase().includes(o.toLowerCase()))) return false;
    if (filters.sizes.length > 0 && !p.availableSizes.some(s => filters.sizes.includes(s))) return false;
    if (filters.colors.length > 0 && !p.colors.some(c => filters.colors.includes(c.name))) return false;
    if (filters.fabrics.length > 0 && !filters.fabrics.includes(p.fabric)) return false;

    // Price
    const price = p.discountPrice || p.basePrice;
    if (price < filters.minPrice || price > filters.maxPrice) return false;

    return true;
  });

  // SORT LOGIC
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const pA = a.discountPrice || a.basePrice;
    const pB = b.discountPrice || b.basePrice;
    if (filters.sortBy === 'price_asc') return pA - pB;
    if (filters.sortBy === 'price_desc') return pB - pA;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.reviewCount - a.reviewCount;
  });

  const toggleFilterItem = (key: 'occasions' | 'sizes' | 'colors' | 'fabrics', value: string) => {
    setFilters(prev => {
      const list = prev[key];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter(item => item !== value) : [...list, value]
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium flex-wrap">
        <button onClick={() => onNavigate('/')} className="hover:text-[#C0654B] cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <button onClick={() => onNavigate(`/category/${currentCategory.slug}`)} className="hover:text-[#C0654B] cursor-pointer">
          {currentCategory.name}
        </button>

        {currentSubcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button onClick={() => onNavigate(`/category/${currentCategory.slug}?sub=${currentSubcategory.id}`)} className="hover:text-[#C0654B] cursor-pointer">
              {currentSubcategory.name}
            </button>
          </>
        )}

        {currentType && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-bold">{currentType.name}</span>
          </>
        )}

        {!currentSubcategory && !currentType && sectionTitle !== currentCategory.name && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-bold">{sectionTitle}</span>
          </>
        )}
      </nav>

      {/* DEDICATED SECTION BANNER */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white p-6 sm:p-10 shadow-md">
        <img src={sectionBanner} alt={sectionTitle} className="absolute inset-0 w-full h-full object-cover opacity-100 brightness-110 contrast-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/40 to-transparent sm:w-2/3 pointer-events-none z-0" />
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="bg-[#C0654B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
            {sectionBadge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-serif">{sectionTitle}</h1>
          <p className="text-xs sm:text-sm text-stone-200 line-clamp-2">
            {sectionSubtitle}
          </p>
        </div>
      </div>

      {/* ACTIVE SECTION FILTER PILLS */}
      {(subParam || typeParam || brandParam || occasionParam || tagParam || ageParam || searchParam) && (
        <div className="flex flex-wrap items-center gap-2 bg-stone-100/80 p-3 rounded-xl border border-stone-200 text-xs">
          <span className="font-bold text-stone-600">Active Section Filter:</span>
          {currentSubcategory && (
            <span className="inline-flex items-center gap-1.5 bg-white text-[#C0654B] font-bold px-2.5 py-1 rounded-full border border-[#C0654B]/30 shadow-2xs">
              <span>Subcategory: {currentSubcategory.name}</span>
              <button onClick={() => onNavigate(`/category/${currentCategory.slug}`)} className="hover:text-stone-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {currentType && (
            <span className="inline-flex items-center gap-1.5 bg-white text-[#C0654B] font-bold px-2.5 py-1 rounded-full border border-[#C0654B]/30 shadow-2xs">
              <span>Type: {currentType.name}</span>
              <button onClick={() => onNavigate(`/category/${currentCategory.slug}${subParam ? '?sub=' + subParam : ''}`)} className="hover:text-stone-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {occasionParam && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
              <span>Occasion: {occasionParam}</span>
              <button onClick={() => onNavigate(`/category/${currentCategory.slug}`)} className="hover:text-stone-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {tagParam && (
            <span className="inline-flex items-center gap-1.5 bg-stone-900 text-white font-bold px-2.5 py-1 rounded-full shadow-2xs">
              <span>Filter: {tagParam}</span>
              <button onClick={() => onNavigate(`/category/${currentCategory.slug}`)} className="hover:text-stone-300 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {currentBrand && (
            <span className="inline-flex items-center gap-1.5 bg-stone-800 text-white font-bold px-2.5 py-1 rounded-full shadow-2xs">
              <span>Brand: {currentBrand.name}</span>
              <button onClick={() => onNavigate(`/category/${currentCategory.slug}`)} className="hover:text-stone-300 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
            className="text-xs font-bold text-[#C0654B] hover:underline cursor-pointer ml-auto"
          >
            Clear Section Filter
          </button>
        </div>
      )}

      {/* FILTER TOP BAR & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-stone-100 hover:bg-[#F3E9E4] text-stone-800 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C0654B]" />
            <span>Filters ({filters.occasions.length + filters.sizes.length + filters.colors.length})</span>
          </button>

          <p className="text-xs text-stone-600 font-medium">
            Showing <strong className="text-stone-900 font-bold">{sortedProducts.length}</strong> items in <strong>{sectionTitle}</strong>
          </p>
        </div>

        {/* SORT DROPDOWN & VIEW MODE TOGGLE */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 hidden sm:inline">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-stone-50 border border-stone-300 text-stone-900 rounded-lg text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[#C0654B]"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          <div className="hidden sm:flex border border-stone-200 rounded-lg p-0.5 bg-stone-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-[#C0654B]' : 'text-stone-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-xs text-[#C0654B]' : 'text-stone-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT: SIDEBAR FILTERS + PRODUCTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-fit text-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif">
              <Filter className="w-4 h-4 text-[#C0654B]" />
              Filter Catalog
            </span>
            <button onClick={resetFilters} className="text-[#C0654B] font-bold hover:underline">
              Reset All
            </button>
          </div>

          {/* CURVES / PLUS-SIZE TOGGLE */}
          <div className="bg-[#F3E9E4] p-3 rounded-xl border border-[#C0654B]/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-[#C0654B] text-xs">CURVES (Plus-Size)</p>
              <p className="text-[10px] text-stone-600">Show size XL, XXL & 3XL items</p>
            </div>
            <input
              type="checkbox"
              checked={filters.plusSizeOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, plusSizeOnly: e.target.checked }))}
              className="w-4 h-4 accent-[#C0654B] cursor-pointer"
            />
          </div>

          {/* Subcategories Filter */}
          {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Subcategory</p>
                {subParam && (
                  <button
                    onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
                    className="text-[10px] text-[#C0654B] font-bold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
                  className={`block w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                    !subParam ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  All {currentCategory.name}
                </button>
                {currentCategory.subcategories.map(sub => {
                  const isSubActive = subParam === sub.id || subParam === sub.slug;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        if (isSubActive) {
                          onNavigate(`/category/${currentCategory.slug}`);
                        } else {
                          onNavigate(`/category/${currentCategory.slug}?sub=${sub.id}`);
                        }
                      }}
                      className={`block w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                        isSubActive ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Type / Style Section Filter */}
          {(() => {
            const displayTypes = currentSubcategory
              ? (currentSubcategory.types || [])
              : (currentCategory?.subcategories ? currentCategory.subcategories.flatMap(s => s.types || []) : allTypes);

            if (!displayTypes || displayTypes.length === 0) return null;

            return (
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Product Type / Section
                  </p>
                  {(typeParam || filters.types.length > 0) && (
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, types: [] }));
                        onNavigate(`/category/${currentCategory.slug}${subParam ? '?sub=' + subParam : ''}`);
                      }}
                      className="text-[10px] text-[#C0654B] font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {displayTypes.map(t => {
                    const isTypeActive = typeParam === t.id || typeParam === t.slug || filters.types.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (isTypeActive) {
                            setFilters(prev => ({ ...prev, types: prev.types.filter(id => id !== t.id) }));
                            onNavigate(`/category/${currentCategory.slug}${subParam ? '?sub=' + subParam : ''}`);
                          } else {
                            setFilters(prev => ({ ...prev, types: [t.id] }));
                            onNavigate(`/category/${currentCategory.slug}?sub=${t.subcategoryId}&type=${t.id}`);
                          }
                        }}
                        className={`w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs flex items-center justify-between ${
                          isTypeActive
                            ? 'bg-[#F3E9E4] text-[#C0654B] font-bold border border-[#C0654B]/30'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        {isTypeActive && <Check className="w-3.5 h-3.5 text-[#C0654B] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Occasion Filter */}
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Occasion</p>
            <div className="space-y-1.5">
              {availableOccasions.map(occ => (
                <label key={occ} className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={filters.occasions.includes(occ) || occasionParam === occ}
                    onChange={() => toggleFilterItem('occasions', occ)}
                    className="w-3.5 h-3.5 accent-[#C0654B]"
                  />
                  <span>{occ}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Size Pick</p>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleFilterItem('sizes', size)}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer ${
                    filters.sizes.includes(size)
                      ? 'border-[#C0654B] bg-[#F3E9E4] text-[#C0654B]'
                      : 'border-stone-200 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Color Swatches</p>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(col => (
                <button
                  key={col.name}
                  onClick={() => toggleFilterItem('colors', col.name)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-6 h-6 rounded-full border border-stone-300 cursor-pointer transition-transform ${
                    filters.colors.includes(col.name) ? 'ring-2 ring-[#C0654B] ring-offset-2 scale-110' : ''
                  }`}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Price Filter — debounced so grid only re-renders after slider rests */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-bold text-stone-900 text-xs">
              <span>Max Price</span>
              <span className="text-[#C0654B]">₹{localMaxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C0654B] cursor-pointer"
            />
          </div>
        </aside>

        {/* PRODUCTS LIST GRID */}
        <main className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
              <Sparkles className="w-10 h-10 text-[#C0654B] mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">No Clothing Items Found in "{sectionTitle}"</h3>
              <p className="text-xs text-stone-500">Try clearing active section filters or exploring our wider catalog.</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
                  className="bg-[#C0654B] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-[#8B4A38]"
                >
                  View All {currentCategory.name}
                </button>
                <button
                  onClick={resetFilters}
                  className="bg-stone-100 text-stone-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-stone-200"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onNavigate={onNavigate} 
                  onToggleCompare={handleToggleCompare}
                  isCompared={comparedProductIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER OVERLAY — slide-in from left */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto space-y-6 z-10 shadow-2xl pb-safe flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="font-bold text-stone-900 text-base font-serif">Filter Catalog</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-[#C0654B] hover:underline"
                  >
                    Reset
                  </button>
                  <button onClick={() => setMobileFilterOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

            {/* Mobile Subcategory */}
            {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <p className="font-bold text-xs uppercase text-stone-900">Subcategory</p>
                <div className="space-y-1">
                  <button
                    onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
                    className={`block w-full text-left py-1.5 px-2 rounded-md text-xs ${
                      !subParam ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    All {currentCategory.name}
                  </button>
                  {currentCategory.subcategories.map(sub => {
                    const isSubActive = subParam === sub.id || subParam === sub.slug;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (isSubActive) {
                            onNavigate(`/category/${currentCategory.slug}`);
                          } else {
                            onNavigate(`/category/${currentCategory.slug}?sub=${sub.id}`);
                          }
                        }}
                        className={`block w-full text-left py-1.5 px-2 rounded-md text-xs ${
                          isSubActive ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Product Type / Style Section */}
            {(() => {
              const displayTypes = currentSubcategory
                ? (currentSubcategory.types || [])
                : (currentCategory?.subcategories ? currentCategory.subcategories.flatMap(s => s.types || []) : allTypes);

              if (!displayTypes || displayTypes.length === 0) return null;

              return (
                <div className="space-y-2 border-b border-stone-100 pb-4">
                  <p className="font-bold text-xs uppercase text-stone-900">Product Type / Section</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {displayTypes.map(t => {
                      const isTypeActive = typeParam === t.id || typeParam === t.slug || filters.types.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            if (isTypeActive) {
                              setFilters(prev => ({ ...prev, types: prev.types.filter(id => id !== t.id) }));
                              onNavigate(`/category/${currentCategory.slug}${subParam ? '?sub=' + subParam : ''}`);
                            } else {
                              setFilters(prev => ({ ...prev, types: [t.id] }));
                              onNavigate(`/category/${currentCategory.slug}?sub=${t.subcategoryId}&type=${t.id}`);
                            }
                          }}
                          className={`w-full text-left py-1.5 px-2 rounded-md text-xs flex items-center justify-between ${
                            isTypeActive ? 'bg-[#F3E9E4] text-[#C0654B] font-bold border border-[#C0654B]/30' : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          {isTypeActive && <Check className="w-3.5 h-3.5 text-[#C0654B] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Mobile Occasions */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <p className="font-bold text-xs uppercase text-stone-900">Occasion</p>
              <div className="space-y-1.5">
                {availableOccasions.map(occ => (
                  <label key={occ} className="flex items-center gap-2 text-xs text-stone-700">
                    <input
                      type="checkbox"
                      checked={filters.occasions.includes(occ) || occasionParam === occ}
                      onChange={() => toggleFilterItem('occasions', occ)}
                      className="w-3.5 h-3.5 accent-[#C0654B]"
                    />
                    <span>{occ}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Sizes */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <p className="font-bold text-xs uppercase text-stone-900">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleFilterItem('sizes', size)}
                    className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                      filters.sizes.includes(size) ? 'bg-[#C0654B] text-white border-[#C0654B]' : 'border-stone-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Colors */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <p className="font-bold text-xs uppercase text-stone-900">Color Swatches</p>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => toggleFilterItem('colors', col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full border border-stone-300 transition-transform ${
                      filters.colors.includes(col.name) ? 'ring-2 ring-[#C0654B] ring-offset-2 scale-110' : ''
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Price — debounced */}
            <div className="space-y-2 pb-2">
              <div className="flex justify-between items-center font-bold text-xs">
                <span>Max Price</span>
                <span className="text-[#C0654B]">₹{localMaxPrice}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                className="w-full accent-[#C0654B]"
              />
            </div>

            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 rounded-xl text-xs shadow-md cursor-pointer mt-4 min-h-[44px]"
            >
              Apply Filters ({sortedProducts.length} Items)
            </button>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING COMPARE BAR */}
      {comparedProductIds.length > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="bg-[#C0654B] p-2 rounded-lg">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div className="text-left shrink-0">
              <p className="text-xs font-bold font-serif tracking-wide">Compare Styles</p>
              <p className="text-[10px] text-stone-400">
                {comparedProductIds.length === 1 
                  ? 'Select 1 more item' 
                  : 'Ready to compare side-by-side'}
              </p>
            </div>

            {/* Selected Thumbnails */}
            <div className="flex items-center gap-2 ml-2">
              {comparedProductIds.map(id => {
                const item = products.find(p => p.id === id);
                if (!item) return null;
                const img = item.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=100&q=80';
                return (
                  <div key={id} className="relative group/thumb w-10 h-12 rounded-md overflow-hidden bg-stone-800 border border-stone-700 shrink-0">
                    <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleToggleCompare(item)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                );
              })}
              {comparedProductIds.length < 2 && (
                <div className="w-10 h-12 rounded-md border border-dashed border-stone-700 flex items-center justify-center text-stone-500 text-xs shrink-0">
                  +
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleClearCompare}
              className="text-stone-400 hover:text-white text-xs font-semibold px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              disabled={comparedProductIds.length < 2}
              onClick={() => setIsCompareModalOpen(true)}
              className="flex-1 sm:flex-none bg-[#C0654B] hover:bg-[#A9533B] disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* TECHNICAL SPECIFICATION SIDE-BY-SIDE MODAL */}
      {isCompareModalOpen && comparedProductIds.length === 2 && (() => {
        const productA = products.find(p => p.id === comparedProductIds[0]);
        const productB = products.find(p => p.id === comparedProductIds[1]);
        if (!productA || !productB) return null;

        const imgA = productA.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';
        const imgB = productB.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';

        const priceA = productA.discountPrice || productA.basePrice;
        const priceB = productB.discountPrice || productB.basePrice;

        const specs = [
          { label: 'Brand Name', valA: productA.brandName || 'PGmart Special', valB: productB.brandName || 'PGmart Special' },
          { label: 'Fabric Composition', valA: productA.fabric, valB: productB.fabric },
          { label: 'Silhouette & Fit', valA: productA.fit, valB: productB.fit },
          { label: 'Neck / Neckline', valA: productA.neck || 'Standard Neck', valB: productB.neck || 'Standard Neck' },
          { label: 'Sleeve Detail', valA: productA.sleeve || 'N/A / Sleeve-less', valB: productB.sleeve || 'N/A / Sleeve-less' },
          { label: 'Pattern Type', valA: productA.pattern || 'Bespoke Traditional', valB: productB.pattern || 'Bespoke Traditional' },
          { label: 'Occasion Suitability', valA: productA.occasion, valB: productB.occasion },
          { label: 'Sizes In-Stock', valA: productA.availableSizes.join(', '), valB: productB.availableSizes.join(', ') },
          { label: 'Color Offerings', valA: productA.colors.map(c => c.name).join(', '), valB: productB.colors.map(c => c.name).join(', ') },
          { label: 'HSN & Tax Rate', valA: `HSN ${productA.hsnCode} (${productA.gstPercent}%)`, valB: `HSN ${productB.hsnCode} (${productB.gstPercent}%)` },
          { label: 'Brief Narrative', valA: productA.description, valB: productB.description },
        ];

        return (
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 transition-opacity animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-800 text-left">
              {/* MODAL HEADER */}
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#C0654B]" />
                    Technical Specification Matchup
                  </h2>
                  <p className="text-xs text-stone-500">Side-by-side analytical comparison of selected PGmart garments</p>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL BODY (SCROLLABLE TABLE) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <table className="w-full text-xs md:text-sm border-collapse">
                  {/* Hero Row for Images, Name, Rating and Price */}
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="w-1/4 pb-4 font-bold text-stone-500 uppercase tracking-wider text-left align-top pt-2">
                        Product
                      </th>
                      <th className="w-3/8 pb-4 pr-4 text-left align-top">
                        <div className="space-y-3">
                          <div className="aspect-3/4 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 max-w-[180px] shadow-2xs">
                            <img src={imgA} alt={productA.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif font-bold text-stone-900 text-sm md:text-base line-clamp-2">{productA.name}</h3>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className="font-bold text-stone-700 text-xs">{productA.rating}</span>
                              <span className="text-stone-400 text-xs">({productA.reviewCount} reviews)</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 pt-1">
                              <span className="font-bold text-stone-900 text-sm md:text-base">₹{priceA.toLocaleString('en-IN')}</span>
                              {productA.basePrice > priceA && (
                                <span className="text-stone-400 text-xs line-through">₹{productA.basePrice.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(productA, productA.variants[0], 1);
                              showToast(`Added ${productA.name} to cart`);
                            }}
                            className="w-full max-w-[180px] bg-[#C0654B] hover:bg-[#A9533B] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add style to Cart
                          </button>
                        </div>
                      </th>
                      <th className="w-3/8 pb-4 text-left align-top">
                        <div className="space-y-3">
                          <div className="aspect-3/4 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 max-w-[180px] shadow-2xs">
                            <img src={imgB} alt={productB.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif font-bold text-stone-900 text-sm md:text-base line-clamp-2">{productB.name}</h3>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className="font-bold text-stone-700 text-xs">{productB.rating}</span>
                              <span className="text-stone-400 text-xs">({productB.reviewCount} reviews)</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 pt-1">
                              <span className="font-bold text-stone-900 text-sm md:text-base">₹{priceB.toLocaleString('en-IN')}</span>
                              {productB.basePrice > priceB && (
                                <span className="text-stone-400 text-xs line-through">₹{productB.basePrice.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(productB, productB.variants[0], 1);
                              showToast(`Added ${productB.name} to cart`);
                            }}
                            className="w-full max-w-[180px] bg-[#C0654B] hover:bg-[#A9533B] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add style to Cart
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Specifications rows */}
                  <tbody>
                    {specs.map((spec, sIdx) => (
                      <tr key={sIdx} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-stone-500 uppercase tracking-wide text-[10px] md:text-xs align-top">
                          {spec.label}
                        </td>
                        <td className="py-3.5 pr-6 text-stone-700 leading-relaxed font-medium align-top">
                          {spec.valA || <span className="text-stone-300 italic">Not Specified</span>}
                        </td>
                        <td className="py-3.5 text-stone-700 leading-relaxed font-medium align-top">
                          {spec.valB || <span className="text-stone-300 italic">Not Specified</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MODAL FOOTER */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
                <span className="text-stone-500">Need specific size advice? Use our AI Stylist in the lounge.</span>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Close Matchup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
