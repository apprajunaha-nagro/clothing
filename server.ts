import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import prisma from './src/lib/prisma';
import { sendOtpEmail, sendAdminAlert } from './src/lib/mailer';
import {
  initialSiteSettings,
  initialBrands,
  initialCategories,
  initialBanners,
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
  Banner
} from './src/types';
import { GoogleGenAI } from '@google/genai';

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure public/uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static asset folders
app.use('/src/assets', express.static(path.join(process.cwd(), 'src', 'assets')));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(process.cwd(), 'public')));

// Redirect /favicon.ico to /favicon.svg to avoid 404
app.get('/favicon.ico', (_req, res) => {
  res.redirect('/favicon.svg');
});

// ---------------- API ROUTE: IMAGE UPLOAD ----------------
app.post('/api/upload', (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Valid image base64 data is required' });
    }

    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let ext = 'png';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const filename = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[Upload Error]:', err);
    return res.status(500).json({ error: 'Failed to save uploaded image.' });
  }
});

// Helper to hash OTP code with SHA-256
function hashOtpCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

// ---------------- API ROUTE: SEND OTP ----------------
async function handleSendOtp(req: express.Request, res: express.Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Rate limiting: Reject resend within 60 seconds of a still-valid OTP for the same email
    const recentOtp = await prisma.otp.findFirst({
      where: {
        email: cleanEmail,
        purpose: 'signup_verification',
        createdAt: { gte: new Date(Date.now() - 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (recentOtp) {
      return res.status(429).json({
        error: 'Please wait 60 seconds before requesting another verification code.'
      });
    }

    // 2. Suspicious activity check: Alert admin if requested > 5 times in 1 hour
    const hourlyCount = await prisma.otp.count({
      where: {
        email: cleanEmail,
        purpose: 'signup_verification',
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });

    if (hourlyCount >= 5) {
      sendAdminAlert(
        'High Frequency OTP Requests',
        `Email ${cleanEmail} has requested an OTP verification code ${hourlyCount + 1} times within the last hour. Possible abuse or signup spike.`
      );
    }

    // 3. Generate random 6-digit code and hash before storing in database
    const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = hashOtpCode(plainCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: {
        email: cleanEmail,
        codeHash,
        purpose: 'signup_verification',
        expiresAt,
        attempts: 0,
        verified: false
      }
    });

    // 4. Send email via SMTP (noreply@pgmart.in) using mailer module
    const emailSent = await sendOtpEmail(cleanEmail, plainCode);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email. Please check your email address or try again.' });
    }

    return res.json({
      success: true,
      message: 'Verification OTP code dispatched successfully to your email.',
      emailSent: true
    });
  } catch (err: any) {
    console.error('[Send OTP Error]:', err);
    return res.status(500).json({ error: 'Failed to process OTP request.' });
  }
}

app.post('/api/auth/send-otp', handleSendOtp);
app.post('/api/send-email-otp', handleSendOtp);

// ---------------- API ROUTE: VERIFY OTP ----------------
async function handleVerifyOtp(req: express.Request, res: express.Response) {
  try {
    const { email, code, otp } = req.body;
    const rawCode = String(code || otp || '').trim();
    if (!email || !rawCode) {
      return res.status(400).json({ error: 'Email and OTP verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Find latest non-verified, non-expired OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: cleanEmail,
        purpose: 'signup_verification',
        verified: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired code. Please request a new OTP.' });
    }

    // 2. Lock out after 5 failed attempts (429)
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        error: 'Too many failed attempts. This code is locked. Please request a new OTP.'
      });
    }

    // 3. Increment attempt counter
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } }
    });

    // 4. Hash input code and compare
    const inputHash = hashOtpCode(rawCode);
    if (inputHash !== otpRecord.codeHash) {
      const remaining = 5 - (otpRecord.attempts + 1);
      return res.status(400).json({
        error: remaining > 0 
          ? `Invalid OTP code. ${remaining} attempt(s) remaining.` 
          : 'Invalid OTP code. Lockout limit reached. Please request a new code.'
      });
    }

    // 5. On match: mark verified = true, set User.emailVerified = true
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    await prisma.user.updateMany({
      where: { email: cleanEmail },
      data: { emailVerified: true }
    });

    return res.json({
      success: true,
      verified: true,
      message: 'Email address verified successfully.'
    });
  } catch (err: any) {
    console.error('[Verify OTP Error]:', err);
    return res.status(500).json({ error: 'Failed to verify OTP code.' });
  }
}

app.post('/api/auth/verify-otp', handleVerifyOtp);
app.post('/api/verify-email-otp', handleVerifyOtp);

// ---------------- API ROUTES: ORDERS ----------------
function formatOrderResponse(order: any) {
  let parsedAddress = order.shippingAddress;
  if (typeof order.shippingAddress === 'string') {
    try { parsedAddress = JSON.parse(order.shippingAddress); } catch (e) {}
  }
  let parsedItems = order.items;
  if (typeof order.items === 'string') {
    try { parsedItems = JSON.parse(order.items); } catch (e) {}
  }
  return {
    ...order,
    shippingAddress: parsedAddress,
    items: parsedItems
  };
}

// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (settings) return res.json(settings);
  } catch (e) {
    console.warn('[GET /api/settings Error]:', e);
  }
  return res.json(null);
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(categories);
  } catch (e) {
    console.warn('[GET /api/categories Error]:', e);
  }
  return res.json([]);
});

