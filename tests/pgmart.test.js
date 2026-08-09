/**
 * pgmart — Full Automated Test Suite
 * Tests: API endpoints, data integrity, business logic, routing
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
let passed = 0;
let failed = 0;
let total = 0;
const results = [];

function fetchJSON(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const opts = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function fetchHTML(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    http.get({ hostname: url.hostname, port: url.port || 3000, path: url.pathname + url.search }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    results.push({ status: 'PASS', message });
  } else {
    failed++;
    results.push({ status: 'FAIL', message });
  }
}

function section(name) {
  results.push({ status: 'SECTION', message: name });
}

async function runTests() {
  console.log('\npgmart Automated Test Suite\n');
  console.log('-'.repeat(60));

  // 1. HOMEPAGE
  section('1. Homepage & Static HTML');
  try {
    const home = await fetchHTML('/');
    assert(home.status === 200, `Homepage returns HTTP 200 (got ${home.status})`);
    assert(home.body.includes('PGmart'), 'Homepage contains "PGmart" brand name');
    assert(home.body.includes('<title>'), 'Homepage has <title> tag');
    assert(home.body.includes('viewport'), 'Homepage has viewport meta tag');
    assert(home.body.length > 500, `Homepage HTML is substantial (${home.body.length} bytes)`);
  } catch (e) {
    assert(false, `Homepage request failed: ${e.message}`);
  }

  // 2. PRODUCTS API
  section('2. Products API');
  let products = [];
  try {
    const res = await fetchJSON('/api/products');
    assert(res.status === 200, `GET /api/products returns 200 (got ${res.status})`);
    assert(Array.isArray(res.body), 'Products response is an array');
    products = res.body || [];
    assert(products.length > 0, `Products list is non-empty (${products.length} products)`);

    if (products.length > 0) {
      const p = products[0];
      assert(typeof p.id === 'string', 'Product has string id');
      assert(typeof p.name === 'string', 'Product has string name');
      assert(typeof p.slug === 'string', 'Product has string slug');
      assert(typeof p.basePrice === 'number', `Product has numeric basePrice`);
      assert(typeof p.rating === 'number', `Product has numeric rating`);
      assert(p.rating >= 0 && p.rating <= 5, `Product rating in valid range 0-5 (got ${p.rating})`);
      assert(Array.isArray(p.variants), 'Product has variants array');
      assert(Array.isArray(p.tags), 'Product has tags array');
      assert(['published','draft','out_of_stock','discontinued'].includes(p.status),
        `Product status is valid enum (got "${p.status}")`);
    }
  } catch (e) {
    assert(false, `Products API failed: ${e.message}`);
  }

  // 2b. PRODUCT FILTERING
  section('2b. Products - Filtering');
  try {
    const limited = await fetchJSON('/api/products?limit=5');
    assert(limited.status === 200, 'GET /api/products?limit=5 returns 200');
    if (Array.isArray(limited.body)) {
      assert(limited.body.length <= 5, `Limit=5 returns <=5 products (got ${limited.body.length})`);
    }

    const byCat = await fetchJSON('/api/products?categoryId=women');
    assert(byCat.status === 200, 'GET /api/products?categoryId=women returns 200');
    if (Array.isArray(byCat.body) && byCat.body.length > 0) {
      const allWomen = byCat.body.every(p => p.categoryId === 'women');
      assert(allWomen, `Category filter returns only women products (${byCat.body.length} items)`);
    }

    const search = await fetchJSON('/api/products?search=saree');
    assert(search.status === 200, 'GET /api/products?search=saree returns 200');
  } catch (e) {
    assert(false, `Product filtering failed: ${e.message}`);
  }

  // 2c. SINGLE PRODUCT
  section('2c. Single Product Detail');
  try {
    if (products.length > 0) {
      const firstId = products[0].id;
      const detail = await fetchJSON(`/api/products/${firstId}`);
      assert(detail.status === 200, `GET /api/products/${firstId} returns 200`);
      if (detail.body) {
        assert(detail.body.id === firstId, 'Single product ID matches');
        assert(Array.isArray(detail.body.variants), 'Single product has variants');
      }
      const missing = await fetchJSON('/api/products/nonexistent_xyz_999');
      assert(missing.status === 404, `Non-existent product returns 404 (got ${missing.status})`);
    }
  } catch (e) {
    assert(false, `Single product API failed: ${e.message}`);
  }

  // 3. CATEGORIES API
  section('3. Categories API');
  let categories = [];
  try {
    const res = await fetchJSON('/api/categories');
    assert(res.status === 200, `GET /api/categories returns 200 (got ${res.status})`);
    assert(Array.isArray(res.body), 'Categories response is an array');
    categories = res.body || [];
    assert(categories.length > 0, `Categories non-empty (${categories.length})`);
    if (categories.length > 0) {
      const c = categories[0];
      assert(typeof c.id === 'string', 'Category has id');
      assert(typeof c.name === 'string', 'Category has name');
      assert(typeof c.slug === 'string', 'Category has slug');
      assert(Array.isArray(c.subcategories), 'Category has subcategories array');
      assert(['active','inactive'].includes(c.status), `Category status valid (got "${c.status}")`);
    }
  } catch (e) {
    assert(false, `Categories API failed: ${e.message}`);
  }

  // 4. BRANDS API
  section('4. Brands API');
  try {
    const res = await fetchJSON('/api/brands');
    assert(res.status === 200, `GET /api/brands returns 200 (got ${res.status})`);
    assert(Array.isArray(res.body), 'Brands response is an array');
    if ((res.body || []).length > 0) {
      const b = res.body[0];
      assert(typeof b.id === 'string', 'Brand has id');
      assert(typeof b.name === 'string', 'Brand has name');
    }
  } catch (e) {
    assert(false, `Brands API failed: ${e.message}`);
  }

  // 5. BANNERS API
  section('5. Banners API');
  try {
    const res = await fetchJSON('/api/banners');
    assert(res.status === 200, `GET /api/banners returns 200 (got ${res.status})`);
    assert(Array.isArray(res.body), 'Banners response is an array');
    if ((res.body || []).length > 0) {
      const b = res.body[0];
      assert(typeof b.id === 'string', 'Banner has id');
      assert(typeof b.title === 'string', 'Banner has title');
      assert(typeof b.isActive === 'boolean', `Banner isActive is boolean`);
      assert(['hero','category','promo_strip','ad_banner'].includes(b.position),
        `Banner position is valid (got "${b.position}")`);
    }
  } catch (e) {
    assert(false, `Banners API failed: ${e.message}`);
  }

  // 6. COUPONS API
  section('6. Coupons API');
  try {
    const res = await fetchJSON('/api/coupons');
    assert(res.status === 200, `GET /api/coupons returns 200 (got ${res.status})`);
    assert(Array.isArray(res.body), 'Coupons response is an array');
    if ((res.body || []).length > 0) {
      const c = res.body[0];
      assert(typeof c.code === 'string', 'Coupon has code');
      assert(['percentage','flat'].includes(c.discountType),
        `Coupon discountType valid (got "${c.discountType}")`);
      assert(typeof c.value === 'number' && c.value > 0, `Coupon value is positive number`);
    }
  } catch (e) {
    assert(false, `Coupons API failed: ${e.message}`);
  }

  // 7. ORDERS API
  section('7. Orders API');
  try {
    const res = await fetchJSON('/api/orders');
    assert(res.status === 200 || res.status === 401,
      `GET /api/orders returns 200 or 401 (got ${res.status})`);
    if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
      const o = res.body[0];
      assert(typeof o.id === 'string', 'Order has id');
      assert(typeof o.total === 'number', 'Order has numeric total');
      const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];
      assert(validStatuses.includes(o.status), `Order status valid (got "${o.status}")`);
    }
  } catch (e) {
    assert(false, `Orders API failed: ${e.message}`);
  }

  // 8. SITE SETTINGS API
  section('8. Site Settings API');
  try {
    const res = await fetchJSON('/api/settings');
    assert(res.status === 200, `GET /api/settings returns 200 (got ${res.status})`);
    if (res.body) {
      assert(typeof res.body.storeName === 'string', `Settings has storeName`);
      assert(typeof res.body.currencyCode === 'string', `Settings has currencyCode`);
      assert(typeof res.body.freeShippingThreshold === 'number', `freeShippingThreshold is a number`);
      assert(typeof res.body.standardShippingFee === 'number', `standardShippingFee is a number`);
      assert(typeof res.body.codEnabled === 'boolean', `codEnabled is boolean`);
    }
  } catch (e) {
    assert(false, `Site Settings API failed: ${e.message}`);
  }

  // 9. REVIEWS API
  section('9. Reviews API');
  try {
    if (products.length > 0) {
      const productId = products[0].id;
      const res = await fetchJSON(`/api/reviews?productId=${productId}`);
      assert(res.status === 200 || res.status === 404,
        `GET /api/reviews?productId=... returns 200 or 404 (got ${res.status})`);
      if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
        const r = res.body[0];
        assert(typeof r.rating === 'number', 'Review has numeric rating');
        assert(r.rating >= 1 && r.rating <= 5, `Review rating in 1-5 range (got ${r.rating})`);
        assert(['approved','pending','rejected'].includes(r.status),
          `Review status valid (got "${r.status}")`);
      }
    }
  } catch (e) {
    assert(false, `Reviews API failed: ${e.message}`);
  }

  // 10. DATA INTEGRITY
  section('10. Data Integrity');
  try {
    if (products.length > 0) {
      const invalidPrices = products.filter(p => typeof p.basePrice !== 'number' || p.basePrice <= 0);
      assert(invalidPrices.length === 0, `All products have positive basePrice (${invalidPrices.length} invalid)`);

      const invalidDiscounts = products.filter(p =>
        p.discountPrice !== undefined && p.discountPrice >= p.basePrice);
      assert(invalidDiscounts.length === 0,
        `All discountPrices < basePrice (${invalidDiscounts.length} violations)`);

      const ids = products.map(p => p.id);
      assert(new Set(ids).size === ids.length, `All product IDs unique (${ids.length} products)`);

      const slugs = products.map(p => p.slug);
      assert(new Set(slugs).size === slugs.length, `All slugs unique (${slugs.length} products)`);

      const invalidRatings = products.filter(p => p.rating < 0 || p.rating > 5);
      assert(invalidRatings.length === 0, `All ratings in 0-5 range (${invalidRatings.length} invalid)`);
    }
    if (categories.length > 0) {
      const catIds = categories.map(c => c.id);
      assert(new Set(catIds).size === catIds.length, `All category IDs unique (${catIds.length})`);
    }
  } catch (e) {
    assert(false, `Data integrity check failed: ${e.message}`);
  }

  // 11. BUSINESS LOGIC
  section('11. Business Logic');
  try {
    const settingsRes = await fetchJSON('/api/settings');
    if (settingsRes.status === 200 && settingsRes.body) {
      const { freeShippingThreshold, standardShippingFee, codFee } = settingsRes.body;
      assert(freeShippingThreshold > 0, `freeShippingThreshold > 0 (got ${freeShippingThreshold})`);
      assert(standardShippingFee >= 0, `standardShippingFee >= 0 (got ${standardShippingFee})`);
      assert(codFee >= 0, `COD fee >= 0 (got ${codFee})`);
    }
    if (products.length > 0) {
      const validTags = ['new_arrival','bestseller','trending','sale',
                         'online_exclusive','value_pack','curves_plus_size','deal_of_the_day'];
      const invalidTagProducts = products.filter(p =>
        p.tags && p.tags.some(t => !validTags.includes(t)));
      assert(invalidTagProducts.length === 0,
        `All product tags are valid enums (${invalidTagProducts.length} with invalid tags)`);

      const publishedNoVariants = products.filter(
        p => p.status === 'published' && (!p.variants || p.variants.length === 0));
      assert(publishedNoVariants.length === 0,
        `All published products have variants (${publishedNoVariants.length} without)`);
    }
  } catch (e) {
    assert(false, `Business logic check failed: ${e.message}`);
  }

  // 12. ERROR HANDLING
  section('12. Error Handling');
  try {
    const unknown = await fetchJSON('/api/unknown_endpoint_xyz_abc');
    assert(unknown.status === 404, `Unknown API route returns 404 (got ${unknown.status})`);

    const emptySearch = await fetchJSON('/api/products?search=');
    assert(emptySearch.status === 200, `Empty search returns 200 (got ${emptySearch.status})`);
  } catch (e) {
    assert(false, `Error handling test failed: ${e.message}`);
  }

  // 13. PERFORMANCE
  section('13. Response Time');
  try {
    const endpoints = ['/api/products','/api/categories','/api/banners','/api/settings'];
    for (const ep of endpoints) {
      const start = Date.now();
      const res = await fetchJSON(ep);
      const ms = Date.now() - start;
      assert(ms < 3000, `${ep} responds in < 3s (took ${ms}ms)`);
    }
  } catch (e) {
    assert(false, `Performance check failed: ${e.message}`);
  }

  // PRINT RESULTS
  console.log('\n');
  for (const r of results) {
    if (r.status === 'SECTION') {
      console.log(`\n--- ${r.message} ---`);
    } else {
      const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
      console.log(`  [${icon}]  ${r.message}`);
    }
  }

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  console.log('\n' + '='.repeat(60));
  console.log(`FINAL RESULTS`);
  console.log(`  Total:  ${total}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Score:  ${passRate}%`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error('Test runner crashed:', e.message);
  process.exit(1);
});
