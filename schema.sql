-- PostgreSQL Schema for PGmart E-commerce Database (Supabase / PostgreSQL)

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY DEFAULT 'default',
    "storeName" VARCHAR(255) NOT NULL DEFAULT 'PGmart — Trusted Fashion & Quality Store',
    "tagline" VARCHAR(255) NOT NULL DEFAULT 'Premium Sarees, Kurtas, Western Dresses & Soft Undergarments',
    "logoUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    "faviconUrl" TEXT NOT NULL DEFAULT '/favicon.ico',
    "primaryColor" VARCHAR(50) NOT NULL DEFAULT '#C0654B',
    "primaryDarkColor" VARCHAR(50) NOT NULL DEFAULT '#8B4A38',
    "bgMutedColor" VARCHAR(50) NOT NULL DEFAULT '#F3E9E4',
    "secondaryDarkColor" VARCHAR(50) NOT NULL DEFAULT '#2B2620',
    "fontFamily" VARCHAR(100) NOT NULL DEFAULT 'Inter',
    "contactEmail" VARCHAR(255) NOT NULL DEFAULT 'support@pgmart.in',
    "contactPhone" VARCHAR(50) NOT NULL DEFAULT '+91 94711 55434',
    "supportEmail" VARCHAR(255) DEFAULT 'support@pgmart.in',
    "supportPhone" VARCHAR(50) DEFAULT '1800-123-4567',
    "whatsappNumber" VARCHAR(50) DEFAULT '+91 98765 43210',
    "address" TEXT NOT NULL DEFAULT '12 Fashion Street, Park Street Area, Kolkata, West Bengal 700016',
    "currencySymbol" VARCHAR(10) NOT NULL DEFAULT '₹',
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 999.00,
    "standardShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 79.00,
    "codFee" DOUBLE PRECISION NOT NULL DEFAULT 49.00,
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "razorpayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "razorpayKeyId" VARCHAR(255) NOT NULL DEFAULT 'rzp_test_1234567890',
    "stripePublicKey" VARCHAR(255) NOT NULL DEFAULT 'pk_test_1234567890',
    "gstNumber" VARCHAR(50) NOT NULL DEFAULT '19AAAAA0000A1Z5',
    "dealsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dealsTitle" VARCHAR(255) NOT NULL DEFAULT 'DEALS OF THE DAY',
    "dealsTimerHours" INT NOT NULL DEFAULT 14,
    "dealsTimerMinutes" INT NOT NULL DEFAULT 45,
    "dealsMinDiscount" INT NOT NULL DEFAULT 30,
    "adBannerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "termsOfService" TEXT,
    "privacyPolicy" TEXT,
    "refundPolicy" TEXT,
    "shippingPolicy" TEXT,
    "brandsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "brandsTitle" VARCHAR(255) NOT NULL DEFAULT 'Featured Clothing Brands',
    "brandsSubtitle" VARCHAR(255) NOT NULL DEFAULT '20 Premier Brands • 100% Authentic Storefront',
    "brandsBadge" VARCHAR(100) NOT NULL DEFAULT 'OFFICIAL BRANDS',
    "brandsSpeed" INT NOT NULL DEFAULT 35,
    "brandsMaxItems" INT NOT NULL DEFAULT 20
);

CREATE TABLE IF NOT EXISTS "Brand" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "image" TEXT NOT NULL,
    "banner" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "sortOrder" INT NOT NULL DEFAULT 1,
    "metaTitle" VARCHAR(255),
    "metaDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Subcategory" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "categoryId" VARCHAR(50) NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "image" TEXT,
    "banner_image" TEXT,
    "description" TEXT,
    "sort_order" INT NOT NULL DEFAULT 1,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subcategory_categoryId_slug_key" UNIQUE ("categoryId", "slug")
);