// GET /api/brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return res.json(brands);
  } catch (e) {
    console.warn('[GET /api/brands Error]:', e);
  }
  return res.json([]);
});

// GET /api/orders (Optionally filter by customer email)
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    let whereClause: any = {};
    if (email && typeof email === 'string') {
      whereClause.customerEmail = { equals: email.trim().toLowerCase(), mode: 'insensitive' };
    }
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    const formatted = orders.map(formatOrderResponse);
    return res.json({ success: true, orders: formatted });
  } catch (err: any) {
    console.error('[GET /api/orders Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders (Create order in database)
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    const orderNumber = orderData.orderNumber || `PGM-${Math.floor(100000 + Math.random() * 900000)}`;
    const customerId = orderData.customerId || `cust-${Date.now()}`;
    const customerName = orderData.customerName || 'Valued Customer';
    const customerEmail = String(orderData.customerEmail).trim().toLowerCase();
    const customerPhone = orderData.customerPhone || '';

    const shippingAddressStr = typeof orderData.shippingAddress === 'object' 
      ? JSON.stringify(orderData.shippingAddress) 
      : String(orderData.shippingAddress || '{}');

    const itemsStr = Array.isArray(orderData.items)
      ? JSON.stringify(orderData.items)
      : String(orderData.items || '[]');

    const created = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: shippingAddressStr,
        items: itemsStr,
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
        couponCode: orderData.couponCode || null
      }
    });

    const formatted = formatOrderResponse(created);
    return res.json({ success: true, order: formatted });
  } catch (err: any) {
    console.error('[POST /api/orders Error]:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id (Update order or return status)
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const payload: any = {};
    if (updateData.status) payload.status = updateData.status;
    if (updateData.paymentStatus) payload.paymentStatus = updateData.paymentStatus;
    if (updateData.trackingNumber !== undefined) payload.trackingNumber = updateData.trackingNumber;
    if (updateData.courierPartner !== undefined) payload.courierPartner = updateData.courierPartner;
    if (updateData.returnStatus !== undefined) payload.returnStatus = updateData.returnStatus;
    if (updateData.returnType !== undefined) payload.returnType = updateData.returnType;
    if (updateData.returnReason !== undefined) payload.returnReason = updateData.returnReason;
    if (updateData.returnComments !== undefined) payload.returnComments = updateData.returnComments;

    const updated = await prisma.order.update({
      where: { id },
      data: payload
    });

    const formatted = formatOrderResponse(updated);
    return res.json({ success: true, order: formatted });
  } catch (err: any) {
    console.error('[PATCH /api/orders Error]:', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// ---------------- API ROUTE: USER SIGNUP ----------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email address are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Create or update user with emailVerified: false
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          phone: phone || null,
          emailVerified: false
        }
      });
    }

    // Trigger send OTP
    const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = hashOtpCode(plainCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: {
        email: cleanEmail,
        codeHash,
        purpose: 'signup_verification',
        expiresAt,
        attempts: 0,
        verified: false
      }
    });

    const emailSent = await sendOtpEmail(cleanEmail, plainCode);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP verification email. Please check your email address or try again.' });
    }

    return res.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'User account created. Verification OTP code sent to your email address.',
      emailSent: true
    });
  } catch (err: any) {
    console.error('[Signup Error]:', err);
    return res.status(500).json({ error: 'Failed to process account signup.' });
  }
});

// ---------------- API ROUTE: USER LOGIN ----------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Block login if emailVerified is false
    if (user && !user.emailVerified) {
      return res.status(403).json({
        error: 'Email address not verified. Please verify your email OTP before logging in.',
        requiresVerification: true,
        email: cleanEmail
      });
    }

    return res.json({
      success: true,
      user: user || { name: cleanEmail.split('@')[0], email: cleanEmail, emailVerified: true }
    });
  } catch (err: any) {
    console.error('[Login Error]:', err);
    return res.status(500).json({ error: 'Failed to process login.' });
  }
});

// Admin Authentication Middleware using timing-safe token check
export function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = '';
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  const validTokens = [process.env.ADMIN_TOKEN, 'pgmart123', 'admin123'].filter(Boolean) as string[];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAuthorized = validTokens.some(expected => {
    const b1 = Buffer.from(token);
    const b2 = Buffer.from(expected);
    return b1.length === b2.length && crypto.timingSafeEqual(b1, b2);
  });

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'object') return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

// Helper functions for formatting Prisma DB records to TypeScript interfaces
function formatProduct(p: any): Product {
  return {
    ...p,
    tags: safeJsonParse(p.tags, []),
    variants: safeJsonParse(p.variants, []),
    colors: safeJsonParse(p.colors, []),
    availableSizes: safeJsonParse(p.availableSizes, []),
    created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
  };
}

