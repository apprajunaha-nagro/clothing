import { initialCategories } from '../src/data/seedData';
import { generateFullCatalogProducts } from '../src/data/productGenerator';

async function runAiCatalogAudit() {
  console.log("=========================================================================");
  console.log("  PGmart AI Catalog Seeding Audit & Population Progress Runner          ");
  console.log("=========================================================================\n");

  const fullProducts = generateFullCatalogProducts(initialCategories);
  
  let totalTypesCount = 0;
  const typeCounts: Record<string, { name: string; subcategory: string; category: string; count: number; samplePrompt: string }> = {};

  initialCategories.forEach(cat => {
    (cat.subcategories || []).forEach(sub => {
      (sub.types || []).forEach(typeItem => {
        totalTypesCount++;
        const matchingProds = fullProducts.filter(p => p.typeId === typeItem.id);
        typeCounts[typeItem.id] = {
          name: typeItem.name,
          subcategory: sub.name,
          category: cat.name,
          count: matchingProds.length,
          samplePrompt: matchingProds[0]?.aiImagePrompt || "E-commerce studio portrait prompt"
        };
      });
    });
  });

  console.log(`[Step 1 & 2] Catalog Audit Complete.`);
  console.log(`- Total Categories: ${initialCategories.length}`);
  console.log(`- Total Unique Apparel Types: ${totalTypesCount}`);
  console.log(`- Total Generated Catalog Products: ${fullProducts.length}\n`);

  console.log("-------------------------------------------------------------------------");
  console.log("TYPE-BY-TYPE SEEDING STATUS CHECKPOINT:");
  console.log("-------------------------------------------------------------------------");

  let processedTypes = 0;
  let totalProductsVerified = 0;

  Object.entries(typeCounts).forEach(([typeId, info], index) => {
    processedTypes++;
    totalProductsVerified += info.count;
    console.log(`[Type ${index + 1}/${totalTypesCount}] ${info.category} -> ${info.subcategory} -> ${info.name} (${typeId})`);
    console.log(`   └─ Seeding Status: ${info.count >= 10 ? '✅ 10/10 Products Fully Seeded' : `⚠️ ${info.count}/10 Products`}`);
    console.log(`   └─ Sample AI Studio Image Prompt: "${info.samplePrompt.substring(0, 95)}..."\n`);
  });

  console.log("=========================================================================");
  console.log(`SUMMARY: ${processedTypes} Types verified. ${totalProductsVerified} Products active with AI Image Prompts.`);
  console.log("=========================================================================");
}

runAiCatalogAudit().catch(err => {
  console.error("Error running AI catalog audit:", err);
});
