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
      const defaultOrders: Order[] = [
        {
          id: 'ord-101',
          orderNumber: 'PGM-89201',
          customerId: 'u-101',
          customerName: 'Priya Sharma',
          customerEmail: 'priya.sharma@example.com',
          customerPhone: '+91 98765 43210',
          shippingAddress: {
            id: 'addr-1',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43210',
            street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700091',
            type: 'home',
            isDefault: true
          },
          items: [
            {
              id: 'oi-1',
              productId: 'w-1',
              variantId: 'w-1-var',
              productName: 'Banarasi Brocade Royal Silk Saree',
              productImage: '/src/assets/images/user_hero_banner_1.png',
              size: 'Free Size',
              color: 'Royal Rose',
              price: 2499,
              quantity: 1
            }
          ],
          subtotal: 2499,
          discount: 0,
          shippingFee: 0,
          tax: 125,
          total: 2624,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          trackingNumber: 'DEL-PGM-771920',
          courierPartner: 'BlueDart Express',
          createdAt: '2026-08-01T10:30:00Z',
          updatedAt: '2026-08-04T14:20:00Z'
        },
        {
          id: 'ord-102',
          orderNumber: 'PGM-89202',
          customerId: 'u-101',
          customerName: 'Priya Sharma',
          customerEmail: 'priya.sharma@example.com',
          customerPhone: '+91 98765 43210',
          shippingAddress: {
            id: 'addr-1',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43210',
            street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700091',
            type: 'home',
            isDefault: true
          },
          items: [
            {
              id: 'oi-2',
              productId: 'm-1',
              variantId: 'm-1-var',
              productName: 'Terracotta Linen Kurta & Churidar Set',
              productImage: '/src/assets/images/user_hero_banner_3.png',
              size: 'L',
              color: 'Terracotta Maroon',
              price: 1899,
              quantity: 1
            }
          ],
          subtotal: 1899,
          discount: 100,
          shippingFee: 0,
          tax: 95,
          total: 1894,
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          trackingNumber: 'EXP-PGM-991823',
          courierPartner: 'Delhivery Express',
          createdAt: '2026-08-05T09:15:00Z',
          updatedAt: '2026-08-06T11:00:00Z'
        }
      ];
      localStorage.setItem('terra_orders_v2', JSON.stringify(defaultOrders));
      return defaultOrders;
    } catch {
      return [];
    }
  });
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
        if (!parsed.addresses || parsed.addresses.length === 0) {
          parsed.addresses = [
            {
              id: 'addr-1',
              fullName: parsed.name || 'Priya Sharma',
              phone: parsed.phone || '+91 98765 43210',
              street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
              city: 'Kolkata',
              state: 'West Bengal',
              pincode: '700091',
              type: 'home',
              isDefault: true
            }
          ];
        }
        return parsed;
      }
      return {
        id: 'u-101',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43210',
        points: 350,
        createdAt: '2026-01-01',
        addresses: [
          {
            id: 'addr-1',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43210',
            street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700091',
            type: 'home',
            isDefault: true
          }
        ]
      };
    } catch {
      return null;
    }
  });

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('terra_user');
  };

  const loginUser = (name: string, email: string, phone?: string) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name || 'Valued Customer',
      email: email || 'customer@example.com',
      phone: phone || '+91 98765 43210',
      points: 100,
      createdAt: new Date().toISOString().split('T')[0],
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: name || 'Valued Customer',
          phone: phone || '+91 98765 43210',
          street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700091',
          type: 'home',
          isDefault: true
        }
      ]
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

  // Fetch live state from backend on load
  const reloadCatalog = async () => {
    try {
      const [resSet, resCat, resProd, resOrd, resBrs] = await Promise.all([
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
        fetch('/api/categories').then(r => r.ok ? r.json() : null),
        fetch('/api/products').then(r => r.ok ? r.json() : null),
        fetch('/api/orders').then(r => r.ok ? r.json() : null),
        fetch('/api/brands').then(r => r.ok ? r.json() : null)
      ]);

      if (resSet) {
        setSettings({
          ...resSet,
          address: initialSiteSettings.address
        });
      }
      if (resCat && resCat.length) setCategories(resCat);
      if (resProd && resProd.length > 0) {
        if (resProd.length >= initialProducts.length) {
          setProducts(resProd);
        } else {
          const prodMap = new Map(resProd.map((p: any) => [p.id, p]));
          setProducts(initialProducts.map(p => prodMap.get(p.id) || p));
        }
      }
      if (resOrd) setOrders(resOrd);
      if (resBrs) setBrands(resBrs);
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
              const prevMap = new Map(prev.map(o => [o.id, o]));
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
      await adminFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch (e) {
      console.warn('Backend sync failed for product creation', e);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    showToast('Product updated successfully');
    try {
      await adminFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } catch (e) {
      console.warn('Backend sync failed for product update', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted');
    try {
      await adminFetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend sync failed for product deletion', e);
    }
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
