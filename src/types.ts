export type Role = 'super_admin' | 'catalog_manager' | 'order_staff' | 'content_editor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: Role;
  addresses?: Address[];
  points?: number;
  createdAt: string;
  gender?: string;
  dob?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  locality?: string;
  addressLine2?: string;
  isDefault?: boolean;
}

export interface CategoryType {
  id: string;
  subcategoryId: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  image?: string;
  banner_image?: string;
  description?: string;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  image?: string;
  banner_image?: string;
  description?: string;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  types: CategoryType[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  banner?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  subcategories: Subcategory[];
  metaTitle?: string;
  metaDesc?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  isFeatured?: boolean;
}

export type ProductTag = 'new_arrival' | 'bestseller' | 'trending' | 'sale' | 'online_exclusive' | 'value_pack' | 'curves_plus_size' | 'deal_of_the_day';

export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  typeId?: string;
  brandId?: string;
  brandName?: string;
  description: string;
  fabric: string;
  fit: string;
  sleeve?: string;
  neck?: string;
  pattern?: string;
  occasion: string;
  hsnCode: string;
  gstPercent: number;
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  tags: ProductTag[];
  isDealOfTheDay?: boolean;
  status: 'published' | 'draft' | 'out_of_stock' | 'discontinued';
  variants: ProductVariant[];
  colors: ColorVariant[];
  availableSizes: string[];
  rating: number;
  reviewCount: number;
  created_at: string;
  metaTitle?: string;
  metaDesc?: string;
  aiImagePrompt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  courierPartner?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  returnStatus?: 'none' | 'return_requested' | 'return_approved' | 'exchange_requested' | 'exchange_approved' | 'completed' | 'rejected';
  returnType?: 'return' | 'exchange';
  returnReason?: string;
  returnComments?: string;
  exchangeSize?: string;
  exchangeColor?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  isVerifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  categoryScope?: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link: string;
  buttonText: string;
  position: 'hero' | 'category' | 'promo_strip' | 'ad_banner';
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  primaryDarkColor: string;
  bgMutedColor: string;
  secondaryDarkColor: string;
  fontFamily: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  address: string;
  currencySymbol: string;
  currencyCode: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codFee: number;
  codEnabled: boolean;
  stripeEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  stripePublicKey: string;
  gstNumber: string;
  dealsEnabled?: boolean;
  dealsTitle?: string;
  dealsTimerHours?: number;
  dealsTimerMinutes?: number;
  dealsMinDiscount?: number;
  adBannerEnabled?: boolean;
}

export interface FilterState {
  categoryId?: string;
  subcategoryId?: string;
  typeId?: string;
  types: string[];
  brandId?: string;
  occasions: string[];
  sizes: string[];
  colors: string[];
  fabrics: string[];
  fits: string[];
  tags: ProductTag[];
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  rating: number;
  plusSizeOnly: boolean;
  searchQuery: string;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'rating';
}
