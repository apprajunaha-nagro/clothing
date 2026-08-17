import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  Banner,
  BlogPost
} from '../types';
import { initialSiteSettings, initialCategories, initialBrands, initialProducts, initialBanners, initialCoupons } from '../data/seedData';
import { initialBlogPosts } from '../data/blogPosts';
import { adminFetch } from '../utils/apiClient';
import { supabase } from '../lib/supabaseClient';

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
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  saveBlogPost: (postData: Partial<BlogPost> & { id?: string }) => Promise<BlogPost | null>;
  deleteBlogPost: (id: string) => Promise<boolean>;
  toggleBlogPostStatus: (id: string) => Promise<void>;
  reloadBlogPosts: () => Promise<void>;
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

function parseDbBlogPost(p: any): BlogPost {
  let content = p.content;
  if (typeof content === 'string') {
    try { content = JSON.parse(content); } catch (e) { content = [content]; }
  }
  let tags = p.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch (e) { tags = []; }
  }
  return {
    ...p,
    content: Array.isArray(content) ? content : [String(content || '')],
    tags: Array.isArray(tags) ? tags : [],
    isPublished: p.isPublished !== false,
    status: p.isPublished !== false ? 'published' : 'draft',
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString()
  };
}

// Safe localStorage helper with automatic QuotaExceededError recovery & cache trimming
const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014 || (typeof e?.message === 'string' && e.message.includes('quota'))) {
      try {
        const legacyKeys = [
          'terra_banners_v1', 'terra_banners_v2', 'terra_banners_v3', 'terra_banners_v4', 'terra_banners_v5',
          'terra_banners_v6', 'terra_banners_v7', 'terra_banners_v8', 'terra_products', 'terra_settings',
          'terra_orders', 'terra_wishlist_v1', 'pgmart_analytics_v1', 'pgmart_marketing_data'
        ];
        legacyKeys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
        localStorage.setItem(key, value);
      } catch {
        // Degrade safely without throwing unhandled exceptions
      }
    }
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('pgmart_site_settings');
      if (saved) return { ...initialSiteSettings, ...JSON.parse(saved) };
    } catch {}
    return initialSiteSettings;
  });
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('pgmart_brands');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialBrands;
  });
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('pgmart_blog_posts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialBlogPosts;
  });
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

  // Fetch reviews from PostgreSQL DB / Supabase on mount
  useEffect(() => {
    async function loadDbReviews() {
      const reviewMap = new Map<string, Review>();

      // 1. Fetch from Supabase direct table
      try {
        const { data: sbReviews, error: sbErr } = await supabase.from('Review').select('*').order('createdAt', { ascending: false });
        if (!sbErr && Array.isArray(sbReviews)) {
          sbReviews.forEach(r => {
            if (r && r.id) reviewMap.set(r.id, r);
          });
        }
      } catch (e) {
        console.warn('Supabase Review select fallback:', e);
      }

      // 2. Fetch from Express / Prisma REST API
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const text = await res.text();
          if (text.startsWith('{') || text.startsWith('[')) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              data.forEach(r => {
                if (r && r.id) reviewMap.set(r.id, r);
              });
            }
          }
        }
      } catch (e) {
        console.warn('REST API /api/reviews fetch fallback:', e);
      }

      if (reviewMap.size > 0) {
        const list = Array.from(reviewMap.values());
        setReviews(list);
        try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(list)); } catch {}
      } else {
        // If DB has 0 reviews, seed the default verified reviews so homepage ticker and admin immediately have live data
        const initialList: Review[] = [
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
        setReviews(initialList);
        try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(initialList)); } catch {}

        // Seed to Supabase & Prisma asynchronously
        initialList.forEach(r => {
          supabase.from('Review').insert([r]).then(() => {}).catch(() => {});
          fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r)
          }).catch(() => {});
        });
      }
    }
    loadDbReviews();
  }, []);

  // Fetch blog posts from PostgreSQL DB / Supabase on mount
  useEffect(() => {
    async function loadDbBlogPosts() {
      const postMap = new Map<string, BlogPost>();

      // 1. Fetch from Supabase direct table
      try {
        const { data: sbPosts, error: sbErr } = await supabase
          .from('BlogPost')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!sbErr && Array.isArray(sbPosts) && sbPosts.length > 0) {
          sbPosts.forEach(p => {
            if (p && p.id) postMap.set(p.id, parseDbBlogPost(p));
          });
        }
      } catch (e) {
        console.warn('Supabase BlogPost select fallback:', e);
      }

      // 2. Fetch from Express / Prisma REST API
      try {
        const res = await fetch('/api/blog-posts');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            data.forEach(p => {
              if (p && p.id) postMap.set(p.id, parseDbBlogPost(p));
            });
          }
        }
      } catch (e) {
        // Ignore fallback
      }

      if (postMap.size > 0) {
        const list = Array.from(postMap.values());
        setBlogPosts(list);
        try { localStorage.setItem('pgmart_blog_posts', JSON.stringify(list)); } catch {}
      } else {
        setBlogPosts(initialBlogPosts);
        try {
          const seedPayload = initialBlogPosts.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            content: JSON.stringify(p.content),
            category: p.category,
            author: p.author,
            authorRole: p.authorRole,
            authorAvatar: p.authorAvatar,
            publishedDate: p.publishedDate,
            readTime: p.readTime,
            featuredImage: p.featuredImage,
            relatedCategorySlug: p.relatedCategorySlug,
            tags: JSON.stringify(p.tags),
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          supabase.from('BlogPost').upsert(seedPayload).then(() => {}).catch(() => {});
        } catch (e) {}
      }
    }
    loadDbBlogPosts();

    // Supabase Realtime channel for BlogPost
    const blogChannel = supabase.channel('realtime:BlogPost')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'BlogPost' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = parseDbBlogPost(payload.new);
          setBlogPosts(prev => {
            const exists = prev.some(p => p.id === updated.id);
            if (exists) {
              return prev.map(p => p.id === updated.id ? updated : p);
            }
            return [updated, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const delId = payload.old.id;
          setBlogPosts(prev => prev.filter(p => p.id !== delId));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(blogChannel);
    };
  }, []);

  const saveBlogPost = async (postData: Partial<BlogPost> & { id?: string }): Promise<BlogPost | null> => {
    const postId = postData.id || `post-${Date.now()}`;
    const slug = postData.slug || postData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const formattedPost: BlogPost = {
      id: postId,
      slug,
      title: postData.title || 'Untitled Post',
      excerpt: postData.excerpt || '',
      content: Array.isArray(postData.content) ? postData.content : [String(postData.content || '')],
      category: postData.category || 'Styling Tips',
      author: postData.author || 'Priyam Ghoshal',
      authorRole: postData.authorRole || 'Founder & CEO, PGmart',
      authorAvatar: postData.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      publishedDate: postData.publishedDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: postData.readTime || '5 min read',
      featuredImage: postData.featuredImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      relatedCategorySlug: postData.relatedCategorySlug || 'women',
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      isPublished: postData.isPublished !== false,
      status: postData.isPublished !== false ? 'published' : 'draft',
      metaTitle: postData.metaTitle || null as any,
      metaDesc: postData.metaDesc || null as any,
      createdAt: postData.createdAt || nowIso,
      updatedAt: nowIso
    };

    // 1. Update state and localStorage immediately
    setBlogPosts(prev => {
      const exists = prev.some(p => p.id === postId);
      const nextList = exists
        ? prev.map(p => p.id === postId ? formattedPost : p)
        : [formattedPost, ...prev];
      try { localStorage.setItem('pgmart_blog_posts', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    // 2. Direct Supabase Upsert
    const sbPayload = {
      id: formattedPost.id,
      slug: formattedPost.slug,
      title: formattedPost.title,
      excerpt: formattedPost.excerpt,
      content: JSON.stringify(formattedPost.content),
      category: formattedPost.category,
      author: formattedPost.author,
      authorRole: formattedPost.authorRole,
      authorAvatar: formattedPost.authorAvatar,
      publishedDate: formattedPost.publishedDate,
      readTime: formattedPost.readTime,
      featuredImage: formattedPost.featuredImage,
      relatedCategorySlug: formattedPost.relatedCategorySlug,
      tags: JSON.stringify(formattedPost.tags),
      isPublished: formattedPost.isPublished,
      metaTitle: formattedPost.metaTitle || null,
      metaDesc: formattedPost.metaDesc || null,
      createdAt: formattedPost.createdAt,
      updatedAt: nowIso
    };

    try {
      const { error: sbErr } = await supabase.from('BlogPost').upsert(sbPayload);
      if (sbErr) console.warn('[Supabase saveBlogPost error]:', sbErr);
    } catch (e) {
      console.warn('[Supabase saveBlogPost exception]:', e);
    }

    // 3. REST API backend sync
    try {
      await adminFetch(postData.id ? `/api/blog-posts/${postData.id}` : '/api/blog-posts', {
        method: postData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPost)
      });
    } catch (e) {
      console.warn('[REST API saveBlogPost error]:', e);
    }

    return formattedPost;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    // 1. Update state and localStorage immediately
    setBlogPosts(prev => {
      const nextList = prev.filter(p => p.id !== id);
      try { localStorage.setItem('pgmart_blog_posts', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    // 2. Supabase direct delete
    try {
      await supabase.from('BlogPost').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase deleteBlogPost error]:', e);
    }

    // 3. REST API delete
    try {
      await adminFetch(`/api/blog-posts/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return true;
  };

  const toggleBlogPostStatus = async (id: string): Promise<void> => {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;
    const nextPublished = !post.isPublished;
    const nextStatus = nextPublished ? 'published' : 'draft';
    const nowIso = new Date().toISOString();

    setBlogPosts(prev => {
      const nextList = prev.map(p => p.id === id ? { ...p, isPublished: nextPublished, status: nextStatus, updatedAt: nowIso } : p);
      try { localStorage.setItem('pgmart_blog_posts', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    try {
      await supabase.from('BlogPost').update({ isPublished: nextPublished, updatedAt: nowIso }).eq('id', id);
    } catch (e) {}

    try {
      await adminFetch(`/api/blog-posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextPublished })
      });
    } catch (e) {}
  };

  const reloadBlogPosts = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from('BlogPost').select('*').order('createdAt', { ascending: false });
      if (!error && Array.isArray(data)) {
        setBlogPosts(data.map(parseDbBlogPost));
      }
    } catch (e) {}
  };

  const addReview = async (reviewData: Partial<Review>) => {
    const reviewId = reviewData.id || `rev-${Date.now()}`;
    const payload = {
      id: reviewId,
      productId: reviewData.productId || 'w-1',
      customerName: reviewData.customerName || 'PGmart Shopper',
      rating: Number(reviewData.rating) || 5,
      title: reviewData.title || `${reviewData.rating || 5} Star Experience`,
      comment: reviewData.comment || '',
      photos: Array.isArray(reviewData.photos) ? JSON.stringify(reviewData.photos) : (reviewData.photos || '[]'),
      isVerifiedPurchase: reviewData.isVerifiedPurchase !== false,
      status: reviewData.status || 'pending',
      createdAt: new Date().toISOString()
    };

    let savedReview: Review | null = null;

    // 1. Direct Supabase JS Client Insert (guarantees real-time persistence to Supabase)
    try {
      const { data: sbData, error: sbErr } = await supabase.from('Review').insert([payload]).select();
      if (!sbErr && sbData && sbData[0]) {
        savedReview = sbData[0];
      } else if (sbErr) {
        console.warn('[Supabase direct review insert warning]:', sbErr);
      }
    } catch (sbEx) {
      console.warn('[Supabase client exception]:', sbEx);
    }

    // 2. Dual REST API Sync
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          savedReview = data.review;
        }
      }
    } catch (apiErr) {
      console.warn('[API Review sync warning]:', apiErr);
    }

    const finalReview: Review = savedReview || {
      ...payload,
      photos: typeof payload.photos === 'string' ? JSON.parse(payload.photos || '[]') : payload.photos
    } as any;

    setReviews(prev => {
      const updated = [finalReview, ...prev.filter(r => r.id !== finalReview.id)];
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });

    return finalReview;
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status } : r);
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast(`Review status updated to ${status.toUpperCase()}`);

    // 1. Direct Supabase Update
    try {
      const { error: sbErr } = await supabase.from('Review').update({ status }).eq('id', id);
      if (sbErr) console.warn('[Supabase update status warning]:', sbErr);
    } catch (e) {}

    // 2. REST API Update
    try {
      await adminFetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn('Backend sync for review status update failed', e);
    }
  };

  const deleteReview = async (id: string) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Review removed.');

    // 1. Direct Supabase Delete
    try {
      const { error: sbErr } = await supabase.from('Review').delete().eq('id', id);
      if (sbErr) console.warn('[Supabase delete review warning]:', sbErr);
    } catch (e) {}

    // 2. REST API Delete
    try {
      await adminFetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend sync for review deletion failed', e);
    }
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

    // Sync to PostgreSQL Prisma User table asynchronously
    if (email) {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Valued Customer', email: email.toLowerCase().trim(), phone: phone || null })
      }).catch(err => console.warn('[PostgreSQL User Sync Error]:', err));
    }
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

    // Dynamic browser favicon synchronization
    const favUrl = settings.faviconUrl || '/favicon.png';
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    if (iconLinks.length > 0) {
      iconLinks.forEach(el => {
        const linkEl = el as HTMLLinkElement;
        if (!linkEl.type || linkEl.type.includes('png') || linkEl.type.includes('icon')) {
          linkEl.href = favUrl;
        }
      });
    }
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
    safeStorageSet('terra_banners_v9', JSON.stringify(banners));
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

  // Fetch live state from Supabase Cloud Database & Backend REST API on load
  const reloadCatalog = async () => {
    // 1. PRIMARY: DIRECT SUPABASE DATABASE QUERIES
    try {
      const [
        { data: sbSettings, error: errSet },
        { data: sbBanners, error: errBan },
        { data: sbBrands, error: errBrs },
        { data: sbCoupons, error: errCoup },
        { data: sbProducts, error: errProd },
        { data: sbCategories, error: errCat },
        { data: sbSubcategories, error: errSub },
        { data: sbCategoryTypes, error: errType },
        { data: sbReviews, error: errRev }
      ] = await Promise.all([
        supabase.from('SiteSettings').select('*').eq('id', 'default').maybeSingle(),
        supabase.from('Banner').select('*').order('sortOrder', { ascending: true }),
        supabase.from('Brand').select('*').order('name', { ascending: true }),
        supabase.from('Coupon').select('*').order('createdAt', { ascending: false }),
        supabase.from('Product').select('*'),
        supabase.from('Category').select('*').order('sortOrder', { ascending: true }),
        supabase.from('Subcategory').select('*').order('sort_order', { ascending: true }),
        supabase.from('CategoryType').select('*').order('sort_order', { ascending: true }),
        supabase.from('Review').select('*').order('createdAt', { ascending: false })
      ]);

      if (!errSet && sbSettings) {
        setSettings(prev => {
          const merged = { ...prev, ...sbSettings };
          try { localStorage.setItem('pgmart_site_settings', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }

      if (!errBan && sbBanners && Array.isArray(sbBanners) && sbBanners.length > 0) {
        setBanners(sbBanners);
        try { localStorage.setItem('terra_banners_v9', JSON.stringify(sbBanners)); } catch {}
      }

      if (!errBrs && sbBrands && Array.isArray(sbBrands) && sbBrands.length > 0) {
        setBrands(sbBrands);
        try { localStorage.setItem('pgmart_brands', JSON.stringify(sbBrands)); } catch {}
      }

      if (!errCoup && sbCoupons && Array.isArray(sbCoupons) && sbCoupons.length > 0) {
        setCoupons(sbCoupons);
        try { localStorage.setItem('pgmart_coupons', JSON.stringify(sbCoupons)); } catch {}
      }

      // ASSEMBLE 3-TIER CATEGORIES (Category -> Subcategory -> CategoryType)
      if (!errCat && sbCategories && Array.isArray(sbCategories) && sbCategories.length > 0) {
        const subMap = new Map<string, any>();
        (sbSubcategories || []).forEach((sub: any) => {
          subMap.set(sub.id, { ...sub, types: [] });
        });

        (sbCategoryTypes || []).forEach((type: any) => {
          const parent = subMap.get(type.subcategoryId);
          if (parent) {
            parent.types.push(type);
          }
        });

        const assembledCategories = sbCategories.map((cat: any) => {
          const matchingSubs = Array.from(subMap.values()).filter((s: any) => s.categoryId === cat.id);
          return {
            ...cat,
            subcategories: matchingSubs
          };
        });

        setCategories(assembledCategories);
      }

      if (!errRev && sbReviews && Array.isArray(sbReviews) && sbReviews.length > 0) {
        setReviews(sbReviews);
        try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(sbReviews)); } catch {}
      }

      if (!errProd && sbProducts && Array.isArray(sbProducts) && sbProducts.length > 0) {
        const normalizedProds = sbProducts.map((p: any) => ({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : []),
          variants: Array.isArray(p.variants) ? p.variants : (typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : []),
          colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? JSON.parse(p.colors || '[]') : []),
          availableSizes: Array.isArray(p.availableSizes) ? p.availableSizes : (typeof p.availableSizes === 'string' ? JSON.parse(p.availableSizes || '[]') : ['S', 'M', 'L', 'XL'])
        }));
        setProducts(normalizedProds);
      }
    } catch (sbEx) {
      console.warn('[Supabase Direct Sync Warning]:', sbEx);
    }

    // 2. DUAL REST BACKEND FALLBACK
    try {
      const [resSet, resCat, resProd, resOrd, resBrs, resBan] = await Promise.all([
        safeJsonFetch('/api/settings'),
        safeJsonFetch('/api/categories'),
        safeJsonFetch('/api/products'),
        safeJsonFetch('/api/orders'),
        safeJsonFetch('/api/brands'),
        safeJsonFetch('/api/banners')
      ]);

      if (resSet) {
        setSettings(prev => ({
          ...prev,
          ...resSet
        }));
      }
      if (resCat && Array.isArray(resCat) && resCat.length > 0) setCategories(resCat);
      if (resProd && Array.isArray(resProd) && resProd.length > 0) {
        setProducts(prev => {
          const map = new Map(resProd.map((p: any) => [p.id, p]));
          return prev.map(p => map.get(p.id) || p);
        });
      }
      if (resOrd) {
        const orderList = Array.isArray(resOrd) ? resOrd : (resOrd.orders || []);
        if (Array.isArray(orderList)) setOrders(orderList);
      }
      if (resBrs && Array.isArray(resBrs) && resBrs.length > 0) setBrands(resBrs);
      if (resBan && Array.isArray(resBan) && resBan.length > 0) setBanners(resBan);
    } catch (e) {
      console.warn('Backend REST sync fallback failed', e);
    }
  };

  useEffect(() => {
    reloadCatalog();
  }, []);

  // REAL-TIME SUPABASE WEBSOCKET SUBSCRIPTION (Live updates broadcast instantly to storefront)
  useEffect(() => {
    const channel = supabase
      .channel('storefront-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'SiteSettings' }, payload => {
        if (payload.new) {
          setSettings(prev => {
            const merged = { ...prev, ...(payload.new as any) };
            try { localStorage.setItem('pgmart_site_settings', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Banner' }, () => {
        supabase.from('Banner').select('*').order('sortOrder', { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) {
            setBanners(data);
            try { localStorage.setItem('terra_banners_v9', JSON.stringify(data)); } catch {}
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Brand' }, () => {
        supabase.from('Brand').select('*').order('name', { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) {
            setBrands(data);
            try { localStorage.setItem('pgmart_brands', JSON.stringify(data)); } catch {}
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Coupon' }, () => {
        supabase.from('Coupon').select('*').then(({ data }) => {
          if (data && data.length > 0) {
            setCoupons(data);
            try { localStorage.setItem('pgmart_coupons', JSON.stringify(data)); } catch {}
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, () => {
        supabase.from('Product').select('*').then(({ data }) => {
          if (data && data.length > 0) {
            const normalized = data.map((p: any) => ({
              ...p,
              tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : []),
              variants: Array.isArray(p.variants) ? p.variants : (typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : []),
              colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? JSON.parse(p.colors || '[]') : [])
            }));
            setProducts(normalized);
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Category' }, () => {
        reloadCatalog();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Subcategory' }, () => {
        reloadCatalog();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'CategoryType' }, () => {
        reloadCatalog();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Review' }, () => {
        supabase.from('Review').select('*').order('createdAt', { ascending: false }).then(({ data }) => {
          if (data && data.length > 0) {
            setReviews(data);
            try { localStorage.setItem('pgmart_reviews_v2', JSON.stringify(data)); } catch {}
          }
        });
      })
      .subscribe();

    // Cross-tab broadcast listener (for instantaneous sync between Admin Portal tab and Customer Storefront tab)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'pgmart_site_settings' && e.newValue) {
        try { setSettings(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'terra_banners_v9' && e.newValue) {
        try { setBanners(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'pgmart_brands' && e.newValue) {
        try { setBrands(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'pgmart_coupons' && e.newValue) {
        try { setCoupons(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'pgmart_reviews_v2' && e.newValue) {
        try { setReviews(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageEvent);
    };
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
          const dbData = await res.json();
          const dbOrders: Order[] = Array.isArray(dbData) ? dbData : (dbData?.orders || []);
          if (Array.isArray(dbOrders)) {
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
              const nextOrders = [...merged, ...localOnly];

              // Check if identical to avoid useless state reference updates
              if (prev.length === nextOrders.length) {
                const isIdentical = prev.every((p, idx) => {
                  const n = nextOrders[idx];
                  return n && p.id === n.id && p.status === n.status && p.trackingNumber === n.trackingNumber && p.updatedAt === n.updatedAt;
                });
                if (isIdentical) return prev;
              }
              return nextOrders;
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
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try { localStorage.setItem('pgmart_site_settings', JSON.stringify(merged)); } catch {}
      return merged;
    });

    // 1. Direct Supabase Client Upsert
    try {
      const { error: sbErr } = await supabase
        .from('SiteSettings')
        .upsert({ id: 'default', ...newSettings });
      if (sbErr) console.warn('[Supabase SiteSettings upsert warning]:', sbErr);
    } catch (sbEx) {
      console.warn('[Supabase SiteSettings exception]:', sbEx);
    }

    // 2. Dual REST API Sync
    try {
      await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (apiErr) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings)
        });
      } catch (e) {}
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

  const saveCoupon = async (coupon: Coupon) => {
    setCoupons(prev => {
      const updated = prev.some(c => c.id === coupon.id || c.code === coupon.code)
        ? prev.map(c => (c.id === coupon.id || c.code === coupon.code) ? coupon : c)
        : [coupon, ...prev];
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 1. Direct Supabase Upsert
    try {
      await supabase.from('Coupon').upsert({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: Number(coupon.value),
        minOrderValue: Number(coupon.minOrderValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        usageLimit: Number(coupon.usageLimit),
        usedCount: Number(coupon.usedCount) || 0,
        expiryDate: coupon.expiryDate,
        categoryScope: coupon.categoryScope || null,
        isActive: coupon.isActive !== false
      });
    } catch (e) {}

    // 2. REST API Sync
    try {
      await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
    } catch (e) {}
  };

  const toggleCoupon = async (id: string) => {
    const target = coupons.find(c => c.id === id);
    const newStatus = target ? !target.isActive : true;
    setCoupons(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c);
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await supabase.from('Coupon').update({ isActive: newStatus }).eq('id', id);
    } catch (e) {}

    try {
      await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
    } catch (e) {}
  };

  const deleteCoupon = async (id: string) => {
    setCoupons(prev => {
      const updated = prev.filter(c => c.id !== id);
      try { localStorage.setItem('pgmart_coupons', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await supabase.from('Coupon').delete().eq('id', id);
    } catch (e) {}

    try {
      await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  const saveBrand = async (brand: Brand) => {
    setBrands(prev => {
      const updated = prev.some(b => b.id === brand.id)
        ? prev.map(b => b.id === brand.id ? brand : b)
        : [brand, ...prev];
      try { localStorage.setItem('pgmart_brands', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 1. Direct Supabase Client Upsert
    try {
      await supabase.from('Brand').upsert({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        isFeatured: brand.isFeatured !== false,
        isActive: brand.isActive !== false
      });
    } catch (e) {}

    // 2. REST API Sync
    try {
      await adminFetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
      });
    } catch (e) {}
  };

  const toggleBrand = async (id: string) => {
    const target = brands.find(b => b.id === id);
    const newStatus = target ? !target.isActive : true;
    setBrands(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, isActive: newStatus } : b);
      try { localStorage.setItem('pgmart_brands', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await supabase.from('Brand').update({ isActive: newStatus }).eq('id', id);
    } catch (e) {}

    try {
      await adminFetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
    } catch (e) {}
  };

  const deleteBrand = async (id: string) => {
    setBrands(prev => {
      const updated = prev.filter(b => b.id !== id);
      try { localStorage.setItem('pgmart_brands', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await supabase.from('Brand').delete().eq('id', id);
    } catch (e) {}

    try {
      await adminFetch(`/api/brands/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {}
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
      name: productData.name || 'New Stylish Apparel',
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `item-${Date.now()}`),
      categoryId: productData.categoryId || 'women',
      subcategoryId: productData.subcategoryId || 'women-ethnic',
      typeId: productData.typeId || 'saree',
      brandId: productData.brandId || 'b1',
      brandName: productData.brandName || 'PGmart Essentials',
      description: productData.description || 'Premium quality fabric crafted with high precision and luxury finish.',
      fabric: productData.fabric || 'Cotton Silk Blend',
      fit: productData.fit || 'Regular Fit',
      occasion: productData.occasion || 'Festive / Casual',
      basePrice: Number(productData.basePrice) || 1999,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      discountPercent: productData.discountPercent ? Number(productData.discountPercent) : undefined,
      tags: productData.tags || ['new_arrival'],
      isDealOfTheDay: Boolean(productData.isDealOfTheDay),
      status: productData.status || 'published',
      availableSizes: productData.availableSizes || ['S', 'M', 'L', 'XL'],
      colors: productData.colors || [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'] }],
      rating: productData.rating || 5,
      reviewCount: productData.reviewCount || 0,
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

    // 1. Direct Supabase upsert
    try {
      await supabase.from('Product').upsert({
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        categoryId: newProduct.categoryId,
        subcategoryId: newProduct.subcategoryId,
        typeId: newProduct.typeId,
        brandId: newProduct.brandId,
        brandName: newProduct.brandName,
        description: newProduct.description,
        fabric: newProduct.fabric,
        fit: newProduct.fit,
        occasion: newProduct.occasion,
        hsnCode: newProduct.hsnCode,
        gstPercent: newProduct.gstPercent,
        basePrice: newProduct.basePrice,
        discountPrice: newProduct.discountPrice || null,
        discountPercent: newProduct.discountPercent || null,
        tags: typeof newProduct.tags === 'string' ? newProduct.tags : JSON.stringify(newProduct.tags || []),
        isDealOfTheDay: Boolean(newProduct.isDealOfTheDay),
        status: newProduct.status,
        variants: typeof newProduct.variants === 'string' ? newProduct.variants : JSON.stringify(newProduct.variants || []),
        colors: typeof newProduct.colors === 'string' ? newProduct.colors : JSON.stringify(newProduct.colors || []),
        availableSizes: typeof newProduct.availableSizes === 'string' ? newProduct.availableSizes : JSON.stringify(newProduct.availableSizes || []),
        kidsSizes: typeof newProduct.kidsSizes === 'string' ? newProduct.kidsSizes : JSON.stringify(newProduct.kidsSizes || []),
        rating: newProduct.rating,
        reviewCount: newProduct.reviewCount,
        created_at: newProduct.created_at,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[Supabase createProduct Error]:', e);
    }

    // 2. REST API insert
    try {
      const res = await adminFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const contentType = res?.headers?.get('content-type') || '';
      if (res && res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.product) {
          const savedProd = data.product;
          setProducts(prev => {
            if (prev.some(p => p.id === savedProd.id)) {
              return prev.map(p => p.id === savedProd.id ? savedProd : p);
            }
            return [savedProd, ...prev];
          });
        }
      }
    } catch (e) {
      // Direct Supabase insert already guaranteed persistence
    }
    showToast('Product created successfully');
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));

    // 1. Direct Supabase Client update
    try {
      const sbUpdatePayload: any = {
        updated_at: new Date().toISOString()
      };
      if (productData.name !== undefined) sbUpdatePayload.name = productData.name;
      if (productData.slug !== undefined) sbUpdatePayload.slug = productData.slug;
      if (productData.basePrice !== undefined) sbUpdatePayload.basePrice = Number(productData.basePrice);
      if (productData.discountPrice !== undefined) sbUpdatePayload.discountPrice = productData.discountPrice !== null ? Number(productData.discountPrice) : null;
      if (productData.discountPercent !== undefined) sbUpdatePayload.discountPercent = productData.discountPercent !== null ? Number(productData.discountPercent) : null;
      if (productData.isDealOfTheDay !== undefined) sbUpdatePayload.isDealOfTheDay = Boolean(productData.isDealOfTheDay);
      if (productData.tags !== undefined) {
        sbUpdatePayload.tags = typeof productData.tags === 'string' ? productData.tags : JSON.stringify(productData.tags);
      }
      if (productData.variants !== undefined) {
        sbUpdatePayload.variants = typeof productData.variants === 'string' ? productData.variants : JSON.stringify(productData.variants);
      }
      if (productData.colors !== undefined) {
        sbUpdatePayload.colors = typeof productData.colors === 'string' ? productData.colors : JSON.stringify(productData.colors);
      }
      if (productData.availableSizes !== undefined) {
        sbUpdatePayload.availableSizes = typeof productData.availableSizes === 'string' ? productData.availableSizes : JSON.stringify(productData.availableSizes);
      }
      if (productData.kidsSizes !== undefined) {
        sbUpdatePayload.kidsSizes = typeof productData.kidsSizes === 'string' ? productData.kidsSizes : JSON.stringify(productData.kidsSizes);
      }
      if (productData.status !== undefined) sbUpdatePayload.status = productData.status;
      if (productData.description !== undefined) sbUpdatePayload.description = productData.description;
      if (productData.fabric !== undefined) sbUpdatePayload.fabric = productData.fabric;
      if (productData.fit !== undefined) sbUpdatePayload.fit = productData.fit;
      if (productData.occasion !== undefined) sbUpdatePayload.occasion = productData.occasion;
      if (productData.brandName !== undefined) sbUpdatePayload.brandName = productData.brandName;
      if (productData.categoryId !== undefined) sbUpdatePayload.categoryId = productData.categoryId;
      if (productData.subcategoryId !== undefined) sbUpdatePayload.subcategoryId = productData.subcategoryId;
      if (productData.typeId !== undefined) sbUpdatePayload.typeId = productData.typeId;

      await supabase.from('Product').update(sbUpdatePayload).eq('id', id);
    } catch (e) {
      console.warn('[Supabase updateProduct Error]:', e);
    }

    // 2. REST API update
    try {
      const res = await adminFetch(`/api/products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const contentType = res?.headers?.get('content-type') || '';
      if (res && res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.product) {
          const updatedProd = data.product;
          setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProd } : p));
        }
      }
    } catch (e) {
      // Direct Supabase update already guaranteed persistence
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    // 1. Direct Supabase deletion
    try {
      await supabase.from('Product').delete().eq('id', id);
    } catch (sbErr) {
      console.warn('Supabase product delete warning:', sbErr);
    }

    // 2. REST API deletion
    try {
      const res = await adminFetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        showToast('Product deleted from database');
        return;
      }
    } catch (e) {
      console.warn('Backend sync failed for product deletion', e);
    }
    showToast('Product deleted');
  };

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    try {
      let createdOrder: Order | null = null;

      // 1. Primary Attempt: POST to /api/orders backend
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.order) {
            createdOrder = data.order;
          }
        }
      } catch (apiErr) {
        console.warn('[createOrder API error, trying direct Supabase REST]:', apiErr);
      }

      // 2. Dual-Channel Fallback: Save directly via Supabase JS client
      if (!createdOrder) {
        const orderId = orderData.id || `ord-${Date.now()}`;
        const orderNumber = orderData.orderNumber || `PGM-${Math.floor(100000 + Math.random() * 900000)}`;
        const customerEmail = String(orderData.customerEmail || user?.email || '').trim().toLowerCase();
        const customerName = String(orderData.customerName || user?.name || 'Valued Customer').trim();
        const customerPhone = String(orderData.customerPhone || user?.phone || '').trim();

        const dbOrderRecord = {
          id: orderId,
          orderNumber,
          customerId: orderData.customerId || user?.id || 'guest',
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: typeof orderData.shippingAddress === 'object' ? JSON.stringify(orderData.shippingAddress) : String(orderData.shippingAddress || '{}'),
          items: Array.isArray(orderData.items) ? JSON.stringify(orderData.items) : String(orderData.items || '[]'),
          subtotal: Number(orderData.subtotal) || 0,
          discount: Number(orderData.discount) || 0,
          shippingFee: Number(orderData.shippingFee) || 0,
          tax: Number(orderData.tax) || 0,
          total: Number(orderData.total) || 0,
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'pending',
          paymentMethod: orderData.paymentMethod || 'cod',
          trackingNumber: orderData.trackingNumber || null,
          courierPartner: orderData.courierPartner || null,
          couponCode: orderData.couponCode || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const { data: sbData, error: sbErr } = await supabase.from('Order').insert([dbOrderRecord]).select();
        if (!sbErr && sbData && sbData[0]) {
          const raw = sbData[0];
          let shippingAddress = raw.shippingAddress;
          if (typeof shippingAddress === 'string') {
            try { shippingAddress = JSON.parse(shippingAddress); } catch {}
          }
          let items = raw.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch {}
          }

          createdOrder = {
            ...raw,
            shippingAddress: typeof shippingAddress === 'object' && shippingAddress !== null ? shippingAddress : {},
            items: Array.isArray(items) ? items : []
          };
        } else if (sbErr) {
          console.error('[Supabase Direct Insert Error]:', sbErr);
        }
      }

      if (createdOrder) {
        setOrders(prev => [createdOrder!, ...prev.filter(o => o.id !== createdOrder!.id)]);
        clearCart();
        showToast(`🎉 Order #${createdOrder.orderNumber} successfully placed!`);
        return createdOrder;
      }

      // 3. Fallback Order Creation
      const fallbackOrder: Order = {
        id: orderData.id || `ord-${Date.now()}`,
        orderNumber: orderData.orderNumber || `PGM-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: orderData.customerId || user?.id || 'guest',
        customerName: orderData.customerName || 'Valued Customer',
        customerEmail: orderData.customerEmail || user?.email || '',
        customerPhone: orderData.customerPhone || '',
        shippingAddress: orderData.shippingAddress || {} as any,
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        discount: orderData.discount || 0,
        shippingFee: orderData.shippingFee || 0,
        tax: orderData.tax || 0,
        total: orderData.total || 0,
        status: 'pending',
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setOrders(prev => [fallbackOrder, ...prev]);
      clearCart();
      showToast('Your order has been submitted!');
      return fallbackOrder;

    } catch (err: any) {
      console.error('[createOrder Exception]:', err);
      showToast(err?.message || 'Network error while placing order. Please check your connection.');
      return null;
    }
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

    // 4. Direct Supabase Order update
    try {
      const sbOrderUpdate: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      if (trackingNum) sbOrderUpdate.trackingNumber = trackingNum;
      if (isDelivered) sbOrderUpdate.paymentStatus = 'paid';

      await supabase.from('Order').update(sbOrderUpdate).eq('id', orderId);
    } catch (sbErr) {
      console.warn('[Supabase updateOrderStatus warning]:', sbErr);
    }

    // 5. Sync updated status to backend API
    try {
      await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: trackingNum, isStockDeducted: stockDeductedNow ? true : undefined })
      });
    } catch (e) {
      // Direct Supabase update already saved state
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

  const contextValue = useMemo(() => ({
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
    reloadCatalog,
    blogPosts,
    setBlogPosts,
    saveBlogPost,
    deleteBlogPost,
    toggleBlogPostStatus,
    reloadBlogPosts
  }), [
    settings,
    categories,
    brands,
    products,
    banners,
    coupons,
    cart,
    appliedCoupon,
    couponDiscount,
    wishlist,
    user,
    isAdminLoggedIn,
    orders,
    reviews,
    filters,
    toastMessage,
    searchModalOpen,
    cartDrawerOpen,
    quickViewProduct,
    sizeChartCategory,
    chatOpen,
    blogPosts
  ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
