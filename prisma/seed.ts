import { PrismaClient } from '@prisma/client';
import {
  initialSiteSettings,
  initialBrands,
  initialCategories,
  initialBanners,
  initialProducts,
  initialCoupons,
  initialReviews
} from '../src/data/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clear existing data
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryType.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.siteSettings.deleteMany();

  console.log('Cleaned old records.');

  // 2. SiteSettings
  await prisma.siteSettings.create({
    data: {
      id: 'default',
      ...initialSiteSettings,
    },
  });
  console.log('SiteSettings seeded.');

  // 3. Brands
  for (const b of initialBrands) {
    await prisma.brand.create({
      data: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        description: b.description,
        isFeatured: b.isFeatured ?? true,
      },
    });
  }
  console.log(`Seeded ${initialBrands.length} brands.`);

  // 4. Categories, Subcategories, CategoryTypes
  for (const cat of initialCategories) {
    const createdCat = await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        banner: cat.banner,
        status: cat.status,
        sortOrder: cat.sortOrder,
        metaTitle: cat.metaTitle,
        metaDesc: cat.metaDesc,
      },
    });

    for (const sub of cat.subcategories || []) {
      const createdSub = await prisma.subcategory.create({
        data: {
          id: sub.id,
          categoryId: createdCat.id,
          name: sub.name,
          slug: sub.slug,
          status: sub.status,
          image: sub.image,
          banner_image: sub.banner_image,
          description: sub.description,
          sort_order: sub.sort_order ?? 1,
          meta_title: sub.meta_title,
          meta_description: sub.meta_description,
        },
      });

      for (const t of sub.types || []) {
        await prisma.categoryType.create({
          data: {
            id: t.id,
            subcategoryId: createdSub.id,
            name: t.name,
            slug: t.slug,
            status: t.status,
            image: t.image,
            banner_image: t.banner_image,
            description: t.description,
            sort_order: t.sort_order ?? 1,
            meta_title: t.meta_title,
            meta_description: t.meta_description,
          },
        });
      }
    }
  }
  console.log(`Seeded ${initialCategories.length} categories with subcategories and types.`);

  // 5. Products
  let productCount = 0;
  for (const p of initialProducts) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId,
        typeId: p.typeId || null,
        brandId: p.brandId || null,
        brandName: p.brandName || null,
        description: p.description,
        fabric: p.fabric,
        fit: p.fit,
        sleeve: p.sleeve || null,
        neck: p.neck || null,
        pattern: p.pattern || null,
        occasion: p.occasion,
        hsnCode: p.hsnCode,
        gstPercent: p.gstPercent,
        basePrice: p.basePrice,
        discountPrice: p.discountPrice || null,
        discountPercent: p.discountPercent || null,
        tags: JSON.stringify(p.tags || []),
        isDealOfTheDay: p.isDealOfTheDay ?? false,
        status: p.status,
        variants: JSON.stringify(p.variants || []),
        colors: JSON.stringify(p.colors || []),
        availableSizes: JSON.stringify(p.availableSizes || []),
        rating: p.rating,
        reviewCount: p.reviewCount,
        created_at: p.created_at ? new Date(p.created_at) : new Date(),
        metaTitle: p.metaTitle || null,
        metaDesc: p.metaDesc || null,
        aiImagePrompt: p.aiImagePrompt || null,
      },
    });
    productCount++;
  }
  console.log(`Seeded ${productCount} products.`);

  // 6. Banners
  for (const b of initialBanners) {
    await prisma.banner.create({
      data: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || null,
        image: b.image,
        mobileImage: b.mobileImage || null,
        link: b.link,
        buttonText: b.buttonText,
        position: b.position,
        sortOrder: b.sortOrder,
        isActive: b.isActive,
      },
    });
  }
  console.log(`Seeded ${initialBanners.length} banners.`);

  // 7. Coupons
  for (const c of initialCoupons) {
    await prisma.coupon.create({
      data: {
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount || null,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        expiryDate: c.expiryDate,
        categoryScope: c.categoryScope || null,
        isActive: c.isActive,
      },
    });
  }
  console.log(`Seeded ${initialCoupons.length} coupons.`);

  // 8. Reviews
  for (const r of initialReviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        productId: r.productId,
        customerName: r.customerName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        photos: JSON.stringify(r.photos || []),
        isVerifiedPurchase: r.isVerifiedPurchase,
        status: r.status,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      },
    });
  }
  console.log(`Seeded ${initialReviews.length} reviews.`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
