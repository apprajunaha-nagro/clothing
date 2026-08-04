import { Category, Brand, Product, Banner, Coupon, SiteSettings, Review } from '../types';
import { generateFullCatalogProducts } from './productGenerator';
const womenBannerImg = '/src/assets/images/women_hero_banner_v2_1785702026093.jpg';
const menBannerImg = '/src/assets/images/men_hero_banner_v2_1785702040043.jpg';
const kidsBannerImg = '/src/assets/images/kids_hero_banner_v2_1785702121789.jpg';
const innerwearBannerImg = '/src/assets/images/innerwear_hero_banner_v2_1785702177666.jpg';

export const initialSiteSettings: SiteSettings = {
  storeName: "PGmart",
  tagline: "India's Most Trusted Choice for Quality & Style",
  logoUrl: "/src/assets/images/pgmart_logo_new.png",
  faviconUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&q=80",
  primaryColor: "#C0654B", // Rose Clay / Terracotta
  primaryDarkColor: "#8B4A38",
  bgMutedColor: "#F3E9E4", // Soft Rose Tint
  secondaryDarkColor: "#2B2620",
  fontFamily: "Poppins, sans-serif",
  contactEmail: "support@pgmart.com",
  contactPhone: "+91 98765 43210",
  address: "Fashion Hub 4th Floor, Park Street, Kolkata - 700016, India",
  currencySymbol: "₹",
  currencyCode: "INR",
  freeShippingThreshold: 999,
  standardShippingFee: 79,
  codFee: 49,
  codEnabled: true,
  stripeEnabled: true,
  razorpayEnabled: true,
  razorpayKeyId: "rzp_test_TC123456789",
  stripePublicKey: "pk_test_TC987654321",
  gstNumber: "19AAAAA0000A1Z5",
};

