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

interface StoreContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  brands: Brand[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  coupons: Coupon[];
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
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNum?: string) => Promise<void>;
  requestOrderReturn: (orderId: string, returnType: 'return' | 'exchange', reason: string, details?: { exchangeSize?: string; exchangeColor?: string; comments?: string }) => void;
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
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('terra_admin_auth') === 'true';
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

      if (resSet) setSettings(resSet);
      if (resCat && resCat.length) setCategories(resCat);
      if (resProd && resProd.length) setProducts(resProd);
      if (resOrd) setOrders(resOrd);
      if (resBrs) setBrands(resBrs);
    } catch (e) {
      console.warn('Backend sync failed, using initial seed data', e);
    }
  };

  useEffect(() => {
    reloadCatalog();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await fetch('/api/settings', {
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

  const applyCoupon = async (code: string) => {
    const cartTotal = cart.reduce((acc, item) => acc + (item.variant.discountPrice || item.variant.price) * item.quantity, 0);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount);
        showToast(`Coupon ${code.toUpperCase()} applied! Saved ₹${data.discountAmount}`);
        return { success: true, message: `Coupon applied: ₹${data.discountAmount} off` };
      } else {
        return { success: false, message: data.error || 'Failed to apply coupon' };
      }
    } catch (e) {
      return { success: false, message: 'Server error applying coupon' };
    }
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

  const adminLogin = (password: string) => {
    if (password === 'admin123' || password === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('terra_admin_auth', 'true');
      showToast('Logged in as Store Administrator');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('terra_admin_auth');
    showToast('Admin logged out');
  };

  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    await updateSettings(newSettings);
  };

  const createProduct = async (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: productData.name || 'New Product',
      slug: (productData.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brandName: productData.brandName || settings.storeName,
      categoryId: productData.categoryId || 'women',
      subcategoryId: productData.subcategoryId || 'women-ethnic',
      typeId: productData.typeId || 'type-sarees',
      basePrice: productData.basePrice || 1999,
      discountPrice: productData.discountPrice || 1499,
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
      created_at: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" created successfully`);

    try {
      await fetch('/api/products', {
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
      await fetch(`/api/products/${id}`, {
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
      await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend sync failed for product deletion', e);
    }
  };

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders(prev => [data.order, ...prev]);
        clearCart();
        return data.order;
      }
    } catch (err) {
      console.error('Error placing order', err);
    }
    return null;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNum?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: trackingNum })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, trackingNumber: trackingNum || o.trackingNumber } : o));
        showToast(`Order #${orderId} status updated to ${status}`);
      }
    } catch (e) {
      console.error(e);
      // Fallback local update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, trackingNumber: trackingNum || o.trackingNumber } : o));
      showToast(`Order status updated to ${status}`);
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
    showToast(`${returnType === 'return' ? 'Return' : 'Exchange'} request submitted successfully! Pickup will be scheduled within 48h.`);
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
        products,
        setProducts,
        banners,
        setBanners,
        coupons,
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
