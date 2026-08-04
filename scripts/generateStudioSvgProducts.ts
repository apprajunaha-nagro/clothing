import fs from 'fs';
import path from 'path';

interface ProductDesign {
  filename: string;
  type: 'anarkali' | 'kurti' | 'palazzo';
  title: string;
  primaryColor: string;
  accentColor: string;
  fabric: string;
  pattern: string;
}

const anarkaliDesigns: ProductDesign[] = [
  {
    filename: 'ai_anarkali_1_emerald_gold.svg',
    type: 'anarkali',
    title: 'Emerald Green Hand-Embroidered Georgette Anarkali Suit',
    primaryColor: '#005C53',
    accentColor: '#D4AF37',
    fabric: 'Georgette Silk',
    pattern: 'Gold Zari Work'
  },
  {
    filename: 'ai_anarkali_2_rose_clay.svg',
    type: 'anarkali',
    title: 'Rose Clay Terracotta Flared Chanderi Anarkali Set',
    primaryColor: '#C0654B',
    accentColor: '#E6C280',
    fabric: 'Chanderi Silk',
    pattern: 'Silver Threadwork'
  },
  {
    filename: 'ai_anarkali_3_purple_velvet.svg',
    type: 'anarkali',
    title: 'Royal Deep Purple Velvet Zari Anarkali Suit',
    primaryColor: '#4E2A47',
    accentColor: '#E6A11E',
    fabric: 'Royal Velvet',
    pattern: 'Heavy Zari Embroidery'
  },
  {
    filename: 'ai_anarkali_4_turquoise_floral.svg',
    type: 'anarkali',
    title: 'Turquoise Blue Floral Printed Georgette Anarkali',
    primaryColor: '#40E0D0',
    accentColor: '#FFD700',
    fabric: 'Georgette',
    pattern: 'Foil Floral Print'
  },
  {
    filename: 'ai_anarkali_5_deep_teal.svg',
    type: 'anarkali',
    title: 'Deep Teal Green Satin Silk Anarkali Gown',
    primaryColor: '#004F6E',
    accentColor: '#FFCBA4',
    fabric: 'Satin Silk',
    pattern: 'Rose Dupatta Shading'
  },
  {
    filename: 'ai_anarkali_6_plum_sharara.svg',
    type: 'anarkali',
    title: 'Plum Purple Printed Flared Anarkali Suit',
    primaryColor: '#582C4D',
    accentColor: '#C0654B',
    fabric: 'Georgette',
    pattern: 'Gota Patti Lace'
  },
  {
    filename: 'ai_anarkali_7_sky_blue.svg',
    type: 'anarkali',
    title: 'Pastel Sky Blue Organza Anarkali Gown',
    primaryColor: '#7EC0EE',
    accentColor: '#FFB6C1',
    fabric: 'Organza',
    pattern: 'Watercolor Floral'
  },
  {
    filename: 'ai_anarkali_8_terracotta_rust.svg',
    type: 'anarkali',
    title: 'Terracotta Rust Silk Front-Slit Anarkali Set',
    primaryColor: '#B24926',
    accentColor: '#D4AF37',
    fabric: 'Tussar Silk',
    pattern: 'Sequin & Slit Cut'
  },
  {
    filename: 'ai_anarkali_9_fuchsia_pink.svg',
    type: 'anarkali',
    title: 'Fuchsia Pink Solid Flared Cotton-Silk Anarkali',
    primaryColor: '#D11D66',
    accentColor: '#FFD700',
    fabric: 'Cotton Silk',
    pattern: 'Piping & Flare'
  },
  {
    filename: 'ai_anarkali_10_indigo_blue.svg',
    type: 'anarkali',
    title: 'Royal Indigo Blue Tiered Printed Anarkali Gown',
    primaryColor: '#1D2A44',
    accentColor: '#C0654B',
    fabric: 'Mulmul Cotton',
    pattern: 'Mughal Block Print'
  }
];