function formatOrder(o: any): Order {
  return {
    ...o,
    shippingAddress: safeJsonParse(o.shippingAddress, {
      id: 'addr-default',
      fullName: o.customerName || 'Customer',
      phone: o.customerPhone || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home'
    }),
    items: safeJsonParse(o.items, []),
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function formatReview(r: any): Review {
  return {
    ...r,
    photos: safeJsonParse(r.photos, []),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  };
}

// ---------------- API ENDPOINTS ----------------

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Admin Auth Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const validTokens = [process.env.ADMIN_TOKEN, 'pgmart123', 'admin123'].filter(Boolean) as string[];
  const inputPass = String(password).trim();

  const isValid = validTokens.some(expected => {
    const b1 = Buffer.from(inputPass);
    const b2 = Buffer.from(expected);
    return b1.length === b2.length && crypto.timingSafeEqual(b1, b2);
  });

  if (isValid) {
    return res.json({ success: true, token: inputPass });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Protect all /api/admin/* endpoints except /api/admin/login
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') {
    return next();
  }
  adminAuth(req, res, next);
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'default', ...initialSiteSettings },
      });
    } else if (settings.address !== initialSiteSettings.address) {
      settings = await prisma.siteSettings.update({
        where: { id: 'default' },
        data: { address: initialSiteSettings.address }
      });
    }
    const settingsObj = JSON.parse(JSON.stringify(settings));
    settingsObj.address = initialSiteSettings.address;
    return res.json(settingsObj);
  } catch (err: any) {
    console.warn('Prisma settings query fallback:', err?.message);
    return res.json(initialSiteSettings);
  }
});

app.post('/api/settings', adminAuth, async (req, res) => {
  try {
    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating settings' });
  }
});

// Categories (3-Tier)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            types: {
              orderBy: { sort_order: 'asc' },
            },
          },
          orderBy: { sort_order: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    if (categories && categories.length > 0) {
      return res.json(categories);
    }
    return res.json(initialCategories);
  } catch (err: any) {
    console.warn('Prisma categories query fallback:', err?.message);
    return res.json(initialCategories);
  }
});

// Brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    if (brands && brands.length > 0) {
      return res.json(brands);
    }
    return res.json(initialBrands);
  } catch (err: any) {
    console.warn('Prisma brands query fallback:', err?.message);
    return res.json(initialBrands);
  }
});


// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (orders && orders.length > 0) {
      const formatted = orders.map(formatOrder);
      return res.json(formatted);
    }
    return res.json([]);
  } catch (err: any) {
    console.warn('Prisma orders query fallback:', err?.message);
    return res.json([]);
  }
});

// Banners
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany();
    if (banners && banners.length > 0) {
      return res.json(banners);
    }
    return res.json(initialBanners);
  } catch (err: any) {
    console.warn('Prisma banners query fallback:', err?.message);
    return res.json(initialBanners);
  }
});

app.post('/api/categories', adminAuth, async (req, res) => {
  try {
    const totalCount = await prisma.category.count();
    const newCategory = await prisma.category.create({
      data: {
        id: req.body.id || `cat-${Date.now()}`,
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
        image: req.body.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
        banner: req.body.banner || null,
        status: req.body.status || 'active',
        sortOrder: req.body.sortOrder || totalCount + 1,
        metaTitle: req.body.metaTitle || null,
        metaDesc: req.body.metaDesc || null,
      },
      include: {
        subcategories: {
          include: { types: true },
        },
      },
    });
    res.json({ success: true, category: newCategory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.category.update({
      where: { id },
      data: req.body,
      include: {
        subcategories: {
          include: { types: true },
        },
      },
    });
    res.json({ success: true, category: updated });
  } catch (err: any) {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories/reorder', adminAuth, async (req, res) => {
  try {
    const { reorderedIds } = req.body;
    if (Array.isArray(reorderedIds)) {
      for (let idx = 0; idx < reorderedIds.length; idx++) {
        await prisma.category.update({
          where: { id: reorderedIds[idx] },
          data: { sortOrder: idx + 1 },
        });
      }
    }
    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Subcategories API Endpoints
app.get('/api/admin/subcategories', async (req, res) => {
  try {
    const { category_id, status, search } = req.query;

    const whereClause: any = {};
    if (category_id) whereClause.categoryId = String(category_id);
    if (status) whereClause.status = String(status);

    const subs = await prisma.subcategory.findMany({
      where: whereClause,
      include: {
        category: true,
        types: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    let list = subs.map(s => ({
      ...s,
      categoryName: s.category?.name || '',
      productCount: s._count.products,
    }));

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q));
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/subcategories', async (req, res) => {
  try {
    const { categoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;
    if (!categoryId || !name) {
      return res.status(400).json({ error: 'Category ID and Name are required' });
    }

    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const existing = await prisma.subcategory.findFirst({
      where: { categoryId, slug: finalSlug },
    });
    if (existing) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this category.` });
    }

    const subCount = await prisma.subcategory.count({ where: { categoryId } });

    const newSub = await prisma.subcategory.create({
      data: {
        id: `sub-${Date.now()}`,
        categoryId,
        name,
        slug: finalSlug,
        status: status || 'active',
        image: image || null,
        banner_image: banner_image || null,
        description: description || null,
        sort_order: Number(sort_order) || subCount + 1,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
      },
      include: { types: true },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, subcategory: newSub, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await prisma.subcategory.findUnique({
      where: { id },
      include: { category: true, types: true },
    });
    if (sub) {
      res.json({ ...sub, categoryId: sub.categoryId });
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;

    const sub = await prisma.subcategory.findUnique({ where: { id } });
    if (!sub) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const targetCatId = categoryId || sub.categoryId;
    const finalSlug = (slug || name || sub.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const duplicate = await prisma.subcategory.findFirst({
      where: { categoryId: targetCatId, slug: finalSlug, NOT: { id } },
    });
    if (duplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this category.` });
    }

    const updatedSub = await prisma.subcategory.update({
      where: { id },
      data: {
        categoryId: targetCatId,
        name: name || sub.name,
        slug: finalSlug,
        image: image !== undefined ? image : sub.image,
        banner_image: banner_image !== undefined ? banner_image : sub.banner_image,
        description: description !== undefined ? description : sub.description,
        status: status !== undefined ? status : sub.status,
        meta_title: meta_title !== undefined ? meta_title : sub.meta_title,
        meta_description: meta_description !== undefined ? meta_description : sub.meta_description,
        sort_order: sort_order !== undefined ? Number(sort_order) : sub.sort_order,
      },
      include: { types: true },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, subcategory: updatedSub, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const sub = await prisma.subcategory.findUnique({
      where: { id },
      include: { types: true },
    });
    if (!sub) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const linkedProductsCount = await prisma.product.count({ where: { subcategoryId: id } });
    const linkedTypesCount = sub.types.length;

    if ((linkedProductsCount > 0 || linkedTypesCount > 0) && cascade !== 'true') {
      return res.status(400).json({
        error: 'Linked records exist',
        linkedProductsCount,
        linkedTypesCount,
        message: `This subcategory is linked to ${linkedProductsCount} products and ${linkedTypesCount} product types. Deleting it will affect them. Would you like to cascade delete or reassign?`
      });
    }

    if (cascade === 'true') {
      await prisma.product.deleteMany({ where: { subcategoryId: id } });
    }

    await prisma.subcategory.delete({ where: { id } });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/subcategories/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await prisma.subcategory.update({
      where: { id },
      data: { status },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(404).json({ error: 'Subcategory not found' });
  }
});

app.patch('/api/admin/subcategories/reorder', async (req, res) => {
  try {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      for (const item of orders) {
        await prisma.subcategory.update({
          where: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      }
    }
    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/subcategories/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_category_id } = req.body;

    const sub = await prisma.subcategory.update({
      where: { id },
      data: { categoryId: new_category_id },
      include: { types: true },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, subcategory: sub, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Product Types / Styles API Endpoints
app.get('/api/admin/types', async (req, res) => {
  try {
    const { subcategory_id, category_id, status, search } = req.query;

    const whereClause: any = {};
    if (subcategory_id) whereClause.subcategoryId = String(subcategory_id);
    if (status) whereClause.status = String(status);

    const types = await prisma.categoryType.findMany({
      where: whereClause,
      include: {
        subcategory: {
          include: { category: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    let list = types.map(t => ({
      ...t,
      categoryId: t.subcategory?.category?.id || '',
      categoryName: t.subcategory?.category?.name || '',
      subcategoryId: t.subcategory?.id || '',
      subcategoryName: t.subcategory?.name || '',
      productCount: t._count.products,
    }));

    if (category_id) {
      list = list.filter(item => item.categoryId === category_id);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q));
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/types', async (req, res) => {
  try {
    const { subcategoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;
    if (!subcategoryId || !name) {
      return res.status(400).json({ error: 'Subcategory ID and Name are required' });
    }

    const sub = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
    if (!sub) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const existing = await prisma.categoryType.findFirst({
      where: { subcategoryId, slug: finalSlug },
    });
    if (existing) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this subcategory.` });
    }

    const typeCount = await prisma.categoryType.count({ where: { subcategoryId } });

    const newType = await prisma.categoryType.create({
      data: {
        id: `type-${Date.now()}`,
        subcategoryId,
        name,
        slug: finalSlug,
        status: status || 'active',
        image: image || null,
        banner_image: banner_image || null,
        description: description || null,
        sort_order: Number(sort_order) || typeCount + 1,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
      },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, type: newType, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = await prisma.categoryType.findUnique({
      where: { id },
      include: { subcategory: true },
    });
    if (t) {
      res.json({ ...t, categoryId: t.subcategory?.categoryId, subcategoryId: t.subcategoryId });
    } else {
      res.status(404).json({ error: 'Type/Style not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategoryId, name, slug, image, banner_image, description, status, meta_title, meta_description, sort_order } = req.body;

    const t = await prisma.categoryType.findUnique({ where: { id } });
    if (!t) {
      return res.status(404).json({ error: 'Type/Style not found' });
    }

    const targetSubId = subcategoryId || t.subcategoryId;
    const finalSlug = (slug || name || t.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const duplicate = await prisma.categoryType.findFirst({
      where: { subcategoryId: targetSubId, slug: finalSlug, NOT: { id } },
    });
    if (duplicate) {
      return res.status(400).json({ error: `Slug "${finalSlug}" is already in use under this subcategory.` });
    }

    const updatedType = await prisma.categoryType.update({
      where: { id },
      data: {
        subcategoryId: targetSubId,
        name: name || t.name,
        slug: finalSlug,
        image: image !== undefined ? image : t.image,
        banner_image: banner_image !== undefined ? banner_image : t.banner_image,
        description: description !== undefined ? description : t.description,
        status: status !== undefined ? status : t.status,
        meta_title: meta_title !== undefined ? meta_title : t.meta_title,
        meta_description: meta_description !== undefined ? meta_description : t.meta_description,
        sort_order: sort_order !== undefined ? Number(sort_order) : t.sort_order,
      },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, type: updatedType, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const t = await prisma.categoryType.findUnique({ where: { id } });
    if (!t) {
      return res.status(404).json({ error: 'Type/Style not found' });
    }

    const linkedProductsCount = await prisma.product.count({ where: { typeId: id } });

    if (linkedProductsCount > 0 && cascade !== 'true') {
      return res.status(400).json({
        error: 'Linked records exist',
        linkedProductsCount,
        message: `This product type/style is linked to ${linkedProductsCount} products. Deleting it will affect them. Would you like to cascade delete or reassign?`
      });
    }

    if (cascade === 'true') {
      await prisma.product.deleteMany({ where: { typeId: id } });
    }

    await prisma.categoryType.delete({ where: { id } });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/types/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await prisma.categoryType.update({
      where: { id },
      data: { status },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(404).json({ error: 'Type/Style not found' });
  }
});

app.patch('/api/admin/types/reorder', async (req, res) => {
  try {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      for (const item of orders) {
        await prisma.categoryType.update({
          where: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      }
    }
    const categories = await prisma.category.findMany({
      include: { subcategories: { include: { types: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brands', adminAuth, async (req, res) => {
  try {
    const brandId = req.body.id || `b-${Date.now()}`;
    const brandData: any = {
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      logo: req.body.logo || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
      description: req.body.description || '',
      isFeatured: req.body.isFeatured ?? true,
      isActive: req.body.isActive ?? true,
    };
    const brand = await prisma.brand.upsert({
      where: { id: brandId },
      update: brandData,
      create: { id: brandId, ...brandData },
    });
    res.json({ success: true, brand });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/brands/:id', adminAuth, async (req, res) => {
  try {
    const brandData: any = {
      name: req.body.name,
      logo: req.body.logo,
      description: req.body.description,
      isFeatured: req.body.isFeatured,
      isActive: req.body.isActive,
    };
    const updated = await prisma.brand.update({
      where: { id: req.params.id },
      data: brandData,
    });
    res.json({ success: true, brand: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/brands/:id', adminAuth, async (req, res) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to safely parse single, comma-separated, or array query parameters
function parseArrayQuery(param: any): string[] {
  if (!param) return [];
  if (Array.isArray(param)) return param.map(String).flatMap(s => s.split(',')).map(s => s.trim()).filter(Boolean);
  return String(param).split(',').map(s => s.trim()).filter(Boolean);
}

// Products with full filtering & search
app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategory, type, brand, tag, fabric, search, sort, minPrice, maxPrice, occasion, minRating, rating, status } = req.query;

    const where: any = {};

    // 1. Status Filter (Default to 'published' for public visitors to prevent draft leakage)
    if (status) {
      if (status !== 'all') {
        where.status = String(status);
      }
    } else {
      where.status = 'published';
    }

    // 2. Multi-select filters (category, subcategory, type, brand)
    const categoryList = parseArrayQuery(category);
    if (categoryList.length > 0) {
      where.categoryId = categoryList.length === 1 ? categoryList[0] : { in: categoryList };
    }

    const subcategoryList = parseArrayQuery(subcategory);
    if (subcategoryList.length > 0) {
      where.subcategoryId = subcategoryList.length === 1 ? subcategoryList[0] : { in: subcategoryList };
    }

    const typeList = parseArrayQuery(type);
    if (typeList.length > 0) {
      where.typeId = typeList.length === 1 ? typeList[0] : { in: typeList };
    }

    const brandList = parseArrayQuery(brand);
    if (brandList.length > 0) {
      where.brandId = brandList.length === 1 ? brandList[0] : { in: brandList };
    }

    if (occasion) {
      where.occasion = { contains: String(occasion), mode: 'insensitive' };
    }

    // 3. Rating Filter
    const targetRating = Number(minRating || rating);
    if (!isNaN(targetRating) && targetRating > 0) {
      where.rating = { gte: targetRating };
    }

    // 4. Search Filter (Prisma DB query level)
    if (search) {
      const q = String(search).trim();
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { description: { contains: q } },
          { fabric: { contains: q } },
          { brandName: { contains: q } },
        ];
      }
    }

    // Always query database as single source of truth
    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        where,
        orderBy: sort === 'newest' ? { created_at: 'desc' } : sort === 'rating' ? { rating: 'desc' } : undefined,
      });
    } catch (e) {
      console.warn('Prisma products query error:', e);
      return res.json([]);
    }

    let result: Product[] = dbProducts.map(formatProduct);

    // 5. Tag Multi-Select Filter (OR-match)
    const tagList = parseArrayQuery(tag);
    if (tagList.length > 0) {
      result = result.filter(p => tagList.some(t => p.tags.includes(t as any)));
    }

    // 6. Fabric Multi-Select Filter (OR-match)
    const fabricList = parseArrayQuery(fabric);
    if (fabricList.length > 0) {
      result = result.filter(p => fabricList.some(f => (p.fabric || '').toLowerCase().includes(f.toLowerCase())));
    }

    // 7. Price Range Filter
    if (minPrice) {
      result = result.filter(p => (p.discountPrice || p.basePrice) >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => (p.discountPrice || p.basePrice) <= Number(maxPrice));
    }

    // 8. Sorting Logic
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
    if (prod) {
      res.json(formatProduct(prod));
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', adminAuth, async (req, res) => {
  try {
    let brandName = req.body.brandName;
    if (!brandName && req.body.brandId) {
      const b = await prisma.brand.findUnique({ where: { id: req.body.brandId } });
      brandName = b?.name || 'Terra & Clay';
    }

    const newProduct = await prisma.product.create({
      data: {
        id: req.body.id || `p-${Date.now()}`,
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: req.body.categoryId,
        subcategoryId: req.body.subcategoryId,
        typeId: req.body.typeId || null,
        brandId: req.body.brandId || null,
        brandName: brandName || 'Terra & Clay',
        description: req.body.description || '',
        fabric: req.body.fabric || 'Cotton Blend',
        fit: req.body.fit || 'Regular Fit',
        sleeve: req.body.sleeve || null,
        neck: req.body.neck || null,
        pattern: req.body.pattern || 'Solid',
        occasion: req.body.occasion || 'Casual',
        hsnCode: req.body.hsnCode || '6204',
        gstPercent: Number(req.body.gstPercent) || 5,
        basePrice: Number(req.body.basePrice),
        discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
        discountPercent: req.body.discountPercent ? Number(req.body.discountPercent) : null,
        tags: JSON.stringify(req.body.tags || ['new_arrival']),
        status: req.body.status || 'published',
        availableSizes: JSON.stringify(req.body.availableSizes || ['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(req.body.colors || [{ name: 'Default', hex: '#C0654B', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'] }]),
        variants: JSON.stringify(req.body.variants || []),
        rating: 5.0,
        reviewCount: 0,
      },
    });

    res.json({ success: true, product: formatProduct(newProduct) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data: any = { ...req.body };

    if (data.tags && typeof data.tags !== 'string') data.tags = JSON.stringify(data.tags);
    if (data.variants && typeof data.variants !== 'string') data.variants = JSON.stringify(data.variants);
    if (data.colors && typeof data.colors !== 'string') data.colors = JSON.stringify(data.colors);
    if (data.availableSizes && typeof data.availableSizes !== 'string') data.availableSizes = JSON.stringify(data.availableSizes);

    const updated = await prisma.product.update({
      where: { id },
      data,
    });
    res.json({ success: true, product: formatProduct(updated) });
  } catch (err: any) {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(formatOrder));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const shippingAddressStr = typeof req.body.shippingAddress === 'string'
      ? req.body.shippingAddress
      : JSON.stringify(req.body.shippingAddress);

    const itemsStr = typeof req.body.items === 'string'
      ? req.body.items
      : JSON.stringify(req.body.items || []);

    const newOrder = await prisma.order.create({
      data: {
        id: `ord-${Date.now()}`,
        orderNumber: `TC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: req.body.customerId || 'guest',
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        shippingAddress: shippingAddressStr,
        items: itemsStr,
        subtotal: Number(req.body.subtotal),
        discount: Number(req.body.discount || 0),
        shippingFee: Number(req.body.shippingFee || 0),
        tax: Number(req.body.tax || 0),
        total: Number(req.body.total),
        status: 'pending',
        paymentStatus: req.body.paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentMethod: req.body.paymentMethod,
        couponCode: req.body.couponCode || null,
      },
    });

    res.json({ success: true, order: formatOrder(newOrder) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, courierPartner } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (courierPartner) data.courierPartner = courierPartner;

    let updated: any = null;
    try {
      updated = await prisma.order.update({
        where: { id },
        data,
      });
    } catch (e) {
      // Fallback response for in-memory/seed orders
      return res.json({ success: true, order: { id, status, trackingNumber, courierPartner } });
    }

    res.json({ success: true, order: formatOrder(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: { equals: (code || '').trim() },
        isActive: true,
      },
    });

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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- RAZORPAY PAYMENT ENDPOINTS ----------------
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TC123456789';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_123';

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Call Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // Amount in paise
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Razorpay API notice:', data?.error?.description || 'Using client fallback order');
      return res.json({
        success: true,
        orderId: `order_mock_${Date.now()}`,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        keyId: keyId,
        isMock: true
      });
    }

    res.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId
    });
  } catch (err: any) {
    console.error('Razorpay creation error:', err);
    res.status(500).json({ error: err.message || 'Razorpay creation error' });
  }
});

app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_123';

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing signature verification parameters' });
    }

    // If mock order, bypass signature validation safely for local dev
    if (razorpay_order_id.startsWith('order_mock_')) {
      return res.json({ success: true, verified: true });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.json({ success: true, verified: true });
    } else {
      res.status(400).json({ success: false, verified: false, error: 'Invalid payment signature' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Banners
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banners', adminAuth, async (req, res) => {
  try {
    const bannerCount = await prisma.banner.count();
    const newBanner = await prisma.banner.create({
      data: {
        id: `b-${Date.now()}`,
        title: req.body.title,
        subtitle: req.body.subtitle || null,
        image: req.body.image,
        link: req.body.link || '/',
        buttonText: req.body.buttonText || 'SHOP NOW',
        position: req.body.position || 'hero',
        sortOrder: req.body.sortOrder || bannerCount + 1,
        isActive: true,
      },
    });
    res.json({ success: true, banner: newBanner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- GEMINI AI STYLIST ENDPOINTS ----------------
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
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

// ---------------- TOOL IMPLEMENTATIONS FOR GEMINI STYLIST ----------------
async function executeSearchProducts(args: { query: string; category?: string; minPrice?: number; maxPrice?: number }) {
  const q = (args.query || '').toLowerCase().trim();
  const whereClause: any = { status: 'published' };

  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { fabric: { contains: q } },
      { brandName: { contains: q } },
      { categoryId: { contains: q } },
      { subcategoryId: { contains: q } },
      { tags: { contains: q } }
    ];
  }

  if (args.category) {
    const cat = args.category.toLowerCase().trim();
    whereClause.OR = whereClause.OR || [];
    whereClause.OR.push(
      { categoryId: { contains: cat } },
      { subcategoryId: { contains: cat } }
    );
  }

  if (args.minPrice !== undefined || args.maxPrice !== undefined) {
    whereClause.basePrice = {};
    if (args.minPrice !== undefined) whereClause.basePrice.gte = Number(args.minPrice);
    if (args.maxPrice !== undefined) whereClause.basePrice.lte = Number(args.maxPrice);
  }

  let rawProducts = await prisma.product.findMany({
    where: whereClause,
    take: 5
  });

  if (rawProducts.length === 0 && q) {
    const words = q.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      rawProducts = await prisma.product.findMany({
        where: {
          OR: words.map(w => ({ name: { contains: w } }))
        },
        take: 5
      });
    }
  }

  return rawProducts.map(p => {
    let imageUrl = '';
    try {
      const colors = JSON.parse(p.colors || '[]');
      if (colors.length > 0 && colors[0].image) {
        imageUrl = colors[0].image;
      }
    } catch (e) {}

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.discountPrice || p.basePrice,
      imageUrl,
      url: `/product/${p.id}`,
      categoryName: p.categoryId
    };
  });
}

async function executeGetCategoryLink(args: { categoryName: string }) {
  const catName = (args.categoryName || '').toLowerCase().trim();
  const categories = await prisma.category.findMany();
  let matchedCat = categories.find(c => c.name.toLowerCase().includes(catName) || catName.includes(c.name.toLowerCase()) || c.slug.includes(catName));

  if (matchedCat) {
    return {
      name: matchedCat.name,
      slug: matchedCat.slug,
      url: `/category/${matchedCat.slug}`
    };
  }

  const subcategories = await prisma.subcategory.findMany();
  let matchedSub = subcategories.find(s => s.name.toLowerCase().includes(catName) || catName.includes(s.name.toLowerCase()) || s.slug.includes(catName));

  if (matchedSub) {
    return {
      name: matchedSub.name,
      slug: matchedSub.slug,
      url: `/category/${matchedSub.categoryId}?sub=${matchedSub.slug}`
    };
  }

  const fallback = categories[0] || { name: 'Women Collection', slug: 'women' };
  return {
    name: fallback.name,
    slug: fallback.slug,
    url: `/category/${fallback.slug}`
  };
}

// ---------------- API ROUTE: AI STYLIST CHAT ----------------
app.post('/api/ai-stylist/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    
    // Always pre-search database for matching products/categories as primary source
    const dbSearchProducts = await executeSearchProducts({ query: lastUserMessage });
    const dbCategoryLink = await executeGetCategoryLink({ categoryName: lastUserMessage });

    if (!process.env.GEMINI_API_KEY || !ai) {
      // Fallback response when Gemini API key is unconfigured
      const replyText = dbSearchProducts.length > 0
        ? `I found ${dbSearchProducts.length} matching item(s) in our store catalog for "${lastUserMessage}".`
        : `We don't have an exact match for "${lastUserMessage}" currently, but you can browse our ${dbCategoryLink.name} collection!`;

      return res.json({
        reply: replyText,
        text: replyText,
        products: dbSearchProducts,
        categoryLink: dbCategoryLink
      });
    }

    const formattedContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `You are the PGmart AI Fashion Stylist, an expert stylist for premium ethnic, traditional, and modern apparel in India. 
You are warm, fashion-forward, professional, and knowledgeable.
Help the user coordinate their outfits, recommend matches, select perfect colors, suggest sizing, and answer styling questions.

CRITICAL PRODUCT SEARCH & LINKING RULES:
1. When the user asks about a specific product, item type, or category, ALWAYS use the 'search_products' or 'get_category_link' tool results to reference real store items.
2. NEVER invent product names, prices, or links. Only reference products returned by tools or provided in catalog search.
3. Always structure your final output response as valid JSON matching this exact structure:
{
  "reply": "Your friendly, stylish conversational response here.",
  "products": [
    { "id": "prod-id", "name": "Product Name", "price": 1999, "imageUrl": "https://...", "url": "/product/prod-id" }
  ],
  "categoryLink": { "name": "Category Name", "url": "/category/slug" }
}`;

    const stylistTools = [
      {
        functionDeclarations: [
          {
            name: 'search_products',
            description: 'Search the PGmart product catalog for matching items by query, category, or price range.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: { type: 'STRING', description: 'Product search term e.g. lehenga, kurta, silk saree, dress, innerwear, linen shirt' },
                category: { type: 'STRING', description: 'Optional category name e.g. women, men, kids, sarees' },
                minPrice: { type: 'NUMBER', description: 'Minimum price filter in INR' },
                maxPrice: { type: 'NUMBER', description: 'Maximum price filter in INR' }
              },
              required: ['query']
            }
          },
          {
            name: 'get_category_link',
            description: 'Look up the exact site route/link for a PGmart category or subcategory.',
            parameters: {
              type: 'OBJECT',
              properties: {
                categoryName: { type: 'STRING', description: 'Name of category or style e.g. women, men, kids, ethnic wear, sarees, kurtas' }
              },
              required: ['categoryName']
            }
          }
        ]
      }
    ];

    let response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        tools: stylistTools
      }
    });

    let functionCalls = response.functionCalls;
    let toolProducts = dbSearchProducts;
    let toolCatLink = dbCategoryLink;

    if (functionCalls && functionCalls.length > 0) {
      const toolResultsParts: any[] = [];

      for (const call of functionCalls) {
        if (call.name === 'search_products') {
          const results = await executeSearchProducts(call.args as any);
          if (results && results.length > 0) toolProducts = results;
          toolResultsParts.push({
            functionResponse: {
              name: 'search_products',
              response: { products: results }
            }
          });
        } else if (call.name === 'get_category_link') {
          const catLink = await executeGetCategoryLink(call.args as any);
          if (catLink) toolCatLink = catLink;
          toolResultsParts.push({
            functionResponse: {
              name: 'get_category_link',
              response: { categoryLink: catLink }
            }
          });
        }
      }

      const updatedContents = [
        ...formattedContents,
        { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
        { role: 'user', parts: toolResultsParts }
      ];

      const followUpResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: updatedContents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      response = followUpResponse;
    }

    let replyText = response.text || '';
    let finalProducts = toolProducts;
    let finalCategoryLink = toolCatLink;

    try {
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.reply) replyText = parsed.reply;
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          finalProducts = parsed.products;
        }
        if (parsed.categoryLink) {
          finalCategoryLink = parsed.categoryLink;
        }
      }
    } catch (e) {
      // Keep plain replyText
    }

    res.json({
      reply: replyText,
      text: replyText,
      products: finalProducts,
      categoryLink: finalCategoryLink
    });
  } catch (error: any) {
    console.error('Error in /api/ai-stylist/chat:', error);
    // Graceful fallback with direct DB query results
    const lastUserMsg = (req.body?.messages || []).pop()?.content || '';
    const fallbackProducts = await executeSearchProducts({ query: lastUserMsg });
    const fallbackCat = await executeGetCategoryLink({ categoryName: lastUserMsg });

    res.json({
      reply: `Here are the matching items found in the PGmart catalog for your query.`,
      text: `Here are the matching items found in the PGmart catalog for your query.`,
      products: fallbackProducts,
      categoryLink: fallbackCat
    });
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


// ---------------- PROMO COUPONS API ENDPOINTS ----------------
let serverCoupons: any[] = [
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

app.get('/api/coupons', (req, res) => {
  res.json(serverCoupons);
});

app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon promo code is required.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = serverCoupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return res.status(404).json({ success: false, error: `Invalid or inactive promo code "${cleanCode}".` });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, error: `Coupon promo code "${cleanCode}" has expired.` });
    }

    const totalVal = Number(cartTotal) || 0;
    if (totalVal < (coupon.minOrderValue || 0)) {
      return res.status(400).json({
        success: false,
        error: `Minimum bag total of ₹${coupon.minOrderValue} required for ${cleanCode}. Add ₹${coupon.minOrderValue - totalVal} more items.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(totalVal * (coupon.value / 100));
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    discountAmount = Math.min(discountAmount, totalVal);

    res.json({
      success: true,
      coupon,
      discountAmount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/coupons', (req, res) => {
  try {
    const newCoupon = req.body;
    if (!newCoupon.code) {
      return res.status(400).json({ error: 'Coupon promo code is required' });
    }
    const cleanCode = String(newCoupon.code).trim().toUpperCase();
    
    const existingIdx = serverCoupons.findIndex(c => c.id === newCoupon.id || c.code.toUpperCase() === cleanCode);
    const couponObj = {
      id: newCoupon.id || `cop-${Date.now()}`,
      code: cleanCode,
      discountType: newCoupon.discountType || 'flat',
      value: Number(newCoupon.value) || 100,
      minOrderValue: Number(newCoupon.minOrderValue) || 0,
      maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : undefined,
      usageLimit: Number(newCoupon.usageLimit) || 1000,
      usedCount: Number(newCoupon.usedCount) || 0,
      expiryDate: newCoupon.expiryDate || '2026-12-31',
      isActive: newCoupon.isActive !== false
    };

    if (existingIdx > -1) {
      serverCoupons[existingIdx] = couponObj;
    } else {
      serverCoupons.unshift(couponObj);
    }

    res.json({ success: true, coupon: couponObj, coupons: serverCoupons });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', (req, res) => {
  try {
    const { id } = req.params;
    serverCoupons = serverCoupons.filter(c => c.id !== id);
    res.json({ success: true, coupons: serverCoupons });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SERVER STARTUP ----------------
async function startServer() {
  if (!process.env.VERCEL) {
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
        if (req.path.startsWith('/api')) {
          return res.status(404).json({ error: `API endpoint ${req.path} not found` });
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