export const initialBrands: Brand[] = [
  { id: 'b1', name: 'Terra Ethnic', slug: 'terra-ethnic', logo: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=80', description: 'Handcrafted Heritage & Festive Apparel', isFeatured: true },
  { id: 'b2', name: 'Clay Urban', slug: 'clay-urban', logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80', description: 'Modern Western & Minimalist Streetwear', isFeatured: true },
  { id: 'b3', name: 'Bare Essentials', slug: 'bare-essentials', logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80', description: 'Ultra-Soft Breathable Innerwear & Lingerie', isFeatured: true },
  { id: 'b4', name: 'Velour Men', slug: 'velour-men', logo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=200&q=80', description: 'Tailored Formals & Casual Menswear', isFeatured: true },
  { id: 'b5', name: 'Aura Kids', slug: 'aura-kids', logo: '/src/assets/images/kids_department_nano_banana.png', description: 'Skin-Friendly Vibrant Kids Apparel', isFeatured: true },
];

export const initialCategories: Category[] = [
  {
    id: 'women',
    name: "Women's Fashion",
    slug: 'women',
    image: '/src/assets/images/anarkali_aqua_turquoise_floral.png',
    banner: womenBannerImg,
    status: 'active',
    sortOrder: 1,
    subcategories: [
      {
        id: 'w-ethnic',
        categoryId: 'women',
        name: 'Ethnic & Traditional Wear',
        slug: 'women-ethnic',
        status: 'active',
        image: '/src/assets/images/anarkali_aqua_turquoise_floral.png',
        types: [
          { id: 'wt-saree', subcategoryId: 'w-ethnic', name: 'Saree (Banarasi, Chiffon, Georgette)', slug: 'saree', status: 'active' },
          { id: 'wt-salwar', subcategoryId: 'w-ethnic', name: 'Salwar Kameez & Churidar', slug: 'salwar-kameez', status: 'active' },
          { id: 'wt-lehenga', subcategoryId: 'w-ethnic', name: 'Lehenga Choli', slug: 'lehenga-choli', status: 'active' },
          { id: 'wt-anarkali', subcategoryId: 'w-ethnic', name: 'Anarkali Suits', slug: 'anarkali-suits', status: 'active' },
          { id: 'wt-kurti', subcategoryId: 'w-ethnic', name: 'Kurti & Kurta Sets', slug: 'kurtis', status: 'active' },
          { id: 'wt-palazzo', subcategoryId: 'w-ethnic', name: 'Palazzo & Sharara Suits', slug: 'palazzo-suits', status: 'active' },
        ]
      },
      {
        id: 'w-western',
        categoryId: 'women',
        name: 'Western Wear',
        slug: 'women-western',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        types: [
          { id: 'wt-dresses', subcategoryId: 'w-western', name: 'Dresses (Maxi, Midi, Party)', slug: 'dresses', status: 'active' },
          { id: 'wt-tops', subcategoryId: 'w-western', name: 'Tops, Blouses & Crop Tops', slug: 'tops-blouses', status: 'active' },
          { id: 'wt-jeans', subcategoryId: 'w-western', name: 'Jeans & Denim Pants', slug: 'women-jeans', status: 'active' },
          { id: 'wt-trousers', subcategoryId: 'w-western', name: 'Trousers & Formal Pants', slug: 'women-trousers', status: 'active' },
          { id: 'wt-coord', subcategoryId: 'w-western', name: 'Co-ord Sets & Jumpsuits', slug: 'coord-sets', status: 'active' },
          { id: 'wt-skirts', subcategoryId: 'w-western', name: 'Skirts (Mini, Midi, Pencil)', slug: 'skirts', status: 'active' },
        ]
      },
      {
        id: 'w-formal',
        categoryId: 'women',
        name: 'Formal & Office Wear',
        slug: 'women-formal',
        status: 'active',
        types: [
          { id: 'wt-blazers', subcategoryId: 'w-formal', name: 'Blazers & Suits', slug: 'women-blazers', status: 'active' },
          { id: 'wt-formal-shirts', subcategoryId: 'w-formal', name: 'Formal Shirts & Trousers', slug: 'women-formal-shirts', status: 'active' },
        ]
      },
      {
        id: 'w-innerwear',
        categoryId: 'women',
        name: 'Lingerie & Innerwear',
        slug: 'women-innerwear',
        status: 'active',
        types: [
          { id: 'wt-bras', subcategoryId: 'w-innerwear', name: 'Bras (Padded, Sports, Seamless)', slug: 'bras', status: 'active' },
          { id: 'wt-panties', subcategoryId: 'w-innerwear', name: 'Panties & Seamless Briefs', slug: 'panties', status: 'active' },
          { id: 'wt-shapewear', subcategoryId: 'w-innerwear', name: 'Shapewear & Camisoles', slug: 'shapewear', status: 'active' },
        ]
      },
      {
        id: 'w-outerwear',
        categoryId: 'women',
        name: 'Outerwear & Jackets',
        slug: 'women-outerwear',
        status: 'active',
        types: [
          { id: 'wt-jackets', subcategoryId: 'w-outerwear', name: 'Jackets & Shrugs', slug: 'women-jackets', status: 'active' },
          { id: 'wt-sweaters', subcategoryId: 'w-outerwear', name: 'Cardigans & Sweaters', slug: 'women-sweaters', status: 'active' },
        ]
      }
    ]
  },
  {
    id: 'men',
    name: "Men's Fashion",
    slug: 'men',
    image: '/src/assets/images/men_kurta_teal_embroidered.jpg',
    banner: menBannerImg,
    status: 'active',
    sortOrder: 2,
    subcategories: [
      {
        id: 'm-ethnic',
        categoryId: 'men',
        name: 'Ethnic Wear',
        slug: 'men-ethnic',
        status: 'active',
        image: '/src/assets/images/men_kurta_teal_embroidered.jpg',
        types: [
          { id: 'mt-kurta', subcategoryId: 'm-ethnic', name: 'Kurta & Kurta Pajama', slug: 'men-kurta', status: 'active' },
          { id: 'mt-sherwani', subcategoryId: 'm-ethnic', name: 'Sherwani & Indo-Western', slug: 'sherwani', status: 'active' },
          { id: 'mt-nehru', subcategoryId: 'm-ethnic', name: 'Nehru Jacket & Bandhgala', slug: 'nehru-jackets', status: 'active' },
        ]
      },
      {
        id: 'm-western',
        categoryId: 'men',
        name: 'Casual Western Wear',
        slug: 'men-western',
        status: 'active',
        image: '/src/assets/images/tshirt_offwhite_henley_long.jpg',
        types: [
          { id: 'mt-tshirts', subcategoryId: 'm-western', name: 'T-Shirts (Polo, Oversized, Henley)', slug: 'men-tshirts', status: 'active' },
          { id: 'mt-shirts', subcategoryId: 'm-western', name: 'Casual Shirts (Printed, Denim, Checked)', slug: 'men-casual-shirts', status: 'active' },
          { id: 'mt-jeans', subcategoryId: 'm-western', name: 'Jeans & Denim Pants', slug: 'men-jeans', status: 'active' },
          { id: 'mt-chinos', subcategoryId: 'm-western', name: 'Chinos & Joggers', slug: 'men-chinos', status: 'active' },
          { id: 'mt-shorts', subcategoryId: 'm-western', name: 'Shorts & Bermudas', slug: 'men-shorts', status: 'active' },
        ]
      },
      {
        id: 'm-formal',
        categoryId: 'men',
        name: 'Formal & Office Wear',
        slug: 'men-formal',
        status: 'active',
        types: [
          { id: 'mt-formal-shirts', subcategoryId: 'm-formal', name: 'Formal Shirts', slug: 'men-formal-shirts', status: 'active' },
          { id: 'mt-formal-trousers', subcategoryId: 'm-formal', name: 'Formal Trousers', slug: 'men-formal-trousers', status: 'active' },
          { id: 'mt-suits', subcategoryId: 'm-formal', name: 'Suits & Blazers (2-Piece / 3-Piece)', slug: 'men-suits', status: 'active' },
        ]
      },
      {
        id: 'm-innerwear',
        categoryId: 'men',
        name: 'Innerwear & Loungewear',
        slug: 'men-innerwear',
        status: 'active',
        types: [
          { id: 'mt-briefs', subcategoryId: 'm-innerwear', name: 'Briefs & Trunks', slug: 'men-briefs', status: 'active' },
          { id: 'mt-boxers', subcategoryId: 'm-innerwear', name: 'Boxers & Vests', slug: 'men-boxers', status: 'active' },
          { id: 'mt-loungewear', subcategoryId: 'm-innerwear', name: 'Tracksuits & Pajamas', slug: 'men-loungewear', status: 'active' },
        ]
      }
    ]
  },
  {
    id: 'kids',
    name: "Kids' Fashion",
    slug: 'kids',
    image: '/src/assets/images/kids_department_nano_banana.png',
    banner: kidsBannerImg,
    status: 'active',
    sortOrder: 3,
    subcategories: [
      {
        id: 'k-boys',
        categoryId: 'kids',
        name: "Boys' Clothing",
        slug: 'boys-clothing',
        status: 'active',
        types: [
          { id: 'kt-b-tshirts', subcategoryId: 'k-boys', name: 'T-Shirts & Shirts', slug: 'boys-tshirts', status: 'active' },
          { id: 'kt-b-ethnic', subcategoryId: 'k-boys', name: 'Kurta Pajama & Sherwanis', slug: 'boys-ethnic', status: 'active' },
          { id: 'kt-b-jeans', subcategoryId: 'k-boys', name: 'Jeans & Shorts', slug: 'boys-jeans', status: 'active' },
        ]
      },
      {
        id: 'k-girls',
        categoryId: 'kids',
        name: "Girls' Clothing",
        slug: 'girls-clothing',
        status: 'active',
        types: [
          { id: 'kt-g-dresses', subcategoryId: 'k-girls', name: 'Dresses & Frocks', slug: 'girls-dresses', status: 'active' },
          { id: 'kt-g-ethnic', subcategoryId: 'k-girls', name: 'Lehenga Choli & Kurtis', slug: 'girls-ethnic', status: 'active' },
          { id: 'kt-g-tops', subcategoryId: 'k-girls', name: 'Tops & Skirts', slug: 'girls-tops', status: 'active' },
        ]
      },
      {
        id: 'k-baby',
        categoryId: 'kids',
        name: 'Infant & Toddler (0-3Y)',
        slug: 'baby-infant',
        status: 'active',
        types: [
          { id: 'kt-rompers', subcategoryId: 'k-baby', name: 'Onesies & Rompers', slug: 'baby-onesies', status: 'active' },
          { id: 'kt-baby-sets', subcategoryId: 'k-baby', name: 'Swaddles & Sleepwear Sets', slug: 'baby-sets', status: 'active' },
        ]
      }
    ]
  },
  {
    id: 'undergarments',
    name: "Innerwear & Lingerie",
    slug: 'undergarments',
    image: '/src/assets/images/innerwear_department_nano_banana.png',
    banner: innerwearBannerImg,
    status: 'active',
    sortOrder: 4,
    subcategories: [
      {
        id: 'u-women',
        categoryId: 'undergarments',
        name: "Women's Lingerie",
        slug: 'womens-lingerie',
        status: 'active',
        types: [
          { id: 'ut-bras', subcategoryId: 'u-women', name: 'Bras (Everyday, Sports, Strapless)', slug: 'women-bras', status: 'active' },
          { id: 'ut-panties', subcategoryId: 'u-women', name: 'Panties (Bikini, Seamless, Hipster)', slug: 'women-panties', status: 'active' },
          { id: 'ut-shapewear', subcategoryId: 'u-women', name: 'Shapewear & Tummy Control', slug: 'women-shapewear', status: 'active' },
          { id: 'ut-thermal-w', subcategoryId: 'u-women', name: 'Thermal Wear', slug: 'women-thermal', status: 'active' },
        ]
      },
      {
        id: 'u-men',
        categoryId: 'undergarments',
        name: "Men's Underwear",
        slug: 'mens-underwear',
        status: 'active',
        types: [
          { id: 'ut-briefs', subcategoryId: 'u-men', name: 'Briefs & Trunks', slug: 'men-briefs-trunks', status: 'active' },
          { id: 'ut-boxers', subcategoryId: 'u-men', name: 'Boxers & Vests', slug: 'men-boxers-vests', status: 'active' },
          { id: 'ut-thermal-m', subcategoryId: 'u-men', name: 'Thermal Wear', slug: 'men-thermal', status: 'active' },
        ]
      }
    ]
  }
];

export const initialBanners: Banner[] = [
  {
    id: 'b1',
    title: 'THE TERRACOTTA HERITAGE',
    subtitle: 'Handcrafted Sarees, Festive Kurtas & Ethnic Splendor',
    image: womenBannerImg,
    link: '/category/women',
    buttonText: 'EXPLORE ETHNIC COLLECTION',
    position: 'hero',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'b2',
    title: 'AUTUMN WESTERN ESSENTIALS',
    subtitle: 'Tailored Blazers, Organic Cottons & Oversized Fits',
    image: menBannerImg,
    link: '/category/men',
    buttonText: 'SHOP WESTERN WEAR',
    position: 'hero',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'b3',
    title: 'JOYFUL KIDS WEAR',
    subtitle: 'Playful, Organic & Soft Cotton Essentials for Little Ones',
    image: kidsBannerImg,
    link: '/category/kids',
    buttonText: 'EXPLORE KIDS COLLECTION',
    position: 'hero',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'b4',
    title: 'ULTRA-SOFT INNERWEAR',
    subtitle: 'Zero Chafing. Seamless All-Day Breathable Comfort',
    image: innerwearBannerImg,
    link: '/category/undergarments',
    buttonText: 'DISCOVER LINGERIE & INNERWEAR',
    position: 'hero',
    sortOrder: 4,
    isActive: true
  }
];

export const initialProducts: Product[] = generateFullCatalogProducts(initialCategories);

export const initialCoupons: Coupon[] = [
  {
    id: 'c1',
    code: 'WELCOME100',
    discountType: 'flat',
    value: 200,
    minOrderValue: 999,
    usageLimit: 500,
    usedCount: 42,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'c2',
    code: 'TERRA15',
    discountType: 'percentage',
    value: 15,
    minOrderValue: 1499,
    maxDiscount: 500,
    usageLimit: 1000,
    usedCount: 189,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'c3',
    code: 'FESTIVE25',
    discountType: 'percentage',
    value: 25,
    minOrderValue: 2499,
    maxDiscount: 1000,
    usageLimit: 200,
    usedCount: 78,
    expiryDate: '2026-11-30',
    isActive: true
  }
];

export const initialReviews: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    customerName: 'Aishwarya R.',
    rating: 5,
    title: 'Breathtaking quality & rich color!',
    comment: 'The Banarasi chiffon saree exceeded my expectations! The terracotta tone is so elegant and unique compared to standard sarees. The drape is lightweight yet feels ultra luxurious.',
    isVerifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-07-28T14:30:00Z'
  },
  {
    id: 'r2',
    productId: 'p5',
    customerName: 'Rohan Mehta',
    rating: 5,
    title: 'Super soft cotton knit fit',
    comment: 'Fits like a charm. The knit texture gives it a premium Italian feel without being too hot. Perfect for summer/monsoon wear.',
    isVerifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-07-29T09:15:00Z'
  }
];