CREATE TABLE IF NOT EXISTS "CategoryType" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "subcategoryId" VARCHAR(50) NOT NULL REFERENCES "Subcategory"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "image" TEXT,
    "banner_image" TEXT,
    "description" TEXT,
    "sort_order" INT NOT NULL DEFAULT 1,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CategoryType_subcategoryId_slug_key" UNIQUE ("subcategoryId", "slug")
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "categoryId" VARCHAR(50) NOT NULL REFERENCES "Category"("id"),
    "subcategoryId" VARCHAR(50) NOT NULL REFERENCES "Subcategory"("id"),
    "typeId" VARCHAR(50) REFERENCES "CategoryType"("id"),
    "brandId" VARCHAR(50) REFERENCES "Brand"("id"),
    "brandName" VARCHAR(255),
    "description" TEXT NOT NULL,
    "fabric" VARCHAR(100) NOT NULL DEFAULT 'Cotton Blend',
    "fit" VARCHAR(100) NOT NULL DEFAULT 'Regular Fit',
    "sleeve" VARCHAR(100),
    "neck" VARCHAR(100),
    "pattern" VARCHAR(100),
    "occasion" VARCHAR(100) NOT NULL DEFAULT 'Casual',
    "hsnCode" VARCHAR(50) NOT NULL DEFAULT '6204',
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isDealOfTheDay" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'published',
    "variants" TEXT NOT NULL DEFAULT '[]',
    "colors" TEXT NOT NULL DEFAULT '[]',
    "availableSizes" TEXT NOT NULL DEFAULT '[]',
    "kidsSizes" TEXT NOT NULL DEFAULT '[]',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "reviewCount" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaTitle" VARCHAR(255),
    "metaDesc" TEXT,
    "aiImagePrompt" TEXT
);

CREATE TABLE IF NOT EXISTS "Banner" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "image" TEXT NOT NULL,
    "mobileImage" TEXT,
    "link" VARCHAR(255) NOT NULL,
    "buttonText" VARCHAR(100) NOT NULL DEFAULT 'Shop Now',
    "position" VARCHAR(50) NOT NULL DEFAULT 'hero',
    "sortOrder" INT NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "code" VARCHAR(100) NOT NULL UNIQUE,
    "discountType" VARCHAR(50) NOT NULL DEFAULT 'percentage',
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INT NOT NULL DEFAULT 100,
    "usedCount" INT NOT NULL DEFAULT 0,
    "expiryDate" VARCHAR(100) NOT NULL,
    "categoryScope" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "productId" VARCHAR(50) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(50) NOT NULL DEFAULT 'approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "orderNumber" VARCHAR(100) NOT NULL UNIQUE,
    "customerId" VARCHAR(50) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "customerEmail" VARCHAR(255) NOT NULL,
    "customerPhone" VARCHAR(50) NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "paymentStatus" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'upi',
    "trackingNumber" VARCHAR(100),
    "courierPartner" VARCHAR(100),
    "couponCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnStatus" VARCHAR(50) DEFAULT 'none',
    "returnType" VARCHAR(50),
    "returnReason" TEXT,
    "returnComments" TEXT,
    "exchangeSize" VARCHAR(50),
    "exchangeColor" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(50),
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Otp" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL,
    "codeHash" VARCHAR(255) NOT NULL,
    "purpose" VARCHAR(100) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "title" VARCHAR(255) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL DEFAULT 'Styling Tips',
    "author" VARCHAR(255) NOT NULL DEFAULT 'Priyam Ghoshal',
    "authorRole" VARCHAR(255) NOT NULL DEFAULT 'Founder & CEO, PGmart',
    "authorAvatar" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    "publishedDate" VARCHAR(100) NOT NULL,
    "readTime" VARCHAR(50) NOT NULL DEFAULT '5 min read',
    "featuredImage" TEXT NOT NULL,
    "relatedCategorySlug" VARCHAR(100) NOT NULL DEFAULT 'women',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" VARCHAR(255),
    "metaDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
