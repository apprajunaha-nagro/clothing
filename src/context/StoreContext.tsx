import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SiteSettings,
  Category,
  Brand,
  Product,
  CartItem,
  Order,
  Coupon,
  FilterState,
  User,
  ProductVariant,
  Banner
} from '../types';
import { initialSiteSettings, initialCategories, initialBrands, initialProducts, initialBanners, initialCoupons } from '../data/seedData';
import { adminFetch } from '../utils/apiClient';

interface StoreContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  saveBrand: (brand: Brand) => Promise<void>;
  toggleBrand: (id: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, qty?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQty: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoutUser: () => void;
  loginUser: (name: string, email: string, phone?: string) => void;
  isAdminLoggedIn: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  adminLogout: () => void;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNum?: string) => Promise<void>;
  requestOrderReturn: (orderId: string, returnType: 'return' | 'exchange', reason: string, details?: { exchangeSize?: string; exchangeColor?: string; comments?: string }) => void;
  updateReturnStatus: (orderId: string, returnStatus: 'approved' | 'rejected' | 'completed', adminNotes?: string) => void;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  addReview: (reviewData: Partial<Review>) => void;
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => void;
  deleteReview: (id: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  sizeChartCategory: string | null;
  setSizeChartCategory: (catId: string | null) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  reloadCatalog: () => Promise<void>;
}

