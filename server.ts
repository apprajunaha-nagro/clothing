import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialSiteSettings,
  initialBrands,
  initialCategories,
  initialBanners,
  initialProducts,
  initialCoupons,
  initialReviews
} from './src/data/seedData';
import {
  SiteSettings,
  Category,
  Subcategory,
  CategoryType,
  Brand,
  Product,
  Order,
  Coupon,
  Review,
  Banner,
  FilterState
} from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // In-memory persistent database store initialized with seed data
  let siteSettings: SiteSettings = { ...initialSiteSettings };
  let categories: Category[] = [...initialCategories];
  let brands: Brand[] = [...initialBrands];
  let products: Product[] = [...initialProducts];
  let banners: Banner[] = [...initialBanners];
  let coupons: Coupon[] = [...initialCoupons];
  let reviews: Review[] = [...initialReviews];
  let orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'TC-2026-1001',
      customerId: 'cust-1',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 98765 12345',
      shippingAddress: {
        id: 'addr-1',
        fullName: 'Priya Sharma',
        phone: '+91 98765 12345',
        street: 'Flat 402, Lotus Apartments, Salt Lake Sector 5',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700091',
        type: 'home',
        isDefault: true
      },
      items: [
        {
          id: 'item-1',
          productId: 'p1',
          variantId: 'p1-v1',
          productName: 'Hand-Woven Royal Banarasi Chiffon Saree',
          productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
          size: 'Free Size',
          color: 'Rose Clay',
          price: 3499,
          quantity: 1
        }
      ],
      subtotal: 3499,
      discount: 200,
      shippingFee: 0,
      tax: 165,
      total: 3464,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      trackingNumber: 'SHIP-IND-98765432',
      courierPartner: 'Delhivery',
      couponCode: 'WELCOME100',
      createdAt: '2026-07-29T11:20:00Z',
      updatedAt: '2026-07-30T14:10:00Z'
    }
  ];

  // ---------------- API ENDPOINTS ----------------

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
  });

  app.post('/api/settings', (req, res) => {
    siteSettings = { ...siteSettings, ...req.body };
    res.json({ success: true, settings: siteSettings });
  });

  // Categories (3-Tier)
  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    const newCategory: Category = {
      id: req.body.id || `cat-${Date.now()}`,
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      image: req.body.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
      banner: req.body.banner,
      status: req.body.status || 'active',
      sortOrder: categories.length + 1,
      subcategories: req.body.subcategories || [],
      metaTitle: req.body.metaTitle,
      metaDesc: req.body.metaDesc
    };
    categories.push(newCategory);
    res.json({ success: true, category: newCategory });
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...req.body };
      res.json({ success: true, category: categories[index] });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id);
    res.json({ success: true });
  });

  app.post('/api/categories/reorder', (req, res) => {
    const { reorderedIds } = req.body;
    if (Array.isArray(reorderedIds)) {
      categories.sort((a, b) => reorderedIds.indexOf(a.id) - reorderedIds.indexOf(b.id));
      categories.forEach((cat, idx) => { cat.sortOrder = idx + 1; });
    }
    res.json({ success: true, categories });
  });

  // Admin Subcategories API Endpoints
  app.get('/api/admin/subcategories', (req, res) => {
    const { category_id, status, search } = req.query;
    let list: any[] = [];
    categories.forEach(cat => {
      if (!category_id || cat.id === category_id) {
        (cat.subcategories || []).forEach(sub => {
          list.push({
            ...sub,
            categoryId: cat.id,
            categoryName: cat.name,
            productCount: products.filter(p => p.subcategoryId === sub.id).length
          });
        });
      }
    });

    if (status) {
      list = list.filter(item => item.status === status);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q));
    }
    list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(list);
  });

  app.post('/api/admin/subcategories', (req, res) => {
    const { categoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;
    if (!categoryId || !name) {
      return res.status(400).json({ error: 'Category ID and Name are required' });
    }
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const isDuplicate = (cat.subcategories || []).some(sub => sub.slug === finalSlug);
    if (isDuplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this category.` });
    }

    const newSub: Subcategory = {
      id: `sub-${Date.now()}`,
      categoryId,
      name,
      slug: finalSlug,
      status: status || 'active',
      image,
      banner_image,
      description,
      sort_order: Number(sort_order) || (cat.subcategories || []).length + 1,
      meta_title,
      meta_description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      types: []
    };
    if (!cat.subcategories) cat.subcategories = [];
    cat.subcategories.push(newSub);
    res.json({ success: true, subcategory: newSub, categories });
  });

  app.get('/api/admin/subcategories/:id', (req, res) => {
    const { id } = req.params;
    let found: any = null;
    categories.forEach(cat => {
      const sub = (cat.subcategories || []).find(s => s.id === id);
      if (sub) {
        found = { ...sub, categoryId: cat.id };
      }
    });
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  });

  app.put('/api/admin/subcategories/:id', (req, res) => {
    const { id } = req.params;
    const { categoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;

    let foundCat: Category | null = null;
    let foundSubIndex = -1;
    categories.forEach(cat => {
      const idx = (cat.subcategories || []).findIndex(s => s.id === id);
      if (idx !== -1) {
        foundCat = cat;
        foundSubIndex = idx;
      }
    });

    if (!foundCat || foundSubIndex === -1) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const sub = foundCat.subcategories[foundSubIndex];
    const finalSlug = (slug || name || sub.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const targetCatId = categoryId || foundCat.id;
    const targetCat = categories.find(c => c.id === targetCatId);
    if (!targetCat) {
      return res.status(404).json({ error: 'Target category not found' });
    }

    const isDuplicate = (targetCat.subcategories || []).some(s => s.id !== id && s.slug === finalSlug);
    if (isDuplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this category.` });
    }

    const updatedSub: Subcategory = {
      ...sub,
      name: name || sub.name,
      slug: finalSlug,
      image: image !== undefined ? image : sub.image,
      banner_image: banner_image !== undefined ? banner_image : sub.banner_image,
      description: description !== undefined ? description : sub.description,
      status: status !== undefined ? status : sub.status,
      meta_title: meta_title !== undefined ? meta_title : sub.meta_title,
      meta_description: meta_description !== undefined ? meta_description : sub.meta_description,
      sort_order: sort_order !== undefined ? Number(sort_order) : sub.sort_order,
      updated_at: new Date().toISOString()
    };

    if (targetCatId !== foundCat.id) {
      foundCat.subcategories.splice(foundSubIndex, 1);
      updatedSub.categoryId = targetCatId;
      if (!targetCat.subcategories) targetCat.subcategories = [];
      targetCat.subcategories.push(updatedSub);
    } else {
      foundCat.subcategories[foundSubIndex] = updatedSub;
    }

    res.json({ success: true, subcategory: updatedSub, categories });
  });

  app.delete('/api/admin/subcategories/:id', (req, res) => {
    const { id } = req.params;
    const { cascade } = req.query;

    let foundCat: Category | null = null;
    let foundSub: Subcategory | null = null;
    let foundSubIndex = -1;

    categories.forEach(cat => {
      const idx = (cat.subcategories || []).findIndex(s => s.id === id);
      if (idx !== -1) {
        foundCat = cat;
        foundSub = cat.subcategories[idx];
        foundSubIndex = idx;
      }
    });

    if (!foundCat || foundSubIndex === -1 || !foundSub) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const linkedProductsCount = products.filter(p => p.subcategoryId === id).length;
    const linkedTypesCount = (foundSub.types || []).length;

    if ((linkedProductsCount > 0 || linkedTypesCount > 0) && cascade !== 'true') {
      return res.status(400).json({
        error: 'Linked records exist',
        linkedProductsCount,
        linkedTypesCount,
        message: `This subcategory is linked to ${linkedProductsCount} products and ${linkedTypesCount} product types. Deleting it will affect them. Would you like to cascade delete or reassign?`
      });
    }

    if (cascade === 'true') {
      products = products.filter(p => p.subcategoryId !== id);
    }

    foundCat.subcategories.splice(foundSubIndex, 1);
    res.json({ success: true, categories });
  });

  app.patch('/api/admin/subcategories/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let found = false;
    categories.forEach(cat => {
      const sub = (cat.subcategories || []).find(s => s.id === id);
      if (sub) {
        sub.status = status;
        sub.updated_at = new Date().toISOString();
        found = true;
      }
    });

    if (found) {
      res.json({ success: true, categories });
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  });

  app.patch('/api/admin/subcategories/reorder', (req, res) => {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      orders.forEach((item: any) => {
        categories.forEach(cat => {
          const sub = (cat.subcategories || []).find(s => s.id === item.id);
          if (sub) {
            sub.sort_order = item.sort_order;
          }
        });
      });
    }
    res.json({ success: true, categories });
  });

  app.patch('/api/admin/subcategories/:id/move', (req, res) => {
    const { id } = req.params;
    const { new_category_id } = req.body;

    const targetCat = categories.find(c => c.id === new_category_id);
    if (!targetCat) {
      return res.status(404).json({ error: 'Target category not found' });
    }

    let foundCat: Category | null = null;
    let foundSubIndex = -1;

    categories.forEach(cat => {
      const idx = (cat.subcategories || []).findIndex(s => s.id === id);
      if (idx !== -1) {
        foundCat = cat;
        foundSubIndex = idx;
      }
    });

    if (!foundCat || foundSubIndex === -1) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const sub = foundCat.subcategories[foundSubIndex];
    foundCat.subcategories.splice(foundSubIndex, 1);
    sub.categoryId = new_category_id;
    if (!targetCat.subcategories) targetCat.subcategories = [];
    targetCat.subcategories.push(sub);

    res.json({ success: true, subcategory: sub, categories });
  });

  // Admin Product Types / Styles API Endpoints
  app.get('/api/admin/types', (req, res) => {
    const { subcategory_id, category_id, status, search } = req.query;
    let list: any[] = [];
    categories.forEach(cat => {
      if (!category_id || cat.id === category_id) {
        (cat.subcategories || []).forEach(sub => {
          if (!subcategory_id || sub.id === subcategory_id) {
            (sub.types || []).forEach(t => {
              list.push({
                ...t,
                categoryId: cat.id,
                categoryName: cat.name,
                subcategoryId: sub.id,
                subcategoryName: sub.name,
                productCount: products.filter(p => p.typeId === t.id).length
              });
            });
          }
        });
      }
    });

    if (status) {
      list = list.filter(item => item.status === status);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q));
    }
    list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(list);
  });

  app.post('/api/admin/types', (req, res) => {
    const { subcategoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;
    if (!subcategoryId || !name) {
      return res.status(400).json({ error: 'Subcategory ID and Name are required' });
    }

    let foundSub: Subcategory | null = null;
    categories.forEach(cat => {
      const sub = (cat.subcategories || []).find(s => s.id === subcategoryId);
      if (sub) foundSub = sub;
    });

    if (!foundSub) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const isDuplicate = (foundSub.types || []).some(t => t.slug === finalSlug);
    if (isDuplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this subcategory.` });
    }

    const newType: CategoryType = {
      id: `type-${Date.now()}`,
      subcategoryId,
      name,
      slug: finalSlug,
      status: status || 'active',
      image,
      banner_image,
      description,
      sort_order: Number(sort_order) || (foundSub.types || []).length + 1,
      meta_title,
      meta_description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!foundSub.types) foundSub.types = [];
    foundSub.types.push(newType);
    res.json({ success: true, type: newType, categories });
  });

  app.get('/api/admin/types/:id', (req, res) => {
    const { id } = req.params;
    let found: any = null;
    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const t = (sub.types || []).find(item => item.id === id);
        if (t) {
          found = { ...t, categoryId: cat.id, subcategoryId: sub.id };
        }
      });
    });
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Type/Style not found' });
    }
  });

  app.put('/api/admin/types/:id', (req, res) => {
    const { id } = req.params;
    const { subcategoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;

    let foundSub: Subcategory | null = null;
    let foundTypeIndex = -1;

    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const idx = (sub.types || []).findIndex(t => t.id === id);
        if (idx !== -1) {
          foundSub = sub;
          foundTypeIndex = idx;
        }
      });
    });

    if (!foundSub || foundTypeIndex === -1) {
      return res.status(404).json({ error: 'Type/Style not found' });
    }

    const t = foundSub.types[foundTypeIndex];
    const finalSlug = (slug || name || t.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const targetSubId = subcategoryId || foundSub.id;
    let targetSub: Subcategory | null = null;
    categories.forEach(cat => {
      const sub = (cat.subcategories || []).find(s => s.id === targetSubId);
      if (sub) targetSub = sub;
    });

    if (!targetSub) {
      return res.status(404).json({ error: 'Target subcategory not found' });
    }

    const isDuplicate = (targetSub.types || []).some(item => item.id !== id && item.slug === finalSlug);
    if (isDuplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this subcategory.` });
    }

    const updatedType: CategoryType = {
      ...t,
      name: name || t.name,
      slug: finalSlug,
      image: image !== undefined ? image : t.image,
      banner_image: banner_image !== undefined ? banner_image : t.banner_image,
      description: description !== undefined ? description : t.description,
      status: status !== undefined ? status : t.status,
      meta_title: meta_title !== undefined ? meta_title : t.meta_title,
      meta_description: meta_description !== undefined ? meta_description : t.meta_description,
      sort_order: sort_order !== undefined ? Number(sort_order) : t.sort_order,
      updated_at: new Date().toISOString()
    };

    if (targetSubId !== foundSub.id) {
      foundSub.types.splice(foundTypeIndex, 1);
      updatedType.subcategoryId = targetSubId;
      if (!targetSub.types) targetSub.types = [];
      targetSub.types.push(updatedType);
    } else {
      foundSub.types[foundTypeIndex] = updatedType;
    }

    res.json({ success: true, type: updatedType, categories });
  });

  app.delete('/api/admin/types/:id', (req, res) => {
    const { id } = req.params;
    const { cascade } = req.query;

    let foundSub: Subcategory | null = null;
    let foundTypeIndex = -1;

    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const idx = (sub.types || []).findIndex(t => t.id === id);
        if (idx !== -1) {
          foundSub = sub;
          foundTypeIndex = idx;
        }
      });
    });

    if (!foundSub || foundTypeIndex === -1) {
      return res.status(404).json({ error: 'Type/Style not found' });
    }

    const linkedProductsCount = products.filter(p => p.typeId === id).length;

    if (linkedProductsCount > 0 && cascade !== 'true') {
      return res.status(400).json({
        error: 'Linked records exist',
        linkedProductsCount,
        message: `This product type/style is linked to ${linkedProductsCount} products. Deleting it will affect them. Would you like to cascade delete or reassign?`
      });
    }

    if (cascade === 'true') {
      products = products.filter(p => p.typeId !== id);
    }

    foundSub.types.splice(foundTypeIndex, 1);
    res.json({ success: true, categories });
  });

  app.patch('/api/admin/types/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let found = false;
    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const t = (sub.types || []).find(item => item.id === id);
        if (t) {
          t.status = status;
          t.updated_at = new Date().toISOString();
          found = true;
        }
      });
    });

    if (found) {
      res.json({ success: true, categories });
    } else {
      res.status(404).json({ error: 'Type/Style not found' });
    }
  });

  app.patch('/api/admin/types/reorder', (req, res) => {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      orders.forEach((item: any) => {
        categories.forEach(cat => {
          (cat.subcategories || []).forEach(sub => {
            const t = (sub.types || []).find(s => s.id === item.id);
            if (t) {
              t.sort_order = item.sort_order;
            }
          });
        });
      });
    }
    res.json({ success: true, categories });
  });

  app.patch('/api/admin/types/:id/move', (req, res) => {
    const { id } = req.params;
    const { new_subcategory_id } = req.body;

    let targetSub: Subcategory | null = null;
    categories.forEach(cat => {
      const sub = (cat.subcategories || []).find(s => s.id === new_subcategory_id);
      if (sub) targetSub = sub;
    });

    if (!targetSub) {
      return res.status(404).json({ error: 'Target subcategory not found' });
    }

    let foundSub: Subcategory | null = null;
    let foundTypeIndex = -1;

    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const idx = (sub.types || []).findIndex(t => t.id === id);
        if (idx !== -1) {
          foundSub = sub;
          foundTypeIndex = idx;
        }
      });
    });

    if (!foundSub || foundTypeIndex === -1) {
      return res.status(404).json({ error: 'Type/Style not found' });
    }

    const t = foundSub.types[foundTypeIndex];
    foundSub.types.splice(foundTypeIndex, 1);
    t.subcategoryId = new_subcategory_id;
    if (!targetSub.types) targetSub.types = [];
    targetSub.types.push(t);

    res.json({ success: true, type: t, categories });
  });

  // Bulk CSV import/export
  app.post('/api/admin/subcategories/import', (req, res) => {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    const lines = csvData.split('\n').map((l: string) => l.trim()).filter(Boolean);
    let imported = 0;
    let skipped = 0;

    const startIdx = lines[0].toLowerCase().includes('category') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p: string) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        const categoryId = parts[0] || 'women';
        const name = parts[1];
        const slug = parts[2] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const status = parts[3] === 'inactive' ? 'inactive' : 'active';

        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
          const exists = (cat.subcategories || []).some(s => s.slug === slug);
          if (!exists) {
            const newSub: Subcategory = {
              id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              categoryId,
              name,
              slug,
              status,
              sort_order: (cat.subcategories || []).length + 1,
              types: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            if (!cat.subcategories) cat.subcategories = [];
            cat.subcategories.push(newSub);
            imported++;
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    res.json({ success: true, imported, skipped, categories });
  });

  app.get('/api/admin/subcategories/export', (req, res) => {
    let csv = 'category_id,name,slug,status\n';
    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        csv += `"${cat.id}","${sub.name.replace(/"/g, '""')}","${sub.slug}","${sub.status}"\n`;
      });
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subcategories.csv"');
    res.send(csv);
  });

  app.post('/api/admin/types/import', (req, res) => {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    const lines = csvData.split('\n').map((l: string) => l.trim()).filter(Boolean);
    let imported = 0;
    let skipped = 0;

    const startIdx = lines[0].toLowerCase().includes('subcategory') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p: string) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        const subcategoryId = parts[0];
        const name = parts[1];
        const slug = parts[2] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const status = parts[3] === 'inactive' ? 'inactive' : 'active';

        let targetSub: Subcategory | null = null;
        categories.forEach(cat => {
          const sub = (cat.subcategories || []).find(s => s.id === subcategoryId);
          if (sub) targetSub = sub;
        });

        if (targetSub) {
          const exists = (targetSub.types || []).some(t => t.slug === slug);
          if (!exists) {
            const newType: CategoryType = {
              id: `type-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              subcategoryId,
              name,
              slug,
              status,
              sort_order: (targetSub.types || []).length + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            if (!targetSub.types) targetSub.types = [];
            targetSub.types.push(newType);
            imported++;
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    res.json({ success: true, imported, skipped, categories });
  });

  app.get('/api/admin/types/export', (req, res) => {
    let csv = 'subcategory_id,name,slug,status\n';
    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        (sub.types || []).forEach(t => {
          csv += `"${sub.id}","${t.name.replace(/"/g, '""')}","${t.slug}","${t.status}"\n`;
        });
      });
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product_types.csv"');
    res.send(csv);
  });

  // Brands
  app.get('/api/brands', (req, res) => {
    res.json(brands);
  });

  app.post('/api/brands', (req, res) => {
    const newBrand: Brand = {
      id: `b-${Date.now()}`,
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      logo: req.body.logo || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
      description: req.body.description || '',
      isFeatured: req.body.isFeatured || false
    };
    brands.push(newBrand);
    res.json({ success: true, brand: newBrand });
  });

  // Products with full filtering & search
  app.get('/api/products', (req, res) => {
    let result = [...products];
    const { category, subcategory, type, brand, tag, search, sort, minPrice, maxPrice, occasion } = req.query;

    if (category) {
      result = result.filter(p => p.categoryId === category);
    }
    if (subcategory) {
      result = result.filter(p => p.subcategoryId === subcategory);
    }
    if (type) {
      result = result.filter(p => p.typeId === type);
    }
    if (brand) {
      result = result.filter(p => p.brandId === brand);
    }
    if (tag) {
      result = result.filter(p => p.tags.includes(tag as any));
    }
    if (occasion) {
      result = result.filter(p => p.occasion.toLowerCase().includes((occasion as string).toLowerCase()));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        (p.brandName && p.brandName.toLowerCase().includes(q))
      );
    }
    if (minPrice) {
      result = result.filter(p => (p.discountPrice || p.basePrice) >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => (p.discountPrice || p.basePrice) <= Number(maxPrice));
    }

    // Sort
    if (sort === 'price_asc') {
      result.sort((a, b) => (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice));
    } else if (sort === 'price_desc') {
      result.sort((a, b) => (b.discountPrice || b.basePrice) - (a.discountPrice || a.basePrice));
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    res.json(result);
  });

  app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const prod = products.find(p => p.id === id || p.slug === id);
    if (prod) {
      res.json(prod);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.post('/api/products', (req, res) => {
    const newProduct: Product = {
      id: req.body.id || `p-${Date.now()}`,
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: req.body.categoryId,
      subcategoryId: req.body.subcategoryId,
      typeId: req.body.typeId,
      brandId: req.body.brandId,
      brandName: req.body.brandName || brands.find(b => b.id === req.body.brandId)?.name || 'Terra & Clay',
      description: req.body.description || '',
      fabric: req.body.fabric || 'Cotton Blend',
      fit: req.body.fit || 'Regular Fit',
      sleeve: req.body.sleeve,
      neck: req.body.neck,
      pattern: req.body.pattern || 'Solid',
      occasion: req.body.occasion || 'Casual',
      hsnCode: req.body.hsnCode || '6204',
      gstPercent: Number(req.body.gstPercent) || 5,
      basePrice: Number(req.body.basePrice),
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
      discountPercent: req.body.discountPercent ? Number(req.body.discountPercent) : undefined,
      tags: req.body.tags || ['new_arrival'],
      status: req.body.status || 'published',
      availableSizes: req.body.availableSizes || ['S', 'M', 'L', 'XL'],
      colors: req.body.colors || [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'] }],
      variants: req.body.variants || [],
      rating: 5.0,
      reviewCount: 0,
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    res.json({ success: true, product: newProduct });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      res.json({ success: true, product: products[index] });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.json({ success: true });
  });

  // Stock Import & Export (CSV)
  app.get('/api/stock/export', (req, res) => {
    // Generate CSV data for stock
    const header = 'SKU,Product Name,Product ID,Variant ID,Size,Color,Price,Discount Price,Stock\n';
    const rows: string[] = [];

    products.forEach(p => {
      p.variants.forEach(v => {
        rows.push(`"${v.sku}","${p.name.replace(/"/g, '""')}","${p.id}","${v.id}","${v.size}","${v.color}",${v.price},${v.discountPrice || ''},${v.stock}`);
      });
    });

    const csvContent = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stock_inventory_export.csv"');
    res.send(csvContent);
  });

  app.post('/api/stock/import', (req, res) => {
    const { updates } = req.body; // Array of { sku, stock, price, discountPrice }
    let updatedCount = 0;

    if (Array.isArray(updates)) {
      updates.forEach((item: any) => {
        const { sku, stock, price, discountPrice } = item;
        products.forEach(p => {
          p.variants.forEach(v => {
            if (v.sku === sku || v.id === sku) {
              if (stock !== undefined && stock !== null && !isNaN(Number(stock))) {
                v.stock = Number(stock);
              }
              if (price !== undefined && price !== null && !isNaN(Number(price))) {
                v.price = Number(price);
              }
              if (discountPrice !== undefined && discountPrice !== null && !isNaN(Number(discountPrice))) {
                v.discountPrice = Number(discountPrice);
              }
              updatedCount++;
            }
          });
        });
      });
    }

    res.json({ success: true, updatedVariantsCount: updatedCount });
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `TC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: req.body.customerId || 'guest',
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      shippingAddress: req.body.shippingAddress,
      items: req.body.items,
      subtotal: Number(req.body.subtotal),
      discount: Number(req.body.discount || 0),
      shippingFee: Number(req.body.shippingFee || 0),
      tax: Number(req.body.tax || 0),
      total: Number(req.body.total),
      status: 'pending',
      paymentStatus: req.body.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod: req.body.paymentMethod,
      couponCode: req.body.couponCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct inventory stock
    newOrder.items.forEach(item => {
      products.forEach(p => {
        p.variants.forEach(v => {
          if (v.id === item.variantId) {
            v.stock = Math.max(0, v.stock - item.quantity);
          }
        });
      });
    });

    orders.unshift(newOrder);
    res.json({ success: true, order: newOrder });
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber, courierPartner } = req.body;
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status || order.status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierPartner) order.courierPartner = courierPartner;
      order.updatedAt = new Date().toISOString();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });

  // Coupons
  app.get('/api/coupons', (req, res) => {
    res.json(coupons);
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, cartTotal } = req.body;
    const coupon = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order value for ${coupon.code} is ₹${coupon.minOrderValue}` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'flat') {
      discountAmount = coupon.value;
    } else {
      discountAmount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    res.json({
      success: true,
      coupon,
      discountAmount: Math.round(discountAmount)
    });
  });

  // Banners
  app.get('/api/banners', (req, res) => {
    res.json(banners);
  });

  app.post('/api/banners', (req, res) => {
    const newBanner: Banner = {
      id: `b-${Date.now()}`,
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: req.body.image,
      link: req.body.link || '/',
      buttonText: req.body.buttonText || 'SHOP NOW',
      position: req.body.position || 'hero',
      sortOrder: banners.length + 1,
      isActive: true
    };
    banners.push(newBanner);
    res.json({ success: true, banner: newBanner });
  });


  // ---------------- GEMINI AI STYLIST ENDPOINTS ----------------
  // Initialize GoogleGenAI
  let ai: any = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log('GoogleGenAI client initialized successfully in server.');
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // Helper function to resolve image to base64
  async function resolveImageToBase64(imagePath: string): Promise<{ data: string; mimeType: string }> {
    if (imagePath.startsWith('data:')) {
      const match = imagePath.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      const response = await fetch(imagePath);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      return { mimeType: contentType, data: base64 };
    }
    // Try local
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const localFilePath = path.join(process.cwd(), cleanPath);
    if (fs.existsSync(localFilePath)) {
      const buffer = fs.readFileSync(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      const base64 = buffer.toString('base64');
      return { mimeType, data: base64 };
    }
    throw new Error('Image could not be resolved');
  }

  app.post('/api/ai-stylist/chat', async (req, res) => {
    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({ error: 'Gemini API is not configured. Please add GEMINI_API_KEY in Settings > Secrets.' });
    }

    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages array' });
      }

      // Format messages into shape expected by generateContent
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Summarize catalog context for model recommendations
      const productCatalogSummary = products.slice(0, 15).map(p => 
        `- ${p.name} (Category: ${p.categoryId}, Subcategory: ${p.subcategoryId}, Price: ₹${p.basePrice}, Colors: ${p.colors.map(c => c.name).join(', ')})`
      ).join('\n');

      const systemInstruction = `You are the PGmart AI Fashion Stylist, an expert stylist for premium ethnic, traditional, and modern apparel in India. 
You are warm, fashion-forward, professional, and knowledgeable.
Help the user coordinate their outfits, recommend matches, select perfect colors, suggest sizing, and answer styling questions.

Here are some real, in-store products currently available on PGmart. Proactively recommend these actual products where they match the user's inquiry:
${productCatalogSummary}

Always mention you are recommending genuine products from PGmart.
Use your Google Search grounding tool to look up current 2026 fashion trends, festival outfits, styling tips, color matches, and wedding trends.
Give clear, stylish, and highly engaging advice.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text,
        grounding: groundingChunks.map((chunk: any) => ({
          title: chunk.web?.title || 'Fashion Source',
          uri: chunk.web?.uri || '#'
        }))
      });
    } catch (error: any) {
      console.error('Error in /api/ai-stylist/chat:', error);
      res.status(500).json({ error: error.message || 'Error communicating with AI Stylist' });
    }
  });

  app.post('/api/ai-stylist/visualize', async (req, res) => {
    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({ error: 'Gemini API is not configured. Please add GEMINI_API_KEY in Settings > Secrets.' });
    }

    try {
      const { prompt, aspectRatio = '1:1', imageSize = '1K', model = 'gemini-3.1-flash-image' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      console.log(`Generating image. Model: ${model}, Size: ${imageSize}, Aspect: ${aspectRatio}`);

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize
          }
        }
      });

      let base64Image = null;
      let text = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          text += part.text;
        }
      }

      if (!base64Image) {
        throw new Error('No image was returned by the model.');
      }

      res.json({
        image: `data:image/png;base64,${base64Image}`,
        text
      });
    } catch (error: any) {
      console.error('Error in /api/ai-stylist/visualize:', error);
      res.status(500).json({ error: error.message || 'Error generating outfit visualization' });
    }
  });

  app.post('/api/ai-stylist/edit', async (req, res) => {
    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({ error: 'Gemini API is not configured. Please add GEMINI_API_KEY in Settings > Secrets.' });
    }

    try {
      const { imagePath, prompt, aspectRatio = '1:1', imageSize = '1K', model = 'gemini-3.1-flash-image' } = req.body;
      if (!imagePath || !prompt) {
        return res.status(400).json({ error: 'imagePath and prompt are required' });
      }

      console.log(`Editing image: ${imagePath.substring(0, 50)}... with prompt: ${prompt}`);

      const resolved = await resolveImageToBase64(imagePath);

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: resolved.data,
                mimeType: resolved.mimeType
              }
            },
            {
              text: prompt
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize
          }
        }
      });

      let base64Image = null;
      let text = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          text += part.text;
        }
      }

      if (!base64Image) {
        throw new Error('No edited image was returned by the model.');
      }

      res.json({
        image: `data:image/png;base64,${base64Image}`,
        text
      });
    } catch (error: any) {
      console.error('Error in /api/ai-stylist/edit:', error);
      res.status(500).json({ error: error.message || 'Error editing image' });
    }
  });


  // ---------------- VITE MIDDLEWARE SETUP ----------------
  // Serve the /src/assets folder statically in both dev and production modes
  app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
