import { Category, Product, ProductTag } from '../types';
import { buildProductAiImagePrompt } from './aiImagePrompts';

// Distinct titles, fabrics, and image pools for each product type
const typeMetadata: Record<string, {
  titles: string[];
  fabrics: string[];
  fits: string[];
  occasions: string[];
  sizes: string[];
  imagePool: string[];
  basePriceRange: [number, number];
}> = {
  // --- WOMEN'S ETHNIC ---
  'wt-saree': {
    titles: [
      'Peach Pink Banarasi Silk Brocade Saree',
      'Modern Patchwork Printed Multicolor Designer Saree',
      'Deep Teal Blue Floral Print Chiffon Saree',
      'Minimalist Navy Checked Handloom Cotton Silk Saree',
      'Traditional Red & Teal Geometric Patola Silk Saree',
      'Royal Plum Banarasi Silk Zari Saree',
      'Lavender Lilac Hand Embroidered Silver Zari Saree',
      'Mustard Gold Kanjeevaram Silk Wedding Saree',
      'Emerald Green Imperial All-Over Gold Brocade Saree',
      'Royal Blue Banarasi Silk Saree with Animal Zari Motifs'
    ],
    fabrics: ['Banarasi Silk', 'Poly Crepe Silk', 'Pure Chiffon Georgette', 'Handloom Cotton Silk', 'Patola Silk', 'Banarasi Pure Silk', 'Premium Organza Silk', 'Pure Kanjeevaram Silk', 'Imperial Silk', 'Royal Silk'],
    fits: ['Free Size Drape'],
    occasions: ['Festive Wear', 'Wedding Wear', 'Party Wear'],
    sizes: ['Free Size'],
    imagePool: [
      '/src/assets/images/saree_pink_banarasi_1785747438425.jpg',
      '/src/assets/images/saree_multicolor_patchwork_1785747468827.jpg',
      '/src/assets/images/saree_teal_floral_1785747500610.jpg',
      '/src/assets/images/saree_checked_blue_1785747524321.jpg',
      '/src/assets/images/saree_pink_teal_patola_1785747548598.jpg',
      '/src/assets/images/saree_purple_banarasi_1785747571080.jpg',
      '/src/assets/images/saree_lilac_embroidered_1785747592185.jpg',
      '/src/assets/images/saree_mustard_gold_1785747615679.jpg',
      '/src/assets/images/saree_emerald_green_1785747638539.jpg',
      '/src/assets/images/saree_blue_animal_motifs_1785747658359.jpg'
    ],
    basePriceRange: [2999, 8999]
  },
  'wt-salwar': {
    titles: [
      'Chanderi Silk Embroidered Salwar Kameez Set',
      'Cotton Jacquard Straight Kurta with Dupatta',
      'Georgette Mirror Work Churidar Suit Set',
      'Printed Rayon Daily Wear Salwar Suit',
      'Silk Blend Festive Churidar Kameez',
      'Linen Cotton Floral Print Salwar Suit',
      'Handblock Print Cotton Churidar Set',
      'Zari Work Chiffon Salwar Suit with Dupatta',
      'Gotapatti Embroidered Silk Salwar Set',
      'Bandhani Print Georgette Churidar Suit'
    ],
    fabrics: ['Chanderi Silk', 'Pure Cotton', 'Georgette', 'Rayon Blend', 'Linen Cotton'],
    fits: ['Regular Fit', 'Straight Cut'],
    occasions: ['Festive Wear', 'Casual Wear', 'Work Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1999, 4999]
  },
  'wt-lehenga': {
    titles: [
      'Velvet Zari Embroidered Bridal Lehenga Choli',
      'Georgette Mirror Work Festive Flare Lehenga Set',
      'Silk Jacquard Floral Printed Lehenga Choli',
      'Net Sequins Heavy Wedding Lehenga with Dupatta',
      'Organza Digital Print Party Wear Lehenga',
      'Brocade Silk Designer Lehenga Choli Set',
      'Semi-Stitched Satin Silk Festive Lehenga',
      'Gotapatti Work Chanderi Flare Lehenga',
      'Bandhani Print Silk Lehenga with Contrast Choli',
      'Taffeta Silk Multi-Color Embroidered Lehenga'
    ],
    fabrics: ['Velvet Silk', 'Georgette', 'Raw Silk', 'Organza', 'Brocade Silk'],
    fits: ['Flared Fit'],
    occasions: ['Wedding Wear', 'Festive Wear'],
    sizes: ['S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [4999, 14999]
  },
  'wt-anarkali': {
    titles: [
      'Heavy Mirror-Work Georgette Flared Anarkali',
      'Chanderi Silk Embroidered Anarkali Kurta Set',
      'Printed Cotton Anarkali Suit with Organza Dupatta',
      'Gota Patti Silk Blend Floor-Length Anarkali',
      'Rayon Slub Foil Print Flared Anarkali Suit',
      'Designer Net Sequins Anarkali Party Dress',
      'Bandhani Print Silk Flared Anarkali Suit',
      'Handcrafted Ajrakh Block Print Anarkali Set',
      'Angrakha Style Georgette Anarkali Kurta',
      'Tiered Cotton Silk Anarkali with Pant Set'
    ],
    fabrics: ['Georgette', 'Chanderi Silk', 'Pure Cotton', 'Rayon Slub'],
    fits: ['Flared Fit', 'Anarkali Cut'],
    occasions: ['Festive Wear', 'Wedding Wear', 'Party Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [2499, 6999]
  },
  'wt-kurti': {
    titles: [
      'Straight Fit Pure Khadi Cotton Kurti',
      'A-Line Rayon Printed Kurti with Pocket',
      'Chanderi Silk Embroidered Tunic Kurti',
      'Mulmul Cotton Handblock Print Daily Kurti',
      'Linen Cotton Formal Collar Kurti',
      'Tiered Flared Georgette Anarkali Kurti',
      'Short Cotton Kurti Tunic for Jeans',
      'Mirror Work Rayon Festive Kurti',
      'Schiffli Embroidered White Cotton Kurti',
      'Casual Striped Linen Straight Kurti'
    ],
    fabrics: ['100% Cotton', 'Rayon Slub', 'Khadi Cotton', 'Chanderi Silk', 'Mulmul Cotton'],
    fits: ['Straight Fit', 'A-Line', 'Relaxed Fit'],
    occasions: ['Casual Wear', 'Work Wear', 'Festive Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [899, 2499]
  },
  'wt-palazzo': {
    titles: [
      'Flared Georgette Sharara Suit Set with Dupatta',
      'Cotton Printed Palazzo Suit with Straight Kurta',
      'Rayon Embroidered Wide Leg Palazzo Set',
      'Silk Blend Gotta Patti Sharara Kurta Set',
      'Chanderi Silk Tiered Palazzo Party Set',
      'Crushed Georgette Flared Sharara Suit',
      'Linen Cotton Printed Kurta with Palazzo Pants',
      'Festive Sequins Work Palazzo Suit Set',
      'Bandhani Print Rayon Sharara Set',
      'Solid Cotton Silk Kurta with Flared Palazzo'
    ],
    fabrics: ['Georgette', 'Pure Cotton', 'Rayon', 'Chanderi Silk'],
    fits: ['Wide Leg', 'Flared Fit'],
    occasions: ['Festive Wear', 'Party Wear', 'Casual Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1799, 4499]
  },

  // --- WOMEN'S WESTERN ---
  'wt-dresses': {
    titles: [
      'Floral Chiffon Tiered Maxi Evening Dress',
      'Satin Silk Wrap Midi Party Dress',
      'Cotton Poplin A-Line Summer Sundress',
      'Ribbed Knit Bodycon Midi Dress',
      'Smocked Off-Shoulder Boho Maxi Dress',
      'Satin Slip Evening Gown with Slit',
      'Polka Dot V-Neck Vintage Midi Dress',
      'Linen Button-Front Shirt Dress',
      'Sequins Glam Party Mini Dress',
      'Tiered Ruffle Chiffon Cocktail Dress'
    ],
    fabrics: ['Chiffon', 'Satin Silk', '100% Cotton Poplin', 'Ribbed Knit', 'Linen Blend'],
    fits: ['A-Line', 'Bodycon', 'Maxi Fit', 'Relaxed Fit'],
    occasions: ['Party Wear', 'Casual Wear', 'Work Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1499, 4999]
  },
  'wt-tops': {
    titles: [
      'Satin Silk Button-Down Formal Blouse',
      'Ribbed Cotton Crop Top with Sweetheart Neck',
      'Floral Print Chiffon Peplum Top',
      'Puff Sleeve Organic Cotton Casual Top',
      'Wrap Front Linen Cropped Top',
      'Schiffli Lace Embroidered White Top',
      'Smocked Elasticated Bardot Top',
      'Knit High-Neck Sleeveless Tank Top',
      'Georgette Tiered Ruffle Top',
      'Classic Striped Cotton Utility Shirt Top'
    ],
    fabrics: ['Satin Silk', 'Organic Cotton', 'Chiffon', 'Ribbed Knit', 'Linen'],
    fits: ['Regular Fit', 'Slim Fit', 'Cropped'],
    occasions: ['Casual Wear', 'Work Wear', 'Party Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 2299]
  },
  'wt-jeans': {
    titles: [
      'High-Rise Wide Leg Vintage Denim Jeans',
      'Slim Fit Ankle Length Stretch Blue Jeans',
      'Straight Fit Mom Jeans in Washed Indigo',
      'Distressed Boyfriend Fit Denim Pants',
      'High-Waisted Flare Bell Bottom Jeans',
      'Black Super Stretch Skinny Fit Jeans',
      'Cargo Pocket High-Rise Denim Trousers',
      'Off-White Wide Leg Cotton Denim Jeans',
      'Cropped Straight Leg Denim Pants',
      'Vintage Light Wash Relaxed Fit Jeans'
    ],
    fabrics: ['98% Cotton 2% Spandex', '100% Rigid Denim Cotton', 'Stretch Cotton Denim'],
    fits: ['Wide Leg', 'Slim Fit', 'Mom Fit', 'Straight Fit'],
    occasions: ['Casual Wear'],
    sizes: ['26', '28', '30', '32', '34'],
    imagePool: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1599, 3499]
  },
  'wt-trousers': {
    titles: [
      'High-Waisted Tailored Pleated Trousers',
      'Linen Blend Wide Leg Summer Pants',
      'Stretch Crepe Ankle Length Formal Trousers',
      'Paperbag Waist Belted Cotton Trousers',
      'Straight Cut Formal Office Wear Pants',
      'Cargo Pocket Tapered Utility Trousers',
      'Relaxed Fit Cotton Chino Trousers',
      'Seamless Ponte Stretch Formal Leggings Pants',
      'Pleated Wide Leg Satin Trousers',
      'Cropped Bootcut Stretch Work Pants'
    ],
    fabrics: ['Polyester Viscose Blend', 'Linen Cotton', 'Stretch Crepe', 'Cotton Twill'],
    fits: ['Tailored Fit', 'Wide Leg', 'Straight Fit'],
    occasions: ['Work Wear', 'Casual Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 2999]
  },
  'wt-coord': {
    titles: [
      'Linen Blazer & High-Waist Wide Leg Trousers Set',
      'Printed Satin Crop Top & Flared Pants Co-ord',
      'Ribbed Knit Sleeveless Top & Skirt Two-Piece',
      'Utility Cargo Shirt & Joggers Co-ord Set',
      'Floral Chiffon Wrap Top & Palazzo Set',
      'Cotton Poplin Oversized Shirt & Shorts Set',
      'Boho Print Crop Top & Tiered Skirt Set',
      'Satin Longline Kimono & Trousers Set',
      'Minimalist Knit Sweater & Wide Pants Set',
      'Structured Formal Vest & Trousers Co-ord'
    ],
    fabrics: ['Linen Blend', 'Satin Silk', 'Ribbed Knit', 'Pure Cotton Poplin'],
    fits: ['Oversized Relaxed', 'Tailored Fit'],
    occasions: ['Casual Wear', 'Party Wear', 'Work Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [2499, 5499]
  },
  'wt-skirts': {
    titles: [
      'Satin High-Waist Midi Bias Skirt',
      'Pleated A-Line Chiffon Maxi Skirt',
      'Denim Front-Slit Straight Midi Skirt',
      'Tiered Floral Print Boho Maxi Skirt',
      'Tailored Formal Pencil Skirt',
      'Ribbed Knit Bodycon Mini Skirt',
      'Wrap Style Linen Summer Skirt',
      'Tulle Layered Party Flare Skirt',
      'Button-Down Cotton A-Line Skirt',
      'Leather Look High-Rise Mini Skirt'
    ],
    fabrics: ['Satin Silk', 'Chiffon', 'Cotton Denim', 'Ribbed Knit', 'Linen'],
    fits: ['A-Line', 'Midi Fit', 'Pencil Fit'],
    occasions: ['Casual Wear', 'Party Wear', 'Work Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [999, 2499]
  },

  // --- WOMEN'S FORMAL ---
  'wt-blazers': {
    titles: [
      'Double-Breasted Tailored Office Blazer',
      'Oversized Linen Casual Structure Blazer',
      'Single-Button Crepe Formal Blazer Suit',
      'Cropped Structured Shoulder Power Blazer',
      'Pinstripe Viscose Tailored Suit Jacket',
      'Satin Lapel Tuxedo Blazer for Women',
      'Tweed Houndstooth Vintage Blazer Jacket',
      'Belted Longline Formal Trench Blazer',
      'Open Front Stretch Crepe Work Blazer',
      'Velvet Evening Formal Dinner Suit Blazer'
    ],
    fabrics: ['Poly-Viscose Blend', 'Pure Linen', 'Stretch Crepe', 'Tweed Wool Blend'],
    fits: ['Tailored Fit', 'Oversized', 'Slim Fit'],
    occasions: ['Work Wear', 'Party Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [2499, 5999]
  },
  'wt-formal-shirts': {
    titles: [
      '100% Cotton Crisp Formal Button-Down Shirt',
      'Satin Silk Concealed Placket Work Shirt',
      'Striped Viscose Formal Office Blouse Shirt',
      'Mandarin Collar Linen Blend Work Shirt',
      'Classic White Oxford Cotton Formal Shirt',
      'French Cuff Tailored Stretch Formal Shirt',
      'Polka Dot Satin Silk Formal Office Shirt',
      'Slim Fit Premium Cotton Formal Shirt',
      'Tie-Neck Pussybow Formal Silk Blouse',
      'Short Sleeve Linen Utility Work Shirt'
    ],
    fabrics: ['100% Giza Cotton', 'Satin Silk', 'Viscose Silk', 'Linen Blend'],
    fits: ['Tailored Fit', 'Regular Fit', 'Slim Fit'],
    occasions: ['Work Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1199, 2799]
  },

  // --- WOMEN'S INNERWEAR ---
  'wt-bras': {
    titles: [
      'Seamless Micro-Modal Wirefree Everyday Bra',
      'Padded T-Shirt Bra with Memory Foam Cups',
      'High-Impact Breathable Mesh Sports Bra',
      'Strapless Convertible Multiway Contour Bra',
      'Lace Bralette with Soft Removable Padding',
      'Full Coverage Non-Padded Cotton Bra',
      'Plunge Neck Seamless Push-Up Bra',
      'Front-Open Cotton Comfort Nursing Bra',
      'Active Racerback Stretch Fitness Bra',
      'Zero-Feel Laser Cut Invisible Edge Bra'
    ],
    fabrics: ['Micro-Modal Spandex', 'Combed Cotton', 'Nylon Elastane', 'Lace Mesh'],
    fits: ['Fitted', 'Seamless'],
    occasions: ['Active & Loungewear', 'Everyday Basics'],
    sizes: ['32B', '34B', '36B', '38B', '34C', '36C'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1799]
  },
  'wt-panties': {
    titles: [
      'Seamless Laser-Cut Bikini Panties (Pack of 3)',
      '100% Organic Cotton Full Briefs (Pack of 3)',
      'High-Waist Micro-Modal Hipster Panties (Pack of 3)',
      'Lace Trim Stretch Microfiber Thong (Pack of 2)',
      'Anti-Bacterial Bamboo Viscose Boyshorts',
      'Zero Elastic Edge Seamless Cheeky Panties',
      'Period Proof Leak-Guard Cotton Briefs',
      'Mid-Rise Combed Cotton Comfort Briefs (Pack of 3)',
      'Ribbed Cotton Stretch Daily Panties (Pack of 3)',
      'Ultra-Soft Seamless Tanga Panties (Pack of 3)'
    ],
    fabrics: ['Micro-Modal', '100% Organic Cotton', 'Nylon Elastane', 'Bamboo Viscose'],
    fits: ['Fitted', 'Seamless'],
    occasions: ['Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [599, 1299]
  },
  'wt-shapewear': {
    titles: [
      'High-Waist Tummy Control Seamless Body Shaper',
      'Full Body Shaping Suit with Targeted Compression',
      'Thigh Slimmer Seamless Shaping Shorts',
      'Waist Cinch Corset Belt Shaper',
      'Camisole Shapewear Tank Top with Built-in Bra',
      'Saree Shapewear Petticoat with Drawstring',
      'Backless Body Shaper Suit for Party Dresses',
      'Seamless Arm Slimmer & Posture Corrector Shaper',
      'Mid-Thigh Firm Control Shaping Briefs',
      'Breathable Mesh Tummy & Hip Shaper'
    ],
    fabrics: ['Nylon Elastane Blend', 'Micro-Modal Spandex', 'Power Mesh'],
    fits: ['Targeted Compression Fit'],
    occasions: ['Party Wear', 'Wedding Wear', 'Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [899, 2499]
  },

  // --- WOMEN'S OUTERWEAR ---
  'wt-jackets': {
    titles: [
      'Vintage Trucker Denim Jacket with Metal Buttons',
      'Faux Leather Biker Moto Jacket',
      'Longline Sheer Chiffon Printed Shrug',
      'Quilted Lightweight Puffer Winter Jacket',
      'Fleece Lined Hooded Windbreaker Jacket',
      'Structured Tweed Cropped Jacket',
      'Cotton Twill Utility Field Jacket with Belt',
      'Faux Fur Trim Tailored Parka Jacket',
      'Open-Front Crochet Knit Summer Shrug',
      'Sporty Zip-Up Track Jacket with Side Stripes'
    ],
    fabrics: ['100% Cotton Denim', 'PU Faux Leather', 'Polyester Fleece', 'Tweed Wool'],
    fits: ['Regular Fit', 'Cropped', 'Oversized'],
    occasions: ['Casual Wear', 'Party Wear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1899, 4499]
  },
  'wt-sweaters': {
    titles: [
      'Cable-Knit Oversized Crewneck Sweater',
      'Soft Cashmere Blend V-Neck Cardigan',
      'Ribbed High-Neck Turtleneck Knit Sweater',
      'Button-Down Chunky Knit Cropped Cardigan',
      'Striped Cotton Knit Casual Pullover',
      'Open Front Longline Knit Duster Cardigan',
      'Fleece Sweatshirt Hoodie with Kangaroo Pocket',
      'Mohair Blend Soft Fluffy Knit Sweater',
      'Embroidered Floral Knit Cardigan Sweater',
      'Asymmetric Wrap Knit Poncho Sweater'
    ],
    fabrics: ['Soft Acrylic Wool Blend', 'Cashmere Blend', '100% Combed Cotton Knit'],
    fits: ['Oversized Fit', 'Regular Fit'],
    occasions: ['Casual Wear', 'Work Wear'],
    sizes: ['S', 'M', 'L', 'XL'],
    imagePool: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 3299]
  },

  // --- MEN'S ETHNIC ---
  'mt-kurta': {
    titles: [
      'Raw Silk Jacquard Festive Kurta & Dhoti Set',
      '100% Pure Cotton Straight Knee-Length Kurta',
      'Chanderi Silk Embroidered Festive Kurta Pajama',
      'Thread Work Chikankari Lucknawi Cotton Kurta',
      'Asymmetric Cut Indo-Western Kurta Shirt',
      'Linen Cotton Solid Mandarin Collar Kurta',
      'Bandhani Print Silk Blend Festive Kurta',
      'Short Cotton Kurta Shirt for Jeans',
      'Handblock Printed Ajrakh Cotton Kurta Set',
      'Heavy Dupion Silk Wedding Kurta with Churidar'
    ],
    fabrics: ['Raw Silk Blend', '100% Pure Cotton', 'Lucknawi Chikankari Cotton', 'Linen Cotton'],
    fits: ['Straight Fit', 'Tailored Cut'],
    occasions: ['Festive Wear', 'Wedding Wear', 'Casual Wear'],
    sizes: ['38', '40', '42', '44', '46'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1499, 4299]
  },
  'mt-sherwani': {
    titles: [
      'Royal Zari Brocade Groom Wedding Sherwani Set',
      'Indo-Western Velvet Embroidered Achkan Suit',
      'Raw Silk Hand-Embroidered Groom Sherwani',
      'Designer Jodhupuri Bandhgala Sherwani Set',
      'Jacquard Patterned Silk Festive Sherwani',
      'Asymmetric Layered Indo-Western Wedding Suit',
      'Thread Embroidered Silk Sherwani with Stole',
      'Minimalist Pastel Silk Groom Sherwani Set',
      'Heavy Sequin Work Velvet Indo-Western Set',
      'Classic Brocade Achkan Sherwani with Churidar'
    ],
    fabrics: ['Raw Silk', 'Velvet Silk', 'Brocade Jacquard', 'Dupion Silk'],
    fits: ['Tailored Structure Fit'],
    occasions: ['Wedding Wear'],
    sizes: ['38', '40', '42', '44'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [6999, 18999]
  },
  'mt-nehru': {
    titles: [
      'Pure Silk Jacquard Sleeveless Nehru Jacket',
      'Linen Cotton Floral Printed Sleeveless Bandhgala',
      'Khadi Cotton Handloom Sleeveless Waistcoat',
      'Velvet Zari Embroidered Festive Nehru Jacket',
      'Textured Raw Silk Bandhgala Waistcoat',
      'Pastel Chanderi Silk Wedding Nehru Jacket',
      'Checkered Wool Blend Formal Nehru Waistcoat',
      'Contrast Piping Silk Nehru Jacket for Men',
      'Handblock Print Cotton Festive Nehru Coat',
      'Satin Silk Self-Design Party Nehru Waistcoat'
    ],
    fabrics: ['Raw Silk', 'Pure Linen', 'Khadi Cotton', 'Brocade Jacquard'],
    fits: ['Tailored Fit'],
    occasions: ['Festive Wear', 'Wedding Wear', 'Casual Wear'],
    sizes: ['38', '40', '42', '44', '46'],
    imagePool: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 3499]
  },

  // --- MEN'S WESTERN ---
  'mt-tshirts': {
    titles: [
      '100% Combed Cotton Pique Polo T-Shirt',
      'Oversized Heavyweight Cotton Graphic Tee',
      'Slim Fit Cotton Henley Neck T-Shirt',
      'Organic Cotton Crew Neck Casual T-Shirt',
      'Colorblock Cotton Blend Sporty T-Shirt',
      'Ribbed Knit Slim Fit V-Neck T-Shirt',
      'Washed Vintage Acid Wash Cotton Tee',
      'Striped Breathable Cotton Polo Shirt',
      'Performance Dry-Fit Athletic Gym T-Shirt',
      'Pocket Detail Slub Cotton Casual Tee'
    ],
    fabrics: ['100% Combed Cotton', 'Pique Cotton', 'Organic Cotton Slub', 'Dry-Fit Polyester'],
    fits: ['Slim Fit', 'Oversized Fit', 'Regular Fit'],
    occasions: ['Casual Wear', 'Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1899]
  },
  'mt-shirts': {
    titles: [
      '100% Pure Linen Long Sleeve Casual Shirt',
      'Slim Fit Italian Knit Stretch Cotton Shirt',
      'Classic Buffalo Plaid Flannel Casual Shirt',
      'Cuban Collar Tropical Printed Resort Shirt',
      'Vintage Indigo Washed Denim Shirt',
      'Oxford Cotton Button-Down Casual Shirt',
      'Textured Corduroy Button-Up Over-Shirt',
      'Micro-Checkered Breathable Cotton Shirt',
      'Short Sleeve Linen Utility Resort Shirt',
      'Mandarin Collar Soft Twill Casual Shirt'
    ],
    fabrics: ['100% European Linen', 'Italian Cotton Knit', 'Oxford Cotton', 'Corduroy'],
    fits: ['Slim Fit', 'Regular Fit', 'Relaxed Fit'],
    occasions: ['Casual Wear', 'Party Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 2999]
  },
  'mt-jeans': {
    titles: [
      'Slim Tapered Stretch Indigo Denim Jeans',
      'Straight Fit Vintage Medium Wash Jeans',
      'Relaxed Fit Heavyweight Cotton Carpenter Jeans',
      'Super Skinny Stretch Black Denim Pants',
      'Distressed Ripped Streetwear Denim Jeans',
      'Bootcut Classic Dark Wash Blue Jeans',
      'Athletic Fit Stretch Comfort Denim Pants',
      'Raw Selvedge Rigid Cotton Denim Jeans',
      'Light Wash Vintage 90s Straight Jeans',
      'Tapered Cargo Pocket Utility Denim Pants'
    ],
    fabrics: ['98% Cotton 2% Spandex Stretch Denim', '100% Heavyweight Rigid Cotton'],
    fits: ['Slim Tapered', 'Straight Fit', 'Relaxed Fit', 'Skinny Fit'],
    occasions: ['Casual Wear'],
    sizes: ['30', '32', '34', '36', '38'],
    imagePool: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1599, 3999]
  },
  'mt-chinos': {
    titles: [
      'Slim Fit Stretch Cotton Twill Chinos',
      'Relaxed Fit Flat Front Casual Trousers',
      'Tapered Fit Elastic Waist Utility Joggers',
      'Linen Cotton Blend Summer Breathable Chinos',
      'Cargo Pocket Heavy Cotton Utility Joggers',
      'Pleated Wide-Leg Vintage Cotton Chino Pants',
      'Drawstring Ankle Cuff Stretch Jogger Pants',
      'Wrinkle-Resistant Office Chino Trousers',
      'Fleece Lined Winter Casual Jogger Pants',
      'Tapered Tech Stretch Everyday Chino Pants'
    ],
    fabrics: ['Stretch Cotton Twill', 'Linen Cotton', 'Heavy Cotton Canvas'],
    fits: ['Slim Fit', 'Tapered Fit', 'Relaxed Fit'],
    occasions: ['Casual Wear', 'Work Wear'],
    sizes: ['30', '32', '34', '36', '38'],
    imagePool: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 2799]
  },
  'mt-shorts': {
    titles: [
      'Stretch Cotton Twill Flat Front Shorts',
      '100% Linen Drawstring Summer Beach Shorts',
      'Cargo Pocket Utility Casual Bermudas',
      'Knit Sweatshirt Fleece Casual Lounge Shorts',
      'Distressed Denim Cut-Off Casual Shorts',
      'Active Dry-Fit Workout Running Shorts',
      'Classic Chino Knee-Length Casual Shorts',
      'Tropical Printed Resort Swim & Walk Shorts',
      'Ribbed Cotton Drawstring Lounge Shorts',
      'Tailored Golf Performance Stretch Shorts'
    ],
    fabrics: ['Stretch Cotton Twill', 'Pure European Linen', 'French Terry Cotton'],
    fits: ['Regular Fit', 'Slim Fit'],
    occasions: ['Casual Wear', 'Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [899, 1999]
  },

  // --- MEN'S FORMAL ---
  'mt-formal-shirts': {
    titles: [
      '100% Giza Cotton Supima Formal Shirt',
      'French Cuff Non-Iron White Executive Shirt',
      'Pinpoint Oxford Tailored Fit Formal Shirt',
      'Micro-Structure Italian Cotton Spread Collar Shirt',
      'Slim Fit Easy-Care Herringbone Formal Shirt',
      'Pastel Satin Finish Formal Tuxedo Shirt',
      'Striped Premium Long-Staple Cotton Shirt',
      'Classic Fit Solid Blue Office Formal Shirt',
      'Mandarin Collar Concealed Placket Formal Shirt',
      'Breathable Bamboo Viscose Formal Shirt'
    ],
    fabrics: ['100% Giza Supima Cotton', 'Pinpoint Oxford Cotton', 'Bamboo Viscose'],
    fits: ['Slim Fit', 'Tailored Fit', 'Classic Fit'],
    occasions: ['Work Wear', 'Party Wear'],
    sizes: ['38', '39', '40', '42', '44'],
    imagePool: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1499, 3499]
  },
  'mt-formal-trousers': {
    titles: [
      'Slim Fit Poly-Viscose Formal Trousers',
      'Flat Front Wool Blend Executive Pants',
      'Stretch Crepe Tailored Office Trousers',
      'Pleated Classic Fit Formal Business Trousers',
      'Wrinkle-Free Tech Stretch Office Pants',
      'Checkered Tailored Formal Trousers',
      'Extended Tab Waistband Italian Suit Pants',
      'Micro-Pinstripe Formal Business Trousers',
      'Tapered Fit Ankle Length Formal Pants',
      'Satin Trimmed Formal Dinner Tuxedo Trousers'
    ],
    fabrics: ['Poly-Viscose Blend', 'Wool Blend', 'Stretch Crepe'],
    fits: ['Slim Fit', 'Tailored Fit', 'Regular Fit'],
    occasions: ['Work Wear', 'Party Wear'],
    sizes: ['30', '32', '34', '36', '38'],
    imagePool: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1299, 2999]
  },
  'mt-suits': {
    titles: [
      'Single-Breasted 2-Piece Wool Blend Suit',
      'Slim Fit Double-Breasted Formal Tuxedo Suit',
      'Tailored Fit 3-Piece Vest Suit with Trousers',
      'Italian Linen Blend Summer Formal Blazer Suit',
      'Pinstripe Executive Business Suit Set',
      'Velvet Lapel Black Tie Evening Dinner Suit',
      'Houndstooth Structured Wool Blend Blazer',
      'Classic Navy Blue Notch Lapel Formal Suit',
      'Charcoal Grey 3-Piece Formal Suit Set',
      'Satin Lapel Formal Wedding Tuxedo Suit'
    ],
    fabrics: ['Wool Poly Viscose Blend', 'Italian Linen Blend', 'Velvet Trim'],
    fits: ['Slim Fit', 'Tailored Structure Fit'],
    occasions: ['Work Wear', 'Wedding Wear', 'Party Wear'],
    sizes: ['38', '40', '42', '44'],
    imagePool: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [5999, 14999]
  },

  // --- MEN'S INNERWEAR ---
  'mt-briefs': {
    titles: [
      'Anti-Microbial Organic Bamboo Boxer Trunks (Pack of 3)',
      'Ultra-Soft Micro-Modal Seamless Briefs (Pack of 3)',
      '100% Combed Cotton Mid-Rise Briefs (Pack of 3)',
      'Microfiber No-Roll Waistband Trunks (Pack of 2)',
      'Breathable Mesh Athletic Active Trunks',
      'Contour Pouch Stretch Micro-Modal Trunks (Pack of 3)',
      'Ribbed Cotton Stretch Daily Briefs (Pack of 3)',
      'Zero-Chafing Performance Boxer Briefs (Pack of 2)',
      'Eco-Friendly Modal Soft Hipster Briefs (Pack of 3)',
      'Seamless Comfort Stretch Cotton Trunks (Pack of 3)'
    ],
    fabrics: ['Organic Bamboo Viscose', 'Micro-Modal Spandex', 'Combed Cotton'],
    fits: ['Trunk Fit', 'Brief Fit'],
    occasions: ['Everyday Basics', 'Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 1699]
  },
  'mt-boxers': {
    titles: [
      '100% Woven Cotton Button-Fly Boxers (Pack of 3)',
      'Combed Cotton Ribbed Gym Sleeveless Vest (Pack of 3)',
      'Micro-Modal Ultra-Soft Lounge Boxers',
      'Seamless Cotton Inner Vests with Anti-Odor Finish (Pack of 3)',
      'Printed Cotton Relaxed Sleep Boxers (Pack of 2)',
      'Deep V-Neck Invisible Cotton Vests (Pack of 3)',
      'Chambray Woven Cotton Casual Boxers',
      'Ribbed Athletic Sleeveless Tank Vests (Pack of 3)',
      'Organic Cotton Printed Comfort Boxers (Pack of 2)',
      'Breathable Bamboo Viscose Muscle Vests (Pack of 2)'
    ],
    fabrics: ['100% Woven Cotton', 'Combed Cotton Rib', 'Micro-Modal'],
    fits: ['Relaxed Fit', 'Fitted Vest'],
    occasions: ['Everyday Basics', 'Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1499]
  },
  'mt-loungewear': {
    titles: [
      'Fleece Lined Winter Tracksuit Set',
      '100% Cotton Lounge Pyjamas with Pockets',
      'French Terry Cotton Hoodie & Joggers Set',
      'Soft Knit Striped Sleep Shirt & Pyjama Set',
      'Breathable Modal Stretch Loungewear Set',
      'Active Dry-Fit Athletic Tracksuit',
      'Waffle Knit Cotton Loungewear Set',
      'Relaxed Fit Cotton Printed Pyjama Pants',
      'Velour Soft Touch Winter Lounge Set',
      'Lightweight Summer Slub Cotton Lounge Set'
    ],
    fabrics: ['French Terry Cotton', '100% Combed Cotton', 'Fleece Blend'],
    fits: ['Relaxed Fit', 'Regular Fit'],
    occasions: ['Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1499, 3499]
  },

  // --- KIDS ---
  'kt-b-tshirts': {
    titles: [
      'Bio-Wash Organic Cotton Printed Boys T-Shirt',
      'Colorblock Cotton Pique Boys Polo Shirt',
      'Superhero Graphic Printed Cotton Boys Tee',
      'Striped Cotton Full Sleeve Boys T-Shirt',
      'Button-Down Denim Cotton Boys Casual Shirt',
      'Dinosaurs Digital Print Cotton Boys T-Shirt',
      'Henley Neck Ribbed Cotton Boys Tee',
      'Active Dry-Fit Sports T-Shirt for Boys',
      'Pocket Detail Slub Cotton Boys Shirt',
      'Pack of 3 Bio-Wash Cotton Crewneck Boys Tees'
    ],
    fabrics: ['100% Bio-Wash Cotton', 'Cotton Pique', 'Organic Slub Cotton'],
    fits: ['Regular Fit'],
    occasions: ['Casual Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [499, 1299]
  },
  'kt-b-ethnic': {
    titles: [
      'Boys Cotton Silk Kurta Pajama with Nehru Jacket',
      'Royal Jacquard Festive Kurta Dhoti Set for Boys',
      'Thread Embroidered Cotton Kurta Set for Boys',
      'Bandhani Print Silk Boys Festive Kurta',
      'Lucknawi Chikankari Cotton Kurta Set for Boys',
      'Satin Silk Indo-Western Achkan Set for Boys',
      'Brocade Sleeveless Nehru Jacket with Kurta',
      'Short Cotton Kurta Pajama for Boys',
      'Velvet Embroidered Sherwani Set for Boys',
      'Ajrakh Block Print Cotton Kurta Set for Boys'
    ],
    fabrics: ['Cotton Silk Blend', 'Brocade Silk', '100% Cotton'],
    fits: ['Regular Fit'],
    occasions: ['Festive Wear', 'Wedding Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [999, 2999]
  },
  'kt-b-jeans': {
    titles: [
      'Elastic Waistband Soft Stretch Denim Boys Jeans',
      'Slim Fit Adjustable Waist Blue Boys Jeans',
      'Cargo Pocket Cotton Utility Joggers for Boys',
      'Distressed Cool Streetwear Denim Boys Pants',
      'Cotton Twill Chino Shorts for Boys',
      'Drawstring Fleece Jogger Pants for Boys',
      'Printed Cotton Casual Shorts for Boys',
      'Straight Fit Dark Wash Denim Boys Jeans',
      'Lightweight Linen Blend Shorts for Boys',
      'Tapered Fit Stretch Cotton Denim Boys Pants'
    ],
    fabrics: ['Soft Stretch Cotton Denim', 'Cotton Twill'],
    fits: ['Regular Fit', 'Slim Fit'],
    occasions: ['Casual Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1699]
  },
  'kt-g-dresses': {
    titles: [
      'Girls Floral Chiffon Tiered Party Frock',
      'Soft Satin Princess Birthday Dress with Bow',
      '100% Cotton Printed Summer Sundress for Girls',
      'Sequins Mesh Layered Party Dress for Girls',
      'Embroidered Organza Flared Girls Frock',
      'Schiffli Lace White Cotton Girls Dress',
      'Smocked Off-Shoulder Boho Girls Dress',
      'Velvet Winter Party Dress for Girls',
      'Polka Dot Vintage A-Line Girls Dress',
      'Denim Dungaree Dress with Striped Inner Tee'
    ],
    fabrics: ['Soft Chiffon', 'Satin Silk', '100% Organic Cotton', 'Mesh Net'],
    fits: ['Flared Fit', 'A-Line'],
    occasions: ['Party Wear', 'Casual Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 2499]
  },
  'kt-g-ethnic': {
    titles: [
      'Girls Brocade Silk Lehenga Choli with Dupatta',
      'Mirror Work Georgette Festive Lehenga for Girls',
      'Printed Cotton Anarkali Kurta Set for Girls',
      'Gotapatti Work Chanderi Silk Lehenga Set',
      'Bandhani Print Rayon Sharara Suit for Girls',
      'Chikankari Embroidered Cotton Kurti Set for Girls',
      'Satin Silk Festive Kurta with Palazzo Pants',
      'Organza Floral Digital Print Girls Lehenga',
      'Tiered Flared Kurta with Churidar for Girls',
      'Jacquard Patterned Festive Lehenga Choli Set'
    ],
    fabrics: ['Brocade Silk', 'Georgette', 'Chanderi Silk', 'Pure Cotton'],
    fits: ['Flared Fit'],
    occasions: ['Festive Wear', 'Wedding Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [1199, 3299]
  },
  'kt-g-tops': {
    titles: [
      'Schiffli Lace Embroidered Girls Top',
      'Floral Printed Chiffon Peplum Top for Girls',
      'Ribbed Cotton Crop Top & Skirt Set for Girls',
      'Puff Sleeve Cotton Casual Top for Girls',
      'Smocked Off-Shoulder Bardot Girls Top',
      'Denim Front-Button Skirt for Girls',
      'Tiered Floral Print Boho Skirt for Girls',
      'Sequins Glam Party Top for Girls',
      'Striped Cotton Utility Shirt Top for Girls',
      'Satin High-Waist Flare Skirt for Girls'
    ],
    fabrics: ['100% Bio Cotton', 'Schiffli Lace', 'Chiffon'],
    fits: ['Regular Fit'],
    occasions: ['Casual Wear', 'Party Wear'],
    sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [499, 1299]
  },
  'kt-rompers': {
    titles: [
      '100% Organic Cotton Infant Onesies (Pack of 3)',
      'Soft Printed Zip-Front Baby Romper',
      'Ribbed Knit Sleeveless Summer Baby Romper',
      'Hooded Fleece Winter Baby Onesie Suite',
      'Snap Button Organic Cotton Footie Sleepsuit',
      'Cute Animal Print Cotton Baby Romper',
      'Denim Dungaree Infant Romper Set',
      'Bamboo Fiber Breathable Baby Onesie',
      'Short Sleeve Summer Cotton Baby Romper',
      'Kimono Style Wrap Organic Cotton Baby Romper'
    ],
    fabrics: ['100% Organic Certified Cotton', 'Bamboo Fiber', 'Fleece'],
    fits: ['Infant Comfort Fit'],
    occasions: ['Casual Wear', 'Everyday Basics'],
    sizes: ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [599, 1499]
  },
  'kt-baby-sets': {
    titles: [
      'Organic Cotton Baby Swaddle Blanket & Cap Set',
      '100% Cotton Infant Sleepwear Top & Pyjama Set',
      'Soft Bamboo Muslin Swaddle Wrap (Pack of 2)',
      'Infant Festive Kurta Pyjama Set (0-2Y)',
      'Newborn Welcome Gift Set (Romper, Bib, Booties)',
      'Fleece Hooded Baby Blanket & Sleepsuit Set',
      'Ribbed Knit Baby Cardigan & Leggings Set',
      'Unisex Organic Cotton Nursery Sleepwear',
      'Soft Cotton Baby Sleeping Bag Wrap',
      'Infant Daily Comfort Tee & Shorts Set'
    ],
    fabrics: ['100% Organic Muslin Cotton', 'Bamboo Viscose'],
    fits: ['Infant Soft Fit'],
    occasions: ['Everyday Basics'],
    sizes: ['0-3M', '3-6M', '6-12M', '12-18M'],
    imagePool: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1799]
  },

  // --- UNDERGARMENTS CATEGORY SPECIFIC ---
  'ut-bras': {
    titles: [
      'Micro-Modal Ultra-Soft Everyday T-Shirt Bra',
      'Seamless Contour Wirefree Memory Foam Bra',
      'High Impact Breathable Fitness Sports Bra',
      'Invisible Laser-Cut Strapless Multiway Bra',
      'Lace Bralette with Soft Removable Cups',
      'Pure Cotton Non-Padded Daily Comfort Bra',
      'Plunge Neck Push-Up Seamless Bra',
      'Anti-Bacterial Bamboo Modal Everyday Bra',
      'Front Open Easy Cotton Comfort Bra',
      'Full Coverage Support Minimizer Bra'
    ],
    fabrics: ['Micro-Modal Spandex', '100% Combed Cotton', 'Nylon Mesh'],
    fits: ['Seamless', 'Fitted'],
    occasions: ['Everyday Basics', 'Active & Loungewear'],
    sizes: ['32B', '34B', '36B', '38B', '34C', '36C'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1699]
  },
  'ut-panties': {
    titles: [
      'Zero-Seam Laser-Cut Micro-Modal Bikini Panties (Pack of 3)',
      '100% Organic Cotton High-Rise Full Briefs (Pack of 3)',
      'Anti-Microbial Bamboo Viscose Hipster Panties (Pack of 3)',
      'Seamless Microfiber Comfort Boyshorts (Pack of 2)',
      'Lace Trim Stretch Cheeky Panties (Pack of 3)',
      'Period-Proof Leak Guard Cotton Briefs',
      'Ribbed Cotton Stretch Daily Briefs (Pack of 3)',
      'Seamless Invisible Tanga Panties (Pack of 3)',
      'Mid-Rise Combed Cotton Comfort Panties (Pack of 3)',
      'Ultra-Soft Breathable Modal Thong (Pack of 3)'
    ],
    fabrics: ['Micro-Modal', '100% Organic Cotton', 'Bamboo Viscose'],
    fits: ['Fitted', 'Seamless'],
    occasions: ['Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [599, 1299]
  },
  'ut-shapewear': {
    titles: [
      'High-Waist Tummy & Hip Seamless Body Shaper',
      'Targeted Compression Full Body Shaping Suit',
      'Seamless Thigh Slimmer Shaping Shorts',
      'Saree Shapewear Petticoat with Sturdy Drawstring',
      'Waist Cinch Corset Belt Shaper',
      'Camisole Tummy Control Tank Top Shaper',
      'Backless Body Shaper for Deep V Dresses',
      'Breathable Power Mesh Shaping Briefs',
      'Posture Corrector Upper Body Arm Shaper',
      'Seamless Firm Control High-Waist Briefs'
    ],
    fabrics: ['Nylon Elastane Blend', 'Power Mesh', 'Micro-Modal'],
    fits: ['Targeted Compression Fit'],
    occasions: ['Party Wear', 'Wedding Wear', 'Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [899, 2299]
  },
  'ut-thermal-w': {
    titles: [
      'Heat-Retaining Soft Fleece Thermal Top for Women',
      'Ultra-Thin Seamless Winter Thermal Bottoms for Women',
      'Body-Hugging Cotton Wool Thermal Set for Women',
      'Scoop Neck Invisible Thermal Innerwear for Women',
      'Full Sleeve Bamboo Thermal Top for Women',
      'High-Waist Ankle Length Thermal Leggings for Women',
      'Quilted Thermal Innerwear Top & Bottom Set for Women',
      'Super Soft Brushed Cotton Thermal Top for Women',
      'V-Neck Thermal Camisole Vest for Women',
      'Heavy Winter Woolen Thermal Suite for Women'
    ],
    fabrics: ['Brushed Cotton Fleece', 'Merino Wool Blend', 'Bamboo Thermal Knit'],
    fits: ['Slim Body-Hugging Fit'],
    occasions: ['Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 1899]
  },
  'ut-briefs': {
    titles: [
      'Organic Bamboo Viscose Anti-Odor Boxer Trunks (Pack of 3)',
      'Ultra-Soft Micro-Modal Seamless Briefs (Pack of 3)',
      '100% Combed Cotton Comfort Mid-Rise Briefs (Pack of 3)',
      'Microfiber No-Roll Waistband Trunks (Pack of 2)',
      'Zero-Chafing Performance Athletic Trunks (Pack of 2)',
      'Ribbed Cotton Stretch Daily Briefs (Pack of 3)',
      'Contour Pouch Stretch Micro-Modal Trunks (Pack of 3)',
      'Eco-Friendly Modal Soft Hipster Briefs (Pack of 3)',
      'Seamless Stretch Cotton Trunks (Pack of 3)',
      'Active Mesh Breathable Sports Briefs (Pack of 2)'
    ],
    fabrics: ['Organic Bamboo Viscose', 'Micro-Modal Spandex', 'Combed Cotton'],
    fits: ['Trunk Fit', 'Brief Fit'],
    occasions: ['Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 1599]
  },
  'ut-boxers': {
    titles: [
      '100% Woven Cotton Button-Fly Boxers (Pack of 3)',
      'Combed Cotton Ribbed Gym Sleeveless Inner Vests (Pack of 3)',
      'Micro-Modal Ultra-Soft Lounge Sleep Boxers',
      'Anti-Odor Cotton Sleeveless Vests (Pack of 3)',
      'Printed Cotton Relaxed Comfort Boxers (Pack of 2)',
      'Deep V-Neck Invisible Cotton Vests (Pack of 3)',
      'Chambray Woven Cotton Casual Boxers',
      'Ribbed Athletic Tank Vests (Pack of 3)',
      'Organic Cotton Printed Comfort Boxers (Pack of 2)',
      'Breathable Bamboo Viscose Muscle Vests (Pack of 2)'
    ],
    fabrics: ['100% Woven Cotton', 'Combed Cotton Rib', 'Micro-Modal'],
    fits: ['Relaxed Fit', 'Fitted Vest'],
    occasions: ['Everyday Basics', 'Active & Loungewear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [699, 1399]
  },
  'ut-thermal-m': {
    titles: [
      'Heat-Retaining Soft Fleece Thermal Top for Men',
      'Ultra-Thin Seamless Winter Thermal Bottoms for Men',
      'Body-Hugging Cotton Wool Thermal Set for Men',
      'V-Neck Invisible Thermal Innerwear Top for Men',
      'Full Sleeve Bamboo Thermal Top for Men',
      'Ankle Length Soft Stretch Thermal Long Johns for Men',
      'Quilted Heavy Winter Thermal Top & Bottom Set for Men',
      'Super Soft Brushed Cotton Thermal Sleeveless Vest for Men',
      'Merino Wool Blend Executive Thermal Set for Men',
      'Ribbed Thermal Innerwear Suite for Men'
    ],
    fabrics: ['Brushed Cotton Fleece', 'Merino Wool Blend', 'Bamboo Thermal Knit'],
    fits: ['Slim Body-Hugging Fit'],
    occasions: ['Everyday Basics'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    imagePool: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    basePriceRange: [799, 1999]
  }
};

const brandsMap: Record<string, string> = {
  'b1': 'Terra Ethnic',
  'b2': 'Clay Urban',
  'b3': 'Bare Essentials',
  'b4': 'Velour Men',
  'b5': 'Aura Kids'
};

const colorsList = [
  { name: 'Rose Clay', hex: '#C0654B' },
  { name: 'Peach Coral', hex: '#E09F87' },
  { name: 'Royal Navy', hex: '#1B2A4A' },
  { name: 'Golden Olive', hex: '#808000' },
  { name: 'Dusty Rose', hex: '#D8A0A6' },
  { name: 'Midnight Charcoal', hex: '#2F4F4F' },
  { name: 'Beige Cream', hex: '#F5F5DC' },
  { name: 'Earthy Clay', hex: '#A0522D' },
  { name: 'Emerald Green', hex: '#046307' },
  { name: 'Classic Black', hex: '#1A1A1A' }
];

const tagsPool: ProductTag[][] = [
  ['bestseller', 'trending'],
  ['new_arrival', 'trending'],
  ['online_exclusive', 'bestseller'],
  ['sale', 'value_pack'],
  ['bestseller', 'curves_plus_size'],
  ['new_arrival', 'online_exclusive']
];

const sareeCustomProducts = [
  {
    title: 'Peach Pink Banarasi Silk Brocade Saree',
    image: '/src/assets/images/saree_pink_banarasi_1785747438425.jpg',
    fabric: 'Banarasi Silk',
    colorName: 'Peach Pink',
    colorHex: '#E09F87',
    description: 'An exquisite Peach Pink Banarasi Silk Saree featuring elaborate gold zari brocade work and borders. Beautifully crafted with traditional floral motifs, making it perfect for weddings and bridal occasions.'
  },
  {
    title: 'Modern Patchwork Printed Multicolor Designer Saree',
    image: '/src/assets/images/saree_multicolor_patchwork_1785747468827.jpg',
    fabric: 'Poly Crepe Silk',
    colorName: 'Multicolor Black',
    colorHex: '#1A1A1A',
    description: 'A striking contemporary designer saree with an artistic multicolor printed patchwork pattern and a contrasting solid black border. Features abstract geometric layouts that offer a bold, modern twist on classic style.'
  },
  {
    title: 'Deep Teal Blue Floral Print Chiffon Saree',
    image: '/src/assets/images/saree_teal_floral_1785747500610.jpg',
    fabric: 'Pure Chiffon Georgette',
    colorName: 'Teal Blue',
    colorHex: '#1E5E70',
    description: 'A premium lightweight deep teal blue chiffon saree adorned with vibrant orange, rust, and yellow floral motifs. Pairs beautifully with a gold designer blouse for an elegant and comfortable evening wear experience.'
  },
  {
    title: 'Minimalist Navy Checked Handloom Cotton Silk Saree',
    image: '/src/assets/images/saree_checked_blue_1785747524321.jpg',
    fabric: 'Handloom Cotton Silk',
    colorName: 'Navy Blue',
    colorHex: '#1B2A4A',
    description: 'A minimalist navy and slate grey checked handloom cotton silk saree with sleek, clean borders. Perfect for professional office wear, casual gatherings, or those who appreciate refined handloom elegance.'
  },
  {
    title: 'Traditional Red & Teal Geometric Patola Silk Saree',
    image: '/src/assets/images/saree_pink_teal_patola_1785747548598.jpg',
    fabric: 'Patola Silk',
    colorName: 'Coral Red & Teal',
    colorHex: '#C0654B',
    description: 'A stunning traditional Patola silk saree featuring a vibrant coral red body, high-contrast teal green pallu, and exquisite geometric motifs. Embellished with classic golden zari borders.'
  },
  {
    title: 'Royal Plum Banarasi Silk Zari Saree',
    image: '/src/assets/images/saree_purple_banarasi_1785747571080.jpg',
    fabric: 'Banarasi Pure Silk',
    colorName: 'Royal Plum',
    colorHex: '#4A154B',
    description: 'A luxurious royal plum Banarasi pure silk saree intricately woven with gold brocade floral motifs (booties) and a heavy elaborate pallu. A masterpiece of traditional Indian artistry, perfect for heritage festivals.'
  },
  {
    title: 'Lavender Lilac Hand Embroidered Silver Zari Saree',
    image: '/src/assets/images/saree_lilac_embroidered_1785747592185.jpg',
    fabric: 'Premium Organza Silk',
    colorName: 'Lavender Lilac',
    colorHex: '#D8A0A6',
    description: 'A breathtaking dusty lavender lilac silk saree featuring delicate hand-embroidered silver zari floral motifs. Highly detailed craftsmanship offers a soft, enchanting shimmer perfect for receptions and cocktail parties.'
  },
  {
    title: 'Mustard Gold Kanjeevaram Silk Wedding Saree',
    image: '/src/assets/images/saree_mustard_gold_1785747615679.jpg',
    fabric: 'Pure Kanjeevaram Silk',
    colorName: 'Mustard Gold',
    colorHex: '#E6A11E',
    description: 'A heavy metallic mustard gold Kanjeevaram silk saree adorned with rich traditional gold zari work and a contrast deep emerald green border. Designed for brides and grand festive drapes.'
  },
  {
    title: 'Emerald Green Imperial All-Over Gold Brocade Saree',
    image: '/src/assets/images/saree_emerald_green_1785747638539.jpg',
    fabric: 'Imperial Silk',
    colorName: 'Emerald Green',
    colorHex: '#046307',
    description: 'An imperial-grade emerald green Banarasi silk saree featuring an all-over intricate gold floral brocade. Heavily detailed work covers the entire drape, radiating majestic traditional luxury.'
  },
  {
    title: 'Royal Blue Banarasi Silk Saree with Animal Zari Motifs',
    image: '/src/assets/images/saree_blue_animal_motifs_1785747658359.jpg',
    fabric: 'Royal Silk',
    colorName: 'Royal Blue',
    colorHex: '#1B2A4A',
    description: 'A striking royal blue Banarasi silk saree woven with traditional gold and silver zari animal motifs including elephants and horses, completed with a solid gold border. Perfect for modern luxury styling.'
  }
];

const salwarCustomProducts = [
  {
    title: 'Turquoise Georgette Gold Embroidered Churidar Suit',
    image: '/src/assets/images/salwar_turquoise_gold_1785766221424.jpg',
    fabric: 'Faux Georgette',
    colorName: 'Turquoise Blue',
    colorHex: '#40E0D0',
    description: 'An elegant turquoise georgette salwar kameez suit. Features a long-sleeved sheer kameez heavily adorned with intricate gold floral embroidery on the body and hem. Complete with solid matching slim-fit churidar pants and a draped sheer net dupatta.'
  },
  {
    title: 'Emerald Green Silk Salwar Suit with Royal Dupatta',
    image: '/src/assets/images/salwar_emerald_zari_1785766234772.jpg',
    fabric: 'Art Silk',
    colorName: 'Emerald Green',
    colorHex: '#50C878',
    description: 'An exquisite emerald green premium art silk salwar suit featuring gold thread zari embroidery on the neckline, sleeve cuffs, and border. Accompanied by a heavy navy blue and green contrast dupatta adorned with rich diamond-patterned embroidery and fine gold lace borders.'
  },
  {
    title: 'Deep Teal Blue Silk Kameez with Multi-Color Embroidery',
    image: '/src/assets/images/salwar_teal_multicolor_1785766245694.jpg',
    fabric: 'Premium Raw Silk',
    colorName: 'Teal Blue',
    colorHex: '#008080',
    description: 'A striking deep teal blue silk salwar suit featuring dense, vibrant multicolored floral and paisley embroidery across the front of the kameez. Includes matching solid teal pencil pants and a sheer designer georgette dupatta with matching borders.'
  },
  {
    title: 'Sleeveless Ivory Kurta with Indigo Block-Print Palazzo Set',
    image: '/src/assets/images/salwar_ivory_indigo_1785766255883.jpg',
    fabric: 'Mulmul Cotton',
    colorName: 'Ivory & Indigo',
    colorHex: '#F0EAD6',
    description: 'A light, breathable sleeveless ivory off-white straight-cut kurta paired with flared navy blue block-print palazzo pants. Styled with a matching sheer block-printed dupatta, perfect for a relaxed yet classic ethnic summer vibe.'
  },
  {
    title: 'Beige & Maroon Traditional Embroidered Sharara Suit Set',
    image: '/src/assets/images/salwar_beige_maroon_1785766268496.jpg',
    fabric: 'Chanderi Silk',
    colorName: 'Cream Beige',
    colorHex: '#F5F5DC',
    description: 'A grand traditional Chanderi silk salwar kameez in elegant cream beige, detailed with heavy gold mirror-work embroidery on the yoke. Paired with flared, wide-leg sharara pants adorned with dark maroon and red patterns and a heavy maroon border dupatta.'
  },
  {
    title: 'Classic Indigo Blue Hand-Block Printed Cotton Suit',
    image: '/src/assets/images/salwar_indigo_block_1785766285220.jpg',
    fabric: '100% Pure Cotton',
    colorName: 'Indigo Blue',
    colorHex: '#4B0082',
    description: 'A beautiful everyday straight kurta set in deep indigo blue cotton. Features traditional white floral handblock prints, matching slim-fit straight-cut printed pants, and a super soft, lightweight printed cotton dupatta.'
  },
  {
    title: 'Peach Pink Floral Print Summer Cotton Suit Set',
    image: '/src/assets/images/salwar_peach_floral_1785766297402.jpg',
    fabric: 'Cambric Cotton',
    colorName: 'Peach Pink',
    colorHex: '#FFDAB9',
    description: 'A refreshing summer cotton straight kurta set featuring delicate pastel coral peach floral handblock prints. Paired with comfortable white printed cotton pants and a semi-sheer peach shaded cotton dupatta with floral trims.'
  },
  {
    title: 'Lavender Grey Silk Suit with Heavily Embroidered Gold Zari',
    image: '/src/assets/images/salwar_lavender_zari_1785766309295.jpg',
    fabric: 'Banarasi Silk Blend',
    colorName: 'Lavender Grey',
    colorHex: '#BDB5D5',
    description: 'A luxurious lavender-grey silk blend straight salwar kameez featuring heavy gold zari embroidery, zari borders, and intricate hand-beaded detailing on the neckline and sleeves. Finished with a delicate matching net dupatta.'
  },
  {
    title: 'Peacock Blue Silk Suit with Intricate Gold Neck Embroidery',
    image: '/src/assets/images/salwar_peacock_blue_1785766319549.jpg',
    fabric: 'Satin Art Silk',
    colorName: 'Peacock Blue',
    colorHex: '#1E4A68',
    description: 'A royal peacock blue art silk salwar kameez detailed with beautiful gold and pink floral thread embroidery around the neckline. Features matching slim silk cigarette pants and a delicate, semi-sheer printed dupatta.'
  },
  {
    title: 'Sleeveless Pastel Blue Cotton Kurta with Geometric Prints',
    image: '/src/assets/images/salwar_pastel_blue_1785766332662.jpg',
    fabric: 'Fine Lawn Cotton',
    colorName: 'Pastel Blue',
    colorHex: '#ADD8E6',
    description: 'A modern, chic sleeveless straight lawn cotton kurta in soft pastel blue, with an elegant light textured pattern. Styled with slim printed matching pants featuring subtle geometric motifs and a lightweight printed summer dupatta.'
  }
];

const lehengaCustomProducts = [
  {
    title: 'Sky Blue Georgette Peplum Lehenga Choli',
    image: '/src/assets/images/lehenga_turquoise_peplum_1785766546414.jpg',
    fabric: 'Faux Georgette',
    colorName: 'Sky Blue',
    colorHex: '#87CEEB',
    description: 'A beautiful sky blue georgette lehenga choli featuring a peplum-style long top with gold and peacock-themed thread embroidery at the waist. The flared skirt is designed with delicate gold mirror-work borders. Accompanied by a matching sheer georgette dupatta.'
  },
  {
    title: 'Heritage Purple Silk Embroidered Lehenga Set',
    image: '/src/assets/images/lehenga_purple_heritage_1785766566845.jpg',
    fabric: 'Art Silk',
    colorName: 'Heritage Purple',
    colorHex: '#800080',
    description: 'A majestic vibrant purple silk lehenga choli set. The flared skirt features a stunning broad hem border intricately embroidered with traditional trees, deer, and palace architecture. Complete with a matching gold-embroidered crop choli and a matching sheer purple dupatta with beaded lace trims.'
  },
  {
    title: 'Blush Peach Bridal Zari Work Lehenga Choli',
    image: '/src/assets/images/lehenga_peach_bridal_1785766583380.jpg',
    fabric: 'Premium Net & Velvet',
    colorName: 'Blush Peach',
    colorHex: '#FFD1DC',
    description: 'A breathtaking pastel blush peach bridal lehenga choli, heavily adorned with intricate gold zari, silver sequins, and exquisite floral beadwork. Draped with a matching peach dupatta and an additional light mint green sheer net dupatta for a royal wedding look.'
  },
  {
    title: 'Royal Hot Pink Silk Bridal Lehenga Choli',
    image: '/src/assets/images/lehenga_pink_lake_1785766598315.jpg',
    fabric: 'Banarasi Raw Silk',
    colorName: 'Hot Pink',
    colorHex: '#FF69B4',
    description: 'A stunning premium hot pink raw silk bridal lehenga choli. The voluminous skirt is heavily embellished with fine gold and silver zari, metallic beadwork, and traditional paisley motifs. Draped with a sheer hot pink net dupatta featuring broad embellished borders.'
  },
  {
    title: 'Ivory Sequin Chevron Modern Lehenga Set',
    image: '/src/assets/images/lehenga_ivory_sequin_1785766619504.jpg',
    fabric: 'Soft Georgette',
    colorName: 'Ivory White',
    colorHex: '#FFFFFF',
    description: 'A chic, contemporary ivory-colored georgette lehenga set. The flared skirt is covered with glistening silver sequin chevron patterns. Paired with a matching draped off-shoulder cape style blouse styled with long hand-beaded tassels for a dramatic party wear look.'
  },
  {
    title: 'Classic Royal Red Silk Wedding Lehenga Choli',
    image: '/src/assets/images/lehenga_red_royal_1785766641764.jpg',
    fabric: 'Pure Silk',
    colorName: 'Royal Red',
    colorHex: '#E60000',
    description: 'A timeless royal red bridal lehenga choli crafted in premium pure silk. Features a heavily structured skirt embroidered with rich antique gold threadwork, floral zari patterns, and hand-stitched stone embellishments. Accompanied by a matching half-sleeved choli and a draped sheer red dupatta.'
  },
  {
    title: 'Traditional Ivory & Crimson Printed Lehenga Set',
    image: '/src/assets/images/lehenga_maroon_ivory_1785766660616.jpg',
    fabric: '100% Cambric Cotton',
    colorName: 'Ivory & Crimson',
    colorHex: '#FFFDD0',
    description: 'A unique and rustic-chic ivory and crimson lehenga choli set. The ivory cotton flared skirt is adorned with traditional printed green trees, foliage, and red deer motifs along the border. Paired with a contrasting rich crimson red embroidered crop top and a matching sheer dupatta.'
  },
  {
    title: 'Bohemian Black Cotton Lehenga with Mirror Work',
    image: '/src/assets/images/lehenga_black_boho_1785766709516.jpg',
    fabric: 'Pure Cotton',
    colorName: 'Bohemian Black',
    colorHex: '#000000',
    description: 'A fun and stylish modern bohemian black cotton lehenga set. Both the crop top and the flared skirt are adorned with colorful geometric diamond embroidery patterns, traditional mirror-work, and playful multi-colored pom-poms on the hemline, completed with a matching printed black dupatta.'
  },
  {
    title: 'Graceful Ivory White Silk Floral Lehenga Set',
    image: '/src/assets/images/lehenga_ivory_floral_1785766733317.jpg',
    fabric: 'Organza Silk Blend',
    colorName: 'Ivory White',
    colorHex: '#FFFFF0',
    description: 'A sophisticated, lightweight ivory white silk blend lehenga choli. The skirt features graceful, delicate pastel pink and light green floral thread embroidery. Paired with a matching full-sleeved embroidered crop blouse and an elegant matching draped sheer dupatta.'
  },
  {
    title: 'Contemporary Peacock Blue Silk Cape Lehenga Set',
    image: '/src/assets/images/lehenga_teal_cape_v2_1785766796612.jpg',
    fabric: 'Art Silk & Shantoon',
    colorName: 'Peacock Blue',
    colorHex: '#004F6E',
    description: 'An ultra-modern contemporary peacock blue georgette lehenga choli. Features an intricately embroidered gold and pink floral sleeveless crop top paired with a solid flared silk skirt, completed with an elegant long flowy matching blue cape jacket with embroidered borders.'
  }
];

export const anarkaliCustomProducts = [
  {
    title: 'Aqua Turquoise Floral Block-Printed Georgette Anarkali Suit Set',
    image: '/src/assets/images/anarkali_aqua_turquoise_floral.png',
    fabric: 'Georgette & Malmal Cotton',
    colorName: 'Aqua Turquoise',
    colorHex: '#20B2AA',
    description: 'A breathtaking aqua turquoise flared Anarkali suit set featuring all-over traditional floral motif block prints, graceful V-neckline with delicate gold zari border finish, paired with a matching flared palazzo and lightweight sheer organza dupatta with scalloped borders.'
  },
  {
    title: 'Royal Maroon & Gold Bandhani Printed Anarkali Suit with Dupatta',
    image: '/src/assets/images/anarkali_maroon_bandhani_printed.png',
    fabric: 'Chanderi Silk Blend',
    colorName: 'Royal Maroon',
    colorHex: '#800020',
    description: 'An opulent royal maroon Anarkali suit woven with intricate golden Bandhani geometric patterns and embroidered neckline details. Accompanied by matching printed trousers and a cascading silk dupatta with tassel accents.'
  },
  {
    title: 'Dusty Grey & Magenta Floral Designer Organza Anarkali Gown',
    image: '/src/assets/images/anarkali_grey_pink_floral_gown.png',
    fabric: 'Premium Sheer Organza & Silk',
    colorName: 'Dusty Grey',
    colorHex: '#708090',
    description: 'An exquisite dusty grey flared Anarkali gown decorated with vibrant magenta floral prints, featuring a deep scalloped neck with golden embroidery work along the empire waistline and hem. Paired with a delicate grey net dupatta.'
  },
  {
    title: 'Pearl Ivory Sequin & Mirror Work Anarkali Gown Set',
    image: '/src/assets/images/anarkali_ivory_mirror_embroidered.png',
    fabric: 'Soft Rayon Crepe & Georgette',
    colorName: 'Pearl Ivory',
    colorHex: '#FFFFF0',
    description: 'A divine pearl white / ivory flared floor-length Anarkali gown beautifully embellished with delicate mirror hand-work along the round neckline and subtle golden sequin bootis across the flare. Paired with a matching sheer ivory dupatta with gota patti lace.'
  },
  {
    title: 'Deep Teal Green Embroidered Anarkali Suit with Floral Silk Dupatta',
    image: '/src/assets/images/anarkali_teal_green_silk_dupatta.png',
    fabric: 'Raw Silk & Art Silk Dupatta',
    colorName: 'Deep Teal',
    colorHex: '#005A60',
    description: 'A stately deep teal green solid silk Anarkali suit showcasing rich gold thread embroideries along the placket and cuffs. Highlighted by an exquisite contrast floral printed silk dupatta with zari borders and matching narrow trousers.'
  }
];

export const kurtiCustomProducts = [
  {
    title: 'Rose Clay Hand-Embroidered Khadi Cotton Kurti Set',
    image: '/src/assets/images/kurti_rose_clay_hd.png',
    fabric: 'Khadi Cotton',
    colorName: 'Rose Clay',
    colorHex: '#C0654B',
    description: 'An elegant rose clay khadi cotton kurti featuring fine thread embroidery along the front placket, paired with straight pants.'
  },
  {
    title: 'Indigo Blue Chanderi Silk Embroidered Tunic Kurti',
    image: '/src/assets/images/kurti_indigo_silk_hd.png',
    fabric: 'Chanderi Silk',
    colorName: 'Indigo Blue',
    colorHex: '#1F305E',
    description: 'A rich indigo blue Chanderi silk tunic kurti accented with silver embroidery along the mandarin collar and cuffs.'
  },
  {
    title: 'Mint Green Mulmul Printed Daily Kurti Set',
    image: '/src/assets/images/kurti_mint_green_hd.png',
    fabric: 'Mulmul Cotton',
    colorName: 'Mint Green',
    colorHex: '#3EB489',
    description: 'A breathable mint green mulmul cotton daily wear kurti with soft pastel handblock floral prints.'
  },
  {
    title: 'Mustard Yellow Bandhani Print A-Line Kurti Set',
    image: '/src/assets/images/kurti_mustard_bandhani_hd.png',
    fabric: 'Rayon Slub',
    colorName: 'Mustard Yellow',
    colorHex: '#E6A11E',
    description: 'A vibrant mustard yellow A-line kurti with traditional Rajasthani Bandhani prints and quarter sleeves.'
  },
  {
    title: 'White Schiffli Lace Embroidered Cotton Kurti',
    image: '/src/assets/images/kurti_white_schiffli_hd.png',
    fabric: 'Pure Cotton',
    colorName: 'Pure White',
    colorHex: '#FAFAFA',
    description: 'A pristine white Schiffli lace embroidered cotton kurti with delicate eyelet detailing.'
  }
];

export const dressesCustomProducts = [
  {
    title: 'Sunset Multicolored Abstract Off-Shoulder Tiered Maxi Dress',
    image: '/src/assets/images/dress_multicolor_off_shoulder_v2.jpg',
    fabric: 'Lightweight Premium Georgette',
    colorName: 'Sunset Multicolored',
    colorHex: '#FF4500',
    description: 'A vibrant multicolored abstract printed off-shoulder maxi dress with a ruffled smocked neckline, tiered flare hem, and delicate shoulder straps. Perfect for resort vacations, beach getaways, and summer parties.'
  },
  {
    title: 'Royal Black Floral Printed Sweetheart Tiered Midi Dress',
    image: '/src/assets/images/dress_black_floral_sweetheart_v2.jpg',
    fabric: 'Rayon Viscose Blend',
    colorName: 'Royal Black / Gold',
    colorHex: '#1A1A1A',
    description: 'An elegant black flared tiered midi dress featuring rich autumn floral motifs, a sweetheart neckline, half sleeves, and a flattering waistline cut.'
  },
  {
    title: 'Mint & White Floral Tiered Puff-Sleeve Maxi Sundress',
    image: '/src/assets/images/dress_mint_white_tier_maxi_v2.jpg',
    fabric: '100% Georgette & Soft Cotton Lining',
    colorName: 'Mint Teal / Off-White',
    colorHex: '#A2E8DD',
    description: 'A dreamlike mint white tiered maxi sundress covered in botanical floral prints. Styled with puffed short sleeves, a sweetheart neck, and a sweeping tiered flare.'
  },
  {
    title: 'Black & Earth Tone Circular Block-Print Kaftan Maxi Dress',
    image: '/src/assets/images/dress_black_earth_kaftan_maxi.jpg',
    fabric: '100% Artisanal Mulmul Cotton',
    colorName: 'Earth Charcoal / Terracotta',
    colorHex: '#2B2620',
    description: 'A sophisticated dark charcoal kaftan maxi dress decorated with bold terracotta, indigo, and beige circular block prints, detailed border trimming, V-neckline, and an effortless relaxed drape.'
  },
  {
    title: 'Olive Green Tropical Leaf Printed Balloon-Sleeve Maxi Dress',
    image: '/src/assets/images/dress_olive_tropical_leaf.jpg',
    fabric: 'Premium Soft Chiffon',
    colorName: 'Olive Green / Yellow',
    colorHex: '#556B2F',
    description: 'A serene olive green maxi dress embellished with lush tropical leaf and butterfly prints. Highlights long cuffed balloon sleeves, a square neck, and a breezy floor-sweeping silhouette with side pockets.'
  }
];

export const palazzoCustomProducts = [
  {
    title: 'Teal Blue Flared Georgette Sharara Suit Set',
    image: '/src/assets/images/palazzo_teal_sharara_hd.png',
    fabric: 'Georgette Silk',
    colorName: 'Teal Blue',
    colorHex: '#005C53',
    description: 'A graceful teal blue flared georgette sharara set accented with gold zari threadwork and a sheer dupatta.'
  },
  {
    title: 'Mustard Yellow Silk Blend Gotta Patti Sharara Set',
    image: '/src/assets/images/palazzo_mustard_silk_hd.png',
    fabric: 'Silk Blend',
    colorName: 'Mustard Yellow',
    colorHex: '#E6A11E',
    description: 'A festive mustard yellow silk blend sharara kurta set decorated with golden gotta patti lace and border work.'
  },
  {
    title: 'Beige & Maroon Block Print Wide-Leg Palazzo Set',
    image: '/src/assets/images/salwar_beige_maroon_1785766268496.jpg',
    fabric: '100% Cotton',
    colorName: 'Beige Maroon',
    colorHex: '#F5F5DC',
    description: 'A classic beige and maroon block printed wide-leg palazzo set paired with a straight tunic kurta.'
  },
  {
    title: 'Ivory & Indigo Ajrakh Print Sharara Kurta Set',
    image: '/src/assets/images/salwar_indigo_block_1785766285220.jpg',
    fabric: 'Mulmul Cotton',
    colorName: 'Indigo Blue',
    colorHex: '#1F305E',
    description: 'A heritage Ajrakh handblock printed indigo and ivory sharara set with handcrafted tassels.'
  },
  {
    title: 'Pastel Sky Blue Sequined Georgette Palazzo Suit',
    image: '/src/assets/images/salwar_pastel_blue_1785766332662.jpg',
    fabric: 'Pure Georgette',
    colorName: 'Pastel Blue',
    colorHex: '#AEC6CF',
    description: 'A dreamy pastel sky blue georgette palazzo suit with subtle silver sequin highlights.'
  }
];

export const topsCustomProducts = [
  {
    title: 'Satin Silk Button-Down Formal Blouse',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    fabric: 'Satin Silk',
    colorName: 'Champagne Gold',
    colorHex: '#D4AF37',
    description: 'A luxurious champagne gold satin silk button-down blouse featuring a tailored spread collar and elegant cuff detailing. Perfect for formal workwear and evening dinners.'
  },
  {
    title: 'Ribbed Cotton Crop Top with Sweetheart Neck',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    fabric: 'Ribbed Organic Cotton',
    colorName: 'Rose Pink',
    colorHex: '#FFB6C1',
    description: 'A chic rose pink ribbed crop top featuring a feminine sweetheart neckline and soft stretch bodycon fit. Ideal for casual street styling.'
  },
  {
    title: 'Floral Print Chiffon Peplum Top',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Premium Sheer Chiffon',
    colorName: 'Pastel Floral',
    colorHex: '#FFC0CB',
    description: 'A breezy chiffon peplum top adorned with soft pastel floral artwork, elasticated cinched waist, and flutter sleeves.'
  },
  {
    title: 'Puff Sleeve Organic Cotton Casual Top',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Organic Cotton',
    colorName: 'Crisp Ivory White',
    colorHex: '#FFFFF0',
    description: 'A stylish crisp ivory white organic cotton top featuring dramatic puff sleeves and a modern relaxed square neckline.'
  },
  {
    title: 'Wrap Front Linen Cropped Top',
    image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    fabric: 'Natural Linen Blend',
    colorName: 'Sage Green',
    colorHex: '#8FBC8F',
    description: 'A trendy sage green natural linen cropped top featuring a flattering wrap-front tie closure and breathable summer weave.'
  }
];

export const jeansCustomProducts = [
  {
    title: 'High-Rise Wide Leg Vintage Denim Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Rigid Denim Cotton',
    colorName: 'Vintage Washed Blue',
    colorHex: '#4682B4',
    description: 'Classic 90s-inspired vintage washed blue high-rise jeans with a wide-leg silhouette and premium 5-pocket styling.'
  },
  {
    title: 'Slim Fit Ankle Length Stretch Blue Jeans',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    fabric: '98% Cotton 2% Spandex',
    colorName: 'Dark Indigo Blue',
    colorHex: '#1D2A44',
    description: 'An essential dark indigo stretch denim jean engineered with contouring stretch memory for an all-day comfortable slim fit.'
  },
  {
    title: 'Straight Fit Mom Jeans in Washed Indigo',
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Cotton Denim',
    colorName: 'Medium Wash Indigo',
    colorHex: '#2B4C7E',
    description: 'A flattering medium wash straight-leg mom jean with a high-waisted cut and relaxed thigh silhouette.'
  },
  {
    title: 'Distressed Boyfriend Fit Denim Pants',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    fabric: 'Cotton Denim',
    colorName: 'Light Washed Blue',
    colorHex: '#ADD8E6',
    description: 'A relaxed boyfriend-fit light wash denim pant featuring subtle knee distressing and a slouchy cuff hem.'
  },
  {
    title: 'High-Waisted Flare Bell Bottom Jeans',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    fabric: 'Stretch Cotton Denim',
    colorName: 'Midnight Black',
    colorHex: '#111111',
    description: 'Retro 70s-inspired high-waisted bell bottom flare jeans in sleek midnight black with stretch shape retention.'
  }
];

export const trousersCustomProducts = [
  {
    title: 'High-Waisted Tailored Pleated Trousers',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    fabric: 'Polyester Viscose Blend',
    colorName: 'Camel Beige',
    colorHex: '#C19A6B',
    description: 'Sleek executive camel beige pleated front trousers tailored with a high waistband and floor-draping wide-leg cut.'
  },
  {
    title: 'Linen Blend Wide Leg Summer Pants',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    fabric: 'Linen Cotton Blend',
    colorName: 'Sand Cream',
    colorHex: '#F5F5DC',
    description: 'Breezy sand cream linen blend wide-leg trousers featuring an elasticated drawstring waistband for effortless resort styling.'
  },
  {
    title: 'Stretch Crepe Ankle Length Formal Trousers',
    image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80',
    fabric: 'Stretch Crepe',
    colorName: 'Navy Blue',
    colorHex: '#000080',
    description: 'Sophisticated navy blue crepe formal trousers cut in a clean ankle-length taper with slant side pockets.'
  },
  {
    title: 'Paperbag Waist Belted Cotton Trousers',
    image: '/src/assets/images/salwar_beige_maroon_1785766268496.jpg',
    fabric: '100% Cotton Twill',
    colorName: 'Terracotta Rust',
    colorHex: '#B24926',
    description: 'Chic paperbag waist trousers in rich terracotta rust, featuring a fabric D-ring belt and relaxed tapered fit.'
  },
  {
    title: 'Straight Cut Formal Office Wear Pants',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    fabric: 'Structured Poly-Viscose',
    colorName: 'Charcoal Grey',
    colorHex: '#36454F',
    description: 'Classic charcoal grey straight-cut formal office trousers with crease-resistant fabric and concealed zipper closure.'
  }
];

export const coordCustomProducts = [
  {
    title: 'Linen Blazer & High-Waist Wide Leg Trousers Set',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    fabric: 'Linen Viscose Blend',
    colorName: 'Oatmeal Beige',
    colorHex: '#E5D3B3',
    description: 'An elegant two-piece co-ord set featuring a single-breasted linen blazer and matching high-waisted wide-leg trousers.'
  },
  {
    title: 'Printed Satin Crop Top & Flared Pants Co-ord',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    fabric: 'Satin Silk',
    colorName: 'Emerald Green Floral',
    colorHex: '#005C53',
    description: 'A showstopping emerald green floral printed satin co-ord with a wrap crop top and matching high-waist flared pants.'
  },
  {
    title: 'Ribbed Knit Sleeveless Top & Skirt Two-Piece',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Ribbed Knit',
    colorName: 'Mocha Brown',
    colorHex: '#4A3B32',
    description: 'A cozy minimalist mocha brown ribbed knit two-piece set featuring a sleeveless high-neck tank and matching midi column skirt.'
  },
  {
    title: 'Utility Cargo Shirt & Joggers Co-ord Set',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Cotton Twill',
    colorName: 'Khaki Olive',
    colorHex: '#708238',
    description: 'A modern urban utility cargo co-ord featuring an oversized short-sleeve button shirt and matching elasticated cargo joggers.'
  },
  {
    title: 'Floral Chiffon Wrap Top & Palazzo Set',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    fabric: 'Chiffon Silk',
    colorName: 'Pastel Blush',
    colorHex: '#FFB6C1',
    description: 'A romantic pastel blush chiffon co-ord set featuring a bell-sleeve wrap blouse and fluid wide-leg palazzo trousers.'
  }
];

export const skirtsCustomProducts = [
  {
    title: 'Satin High-Waist Midi Bias Skirt',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    fabric: 'Satin Silk',
    colorName: 'Emerald Green',
    colorHex: '#005C53',
    description: 'A silky smooth emerald green bias-cut midi skirt with a lustrous sheen, comfortable hidden elastic waistband, and fluid drape.'
  },
  {
    title: 'Pleated A-Line Chiffon Maxi Skirt',
    image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80',
    fabric: 'Chiffon Georgette',
    colorName: 'Blush Pink',
    colorHex: '#FFB6C1',
    description: 'A romantic blush pink accordion pleated maxi skirt crafted in sheer chiffon georgette with soft satin inner lining.'
  },
  {
    title: 'Denim Front-Slit Straight Midi Skirt',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    fabric: 'Cotton Denim',
    colorName: 'Vintage Washed Blue',
    colorHex: '#4682B4',
    description: 'A trending vintage washed blue denim midi skirt featuring a high front-slit, classic 5-pocket detail, and raw hemline.'
  },
  {
    title: 'Tiered Floral Print Boho Maxi Skirt',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    fabric: 'Lightweight Rayon',
    colorName: 'Terracotta Floral',
    colorHex: '#C0654B',
    description: 'A bohemian terracotta floral printed tiered maxi skirt featuring an elasticated smocked waistband and airy flared silhouette.'
  },
  {
    title: 'Tailored Formal Pencil Skirt',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80',
    fabric: 'Stretch Poly-Viscose',
    colorName: 'Classic Black',
    colorHex: '#111111',
    description: 'A sleek classic black formal pencil skirt cut with a comfortable stretch fit, back slit for movement, and high-waisted waistband.'
  }
];

export const menKurtaCustomProducts = [
  {
    title: 'Teal Green Threadwork Embroidered Silk Kurta Pajama Set',
    image: '/src/assets/images/men_kurta_teal_embroidered.jpg',
    fabric: 'Dupion Silk Blend & Cotton Pajama',
    colorName: 'Royal Teal Green',
    colorHex: '#005C53',
    description: 'An opulent teal green dupion silk straight kurta intricately embroidered with fine geometric threadwork and sequin highlights. Accompanied by a classic white churidar pajama. Perfect for wedding receptions and festive celebrations.'
  },
  {
    title: 'Off-White & Navy Botanical Printed Silk Short Kurta Set',
    image: '/src/assets/images/men_kurta_cream_navy_floral.jpg',
    fabric: 'Raw Silk & Linen Blend',
    colorName: 'Off-White / Navy',
    colorHex: '#F5F5DC',
    description: 'A modern off-white raw silk short kurta decorated with intricate navy blue botanical floral prints, mandarin collar, and buttoned placket. Styled with beige tailored trousers for contemporary festive occasions.'
  },
  {
    title: 'Royal Maroon Mirror-Work Georgette Kurta Pajama Set',
    image: '/src/assets/images/men_kurta_maroon_mirror.jpg',
    fabric: 'Art Silk & Mirror Embroidery',
    colorName: 'Royal Maroon',
    colorHex: '#800020',
    description: 'A majestic royal maroon straight kurta decorated with shimmering handcrafted mirror work and gold thread lattice motifs. Paired with a comfortable white cotton silk pajama. Ideal for Sangeet and Diwali parties.'
  },
  {
    title: 'Ivory Silk Kurta Pajama with Jacquard Nehru Jacket Set',
    image: '/src/assets/images/men_kurta_cream_nehru_jacket.jpg',
    fabric: 'Pure Mulberry Silk & Brocade Jacket',
    colorName: 'Cream Ivory',
    colorHex: '#FFFDD0',
    description: 'A sophisticated 3-piece festive ensemble featuring a pristine cream silk straight kurta, matching churidar pajama, and a luxurious pastel floral woven jacquard Nehru jacket.'
  },
  {
    title: 'Slate Greyish Brown Solid Cotton Kurta Pajama Set',
    image: '/src/assets/images/men_kurta_grey_brown_solid.jpg',
    fabric: '100% Breathable Cotton',
    colorName: 'Slate Greyish Brown',
    colorHex: '#4A4644',
    description: 'A versatile slate greyish brown solid long kurta tailored with a mandarin collar, front chest pocket, and comfortable straight sleeves. Paired with a white cotton pajama for effortless daily and ceremonial wear.'
  }
];

export const menTShirtCustomProducts = [
  {
    title: 'Off-White Long-Sleeve Waffle-Knit Henley T-Shirt',
    image: '/src/assets/images/tshirt_offwhite_henley_long.jpg',
    fabric: '100% Organic Waffle Cotton',
    colorName: 'Off-White / Cream',
    colorHex: '#F5F5DC',
    description: 'A classic off-white long-sleeve Henley t-shirt featuring a 3-button front placket, chest logo embroidery, ribbed cuffs, and soft waffle-knit texture for versatile casual pairing.'
  },
  {
    title: 'Sleek Black Mandarin Collar Short-Sleeve Henley T-Shirt',
    image: '/src/assets/images/tshirt_black_mandarin_henley.jpg',
    fabric: 'Stretch Cotton Spandex',
    colorName: 'Pitch Black',
    colorHex: '#111111',
    description: 'A sharp, modern pitch black short-sleeve Henley tee featuring an executive mandarin collar, buttoned placket, and contoured muscle fit. Perfect for casual evening wear.'
  },
  {
    title: 'Sage Green Half-Zip Athletic Performance Polo T-Shirt',
    image: '/src/assets/images/tshirt_sage_halfzip_polo.jpg',
    fabric: 'Moisture-Wicking Poly-Spandex Blend',
    colorName: 'Sage Green / White',
    colorHex: '#87A96B',
    description: 'An athletic sage green polo t-shirt highlighted with shoulder stripe accents, a sleek half-zip front closure, and lightweight quick-dry breathable performance fabric.'
  },
  {
    title: 'Colorblock Quarter-Zip Active Performance T-Shirt',
    image: '/src/assets/images/tshirt_colorblock_quarterzip_active.jpg',
    fabric: '4-Way Stretch Compression Knit',
    colorName: 'Black & Charcoal',
    colorHex: '#1C1C1C',
    description: 'High-performance active training t-shirt featuring a dynamic colorblocked chest panel, quarter-zip stand collar, long sleeves with thumbholes, and reflective accents for workout sessions.'
  },
  {
    title: 'Dark Chocolate Oversized Graphic Originals Polo T-Shirt',
    image: '/src/assets/images/tshirt_brown_oversized_originals_polo.jpg',
    fabric: 'Heavyweight 240 GSM Cotton Pique',
    colorName: 'Dark Chocolate Brown',
    colorHex: '#3D2314',
    description: 'A trendy streetwear oversized polo t-shirt in rich dark chocolate brown, featuring a contrasting off-white collar, retro Originals cursive script print, and relaxed drop-shoulder cut.'
  }
];

export const menFormalShirtCustomProducts = [
  {
    title: 'Champagne Beige Satin-Cotton Slim-Fit Executive Formal Shirt',
    image: '/src/assets/images/formal_shirt_champagne_cream.jpg',
    fabric: '100% Giza Satin Cotton',
    colorName: 'Champagne Beige',
    colorHex: '#F5F5DC',
    description: 'An executive champagne beige slim-fit formal shirt crafted from lustrous Giza satin cotton. Styled with a stiff cutaway collar, dark contrast buttons, french cuffs, and an anti-crease smooth finish.'
  },
  {
    title: 'Blush Pink Italian Stretch-Cotton Tailored Formal Shirt',
    image: '/src/assets/images/formal_shirt_blush_pink.jpg',
    fabric: 'Italian Stretch Cotton',
    colorName: 'Soft Blush Pink',
    colorHex: '#FFD1DC',
    description: 'A modern tailored blush pink formal shirt featuring a sleek spread collar, buttoned front, and 2-way stretch comfort weave designed for corporate wear and evening galas.'
  },
  {
    title: 'Deep Wine Burgundy Premium Twill Cotton Formal Shirt',
    image: '/src/assets/images/formal_shirt_deep_burgundy.jpg',
    fabric: '100% Premium Twill Cotton',
    colorName: 'Deep Wine Burgundy',
    colorHex: '#5C061C',
    description: 'A rich wine burgundy executive formal shirt featuring a classic point collar, mother-of-pearl buttons, and structured breathable twill weave suitable for boardroom presentations.'
  },
  {
    title: 'Royal Blue Solid Pure-Cotton Regular-Fit Formal Shirt',
    image: '/src/assets/images/formal_shirt_royal_blue.jpg',
    fabric: '100% Pure Egyptian Cotton',
    colorName: 'Royal Blue',
    colorHex: '#003399',
    description: 'A timeless royal blue formal shirt tailored in a comfortable regular fit with a sharp spread collar, single chest pocket, and durable double-stitched seams.'
  },
  {
    title: 'Deep Teal Blue Micro-Textured Oxford Formal Shirt',
    image: '/src/assets/images/formal_shirt_teal_blue.jpg',
    fabric: 'Micro-Textured Oxford Cotton',
    colorName: 'Deep Teal Blue',
    colorHex: '#005F73',
    description: 'A distinctive deep teal blue formal shirt made from breathable micro-textured Oxford cotton, featuring a semi-cutaway collar and polished corporate drape.'
  }
];

export const menBriefsCustomProducts = [
  {
    title: 'Maroon Premium Cotton Stretch Comfort Trunk',
    image: '/src/assets/images/briefs_maroon_ramraj_trunk.jpg',
    fabric: '95% Combed Cotton 5% Elastane',
    colorName: 'Maroon Red',
    colorHex: '#800020',
    description: 'A premium maroon cotton stretch trunk featuring an ultra-soft woven elastic waistband, contoured pouch for support, and anti-chafing leg openings for all-day active comfort.'
  },
  {
    title: 'White & Navy Geometric Micro-Print Cotton Brief',
    image: '/src/assets/images/briefs_white_navy_print_brief.jpg',
    fabric: '100% Breathable Combed Cotton',
    colorName: 'White / Navy Printed',
    colorHex: '#F5F5DC',
    description: 'A comfortable white cotton brief decorated with subtle navy blue geometric lattice prints, featuring a plush micro-fiber elastic waistband and snug ergonomic support.'
  },
  {
    title: 'Solid Midnight Black Stretch-Cotton Hipster Trunk',
    image: '/src/assets/images/briefs_black_jack_jones_trunk.jpg',
    fabric: '95% Organic Cotton 5% Spandex',
    colorName: 'Midnight Black',
    colorHex: '#111111',
    description: 'An essential midnight black hipster trunk crafted with 4-way stretch memory, jacquard brand elastic waistband, flatlock seams, and breathable moisture-wicking technology.'
  },
  {
    title: 'Premium Stretch Cotton Athletic Trunks (Multi-Pack)',
    image: '/src/assets/images/briefs_uspolo_black_trunk.jpg',
    fabric: 'Super Combed Organic Cotton',
    colorName: 'Solid Black & Charcoal',
    colorHex: '#1C1C1C',
    description: 'A value pack of premium stretch cotton trunks designed with a non-roll Jacquard elastic waistband, mid-thigh length, and zero-tag label for irritation-free daily wear.'
  },
  {
    title: 'Graffiti & Tropical Printed Satin-Finish Trunks (3-Pack)',
    image: '/src/assets/images/briefs_brogift_printed_trunks.jpg',
    fabric: 'Ultra-Soft Micro-Modal Satin Blend',
    colorName: 'Multicolor Printed',
    colorHex: '#2B2B2B',
    description: 'A trendy 3-pack set of graphic abstract, typography, and tropical printed trunks featuring an ultra-soft satin finish, wide elastic logo band, and smooth seamless back.'
  }
];

export const boysTShirtCustomProducts = [
  {
    title: 'Bio-Wash Organic Cotton Printed Boys T-Shirt',
    image: '/src/assets/images/boys_biowash_cotton_tshirt.png',
    secondaryImage: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Bio-Wash Organic Cotton',
    colorName: 'Royal Cobalt Blue',
    colorHex: '#1E40AF',
    description: 'An ultra-soft 100% bio-wash organic cotton printed t-shirt for boys, designed with hypoallergenic breathable fibers, vibrant non-toxic prints, and double-stitched durability for everyday play.'
  },
  {
    title: 'Colorblock Cotton Pique Boys Polo Shirt',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
    secondaryImage: '/src/assets/images/boys_biowash_cotton_tshirt.png',
    fabric: 'Cotton Pique',
    colorName: 'Navy / Mustard',
    colorHex: '#1E293B',
    description: 'A smart colorblock cotton pique polo shirt for boys featuring a ribbed collar, two-button placket, and comfortable regular fit.'
  },
  {
    title: 'Superhero Graphic Printed Cotton Boys Tee',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    fabric: 'Combed Cotton',
    colorName: 'Crimson Red',
    colorHex: '#DC2626',
    description: 'Fun and vibrant graphic printed cotton crewneck tee for boys. Made from breathable combed cotton for all-day comfort.'
  },
  {
    title: 'Striped Cotton Full Sleeve Boys T-Shirt',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Cotton',
    colorName: 'Olive / White',
    colorHex: '#475569',
    description: 'Classic nautical striped full-sleeve t-shirt crafted in pure cotton knit, providing warmth and effortless everyday style.'
  },
  {
    title: 'Pack of 3 Bio-Wash Cotton Crewneck Boys Tees',
    image: 'https://images.unsplash.com/photo-1471286174240-e6458fe7d4a4?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1505371796105-89db7880b749?auto=format&fit=crop&w=800&q=80',
    fabric: '100% Bio-Wash Cotton',
    colorName: 'Multicolor Pack',
    colorHex: '#0284C7',
    description: 'Value pack of 3 super soft bio-washed cotton crewneck tees in versatile solid colors, designed for durability and easy washing.'
  }
];

export const womenBrasCustomProducts = [
  {
    title: 'Micro-Modal Ultra-Soft Everyday T-Shirt Bra',
    image: '/src/assets/images/tshirt_bra_micromodal.png',
    secondaryImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    fabric: 'Ultra-Soft Micro-Modal & Elastane',
    colorName: 'Nude / Rose Beige',
    colorHex: '#E2BCAD',
    description: 'An ultra-soft micro-modal seamless T-shirt bra featuring smooth 3D memory foam contour cups, wirefree all-day comfort, non-slip adjustable straps, and invisible laser-cut side wings.'
  },
  {
    title: 'Seamless Contour Wirefree Memory Foam Bra',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    secondaryImage: '/src/assets/images/tshirt_bra_micromodal.png',
    fabric: 'Seamless Stretch Nylon Blend',
    colorName: 'Soft Blush Pink',
    colorHex: '#FFB6C1',
    description: 'Lightweight wirefree contour bra with molded memory foam cups providing natural lift and zero irritation.'
  },
  {
    title: 'High Impact Breathable Fitness Sports Bra',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Moisture-Wicking Power Stretch',
    colorName: 'Charcoal / Coral',
    colorHex: '#36454F',
    description: 'High-impact racerback sports bra engineered with breathable mesh inserts, wide supportive elastic underband, and removable padding.'
  },
  {
    title: 'Invisible Laser-Cut Strapless Multiway Bra',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    fabric: 'Laser-Cut Microfiber',
    colorName: 'Classic Onyx Black',
    colorHex: '#1C1C1C',
    description: 'Versatile strapless multiway contour bra featuring anti-slip silicone lining, detachable convertible straps, and seamless invisible edges.'
  },
  {
    title: 'Lace Bralette with Soft Removable Cups',
    image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    fabric: 'Scalloped Floral Lace',
    colorName: 'Elegance Ivory',
    colorHex: '#FFFFF0',
    description: 'Romantic scalloped floral lace bralette designed with deep plunge V-neckline, soft stretch elastic underband, and removable contour cups.'
  }
];

// --- DYNAMIC CATALOG IMAGE & DESCRIPTION GENERATORS ---
const ethnicImageIds = [
  'photo-1610030469983-98e550d6193c',
  'photo-1583391733956-3750e0ff4e8b',
  'photo-1631856955106-93a8d8e3cc8b',
  'photo-1605721911519-3dfeb3be25e7'
];

const westernImageIds = [
  'photo-1490481651871-ab68de25d43d',
  'photo-1496747611176-843222e1e57c',
  'photo-1515886657613-9f3515b0c78f',
  'photo-1539109136881-3be0616acf4b',
  'photo-1485230895905-ec40ba36b9bc',
  'photo-1509631179647-0177331693ae',
  'photo-1529139574466-a303027c1d8b',
  'photo-1554412933-514a83d2f3c8',
  'photo-1541099649105-f69ad21f3246',
  'photo-1578587018452-892bacefd3f2'
];

const menEthnicImageIds = [
  'photo-1617137968427-85924c800a22',
  'photo-1602810318383-e386cc2a3ccf',
  'photo-1618220179428-22790b461013',
  'photo-1624378439575-d8705ad7ae80',
  'photo-1507679799987-c73779587ccf',
  'photo-1553211166-0e1a845b08b7',
  'photo-1605518216938-7c31b7b14ad0',
  'photo-1607990283143-e81e7a2c93ab',
  'photo-1594938298603-c8148c4dae35',
  'photo-1505022610485-0249ba5b3675'
];

const menWesternImageIds = [
  'photo-1617137968427-85924c800a22',
  'photo-1507679799987-c73779587ccf',
  'photo-1521572267360-ee0c2909d518',
  'photo-1602810318383-e386cc2a3ccf',
  'photo-1594938298603-c8148c4dae35',
  'photo-1598033129183-c4f50c736f10',
  'photo-1620012253295-c05518e993be',
  'photo-1479064555552-3ef4979f8908',
  'photo-1489987707025-afc232f7ea0f',
  'photo-1541099649105-f69ad21f3246'
];

const kidsImageIds = [
  'photo-1503944583220-79d8926ad5e2',
  'photo-1503944583220-79d8926ad5e2',
  'photo-1518831959646-742c3a14ebf7',
  'photo-1522771739844-6a9f6d5f14af',
  'photo-1471286174240-e6458fe7d4a4',
  'photo-1519689680058-324335c77ebe',
  'photo-1596870230751-ebdf1ab8612f',
  'photo-1505371796105-89db7880b749',
  'photo-1611428185603-19a0a99ff11e',
  'photo-1519457431-44ccd64a579b'
];

const innerImageIds = [
  'photo-1522337360788-8b13dee7a37e',
  'photo-1518611012118-696072aa579a',
  'photo-1544367567-0f2fcb009e0b',
  'photo-1515886657613-9f3515b0c78f',
  'photo-1506152983158-b4a74a01c721',
  'photo-1582562124811-c09040d0a901',
  'photo-1607990283143-e81e7a2c93ab',
  'photo-1521572267360-ee0c2909d518',
  'photo-1485230895905-ec40ba36b9bc',
  'photo-1578587018452-892bacefd3f2'
];

function getCustomImage(typeId: string, index: number, isSecondary: boolean): string {
  let pool = westernImageIds;
  let offset = 0;

  if (typeId.startsWith('wt-')) {
    if (['wt-saree', 'wt-salwar', 'wt-lehenga', 'wt-anarkali', 'wt-kurti', 'wt-palazzo'].includes(typeId)) {
      pool = ethnicImageIds;
      offset = typeId.charCodeAt(3) || 0;
    } else if (['wt-bras', 'wt-panties', 'wt-shapewear'].includes(typeId)) {
      pool = innerImageIds;
      offset = typeId.charCodeAt(3) || 0;
    } else {
      pool = westernImageIds;
      offset = typeId.charCodeAt(3) || 0;
    }
  } else if (typeId.startsWith('mt-')) {
    if (['mt-kurta', 'mt-sherwani', 'mt-nehru'].includes(typeId)) {
      pool = menEthnicImageIds;
      offset = typeId.charCodeAt(3) || 0;
    } else if (['mt-briefs', 'mt-boxers', 'mt-loungewear'].includes(typeId)) {
      pool = innerImageIds;
      offset = typeId.charCodeAt(3) || 0;
    } else {
      pool = menWesternImageIds;
      offset = typeId.charCodeAt(3) || 0;
    }
  } else if (typeId.startsWith('kt-')) {
    pool = kidsImageIds;
    offset = typeId.charCodeAt(3) || 0;
  } else if (typeId.startsWith('ut-')) {
    pool = innerImageIds;
    offset = typeId.charCodeAt(3) || 0;
  }

  const idx = (index + (isSecondary ? 1 : 0) + offset) % pool.length;
  const photoId = pool[idx];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
}

function getCustomDescription(title: string, fabric: string, fit: string, occasion: string, colorName: string, typeId: string): string {
  const cName = colorName || 'Standard';
  if (typeId === 'wt-saree') {
    return `An exquisite saree featuring premium ${fabric}. Meticulously styled with a classical ${fit} for an elegant look. Ideal for ${occasion} and festivals.`;
  }
  
  if (typeId === 'wt-salwar') {
    return `Elevate your ethnic grace with this stunning ${title} in a beautiful ${cName} shade. Tailored from premium ${fabric} and designed in a relaxed ${fit}, this suit set features high-end embroidery. Perfect for ${occasion} celebrations.`;
  }
  if (typeId === 'wt-lehenga') {
    return `A masterpiece of celebratory elegance, this ${title} captures the grandeur of royal Indian couture. Woven with luxurious ${fabric} in ${cName}, it features a majestic ${fit} that drapes like a dream, ideal for ${occasion}.`;
  }
  if (typeId === 'wt-anarkali') {
    return `Command absolute attention in this breathtaking ${title}. This flared masterpiece is meticulously tailored in premium ${fabric} and finished in a rich ${cName} colorway. Styled with a sweepy ${fit} for ${occasion}.`;
  }
  if (typeId === 'wt-kurti') {
    return `A gorgeous blend of daily comfort and elegant design, this ${title} is a must-have. Crafted in lightweight ${fabric} and a fresh ${cName} hue, this comfortable ${fit} tunic is perfect for ${occasion}.`;
  }
  if (typeId === 'wt-palazzo') {
    return `Step out in effortless grace with this chic ${title}. Featuring a comfortable, breathable wide-leg ${fit} in a beautiful ${cName} finish. Made from premium ${fabric}, perfect for styled ${occasion} looks.`;
  }
  if (typeId.startsWith('wt-') && ['wt-dresses', 'wt-tops', 'wt-skirts', 'wt-coord'].includes(typeId)) {
    return `Indulge in modern sophistication with this premium ${title} in a stunning ${cName} colorway. Beautifully cut from premium ${fabric} with a flattering ${fit} designed for ${occasion}.`;
  }
  if (typeId.startsWith('wt-') && ['wt-blazers', 'wt-formal-shirts', 'wt-trousers'].includes(typeId)) {
    return `Crafted for the modern corporate leader, this sleek ${title} features a crisp, tailored ${fit} in an executive ${cName} shade. Made from structural ${fabric}, perfect for formal ${occasion}.`;
  }
  if (typeId.startsWith('mt-') && ['mt-kurta', 'mt-sherwani', 'mt-nehru'].includes(typeId)) {
    return `Drape yourself in classic heritage with this premium ${title}. Woven from luxurious ${fabric} in a royal ${cName} tone. This sharp ${fit} outfit is perfect for ${occasion} and traditional gatherings.`;
  }
  if (typeId.startsWith('mt-') && ['mt-shirts', 'mt-tshirts', 'mt-jeans', 'mt-chinos', 'mt-shorts'].includes(typeId)) {
    return `Upgrade your casual rotation with this smart ${title} in ${cName}. Made from lightweight, breathable ${fabric} in a versatile ${fit}, ideal for ${occasion} and everyday urban wear.`;
  }
  if (typeId.startsWith('mt-') && ['mt-formal-shirts', 'mt-formal-trousers', 'mt-suits'].includes(typeId)) {
    return `Sleek, sharp, and business-ready, this ${title} is tailored in a structured ${fit} from premium Italian-finish ${fabric}. Designed in an executive ${cName} shade, perfect for high-stakes ${occasion}.`;
  }
  if (typeId.startsWith('kt-')) {
    return `Keep your little one looking adorable and feeling super cozy with this ${title}. Meticulously crafted from ultra-soft, hypoallergenic ${fabric} in a playful ${cName} shade with an easy ${fit} for play.`;
  }
  if (typeId.endsWith('bras') || typeId.endsWith('panties') || typeId.endsWith('shapewear') || typeId.includes('briefs') || typeId.includes('boxers') || typeId.includes('thermal')) {
    return `Experience second-skin comfort with this premium ${title}. Crafted from ultra-soft, breathable ${fabric} in a classic ${cName} shade. Features flat-lock seams and a flexible ${fit} for everyday comfort.`;
  }

  return `An exquisite ${title} styled in an elegant ${cName} colorway. Meticulously crafted from high-grade ${fabric} in a refined ${fit} that blends sleek aesthetics with everyday durability, perfect for ${occasion}.`;
}

export function generateFullCatalogProducts(categories: Category[]): Product[] {
  const generatedProducts: Product[] = [];

  let count = 100;

  for (const cat of categories) {
    for (const sub of cat.subcategories || []) {
      for (const typeItem of sub.types || []) {
        const isAnarkali = typeItem.id === 'wt-anarkali';
        const isKurti = typeItem.id === 'wt-kurti';
        const isPalazzo = typeItem.id === 'wt-palazzo';
        const isMenKurta = typeItem.id === 'mt-kurta';
        const isMenTShirt = typeItem.id === 'mt-tshirts';
        const isMenFormalShirt = typeItem.id === 'mt-formal-shirts';
        const isMenBriefs = typeItem.id === 'mt-briefs';
        const isWesternType = ['wt-dresses', 'wt-tops', 'wt-jeans', 'wt-trousers', 'wt-coord', 'wt-skirts'].includes(typeItem.id);
        const meta = typeMetadata[typeItem.id] || {
          titles: Array.from({ length: 10 }, (_, i) => `${typeItem.name} Style ${i + 1}`),
          fabrics: ['Premium Cotton', 'Silk Blend', 'Linen Blend'],
          fits: ['Regular Fit', 'Slim Fit'],
          occasions: ['Casual Wear', 'Festive Wear', 'Work Wear'],
          sizes: ['S', 'M', 'L', 'XL'],
          imagePool: [sub.image || cat.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'],
          basePriceRange: [999, 2999]
        };

        // Pick brand according to category
        let brandId = 'b1';
        if (cat.id === 'men') brandId = 'b4';
        else if (cat.id === 'kids') brandId = 'b5';
        else if (cat.id === 'undergarments') brandId = 'b3';
        else if (sub.id.includes('western')) brandId = 'b2';

        const isBoysTShirt = typeItem.id === 'kt-b-tshirts';
        const isBras = typeItem.id === 'ut-bras' || typeItem.id === 'wt-bras';
        const itemCount = (isAnarkali || isKurti || isPalazzo || isWesternType || isMenKurta || isMenTShirt || isMenFormalShirt || isMenBriefs || isBoysTShirt || isBras) ? 5 : 10;
        for (let i = 0; i < itemCount; i++) {
          count++;
          const prodId = `prod_${typeItem.id}_${i + 1}`;
          
          const isSaree = typeItem.id === 'wt-saree';
          const sareeOverride = isSaree ? sareeCustomProducts[i % sareeCustomProducts.length] : null;

          const isSalwar = typeItem.id === 'wt-salwar';
          const salwarOverride = isSalwar ? salwarCustomProducts[i % salwarCustomProducts.length] : null;

          const isLehenga = typeItem.id === 'wt-lehenga';
          const lehengaOverride = isLehenga ? lehengaCustomProducts[i % lehengaCustomProducts.length] : null;

          const isAnarkali = typeItem.id === 'wt-anarkali';
          const anarkaliOverride = isAnarkali ? anarkaliCustomProducts[i % anarkaliCustomProducts.length] : null;

          const isKurti = typeItem.id === 'wt-kurti';
          const kurtiOverride = isKurti ? kurtiCustomProducts[i % kurtiCustomProducts.length] : null;

          const isPalazzo = typeItem.id === 'wt-palazzo';
          const palazzoOverride = isPalazzo ? palazzoCustomProducts[i % palazzoCustomProducts.length] : null;

          const isDresses = typeItem.id === 'wt-dresses';
          const dressesOverride = isDresses ? dressesCustomProducts[i % dressesCustomProducts.length] : null;

          const isTops = typeItem.id === 'wt-tops';
          const topsOverride = isTops ? topsCustomProducts[i % topsCustomProducts.length] : null;

          const isJeans = typeItem.id === 'wt-jeans';
          const jeansOverride = isJeans ? jeansCustomProducts[i % jeansCustomProducts.length] : null;

          const isTrousers = typeItem.id === 'wt-trousers';
          const trousersOverride = isTrousers ? trousersCustomProducts[i % trousersCustomProducts.length] : null;

          const isCoord = typeItem.id === 'wt-coord';
          const coordOverride = isCoord ? coordCustomProducts[i % coordCustomProducts.length] : null;

          const isSkirts = typeItem.id === 'wt-skirts';
          const skirtsOverride = isSkirts ? skirtsCustomProducts[i % skirtsCustomProducts.length] : null;

          const menKurtaOverride = isMenKurta ? menKurtaCustomProducts[i % menKurtaCustomProducts.length] : null;

          const menTShirtOverride = isMenTShirt ? menTShirtCustomProducts[i % menTShirtCustomProducts.length] : null;

          const menFormalShirtOverride = isMenFormalShirt ? menFormalShirtCustomProducts[i % menFormalShirtCustomProducts.length] : null;

          const menBriefsOverride = isMenBriefs ? menBriefsCustomProducts[i % menBriefsCustomProducts.length] : null;

          const isBoysTShirt = typeItem.id === 'kt-b-tshirts';
          const boysTShirtOverride = isBoysTShirt ? boysTShirtCustomProducts[i % boysTShirtCustomProducts.length] : null;

          const isBras = typeItem.id === 'ut-bras' || typeItem.id === 'wt-bras';
          const brasOverride = isBras ? womenBrasCustomProducts[i % womenBrasCustomProducts.length] : null;

          const activeOverride = sareeOverride || salwarOverride || lehengaOverride || anarkaliOverride || kurtiOverride || palazzoOverride || dressesOverride || topsOverride || jeansOverride || trousersOverride || coordOverride || skirtsOverride || menKurtaOverride || menTShirtOverride || menFormalShirtOverride || menBriefsOverride || boysTShirtOverride || brasOverride;

          const title = activeOverride ? activeOverride.title : (meta.titles[i % meta.titles.length] || `${typeItem.name} Edition ${i + 1}`);
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const fabric = activeOverride ? activeOverride.fabric : meta.fabrics[i % meta.fabrics.length];
          const fit = meta.fits[i % meta.fits.length];
          const occasion = meta.occasions[i % meta.occasions.length];
          
          const imgUrl = activeOverride ? activeOverride.image : getCustomImage(typeItem.id, i, false);
          const secondaryImgUrl = (activeOverride && 'secondaryImage' in activeOverride && (activeOverride as any).secondaryImage)
            ? (activeOverride as any).secondaryImage
            : getCustomImage(typeItem.id, i, true);

          const basePrice = Math.floor(
            meta.basePriceRange[0] + (i * (meta.basePriceRange[1] - meta.basePriceRange[0])) / 9
          );
          const discountPercent = i % 3 === 0 ? 30 : i % 2 === 0 ? 20 : 0;
          const discountPrice = discountPercent > 0 ? Math.floor(basePrice * (1 - discountPercent / 100)) : undefined;

          const color1 = activeOverride ? { name: activeOverride.colorName, hex: activeOverride.colorHex } : colorsList[i % colorsList.length];
          const color2 = activeOverride ? { name: isSaree ? 'Gold Accent Border' : isLehenga ? 'Contrasting Choli & Dupatta Shading' : isAnarkali ? 'Decorative Dupatta Accents' : 'Contrast Dupatta Shading', hex: isSaree ? '#D4AF37' : '#E6A11E' } : colorsList[(i + 3) % colorsList.length];

          const tags = tagsPool[i % tagsPool.length];
          const description = activeOverride ? activeOverride.description : getCustomDescription(title, fabric, fit, occasion, color1.name, typeItem.id);

          const aiImagePrompt = buildProductAiImagePrompt({
            productName: title,
            typeName: typeItem.name,
            colorName: color1.name,
            fabric: fabric,
            fit: fit,
            category: cat.id
          });

          generatedProducts.push({
            id: prodId,
            name: title,
            slug: slug,
            categoryId: cat.id,
            subcategoryId: sub.id,
            typeId: typeItem.id,
            brandId: brandId,
            brandName: brandsMap[brandId] || 'PGmart Essentials',
            description: description,
            fabric: fabric,
            fit: fit,
            occasion: occasion,
            hsnCode: '6204',
            gstPercent: 5,
            basePrice: basePrice,
            discountPrice: discountPrice,
            discountPercent: discountPercent > 0 ? discountPercent : undefined,
            tags: tags,
            status: 'published',
            availableSizes: meta.sizes,
            rating: Number((4.3 + (i % 7) * 0.1).toFixed(1)),
            reviewCount: 15 + i * 8,
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            aiImagePrompt: aiImagePrompt,
            colors: [
              { name: color1.name, hex: color1.hex, images: [imgUrl, secondaryImgUrl] },
              { name: color2.name, hex: color2.hex, images: [secondaryImgUrl, imgUrl] }
            ],
            variants: meta.sizes.map((sz, sIdx) => ({
              id: `${prodId}-v${sIdx + 1}`,
              productId: prodId,
              size: sz,
              color: color1.name,
              colorHex: color1.hex,
              sku: `PGM-${typeItem.id.toUpperCase()}-${i + 1}-${sz}`,
              price: basePrice,
              discountPrice: discountPrice,
              stock: 12 + ((i + sIdx) % 15),
              images: [imgUrl, secondaryImgUrl]
            }))
          });
        }
      }
    }
  }

  return generatedProducts;
}
