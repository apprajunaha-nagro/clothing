-- PostgreSQL Incremental Migration & Additions Script for PGmart
-- Use this script if your database tables already exist and you need to add newly added columns/tables without dropping existing data.

-- 1. Create missing tables if they don't exist yet
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

-- Index for OTP table
CREATE INDEX IF NOT EXISTS "Otp_email_purpose_idx" ON "Otp"("email", "purpose");

-- 2. Incremental Column Additions to "Order" table (Returns & Exchanges)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "returnStatus" VARCHAR(50) DEFAULT 'none';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "returnType" VARCHAR(50);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "returnReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "returnComments" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "exchangeSize" VARCHAR(50);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "exchangeColor" VARCHAR(50);

-- 3. Incremental Column Additions to "Product" table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "typeId" VARCHAR(50);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brandId" VARCHAR(50);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brandName" VARCHAR(255);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "metaTitle" VARCHAR(255);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "metaDesc" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "aiImagePrompt" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "kidsSizes" TEXT DEFAULT '[]';

-- 4. Incremental Column Additions to "SiteSettings" table
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "supportEmail" VARCHAR(255) DEFAULT 'support@pgmart.in';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "supportPhone" VARCHAR(50) DEFAULT '1800-123-4567';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "whatsappNumber" VARCHAR(50) DEFAULT '+91 98765 43210';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsTitle" VARCHAR(255) DEFAULT 'Featured Clothing Brands';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsSubtitle" VARCHAR(255) DEFAULT '20 Premier Brands • 100% Authentic Storefront';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsBadge" VARCHAR(100) DEFAULT 'OFFICIAL BRANDS';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsSpeed" INT DEFAULT 35;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandsMaxItems" INT DEFAULT 20;

-- 5. Incremental Column Additions to "User" table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