const kurtiDesigns: ProductDesign[] = [
  {
    filename: 'ai_kurti_1_rose_clay.svg',
    type: 'kurti',
    title: 'Rose Clay Embroidered Khadi Cotton Kurti Set',
    primaryColor: '#C0654B',
    accentColor: '#F3E9E4',
    fabric: 'Khadi Cotton',
    pattern: 'Placket Embroidery'
  },
  {
    filename: 'ai_kurti_2_indigo_chanderi.svg',
    type: 'kurti',
    title: 'Indigo Blue Chanderi Silk Tunic Kurti',
    primaryColor: '#1F305E',
    accentColor: '#C0654B',
    fabric: 'Chanderi Silk',
    pattern: 'Mandarin Collar & Cuffs'
  },
  {
    filename: 'ai_kurti_3_mint_green.svg',
    type: 'kurti',
    title: 'Mint Green Mulmul Printed Daily Kurti',
    primaryColor: '#3EB489',
    accentColor: '#FFFFFF',
    fabric: 'Mulmul Cotton',
    pattern: 'Floral Block Print'
  },
  {
    filename: 'ai_kurti_4_mustard_yellow.svg',
    type: 'kurti',
    title: 'Mustard Yellow Bandhani Print A-Line Kurti',
    primaryColor: '#E6A11E',
    accentColor: '#800020',
    fabric: 'Rayon Slub',
    pattern: 'Bandhani Dots'
  },
  {
    filename: 'ai_kurti_5_pure_white.svg',
    type: 'kurti',
    title: 'White Schiffli Lace Embroidered Cotton Kurti',
    primaryColor: '#FAFAFA',
    accentColor: '#C0654B',
    fabric: 'Pure Cotton',
    pattern: 'Schiffli Eyelet Lace'
  },
  {
    filename: 'ai_kurti_6_peach_pink.svg',
    type: 'kurti',
    title: 'Peach Pink Embroidered Chanderi Kurti',
    primaryColor: '#FFB7A1',
    accentColor: '#005C53',
    fabric: 'Chanderi Silk',
    pattern: 'Chikankari Threadwork'
  },
  {
    filename: 'ai_kurti_7_lavender.svg',
    type: 'kurti',
    title: 'Lavender Lilac Gotapatti Work Kurti',
    primaryColor: '#B57EDC',
    accentColor: '#FFD700',
    fabric: 'Rayon Slub',
    pattern: 'Gota Patti Piping'
  },
  {
    filename: 'ai_kurti_8_peacock_blue.svg',
    type: 'kurti',
    title: 'Peacock Blue Silk Straight Formal Kurti',
    primaryColor: '#005F73',
    accentColor: '#D4AF37',
    fabric: 'Art Silk',
    pattern: 'Formal Zari Collar'
  },
  {
    filename: 'ai_kurti_9_turquoise_gold.svg',
    type: 'kurti',
    title: 'Turquoise Gold Zari Embroidered Festive Kurti',
    primaryColor: '#00A896',
    accentColor: '#FFD700',
    fabric: 'Georgette Silk',
    pattern: 'Zari Slit Cut'
  },
  {
    filename: 'ai_kurti_10_pastel_blue.svg',
    type: 'kurti',
    title: 'Pastel Sky Blue Schiffli Cotton Kurti',
    primaryColor: '#8ECAE6',
    accentColor: '#FFFFFF',
    fabric: 'Pure Cotton',
    pattern: 'Scalloped Edge'
  }
];

const palazzoDesigns: ProductDesign[] = [
  {
    filename: 'ai_palazzo_1_teal_sharara.svg',
    type: 'palazzo',
    title: 'Teal Blue Flared Georgette Sharara Suit Set',
    primaryColor: '#005C53',
    accentColor: '#FFD700',
    fabric: 'Georgette Silk',
    pattern: 'Tiered Flared Sharara'
  },
  {
    filename: 'ai_palazzo_2_mustard_silk.svg',
    type: 'palazzo',
    title: 'Mustard Yellow Silk Blend Gotta Patti Sharara Set',
    primaryColor: '#E6A11E',
    accentColor: '#D4AF37',
    fabric: 'Silk Blend',
    pattern: 'Gotta Patti Border'
  },
  {
    filename: 'ai_palazzo_3_beige_maroon.svg',
    type: 'palazzo',
    title: 'Beige & Maroon Block Print Wide-Leg Palazzo Set',
    primaryColor: '#F5F5DC',
    accentColor: '#800020',
    fabric: '100% Cotton',
    pattern: 'Wide-Leg Block Print'
  },
  {
    filename: 'ai_palazzo_4_indigo_ajrakh.svg',
    type: 'palazzo',
    title: 'Ivory & Indigo Ajrakh Print Sharara Kurta Set',
    primaryColor: '#1F305E',
    accentColor: '#C0654B',
    fabric: 'Mulmul Cotton',
    pattern: 'Ajrakh Geometric'
  },
  {
    filename: 'ai_palazzo_5_pastel_blue.svg',
    type: 'palazzo',
    title: 'Pastel Sky Blue Sequined Georgette Palazzo Suit',
    primaryColor: '#AEC6CF',
    accentColor: '#C0C0C0',
    fabric: 'Pure Georgette',
    pattern: 'Sequin Highlight'
  },
  {
    filename: 'ai_palazzo_6_lavender_sharara.svg',
    type: 'palazzo',
    title: 'Lavender Lilac Flared Sharara Set with Dupatta',
    primaryColor: '#B57EDC',
    accentColor: '#FFFFFF',
    fabric: 'Rayon Blend',
    pattern: 'Flared Dupatta Draped'
  },
  {
    filename: 'ai_palazzo_7_emerald_wideleg.svg',
    type: 'palazzo',
    title: 'Emerald Green Threadwork Wide-Leg Palazzo Suit',
    primaryColor: '#005C53',
    accentColor: '#D4AF37',
    fabric: 'Silk Blend',
    pattern: 'Wide-Leg Threadwork'
  },
  {
    filename: 'ai_palazzo_8_peacock_blue.svg',
    type: 'palazzo',
    title: 'Peacock Blue Silk Flared Sharara Kurta Set',
    primaryColor: '#004F6E',
    accentColor: '#E6A11E',
    fabric: 'Art Silk',
    pattern: 'Short Kurta + Sharara'
  },
  {
    filename: 'ai_palazzo_9_peach_floral.svg',
    type: 'palazzo',
    title: 'Peach Pink Floral Printed Cotton Palazzo Set',
    primaryColor: '#FFCBA4',
    accentColor: '#D11D66',
    fabric: 'Pure Cotton',
    pattern: 'Floral Printed Pants'
  },
  {
    filename: 'ai_palazzo_10_turquoise_gold.svg',
    type: 'palazzo',
    title: 'Turquoise Blue Gold Foil Palazzo Kurta Set',
    primaryColor: '#40E0D0',
    accentColor: '#FFD700',
    fabric: 'Georgette',
    pattern: 'Mirror Work & Foil'
  }
];