const defaultFilters: FilterState = {
  types: [],
  occasions: [],
  sizes: [],
  colors: [],
  fabrics: [],
  fits: [],
  tags: [],
  minPrice: 0,
  maxPrice: 10000,
  minDiscount: 0,
  rating: 0,
  plusSizeOnly: false,
  searchQuery: '',
  sortBy: 'popularity'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('terra_banners_v9');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('terra_banners_v9', JSON.stringify(initialBanners));
      return initialBanners;
    } catch {
      return initialBanners;
    }
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('pgmart_coupons');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCoupons;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('terra_orders_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('pgmart_reviews_v2');
      if (saved) return JSON.parse(saved);
      const defaultReviews: Review[] = [
        {
          id: 'rev-1',
          productId: 'w-1',
          customerName: 'Aishwarya Roy',
          rating: 5,
          title: 'Breathtaking quality & authentic weave!',
          comment: 'Absolutely gorgeous Banarasi saree! The gold zari work is extremely fine and matches the photo perfectly. Delivery was super fast within Kolkata.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: '2026-08-01T14:30:00Z'
        },
        {
          id: 'rev-2',
          productId: 'm-1',
          customerName: 'Vikram Seth',
          rating: 5,
          title: 'Pure handloom feel, perfect fitting',
          comment: 'The terracotta kurta set has top-notch stitching and pure breathable fabric. Got tons of compliments at the festive gathering!',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: '2026-07-29T10:15:00Z'
        },
        {
          id: 'rev-3',
          productId: 'k-1',
          customerName: 'Priyanka Ghosh',
          rating: 5,
          title: 'Kids clothing is so soft and gentle',
          comment: 'Super soft material for my 4 year old boy. No irritation on skin and the embroidery is gentle on the inside lining.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: '2026-07-26T16:45:00Z'
        },
        {
          id: 'rev-4',
          productId: 'u-1',
          customerName: 'Debarati Mukherjee',
          rating: 5,
          title: 'Ultimate luxury innerwear comfort',
          comment: 'Very premium organic cotton fabric. Durable elastic, seamless finish, and keeps you comfortable all day long.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: '2026-07-22T11:20:00Z'
        },
        {
          id: 'rev-5',
          productId: 'w-2',
          customerName: 'Sneha Banerjee',
          rating: 5,
          title: 'Loved the packaging and weaver story!',
          comment: 'Authentic Indian ethnic fashion at such fair direct pricing. Very happy to support artisan weavers through PGmart.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: '2026-07-18T18:00:00Z'
        }
      ];
      localStorage.setItem('pgmart_reviews_v2', JSON.stringify(defaultReviews));
      return defaultReviews;
    } catch {
      return [];
    }
  });

  const addReview = (reviewData: Partial<Review>) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId || 'w-1',
      customerName: reviewData.customerName || 'PGmart Shopper',
      rating: reviewData.rating || 5,
      title: reviewData.title || 'Excellent purchase!',
      comment: reviewData.comment || '',
      isVerifiedPurchase: reviewData.isVerifiedPurchase !== false,
      status: reviewData.status || 'approved',
      createdAt: new Date().toISOString()
    };
    setReviews(prev => {
      const updated = [newRev, ...prev];
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Customer review created and updated live!');
  };

  const updateReviewStatus = (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status } : r);
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast(`Review status updated to ${status.toUpperCase()}`);
  };

  const deleteReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Review removed.');
  };
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('terra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('terra_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('terra_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name !== 'Priya Sharma') {
          // Filter out any legacy dummy address from parsed user
          const cleanedAddrs = Array.isArray(parsed.addresses)
            ? parsed.addresses.filter((a: any) => !a.street?.includes('Flat 402, Lotus Apartments'))
            : [];
          return { ...parsed, addresses: cleanedAddrs };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('terra_user');
  };

  const loginUser = (name: string, email: string, phone?: string, initialAddresses?: Address[]) => {
    // Preserve existing saved addresses if user previously saved any
    let savedAddrs: Address[] = [];
    if (initialAddresses && initialAddresses.length > 0) {
      savedAddrs = initialAddresses;
    } else {
      try {
        const saved = localStorage.getItem('terra_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email?.toLowerCase() === email?.toLowerCase() && Array.isArray(parsed?.addresses)) {
            savedAddrs = parsed.addresses.filter((a: Address) => !a.street?.includes('Flat 402, Lotus Apartments'));
          }
        }
      } catch {}
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name || 'Valued Customer',
      email: email || 'customer@example.com',
      phone: phone || '',
      points: 100,
      createdAt: new Date().toISOString().split('T')[0],
      addresses: savedAddrs
    };
    setUser(newUser);
    localStorage.setItem('terra_user', JSON.stringify(newUser));
  };
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('pgmart_admin_token') || sessionStorage.getItem('pgmart_admin_token');
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('pgmart_admin_token') || sessionStorage.getItem('pgmart_admin_token'));
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeChartCategory, setSizeChartCategory] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Apply CSS Variables dynamically based on site settings
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.primaryColor || '#C0654B');
    root.style.setProperty('--color-primary-dark', settings.primaryDarkColor || '#8B4A38');
    root.style.setProperty('--color-bg-muted', settings.bgMutedColor || '#F3E9E4');
    root.style.setProperty('--color-secondary-dark', settings.secondaryDarkColor || '#2B2620');
  }, [settings]);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('terra_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('terra_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync Banners to localStorage permanently across reloads
  useEffect(() => {
    try {
      localStorage.setItem('terra_banners_v5', JSON.stringify(banners));
    } catch (e) {
      console.error('Failed to save banners to localStorage:', e);
    }
  }, [banners]);

  // Helper to safely fetch JSON from backend routes
  const safeJsonFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  };

  // Fetch live state from backend on load
  const reloadCatalog = async () => {
    try {
      const [resSet, resCat, resProd, resOrd, resBrs] = await Promise.all([
        safeJsonFetch('/api/settings'),
        safeJsonFetch('/api/categories'),
        safeJsonFetch('/api/products'),
        safeJsonFetch('/api/orders'),
        safeJsonFetch('/api/brands')
      ]);

      if (resSet) {
        setSettings({
          ...resSet,
          address: initialSiteSettings.address
        });
      }
      if (resCat && Array.isArray(resCat) && resCat.length > 0) setCategories(resCat);
      if (resProd && Array.isArray(resProd) && resProd.length > 0) {
        if (resProd.length >= initialProducts.length) {
          setProducts(resProd);
        } else {
          const prodMap = new Map(resProd.map((p: any) => [p.id, p]));
          setProducts(initialProducts.map(p => prodMap.get(p.id) || p));
        }
      }
      if (resOrd) {
        const orderList = Array.isArray(resOrd) ? resOrd : (resOrd.orders || []);
        if (Array.isArray(orderList)) setOrders(orderList);
      }
      if (resBrs && Array.isArray(resBrs) && resBrs.length > 0) setBrands(resBrs);
    } catch (e) {
      console.warn('Backend sync failed, using initial seed data', e);
    }
  };

  useEffect(() => {
    reloadCatalog();
  }, []);

  // Automatic localStorage persistence for orders
  useEffect(() => {
    try {
      localStorage.setItem('terra_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders', e);
    }
  }, [orders]);

  // Real-time Order Sync (Polls /api/orders every 3 seconds so placed orders reflect immediately in Admin Portal)
  useEffect(() => {
    const syncOrdersInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const dbOrders = await res.json();
          if (Array.isArray(dbOrders) && dbOrders.length > 0) {
            setOrders(prev => {
              const prevMap = new Map<string, Order>(prev.map(o => [o.id, o]));
              const merged = dbOrders.map((dbOrd: Order) => {
                const localOrd = prevMap.get(dbOrd.id);
                // Keep local status if local status was updated more recently
                if (localOrd && localOrd.updatedAt && new Date(localOrd.updatedAt) >= new Date(dbOrd.updatedAt || 0)) {
                  return { ...dbOrd, status: localOrd.status, isStockDeducted: localOrd.isStockDeducted || dbOrd.isStockDeducted, updatedAt: localOrd.updatedAt };
                }
                return dbOrd;
              });
              const dbIds = new Set(dbOrders.map((o: Order) => o.id));
              const localOnly = prev.filter(o => !dbIds.has(o.id));
              return [...merged, ...localOnly];
            });
          }
        }
      } catch (e) {
        // silent fallback to local state
      }
    }, 3000);
    return () => clearInterval(syncOrdersInterval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await adminFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      showToast('Site settings updated successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product: Product, variant: ProductVariant, qty = 1) => {
    const existingIndex = cart.findIndex(c => c.variant.id === variant.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += qty;
      setCart(newCart);
    } else {
      setCart(prev => [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          variant,
          quantity: qty,
          selectedColor: variant.color,
          selectedSize: variant.size
        }
      ]);
    }
    showToast(`Added ${product.name} (${variant.size}) to cart`);
    setCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQty = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const saveCoupon = async (newCoupon: Coupon) => {
    setCoupons(prev => {
      const cleanCode = newCoupon.code.trim().toUpperCase();
      const existingIdx = prev.findIndex(c => c.id === newCoupon.id || c.code.toUpperCase() === cleanCode);
      let updated: Coupon[];
      if (existingIdx > -1) {
        updated = prev.map((c, i) => i === existingIdx ? newCoupon : c);
      } else {
        updated = [newCoupon, ...prev];
      }
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
    } catch (e) {
      console.warn('Backend sync failed for coupon creation', e);
    }
  };

  const toggleCoupon = async (id: string) => {
    setCoupons(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteCoupon = async (id: string) => {
    setCoupons(prev => {
      const updated = prev.filter(c => c.id !== id);
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend sync failed for coupon deletion', e);
    }
  };

  const saveBrand = async (brand: Brand) => {
    setBrands(prev => {
      const exists = prev.some(b => b.id === brand.id);
      if (exists) return prev.map(b => b.id === brand.id ? brand : b);
      return [...prev, brand];
    });
    try {
      await adminFetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
    } catch (e) {
      console.warn('Backend brand save fallback', e);
    }
  };

  const toggleBrand = async (id: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, isActive: b.isActive === false ? true : false } : b));
    try {
      const target = brands.find(b => b.id === id);
      if (target) {
        await adminFetch(`/api/brands/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, isActive: target.isActive === false ? true : false }),
        });
      }
    } catch (e) {
      console.warn('Backend brand toggle fallback', e);
    }
  };

  const deleteBrand = async (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
    try {
      await adminFetch(`/api/brands/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend brand delete fallback', e);
    }
  };

  const applyCoupon = async (code: string) => {
    const cartTotal = cart.reduce((acc, item) => acc + (item.variant.discountPrice || item.variant.price) * item.quantity, 0);
    const cleanCode = code.trim().toUpperCase();

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, cartTotal })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAppliedCoupon(data.coupon);
          setCouponDiscount(data.discountAmount);
          showToast(`Coupon ${cleanCode} applied! Saved ₹${data.discountAmount}`);
          return { success: true, message: `Coupon applied: ₹${data.discountAmount} off` };
        } else {
          return { success: false, message: data.error || 'Failed to apply coupon' };
        }
      }
    } catch (e) {
      console.warn('Backend coupon validate offline fallback', e);
    }

    // Local state fallback validation
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!coupon) {
      return { success: false, message: `Invalid or inactive promo code "${cleanCode}".` };
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { success: false, message: `Promo coupon code "${cleanCode}" has expired.` };
    }
    if (cartTotal < (coupon.minOrderValue || 0)) {
      return { success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required for ${cleanCode}.` };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(cartTotal * (coupon.value / 100));
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    setAppliedCoupon(coupon);
    setCouponDiscount(discountAmount);
    showToast(`Coupon ${cleanCode} applied! Saved ₹${discountAmount}`);
    return { success: true, message: `Coupon applied: ₹${discountAmount} off` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to Wishlist');
        return [...prev, productId];
      }
    });
  };

  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setAdminToken(data.token);
          setIsAdminLoggedIn(true);
          localStorage.setItem('pgmart_admin_token', data.token);
          sessionStorage.setItem('pgmart_admin_token', data.token);
          showToast('Logged in as Store Administrator');
          return true;
        }
      }
    } catch (e) {
      console.warn('Backend admin login offline fallback', e);
    }

    if (password === 'pgmart123' || password === 'admin123') {
      const fallbackToken = 'pgmart123';
      setAdminToken(fallbackToken);
      setIsAdminLoggedIn(true);
      localStorage.setItem('pgmart_admin_token', fallbackToken);
      sessionStorage.setItem('pgmart_admin_token', fallbackToken);
      showToast('Logged in as Store Administrator');
      return true;
    }

    return false;
  };

  const adminLogout = () => {
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('pgmart_admin_token');
    sessionStorage.removeItem('pgmart_admin_token');
    showToast('Admin logged out');
  };

  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    await updateSettings(newSettings);
  };

  const createProduct = async (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: productData.id || `p-${Date.now()}`,
      name: productData.name || 'New Product',
      slug: productData.slug || (productData.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brandName: productData.brandName || settings.storeName,
      categoryId: productData.categoryId || 'women',
      subcategoryId: productData.subcategoryId || 'women-ethnic',
      typeId: productData.typeId || 'type-sarees',
      basePrice: productData.basePrice || 1999,
      discountPrice: productData.discountPrice,
      fabric: productData.fabric || 'Cotton Blend',
      fit: productData.fit || 'Regular Fit',
      occasion: productData.occasion || 'Everyday',
      availableSizes: productData.availableSizes || ['S', 'M', 'L', 'XL'],
      colors: productData.colors || [
        {
          name: 'Primary',
          hex: settings.primaryColor || '#C0654B',
          images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80']
        }
      ],
      tags: productData.tags || ['new_arrival'],
      rating: productData.rating || 4.5,
      reviewCount: productData.reviewCount || 1,
      description: productData.description || 'Premium quality apparel designed for maximum comfort and style.',
      status: productData.status || 'published',
      variants: productData.variants || [],
      hsnCode: productData.hsnCode || '5407',
      gstPercent: productData.gstPercent || 5,
      created_at: productData.created_at || new Date().toISOString()
    };

    setProducts(prev => {
      if (prev.some(p => p.id === newProduct.id)) {
        return prev.map(p => p.id === newProduct.id ? newProduct : p);
      }
      return [newProduct, ...prev];
    });

    try {
      const res = await adminFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          const savedProd = data.product;
          setProducts(prev => {
            if (prev.some(p => p.id === savedProd.id)) {
              return prev.map(p => p.id === savedProd.id ? savedProd : p);
            }
            return [savedProd, ...prev];
          });
          showToast('Product created successfully');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend sync failed for product creation', e);
    }
    setProducts(prev => {
      if (prev.some(p => p.id === newProduct.id)) {
        return prev.map(p => p.id === newProduct.id ? newProduct : p);
      }
      return [newProduct, ...prev];
    });
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const res = await adminFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          const updatedProd = data.product;
          setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProd } : p));
          showToast('Product updated successfully');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend sync failed for product update', e);
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    showToast('Product updated successfully');
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await adminFetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted from database');
        return;
      }
    } catch (e) {
      console.warn('Backend sync failed for product deletion', e);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted');
  };

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    let createdOrder: Order | null = null;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success && data.order) {
        createdOrder = data.order;
      }
    } catch (err) {
      console.warn('Backend API order creation failed, relying on local state fallback', err);
    }

    // Construct full order object if API is offline or returned null
    if (!createdOrder) {
      createdOrder = {
        id: orderData.id || `ord-${Date.now()}`,
        orderNumber: orderData.orderNumber || `PGM-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: orderData.customerId || user?.id || 'guest',
        customerName: orderData.customerName || 'Customer',
        customerEmail: orderData.customerEmail || 'support@pgmart.in',
        customerPhone: orderData.customerPhone || '+91 94711 55434',
        shippingAddress: orderData.shippingAddress || {
          id: `addr-${Date.now()}`,
          fullName: orderData.customerName || 'Customer',
          phone: orderData.customerPhone || '+91 94711 55434',
          street: 'Kapda Patti, Jharia',
          city: 'Dhanbad',
          state: 'Jharkhand',
          pincode: '828111',
          type: 'home'
        },
        items: orderData.items || cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          variantId: item.selectedVariant.id,
          sku: item.selectedVariant.sku,
          size: item.selectedVariant.size,
          color: item.selectedVariant.color,
          price: item.selectedVariant.price,
          quantity: item.quantity,
          image: item.selectedVariant.image || item.product.images[0]
        })),
        subtotal: orderData.subtotal || 0,
        shippingFee: orderData.shippingFee || 0,
        tax: orderData.tax || 0,
        discount: orderData.discount || 0,
        total: orderData.total || 0,
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: orderData.paymentStatus || 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    setOrders(prev => [createdOrder!, ...prev]);
    clearCart();
    showToast(`Order #${createdOrder.orderNumber} successfully placed!`);
    return createdOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNum?: string) => {
    const isDelivered = status === 'delivered';
    const isConfirmedOrBeyond = ['confirmed', 'processing', 'shipped', 'delivered'].includes(status);
    const targetOrder = orders.find(o => o.id === orderId);

    let stockDeductedNow = false;
    let stockRestoredNow = false;

    // 1. DEDUCT QUANTITY FROM PRODUCT LIST IF ORDER IS CONFIRMED BY ADMIN
    if (isConfirmedOrBeyond && targetOrder && !targetOrder.isStockDeducted) {
      stockDeductedNow = true;
      setProducts(prevProducts => {
        const updated = [...prevProducts];
        targetOrder.items.forEach(item => {
          const pIndex = updated.findIndex(p => p.id === item.productId);
          if (pIndex !== -1) {
            const prod = updated[pIndex];
            // Calculate new stock quantity
            const currentStock = (prod as any).stockQuantity ?? 100;
            const newStock = Math.max(0, currentStock - item.quantity);

            // Deduct variant stock if variantId matches
            let updatedVariants = prod.variants;
            if (item.variantId && Array.isArray(prod.variants)) {
              updatedVariants = prod.variants.map(v => {
                if (v.id === item.variantId || v.size === item.size) {
                  return { ...v, stockQuantity: Math.max(0, (v.stockQuantity ?? 50) - item.quantity) };
                }
                return v;
              });
            }

            updated[pIndex] = {
              ...prod,
              stockQuantity: newStock,
              inStock: newStock > 0,
              status: newStock === 0 ? 'out_of_stock' : prod.status,
              variants: updatedVariants
            };

            // Sync updated stock to backend API
            adminFetch(`/api/products/${prod.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stockQuantity: newStock, inStock: newStock > 0 })
            }).catch(() => {});
          }
        });
        return updated;
      });
    }

    // 2. RESTORE QUANTITY IF CONFIRMED ORDER IS LATER CANCELLED OR RETURNED
    if ((status === 'cancelled' || status === 'returned') && targetOrder && targetOrder.isStockDeducted) {
      stockRestoredNow = true;
      setProducts(prevProducts => {
        const updated = [...prevProducts];
        targetOrder.items.forEach(item => {
          const pIndex = updated.findIndex(p => p.id === item.productId);
          if (pIndex !== -1) {
            const prod = updated[pIndex];
            const currentStock = (prod as any).stockQuantity ?? 0;
            const newStock = currentStock + item.quantity;
            updated[pIndex] = {
              ...prod,
              stockQuantity: newStock,
              inStock: true,
              status: prod.status === 'out_of_stock' ? 'published' : prod.status
            };

            adminFetch(`/api/products/${prod.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stockQuantity: newStock, inStock: true })
            }).catch(() => {});
          }
        });
        return updated;
      });
    }

    // 3. Instant local state update for zero latency reflection across Admin & Storefront
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          trackingNumber: trackingNum || o.trackingNumber,
          paymentStatus: isDelivered ? 'paid' : o.paymentStatus,
          isStockDeducted: stockDeductedNow ? true : (stockRestoredNow ? false : o.isStockDeducted),
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    const toastMsg = stockDeductedNow
      ? `Order #${orderId} status updated to "${status.toUpperCase()}" & Quantity Deducted from Product List!`
      : `Order #${orderId} status updated to "${status.toUpperCase()}"`;
    showToast(toastMsg);

    // 4. Sync updated status to backend API
    try {
      await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: trackingNum, isStockDeducted: stockDeductedNow ? true : undefined })
      });
    } catch (e) {
      console.warn('Backend sync for status update failed, local state updated successfully', e);
    }
  };

  const requestOrderReturn = (
    orderId: string,
    returnType: 'return' | 'exchange',
    reason: string,
    details?: { exchangeSize?: string; exchangeColor?: string; comments?: string }
  ) => {
    setOrders(prev => {
      const updated = prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            returnStatus: returnType === 'return' ? 'return_requested' : ('exchange_requested' as any),
            returnType,
            returnReason: reason,
            returnComments: details?.comments,
            exchangeSize: details?.exchangeSize,
            exchangeColor: details?.exchangeColor,
            updatedAt: new Date().toISOString()
          };
        }
        return ord;
      });
      try {
        localStorage.setItem('terra_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast(`Return request submitted successfully! Pickup will be scheduled within 48h.`);
  };

  const updateReturnStatus = (
    orderId: string,
    returnStatus: 'approved' | 'rejected' | 'completed',
    adminNotes?: string
  ) => {
    setOrders(prev => {
      const updated = prev.map(ord => {
        if (ord.id === orderId) {
          const isApproved = returnStatus === 'approved';
          const isRejected = returnStatus === 'rejected';
          return {
            ...ord,
            returnStatus,
            status: isApproved ? 'returned' as const : isRejected ? ord.status : 'returned' as const,
            paymentStatus: isApproved ? 'refunded' : ord.paymentStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return ord;
      });
      try {
        localStorage.setItem('terra_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast(`Return claim #${orderId} marked as ${returnStatus.toUpperCase()}`);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        setCategories,
        brands,
        setBrands,
        saveBrand,
        toggleBrand,
        deleteBrand,
        products,
        setProducts,
        banners,
        setBanners,
        coupons,
        setCoupons,
        saveCoupon,
        toggleCoupon,
        deleteCoupon,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        user,
        setUser,
        logoutUser,
        loginUser,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        saveSettings,
        createProduct,
        updateProduct,
        deleteProduct,
        orders,
        createOrder,
        updateOrderStatus,
        requestOrderReturn,
        updateReturnStatus,
        reviews,
        setReviews,
        addReview,
        updateReviewStatus,
        deleteReview,
        filters,
        setFilters,
        resetFilters,
        toastMessage,
        showToast,
        searchModalOpen,
        setSearchModalOpen,
        cartDrawerOpen,
        setCartDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        sizeChartCategory,
        setSizeChartCategory,
        chatOpen,
        setChatOpen,
        reloadCatalog
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
