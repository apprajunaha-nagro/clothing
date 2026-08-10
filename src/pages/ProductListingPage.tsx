import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, X, ChevronRight, Check, Grid, List, Sparkles, ArrowLeftRight, Scale, ShoppingBag, Star, Heart } from 'lucide-react';
import { Product, FilterState } from '../types';
import { AnimatePresence, motion } from 'motion/react';

interface ProductListingPageProps {
  onNavigate: (path: string) => void;
  categorySlug?: string;
  queryString?: string;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({ onNavigate, categorySlug = 'women', queryString = '' }) => {
  const { categories, brands, products, filters, setFilters, resetFilters, wishlist, showToast, addToCart } = useStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  // Local price state — debounced before applying to context so the grid
  // doesn't re-render on every pixel of slider movement.
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);

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

  if (searchParam) {
    sectionTitle = `Search Results for "${searchParam}"`;
    sectionSubtitle = `Showing products matching "${searchParam}" across all PGmart departments.`;
    sectionBadge = 'SEARCH RESULTS';
  } else if (tagParam === 'wishlist' || rawSlug === 'wishlist') {
    sectionTitle = 'My Saved Wishlist';
    sectionSubtitle = 'Your favorite bookmarked sarees, suits, dresses, and innerwear saved for later.';
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

  // STAGED DRAFT FILTERS STATE (unapplied until user clicks 'Apply Filters')
  const [draftFilters, setDraftFilters] = useState<FilterState>({ ...filters });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ ...filters });

  // Sidebar-local selected subcategory (controls which types are shown, without navigating)
  const [sidebarSubId, setSidebarSubId] = useState<string | null>(
    currentSubcategory?.id || null
  );

  // Sync draft and applied filters when route/query changes; reset page to 1
  useEffect(() => {
    const initSubId = currentSubcategory?.id || (subParam ? subParam : undefined);
    const initTypeId = currentType?.id || (typeParam ? typeParam : undefined);
    const initialDraft: FilterState = {
      ...filters,
      subcategoryId: initSubId,
      types: initTypeId ? [initTypeId] : (filters.types || []),
      occasions: occasionParam ? [occasionParam] : (filters.occasions || []),
      searchQuery: searchParam || filters.searchQuery || '',
    };
    setDraftFilters(initialDraft);
    setAppliedFilters(initialDraft);
    setCurrentPage(1);
    setSidebarSubId(initSubId || null);
  }, [categorySlug, queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  // DRAFT FILTERED PRODUCTS (calculates preview count for Apply Filters button)
  const draftFilteredProducts = products.filter((p) => {
    if (tagParam === 'wishlist' || rawSlug === 'wishlist') return wishlist.includes(p.id);
    if (!searchParam && rawSlug && !['all', 'sale', 'new-arrivals', 'bestsellers', 'curves', 'ethnic', 'western'].includes(rawSlug)) {
      if (currentCategory?.id && p.categoryId !== currentCategory.id) return false;
    }
    if (rawSlug === 'sale' || tagParam === 'sale') {
      if (!p.tags.includes('sale') && !p.discountPrice && (!p.discountPercent || p.discountPercent <= 0)) return false;
    }
    if (rawSlug === 'new-arrivals' || tagParam === 'new_arrival') {
      if (!p.tags.includes('new_arrival')) return false;
    }
    if (rawSlug === 'bestsellers' || tagParam === 'bestseller') {
      if (!p.tags.includes('bestseller') && p.rating < 4.5) return false;
    }
    if (rawSlug === 'curves' || tagParam === 'curves_plus_size' || draftFilters.plusSizeOnly) {
      if (!p.tags.includes('curves_plus_size') && !p.availableSizes.some(s => ['XL', 'XXL', '3XL', 'Free Size'].includes(s))) return false;
    }
    if (draftFilters.subcategoryId) {
      const subId = draftFilters.subcategoryId.toLowerCase();
      if (p.subcategoryId.toLowerCase() !== subId && !p.subcategoryId.toLowerCase().includes(subId)) return false;
    }
    if (draftFilters.types && draftFilters.types.length > 0) {
      if (!p.typeId || !draftFilters.types.some(tId => p.typeId.toLowerCase() === tId.toLowerCase() || p.typeId.toLowerCase().includes(tId.toLowerCase()))) return false;
    }
    const activeBrandId = draftFilters.brandId || brandParam;
    if (activeBrandId) {
      const bId = activeBrandId.toLowerCase();
      if (p.brandId?.toLowerCase() !== bId && (!p.brandName || !p.brandName.toLowerCase().includes(bId))) return false;
    }
    if (occasionParam) {
      const occLower = occasionParam.toLowerCase();
      if (!p.occasion.toLowerCase().includes(occLower) && !p.name.toLowerCase().includes(occLower)) return false;
    }
    if (ageParam) {
      const ageLower = ageParam.toLowerCase();
      if (!p.tags.some(t => t.toLowerCase().includes(ageLower)) && !p.name.toLowerCase().includes(ageLower) && !p.description.toLowerCase().includes(ageLower)) {
        if (ageLower === 'toddler' && !p.availableSizes.some(s => ['1-2Y', '2-3Y', 'S'].includes(s))) return false;
      }
    }
    const activeSearch = draftFilters.searchQuery || searchParam;
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q) ||
                            p.fabric.toLowerCase().includes(q) ||
                            p.occasion.toLowerCase().includes(q) ||
                            (p.brandName && p.brandName.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (draftFilters.occasions && draftFilters.occasions.length > 0) {
      if (!draftFilters.occasions.some(o => p.occasion.toLowerCase().includes(o.toLowerCase()))) return false;
    }
    if (draftFilters.sizes && draftFilters.sizes.length > 0) {
      if (!p.availableSizes.some(s => draftFilters.sizes.includes(s))) return false;
    }
    if (draftFilters.colors && draftFilters.colors.length > 0) {
      if (!p.colors.some(c => draftFilters.colors.includes(c.name))) return false;
    }
    if (draftFilters.fabrics && draftFilters.fabrics.length > 0) {
      if (!draftFilters.fabrics.includes(p.fabric)) return false;
    }

    const price = p.discountPrice || p.basePrice;
    if (price < draftFilters.minPrice || price > draftFilters.maxPrice) return false;

    return true;
  });

  // APPLIED FILTERED PRODUCTS (for product grid display — only updates on Apply Filters click)
  const filteredProducts = products.filter((p) => {
    if (tagParam === 'wishlist' || rawSlug === 'wishlist') return wishlist.includes(p.id);
    if (rawSlug && !['all', 'sale', 'new-arrivals', 'bestsellers', 'curves', 'ethnic', 'western'].includes(rawSlug)) {
      if (currentCategory?.id && p.categoryId !== currentCategory.id) return false;
    }
    if (rawSlug === 'sale' || tagParam === 'sale') {
      if (!p.tags.includes('sale') && !p.discountPrice && (!p.discountPercent || p.discountPercent <= 0)) return false;
    }
    if (rawSlug === 'new-arrivals' || tagParam === 'new_arrival') {
      if (!p.tags.includes('new_arrival')) return false;
    }
    if (rawSlug === 'bestsellers' || tagParam === 'bestseller') {
      if (!p.tags.includes('bestseller') && p.rating < 4.5) return false;
    }
    if (rawSlug === 'curves' || tagParam === 'curves_plus_size' || appliedFilters.plusSizeOnly) {
      if (!p.tags.includes('curves_plus_size') && !p.availableSizes.some(s => ['XL', 'XXL', '3XL', 'Free Size'].includes(s))) return false;
    }
    if (appliedFilters.subcategoryId) {
      const subId = appliedFilters.subcategoryId.toLowerCase();
      if (p.subcategoryId.toLowerCase() !== subId && !p.subcategoryId.toLowerCase().includes(subId)) return false;
    }
    if (appliedFilters.types && appliedFilters.types.length > 0) {
      if (!p.typeId || !appliedFilters.types.some(tId => p.typeId.toLowerCase() === tId.toLowerCase() || p.typeId.toLowerCase().includes(tId.toLowerCase()))) return false;
    }
    const activeBrandId = appliedFilters.brandId || brandParam;
    if (activeBrandId) {
      const bId = activeBrandId.toLowerCase();
      if (p.brandId?.toLowerCase() !== bId && (!p.brandName || !p.brandName.toLowerCase().includes(bId))) return false;
    }
    if (occasionParam) {
      const occLower = occasionParam.toLowerCase();
      if (!p.occasion.toLowerCase().includes(occLower) && !p.name.toLowerCase().includes(occLower)) return false;
    }
    if (ageParam) {
      const ageLower = ageParam.toLowerCase();
      if (!p.tags.some(t => t.toLowerCase().includes(ageLower)) && !p.name.toLowerCase().includes(ageLower) && !p.description.toLowerCase().includes(ageLower)) {
        if (ageLower === 'toddler' && !p.availableSizes.some(s => ['1-2Y', '2-3Y', 'S'].includes(s))) return false;
      }
    }
    const activeSearch = appliedFilters.searchQuery || searchParam;
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q) ||
                            p.fabric.toLowerCase().includes(q) ||
                            p.occasion.toLowerCase().includes(q) ||
                            (p.brandName && p.brandName.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (appliedFilters.occasions && appliedFilters.occasions.length > 0) {
      if (!appliedFilters.occasions.some(o => p.occasion.toLowerCase().includes(o.toLowerCase()))) return false;
    }
    if (appliedFilters.sizes && appliedFilters.sizes.length > 0) {
      if (!p.availableSizes.some(s => appliedFilters.sizes.includes(s))) return false;
    }
    if (appliedFilters.colors && appliedFilters.colors.length > 0) {
      if (!p.colors.some(c => appliedFilters.colors.includes(c.name))) return false;
    }
    if (appliedFilters.fabrics && appliedFilters.fabrics.length > 0) {
      if (!appliedFilters.fabrics.includes(p.fabric)) return false;
    }

    const price = p.discountPrice || p.basePrice;
    if (price < appliedFilters.minPrice || price > appliedFilters.maxPrice) return false;

    return true;
  });

  // SORT LOGIC
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const pA = a.discountPrice || a.basePrice;
    const pB = b.discountPrice || b.basePrice;
    if (appliedFilters.sortBy === 'price_asc') return pA - pB;
    if (appliedFilters.sortBy === 'price_desc') return pB - pA;
    if (appliedFilters.sortBy === 'rating') return b.rating - a.rating;
    if (appliedFilters.sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.reviewCount - a.reviewCount;
  });

  // MULTIPLE FILTER TOGGLE HELPERS (Mutates local draft state)
  const toggleDraftFilterItem = (key: 'occasions' | 'sizes' | 'colors' | 'fabrics', value: string) => {
    setDraftFilters(prev => {
      const list = prev[key] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter(item => item !== value) : [...list, value]
      };
    });
  };

  const toggleDraftType = (typeId: string) => {
    setDraftFilters(prev => {
      const exists = prev.types.includes(typeId);
      return {
        ...prev,
        types: exists ? prev.types.filter(id => id !== typeId) : [...prev.types, typeId]
      };
    });
  };

  // APPLY FILTERS ACTION
  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setFilters({ ...draftFilters });
    setCurrentPage(1);
    setMobileFilterOpen(false);
    // Scroll the independently-scrollable products panel back to the top
    const container = document.getElementById('products-grid-container');
    if (container) container.scrollTop = 0;
    showToast(`Filters Applied (${draftFilteredProducts.length} items found)`);
  };

  // RESET ALL FILTERS ACTION
  const handleResetFilters = () => {
    const emptyFilters: FilterState = {
      searchQuery: '',
      minPrice: 0,
      maxPrice: 10000,
      types: [],
      occasions: [],
      sizes: [],
      colors: [],
      fabrics: [],
      fits: [],
      tags: [],
      minDiscount: 0,
      rating: 0,
      plusSizeOnly: false,
      sortBy: 'popularity',
      subcategoryId: undefined,
    };
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setLocalMaxPrice(10000);
    setSidebarSubId(null);
    resetFilters();
    showToast("Filters Reset");
  };

  const hasUnappliedChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

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

      {/* FILTER TOP BAR & FLIPKART HORIZONTAL SORT TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-[#C0654B] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <p className="text-xs text-stone-600 font-medium">
            Showing <strong className="text-stone-900 font-bold">{sortedProducts.length}</strong> items in <strong>{sectionTitle}</strong>
          </p>
        </div>

        {/* FLIPKART HORIZONTAL SORT TABS */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          <span className="text-stone-500 font-bold mr-1 shrink-0">Sort By:</span>
          {[
            { id: 'popularity', label: 'Popularity' },
            { id: 'price_asc', label: 'Price -- Low to High' },
            { id: 'price_desc', label: 'Price -- High to Low' },
            { id: 'newest', label: 'Newest First' },
            { id: 'rating', label: 'Customer Rating' },
          ].map((tab) => {
            const isSelected = appliedFilters.sortBy === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const newSort = tab.id as any;
                  setDraftFilters(prev => ({ ...prev, sortBy: newSort }));
                  setAppliedFilters(prev => ({ ...prev, sortBy: newSort }));
                  setFilters(prev => ({ ...prev, sortBy: newSort }));
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'text-[#C0654B] border-b-2 border-[#C0654B] font-extrabold bg-[#C0654B]/5'
                    : 'text-stone-600 hover:text-[#C0654B]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT: TRULY INDEPENDENT SCROLL — sidebar and product grid each have their own scrollbar */}
      {/* The outer wrapper is fixed to viewport height so both columns scroll inside themselves */}
      <div className="flex gap-8 items-start" style={{ height: 'calc(100vh - 14rem)' }}>
        {/* DESKTOP FILTER SIDEBAR — independently scrollable, fixed height, never moves with page */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-2xl border border-stone-200 shadow-xs text-xs overflow-hidden" style={{ height: '100%' }}>
          {/* HEADER — pinned at top of sidebar, never scrolls away */}
          <div className="shrink-0 space-y-2.5 p-5 pb-3 border-b border-stone-200 bg-white z-10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif">
                <Filter className="w-4 h-4 text-[#C0654B]" />
                Filter Catalog
              </span>
              <button 
                onClick={handleResetFilters} 
                className="text-stone-500 hover:text-[#C0654B] font-bold text-[11px] transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* APPLY FILTERS BUTTON (TOP POSITION — APPLIES DRAFT SELECTIONS) */}
            <button
              onClick={handleApplyFilters}
              className={`w-full text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasUnappliedChanges
                  ? 'bg-[#C0654B] hover:bg-[#8B4A38] ring-2 ring-[#C0654B]/40 scale-[1.01]'
                  : 'bg-[#C0654B] hover:bg-[#8B4A38]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Apply Filters ({draftFilteredProducts.length} Items)</span>
              {hasUnappliedChanges && (
                <span className="bg-white text-[#C0654B] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ml-1 animate-pulse">
                  Unapplied
                </span>
              )}
            </button>
          </div>

          {/* INDEPENDENTLY SCROLLABLE FILTER LIST BODY — scrolls within the sidebar without moving the page */}
          <div className="flex-1 overflow-y-auto overscroll-contain pr-1.5 p-5 pt-3 space-y-5">
            {/* CURVES / PLUS-SIZE TOGGLE */}
            <div className="bg-[#F3E9E4] p-3 rounded-xl border border-[#C0654B]/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-[#C0654B] text-xs">CURVES (Plus-Size)</p>
                <p className="text-[10px] text-stone-600">Show size XL, XXL & 3XL items</p>
              </div>
              <input
                type="checkbox"
                checked={draftFilters.plusSizeOnly}
                onChange={(e) => setDraftFilters(prev => ({ ...prev, plusSizeOnly: e.target.checked }))}
                className="w-4 h-4 accent-[#C0654B] cursor-pointer"
              />
            </div>

            {/* Subcategories Filter — clicking one auto-expands its product types */}
            {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
              <div className="space-y-1.5 border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Subcategory</p>
                  {sidebarSubId && (
                    <button
                      onClick={() => {
                        setSidebarSubId(null);
                        setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                      }}
                      className="text-[10px] text-[#C0654B] font-bold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* All button */}
                <button
                  onClick={() => {
                    setSidebarSubId(null);
                    setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                  }}
                  className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                    !sidebarSubId ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  All {currentCategory.name}
                </button>

                {currentCategory.subcategories.map(sub => {
                  const isActive = sidebarSubId === sub.id;
                  const subTypes = sub.types || [];
                  return (
                    <div key={sub.id}>
                      {/* Subcategory button */}
                      <button
                        onClick={() => {
                          if (isActive) {
                            // Collapse: deselect
                            setSidebarSubId(null);
                            setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                          } else {
                            // Expand: select this subcategory, clear types
                            setSidebarSubId(sub.id);
                            setDraftFilters(prev => ({ ...prev, subcategoryId: sub.id, types: [] }));
                          }
                        }}
                        className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs flex items-center justify-between ${
                          isActive
                            ? 'bg-[#F3E9E4] text-[#C0654B] font-bold border border-[#C0654B]/30'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                          isActive ? 'rotate-90 text-[#C0654B]' : 'text-stone-400'
                        }`} />
                      </button>

                      {/* Types revealed inline when subcategory is active */}
                      {isActive && subTypes.length > 0 && (
                        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#C0654B]/30 pl-2">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 pb-0.5">Styles</p>
                          {subTypes.map(t => {
                            const isTypeSelected = draftFilters.types.includes(t.id);
                            return (
                              <button
                                key={t.id}
                                onClick={() => toggleDraftType(t.id)}
                                className={`w-full text-left py-1 px-2 rounded-md text-xs flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                                  isTypeSelected
                                    ? 'bg-[#C0654B] text-white font-bold'
                                    : 'text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                <span className="truncate">{t.name}</span>
                                {isTypeSelected && <Check className="w-3 h-3 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Product Type / Style Section Filter — only shown when NO subcategory is expanded in sidebar (to avoid duplication) */}
            {!sidebarSubId && (() => {
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
                    {(typeParam || draftFilters.types.length > 0) && (
                      <button
                        onClick={() => {
                          setDraftFilters(prev => ({ ...prev, types: [] }));
                        }}
                        className="text-[10px] text-[#C0654B] font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto filter-scroll-container pr-1">
                    {displayTypes.map(t => {
                      const isTypeActive = typeParam === t.id || typeParam === t.slug || draftFilters.types.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleDraftType(t.id)}
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

            {/* Occasion Filter (MULTIPLE SELECTABLE) */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Occasion</p>
                {draftFilters.occasions.length > 0 && (
                  <span className="text-[10px] text-[#C0654B] font-bold">
                    {draftFilters.occasions.length} selected
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {availableOccasions.map(occ => (
                  <label key={occ} className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-stone-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={draftFilters.occasions.includes(occ) || occasionParam === occ}
                      onChange={() => toggleDraftFilterItem('occasions', occ)}
                      className="w-3.5 h-3.5 accent-[#C0654B] cursor-pointer"
                    />
                    <span>{occ}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes Filter (MULTIPLE SELECTABLE) */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Size Pick</p>
                {draftFilters.sizes.length > 0 && (
                  <span className="text-[10px] text-[#C0654B] font-bold">
                    {draftFilters.sizes.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleDraftFilterItem('sizes', size)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
                      draftFilters.sizes.includes(size)
                        ? 'border-[#C0654B] bg-[#F3E9E4] text-[#C0654B] shadow-2xs font-bold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Filter (MULTIPLE SELECTABLE) */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Color Swatches</p>
                {draftFilters.colors.length > 0 && (
                  <span className="text-[10px] text-[#C0654B] font-bold">
                    {draftFilters.colors.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => toggleDraftFilterItem('colors', col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full border border-stone-300 cursor-pointer transition-transform ${
                      draftFilters.colors.includes(col.name) ? 'ring-2 ring-[#C0654B] ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-2 pb-2">
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalMaxPrice(val);
                  setDraftFilters(prev => ({ ...prev, maxPrice: val }));
                }}
                className="w-full accent-[#C0654B] cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* PRODUCTS LIST GRID — independently scrollable, fills remaining width */}
        <main id="products-grid-container" className="flex-1 overflow-y-auto pr-2 py-1 overscroll-contain">
          {sortedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
              {(rawSlug === 'wishlist' || tagParam === 'wishlist') ? (
                <>
                  <Heart className="w-12 h-12 text-[#C0654B] mx-auto fill-[#C0654B]/20 animate-pulse" />
                  <h3 className="text-xl font-bold font-serif text-stone-900">Your Wishlist is Empty</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">Explore our collections and tap the heart ❤️ icon on any item to save your favorite outfits for later!</p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('/category/all')}
                      className="bg-[#C0654B] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:bg-[#8B4A38] transition-colors"
                    >
                      Explore Fashion Catalog →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Sparkles className="w-10 h-10 text-[#C0654B] mx-auto" />
                  <h3 className="text-lg font-bold text-stone-900">No Clothing Items Found in "{sectionTitle}"</h3>
                  <p className="text-xs text-stone-500">Try adjusting your selected filters or clearing active section criteria.</p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => onNavigate(`/category/${currentCategory.slug}`)}
                      className="bg-[#C0654B] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-[#8B4A38]"
                    >
                      View All {currentCategory.name}
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="bg-stone-100 text-stone-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-stone-200"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (() => {
            const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
            const pagedProducts = sortedProducts.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE
            );

            const handlePageChange = (page: number) => {
              setCurrentPage(page);
              const container = document.getElementById('products-grid-container');
              if (container) container.scrollTop = 0;
            };

            // Build page numbers with ellipsis
            const getPageNumbers = () => {
              const pages: (number | '...')[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }
              return pages;
            };

            return (
              <div id="products-grid-top" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pagedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                      onToggleCompare={handleToggleCompare}
                      isCompared={comparedProductIds.includes(product.id)}
                    />
                  ))}
                </div>

                {/* PAGINATION BAR */}
                {totalPages > 1 && (
                  <div className="bg-white p-3 rounded border border-stone-200 flex items-center justify-between text-xs font-semibold shadow-2xs">
                    <span className="text-stone-500">
                      Page {currentPage} of {totalPages}
                      <span className="hidden sm:inline text-stone-400 font-normal ml-1">
                        ({sortedProducts.length} items)
                      </span>
                    </span>
                    <div className="flex items-center gap-1">
                      {/* PREV button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded hover:bg-stone-100 text-[#C0654B] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        <span className="hidden sm:inline">PREV</span>
                      </button>

                      {/* Page number buttons */}
                      {getPageNumbers().map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-stone-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p as number)}
                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center cursor-pointer transition-all ${
                              currentPage === p
                                ? 'bg-[#C0654B] text-white shadow-xs'
                                : 'hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      {/* NEXT button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded hover:bg-stone-100 text-[#C0654B] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline">NEXT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white p-5 overflow-hidden z-10 shadow-2xl pb-safe flex flex-col"
          >
            {/* PINNED HEADER AT TOP OF MOBILE FILTER SECTION WITH APPLY FILTERS BUTTON */}
            <div className="shrink-0 space-y-3 pb-3 border-b border-stone-200 bg-white z-10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-base font-serif">Filter Catalog</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-stone-500 hover:text-[#C0654B] transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setMobileFilterOpen(false)} 
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* APPLY FILTERS BUTTON (TOP POSITION IN MOBILE FILTER DRAWER) */}
              <button
                onClick={handleApplyFilters}
                className={`w-full text-white font-bold py-3 rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                  hasUnappliedChanges ? 'bg-[#C0654B] hover:bg-[#8B4A38] ring-2 ring-[#C0654B]/40' : 'bg-[#C0654B] hover:bg-[#8B4A38]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Apply Filters ({draftFilteredProducts.length} Items)</span>
              </button>
            </div>

            {/* INDEPENDENT SCROLL CONTAINER FOR MOBILE FILTERS BODY */}
            <div className="flex-1 overflow-y-auto filter-scroll-container overscroll-contain py-4 space-y-5 pr-1">
              {/* Mobile Subcategory — draft-only, same as desktop sidebar */}
              {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
                <div className="space-y-1.5 border-b border-stone-100 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs uppercase text-stone-900">Subcategory</p>
                    {sidebarSubId && (
                      <button
                        onClick={() => {
                          setSidebarSubId(null);
                          setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                        }}
                        className="text-[10px] text-[#C0654B] font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSidebarSubId(null);
                      setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                    }}
                    className={`block w-full text-left py-1.5 px-2 rounded-md text-xs ${
                      !sidebarSubId ? 'bg-[#F3E9E4] text-[#C0654B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    All {currentCategory.name}
                  </button>
                  {currentCategory.subcategories.map(sub => {
                    const isActive = sidebarSubId === sub.id;
                    const subTypes = sub.types || [];
                    return (
                      <div key={sub.id}>
                        <button
                          onClick={() => {
                            if (isActive) {
                              setSidebarSubId(null);
                              setDraftFilters(prev => ({ ...prev, subcategoryId: undefined, types: [] }));
                            } else {
                              setSidebarSubId(sub.id);
                              setDraftFilters(prev => ({ ...prev, subcategoryId: sub.id, types: [] }));
                            }
                          }}
                          className={`block w-full text-left py-1.5 px-2 rounded-md text-xs flex items-center justify-between ${
                            isActive
                              ? 'bg-[#F3E9E4] text-[#C0654B] font-bold border border-[#C0654B]/30'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                            isActive ? 'rotate-90 text-[#C0654B]' : 'text-stone-400'
                          }`} />
                        </button>
                        {isActive && subTypes.length > 0 && (
                          <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#C0654B]/30 pl-2">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 pb-0.5">Styles</p>
                            {subTypes.map(t => {
                              const isTypeSelected = draftFilters.types.includes(t.id);
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => toggleDraftType(t.id)}
                                  className={`w-full text-left py-1 px-2 rounded-md text-xs flex items-center justify-between gap-1 cursor-pointer transition-colors min-h-[36px] ${
                                    isTypeSelected
                                      ? 'bg-[#C0654B] text-white font-bold'
                                      : 'text-stone-700 hover:bg-stone-100'
                                  }`}
                                >
                                  <span className="truncate">{t.name}</span>
                                  {isTypeSelected && <Check className="w-3 h-3 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile Product Type — only shown when no subcategory expanded (types shown inline above) */}
              {!sidebarSubId && (() => {
                const displayTypes = currentSubcategory
                  ? (currentSubcategory.types || [])
                  : (currentCategory?.subcategories ? currentCategory.subcategories.flatMap(s => s.types || []) : allTypes);

                if (!displayTypes || displayTypes.length === 0) return null;

                return (
                  <div className="space-y-2 border-b border-stone-100 pb-4">
                    <p className="font-bold text-xs uppercase text-stone-900">Product Type / Section</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto filter-scroll-container pr-1">
                      {displayTypes.map(t => {
                        const isTypeActive = typeParam === t.id || typeParam === t.slug || draftFilters.types.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleDraftType(t.id)}
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
                    <label key={occ} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftFilters.occasions.includes(occ) || occasionParam === occ}
                        onChange={() => toggleDraftFilterItem('occasions', occ)}
                        className="w-3.5 h-3.5 accent-[#C0654B] cursor-pointer"
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
                      onClick={() => toggleDraftFilterItem('sizes', size)}
                      className={`px-3 py-1 rounded-md border text-xs font-semibold cursor-pointer ${
                        draftFilters.sizes.includes(size) ? 'bg-[#C0654B] text-white border-[#C0654B]' : 'border-stone-300'
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
                      onClick={() => toggleDraftFilterItem('colors', col.name)}
                      style={{ backgroundColor: col.hex }}
                      className={`w-6 h-6 rounded-full border border-stone-300 transition-transform cursor-pointer ${
                        draftFilters.colors.includes(col.name) ? 'ring-2 ring-[#C0654B] ring-offset-2 scale-110' : ''
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
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
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalMaxPrice(val);
                    setDraftFilters(prev => ({ ...prev, maxPrice: val }));
                  }}
                  className="w-full accent-[#C0654B] cursor-pointer"
                />
              </div>
            </div>
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
                <span className="text-stone-500">Need specific size advice? Ask our Live Chatbot assistant.</span>
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
