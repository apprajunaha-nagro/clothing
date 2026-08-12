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
  contactPhone: "+91 94711 55434",
  supportEmail: "support@pgmart.com",
  supportPhone: "+91 94711 55434",
  whatsappNumber: "9471155434",
  address: "Kapda Patti, Jharia, Dhanbad, Jharkhand 828111",
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
  dealsEnabled: true,
  dealsTitle: "Deals of the Day",
  dealsTimerHours: 14,
  dealsTimerMinutes: 22,
  dealsMinDiscount: 20,
  adBannerEnabled: true,
  newArrivalsEnabled: true,
  newArrivalsTitle: "New Arrivals",
  newArrivalsSubtitle: "Explore the latest ethnic wear, designer sarees, & festive drops",
  newArrivalsBadge: "JUST ARRIVED",
  newArrivalsMaxItems: 10,
};

export const initialBrands: Brand[] = [
  { id: 'b1', name: 'Manyavar', slug: 'manyavar', logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&h=200&q=80', description: 'Royal Ethnic & Sherwanis', isFeatured: true, isActive: true },
  { id: 'b2', name: 'Biba', slug: 'biba', logo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&h=200&q=80', description: "Women's Ethnic & Anarkalis", isFeatured: true, isActive: true },
  { id: 'b3', name: 'W for Woman', slug: 'w-for-woman', logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&h=200&q=80', description: 'Contemporary Indo-Western Wear', isFeatured: true, isActive: true },
  { id: 'b4', name: 'FabIndia', slug: 'fabindia', logo: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&h=200&q=80', description: 'Handwoven Silk & Cotton Outfits', isFeatured: true, isActive: true },
  { id: 'b5', name: 'Aurelia', slug: 'aurelia', logo: 'https://images.unsplash.com/photo-1583391733975-01e4a5d84175?auto=format&fit=crop&w=200&h=200&q=80', description: 'Designer Kurti & Ethnic Sets', isFeatured: true, isActive: true },
  { id: 'b6', name: 'Allen Solly', slug: 'allen-solly', logo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=200&h=200&q=80', description: 'Modern Workwear & Executive Wear', isFeatured: true, isActive: true },
  { id: 'b7', name: 'Van Heusen', slug: 'van-heusen', logo: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&h=200&q=80', description: 'Premium Formal & Corporate Apparel', isFeatured: true, isActive: true },
  { id: 'b8', name: 'Raymond', slug: 'raymond', logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&h=200&q=80', description: 'The Complete Man Heritage Suiting', isFeatured: true, isActive: true },
  { id: 'b9', name: 'Peter England', slug: 'peter-england', logo: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&h=200&q=80', description: 'Classic Formal & Casual Menswear', isFeatured: true, isActive: true },
  { id: 'b10', name: 'Blackberrys', slug: 'blackberrys', logo: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=200&h=200&q=80', description: 'Sharp Suits & Executive Trousers', isFeatured: true, isActive: true },
  { id: 'b11', name: 'Mufti', slug: 'mufti', logo: 'https://images.unsplash.com/photo-1542272604-780c36856842?auto=format&fit=crop&w=200&h=200&q=80', description: 'Urban Denim & Streetwear Fashion', isFeatured: true, isActive: true },
  { id: 'b12', name: 'Monte Carlo', slug: 'monte-carlo', logo: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=200&h=200&q=80', description: 'Luxe Woollens & Seasonal Apparel', isFeatured: true, isActive: true },
  { id: 'b13', name: "Levi's", slug: 'levis', logo: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=200&h=200&q=80', description: 'Original Denim & Casual Wear', isFeatured: true, isActive: true },
  { id: 'b14', name: 'U.S. Polo Assn.', slug: 'us-polo-assn', logo: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=200&h=200&q=80', description: 'Authentic Sporty Lifestyle Wear', isFeatured: true, isActive: true },
  { id: 'b15', name: 'Pepe Jeans', slug: 'pepe-jeans', logo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&h=200&q=80', description: 'Casual Denim & Outerwear Apparel', isFeatured: true, isActive: true },
  { id: 'b16', name: "Neeru's", slug: 'neerus', logo: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=200&h=200&q=80', description: 'Royal Ethnic & Bridal Sarees', isFeatured: true, isActive: true },
  { id: 'b17', name: 'Craftsvilla', slug: 'craftsvilla', logo: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&h=200&q=80', description: 'Traditional Artisan Ethnic Apparel', isFeatured: true, isActive: true },
  { id: 'b18', name: 'Mohey', slug: 'mohey', logo: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&h=200&q=80', description: 'Luxury Bridal & Festival Lehengas', isFeatured: true, isActive: true },
  { id: 'b19', name: 'Sabhyata', slug: 'sabhyata', logo: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=200&h=200&q=80', description: 'Ethnic Kurti Collections', isFeatured: true, isActive: true },
  { id: 'b20', name: 'Jockey', slug: 'jockey', logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&h=200&q=80', description: 'Premium Loungewear & Innerwear', isFeatured: true, isActive: true },
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
    image: '/src/assets/images/innerwear_department_new.png',
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
    title: 'LEGACY IN WEAVE, ELEGANCE IN DESIGN',
    subtitle: 'Unveil Your Royal Splendor',
    image: '/images/hero_banner_men_royal.png',
    link: '/category/men',
    buttonText: 'EXPLORE THE COLLECTION',
    position: 'hero',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'b2',
    title: 'LUMIÈRE FASHION WEEK 2024 - THE AUTUMN FUSION COLLECTION',
    subtitle: 'A Stunning Blend of Tradition and Contemporary Design',
    image: '/images/hero_banner_lumiere_autumn.png',
    link: '/category/women',
    buttonText: 'SHOP THE LOOK',
    position: 'hero',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'b3',
    title: 'UNVEILING TIMELESS ELEGANCE',
    subtitle: 'Discover the Royal Heritage Saree Collection',
    image: '/images/hero_banner_women_saree.png',
    link: '/category/women',
    buttonText: 'DISCOVER ROYAL HERITAGE',
    position: 'hero',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'b4',
    title: 'DIWALI MAGIC: FESTIVE JOY',
    subtitle: "Festive Joy For Lil' Celebrations",
    image: '/images/hero_banner_kids_diwali.png',
    link: '/category/kids',
    buttonText: 'SHOP THE COLLECTION NOW',
    position: 'hero',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'ad-b1',
    title: 'Banarasi Silk Sarees',
    subtitle: 'Flat 40% OFF Festive Discount | Code: FESTIVE40',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    link: '/category/women?sub=sub-women-sarees',
    buttonText: 'Explore Offer',
    position: 'ad_banner',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'ad-b2',
    title: 'Linen & Silk Kurtas',
    subtitle: 'Pure Handloom Bestsellers starting at ₹499',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    link: '/category/women?sub=sub-women-kurtis',
    buttonText: 'Shop Kurtas',
    position: 'ad_banner',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'ad-b3',
    title: 'Luxe Innerwear Essentials',
    subtitle: 'Buy 2 Get 1 Free on Soft Cotton Lingerie',
    image: '/images/innerwear_department_new.png',
    link: '/category/undergarments',
    buttonText: 'Claim Deal',
    position: 'ad_banner',
    sortOrder: 3,
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
