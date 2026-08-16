const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jgyiqbdplrisupvqkiqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWlxYmRwbHJpc3VwdnFraXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTAwOTcsImV4cCI6MjEwMjI2NjA5N30.BgYf8V7ehJN2wB2voofNw3DDew9hRNv2sGmjuIE38NY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function prune50Percent() {
  console.log('=== STARTING 50% PRODUCT LIST PRUNING PER STYLE/TYPE ===');

  // 1. Fetch all products from database
  const allProducts = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Total Products currently in DB: ${allProducts.length}`);

  // Group by typeId
  const byType = {};
  for (const p of allProducts) {
    const t = p.typeId || p.subcategoryId || 'uncategorized';
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  }

  const idsToDelete = [];
  const idsToKeep = [];

  for (const [typeId, list] of Object.entries(byType)) {
    // Keep top 50% (at least 1, or Math.ceil(len * 0.5))
    const keepCount = Math.max(1, Math.ceil(list.length * 0.5));
    const keepSlice = list.slice(0, keepCount);
    const deleteSlice = list.slice(keepCount);

    keepSlice.forEach(p => idsToKeep.push(p.id));
    deleteSlice.forEach(p => idsToDelete.push(p.id));
  }

  console.log(`\nIdentified ${idsToKeep.length} products to KEEP, and ${idsToDelete.length} products to DELETE.`);

  // 2. Delete from Prisma in chunks of 100
  console.log('\nDeleting from Prisma / PostgreSQL Database...');
  for (let i = 0; i < idsToDelete.length; i += 100) {
    const chunk = idsToDelete.slice(i, i + 100);
    await prisma.product.deleteMany({
      where: { id: { in: chunk } }
    });
    process.stdout.write(`Deleted ${Math.min(i + 100, idsToDelete.length)}/${idsToDelete.length}...\r`);
  }
  console.log(`\n✓ Successfully pruned 50% from Prisma database.`);

  // 3. Delete from Supabase client in chunks of 100
  console.log('Deleting from Supabase REST Client...');
  for (let i = 0; i < idsToDelete.length; i += 100) {
    const chunk = idsToDelete.slice(i, i + 100);
    const { error } = await supabase.from('Product').delete().in('id', chunk);
    if (error) {
      console.warn('Supabase chunk delete warning:', error.message);
    }
  }
  console.log(`✓ Successfully pruned 50% from Supabase.`);

  // 4. Verify new total
  const remainingCount = await prisma.product.count();
  const { count: sbRemainingCount } = await supabase.from('Product').select('*', { count: 'exact', head: true });
  console.log(`\n=== PRUNING COMPLETE ===`);
  console.log(`Remaining Products in Prisma: ${remainingCount}`);
  console.log(`Remaining Products in Supabase: ${sbRemainingCount}`);
}

prune50Percent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