function generateGarmentSvg(d: ProductDesign): string {
  const isAnarkali = d.type === 'anarkali';
  const isKurti = d.type === 'kurti';
  const isPalazzo = d.type === 'palazzo';

  const titleShort = d.title.length > 38 ? d.title.substring(0, 35) + '...' : d.title;

  let bodyGarmentPath = '';
  let bottomGarmentPath = '';
  let dupattaPath = '';

  if (isAnarkali) {
    // Flared Anarkali floor length silhouette
    bodyGarmentPath = `
      <path d="M260 210 Q400 240 540 210 L590 640 Q400 680 210 640 Z" fill="${d.primaryColor}" opacity="0.95" />
      <!-- High-volume Flare Slits & Border -->
      <path d="M210 640 Q400 680 590 640 L605 675 Q400 715 195 675 Z" fill="${d.accentColor}" />
      <path d="M360 230 L350 650 M440 230 L450 650 M400 240 L400 660" stroke="${d.accentColor}" stroke-width="2" stroke-dasharray="8 6" opacity="0.6" />
    `;
    dupattaPath = `
      <path d="M190 230 Q280 320 330 620 L370 620 Q310 320 220 220 Z" fill="${d.accentColor}" opacity="0.4" />
      <path d="M610 230 Q520 320 470 620 L430 620 Q490 320 580 220 Z" fill="${d.accentColor}" opacity="0.4" />
    `;
  } else if (isKurti) {
    // Straight Fit / A-Line Kurti with Pants
    bodyGarmentPath = `
      <!-- Kurti Bodice & Tunic -->
      <path d="M290 210 Q400 230 510 210 L525 540 Q400 555 275 540 Z" fill="${d.primaryColor}" opacity="0.95" />
      <!-- Hem Border -->
      <path d="M275 540 Q400 555 525 540 L525 558 Q400 573 275 558 Z" fill="${d.accentColor}" />
      <!-- Placket Embroidery -->
      <rect x="382" y="220" width="36" height="170" rx="4" fill="${d.accentColor}" opacity="0.9" />
      <circle cx="400" cy="250" r="4" fill="#FFF" />
      <circle cx="400" cy="285" r="4" fill="#FFF" />
      <circle cx="400" cy="320" r="4" fill="#FFF" />
      <circle cx="400" cy="355" r="4" fill="#FFF" />
    `;
    bottomGarmentPath = `
      <!-- Straight Fitted Pants -->
      <path d="M330 555 L345 710 L390 710 L380 560 Z" fill="${d.accentColor}" opacity="0.9" />
      <path d="M470 555 L455 710 L410 710 L420 560 Z" fill="${d.accentColor}" opacity="0.9" />
    `;
  } else {
    // Palazzo & Flared Sharara Suit Set
    bodyGarmentPath = `
      <!-- Short Festive Kurta -->
      <path d="M295 210 Q400 230 505 210 L520 480 Q400 495 280 480 Z" fill="${d.primaryColor}" opacity="0.95" />
      <path d="M280 480 Q400 495 520 480 L520 496 Q400 511 280 496 Z" fill="${d.accentColor}" />
    `;
    bottomGarmentPath = `
      <!-- Wide-Leg Flared Sharara Pants -->
      <path d="M310 496 Q240 620 180 715 L365 715 Q360 620 375 500 Z" fill="${d.primaryColor}" />
      <path d="M490 496 Q560 620 620 715 L435 715 Q440 620 425 500 Z" fill="${d.primaryColor}" />
      <!-- Sharara Tier Lace -->
      <path d="M180 700 Q270 710 365 700 L365 715 Q270 725 180 715 Z" fill="${d.accentColor}" />
      <path d="M435 700 Q530 710 620 700 L620 715 Q530 725 435 715 Z" fill="${d.accentColor}" />
    `;
    dupattaPath = `
      <!-- Draped Sheer Dupatta -->
      <path d="M190 220 Q400 340 610 220 Q560 380 400 420 Q240 380 190 220 Z" fill="${d.accentColor}" opacity="0.35" />
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Studio Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7F5" />
      <stop offset="50%" stop-color="#F3E9E4" />
      <stop offset="100%" stop-color="#EADCD5" />
    </linearGradient>

    <!-- Metallic Gold/Accent Shimmer -->
    <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="50%" stop-color="#FFF2A1" />
      <stop offset="100%" stop-color="#C59B27" />
    </linearGradient>

    <!-- Soft Drop Shadow Filter -->
    <filter id="studioShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#2B2620" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Clean Studio Background -->
  <rect width="800" height="800" fill="url(#bgGrad)" />
  <circle cx="400" cy="400" r="340" fill="#FFFFFF" opacity="0.4" />

  <!-- Studio Floor Soft Shadow -->
  <ellipse cx="400" cy="735" rx="260" ry="24" fill="#2B2620" opacity="0.12" />

  <!-- MAIN GARMENT SHAPE (Ghost Mannequin / Invisible Model) -->
  <g filter="url(#studioShadow)">
    <!-- Shoulders & Hanger Form -->
    <path d="M330 145 C360 135 440 135 470 145 C495 155 530 190 540 210 L260 210 C270 190 305 155 330 145 Z" fill="${d.primaryColor}" />
    <!-- Neckline -->
    <path d="M360 145 C380 180 420 180 440 145 Z" fill="#FAF7F5" stroke="${d.accentColor}" stroke-width="4" />

    <!-- Sleeves -->
    <path d="M260 210 L200 370 L250 380 L290 230 Z" fill="${d.primaryColor}" />
    <path d="M540 210 L600 370 L550 380 L510 230 Z" fill="${d.primaryColor}" />
    <!-- Sleeve Cuff Borders -->
    <path d="M200 370 L250 380 L245 392 L195 382 Z" fill="${d.accentColor}" />
    <path d="M600 370 L550 380 L555 392 L605 382 Z" fill="${d.accentColor}" />

    ${dupattaPath}
    ${bottomGarmentPath}
    ${bodyGarmentPath}
  </g>

  <!-- PGMART BRAND WATERMARK BADGE -->
  <rect x="40" y="40" width="170" height="34" rx="17" fill="#C0654B" opacity="0.9" />
  <text x="125" y="62" font-family="'Poppins', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">PGMART STUDIO</text>

  <!-- GARMENT FABRIC BADGE -->
  <rect x="580" y="40" width="180" height="34" rx="8" fill="#FFFFFF" stroke="#C0654B" stroke-width="1.5" />
  <text x="670" y="62" font-family="'Poppins', sans-serif" font-size="11" font-weight="700" fill="#2B2620" text-anchor="middle">${d.fabric.toUpperCase()}</text>

  <!-- PRODUCT TITLE OVERLAY CARD AT BOTTOM -->
  <rect x="50" y="720" width="700" height="50" rx="12" fill="#FFFFFF" opacity="0.95" />
  <text x="70" y="750" font-family="'Playfair Display', serif" font-size="15" font-weight="700" fill="#2B2620">${titleShort}</text>
  <rect x="610" y="732" width="125" height="26" rx="6" fill="${d.primaryColor}" />
  <text x="672" y="749" font-family="'Poppins', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">${d.pattern.toUpperCase()}</text>
</svg>`;
}

async function generateAllStudioImages() {
  const outputDir = path.join(process.cwd(), 'src', 'assets', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allDesigns = [...anarkaliDesigns, ...kurtiDesigns, ...palazzoDesigns];
  console.log(`Generating ${allDesigns.length} studio SVG e-commerce product images...`);

  allDesigns.forEach((d, idx) => {
    const svgCode = generateGarmentSvg(d);
    const filePath = path.join(outputDir, d.filename);
    fs.writeFileSync(filePath, svgCode, 'utf-8');
    console.log(`[${idx + 1}/${allDesigns.length}] Generated ${d.filename} (${d.title})`);
  });

  console.log("\n✅ All 30 AI Studio Product Images generated successfully!");
}

generateAllStudioImages().catch(console.error);
