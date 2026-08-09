export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: 'Styling Tips' | 'Behind the Brand' | 'Fabric Guide' | 'Seasonal Edit' | 'Our Story';
  author: string;
  authorRole: string;
  authorAvatar: string;
  publishedDate: string;
  readTime: string;
  featuredImage: string;
  relatedCategorySlug: string;
  tags: string[];
}

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-our-story',
    slug: 'our-story',
    title: 'Our Story: How PGmart Was Born From the Heart of Bengal\'s Handloom Heritage',
    excerpt: 'From a small workshop in Shantipur to India\'s most trusted fashion destination — discover the people, purpose, and passion woven into every thread at PGmart.',
    content: [
      'Every great brand begins with a moment of conviction. For PGmart, that moment came on a rain-soaked afternoon in Shantipur, West Bengal — a town where handlooms sing before dawn and weavers\'s hands carry the memory of centuries. Our founder, Priyam Ghoshal, watched a master weaver fold an exquisite Tant saree, knowing it would sell for a fraction of its true worth through layers of middlemen. That injustice became our founding promise.',
      '### The Beginning: A Loom, a Dream & a Delivery Van',
      'In 2019, PGmart launched with just 12 SKUs, one delivery partner, and an unshakeable belief: that authentic Indian craftsmanship deserves fair prices — for weavers and for buyers. We started by sourcing directly from 18 weaver families across the Nadia district. Within eight months, we had served 3,000 customers across 22 Indian cities, entirely by word of mouth.',
      '### Our Artisan Network: 1,200+ Weavers, One Mission',
      'Today, PGmart is proud to work with over 1,200 artisans and master craftspeople spread across West Bengal, Varanasi, Jaipur, and Surat. Each weaver partner receives a guaranteed fair-trade price, year-round work orders, and access to our healthcare partnership program. When you buy from PGmart, over 70% of the garment\'s value flows directly to the hands that made it.',
      '### Quality Is Our Non-Negotiable',
      'Every product listed on PGmart undergoes a 7-point quality check — fabric GSM verification, colour fastness test, stitching stress test, wash-shrinkage assessment, fit calibration, packaging integrity check, and final dispatch audit. We reject nearly 12% of incoming stock that doesn\'t meet our bar. Because your trust is not a metric we\'re willing to compromise.',
      '### The Rose Clay Philosophy',
      'Our brand colour — Rose Clay (#C0654B) — is not a random design choice. It is the exact pigment of the iron-rich earth from the riverbanks of the Bhagirathi, where Bengal\'s most famous handloom villages sit. It symbolises warmth, rootedness, and the enduring dignity of handcraft. Every time you see that terracotta rose on our tags, packaging, and storefronts, it is a quiet reminder of where we come from.',
      '### Where We Are Headed',
      'Our vision is to make PGmart the largest direct-to-consumer artisan fashion marketplace in India by 2030 — not by cutting corners, but by deepening trust. We are building a traceability system so every product will carry a QR code linking you to the exact weaver cluster that made it. Fashion with a face. Commerce with a conscience. That is PGmart.',
      'Thank you for being part of our story. Every order you place is not just a purchase — it is a vote for a more equitable, more beautiful world.'
    ],
    category: 'Our Story',
    author: 'Priyam Ghoshal',
    authorRole: 'Founder & CEO, PGmart',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'August 9, 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'women',
    tags: ['Our Story', 'PGmart Origin', 'Artisan Fashion', 'Bengal Handloom', 'Ethical Fashion', 'Founder']
  },
  {
    id: 'post-1',
    slug: 'how-to-style-a-saree-for-every-occasion',
    title: 'How to Style a Saree for Every Occasion: Festive, Office & Casual Edits',
    excerpt: 'From classic Banarasi silk drapes to lightweight georgette printed sarees, discover how to pair dupattas, blouses, and handcrafted jewellery effortless for any event.',
    content: [
      'The saree remains India\'s most versatile and timeless garment. Whether you are dressing up for a grand Diwali gala, attending a high-stakes corporate presentation, or hosting an intimate family brunch, the secret to effortless saree styling lies in fabric selection, blouse tailoring, and mindful accessorizing.',
      '### 1. The Festive Gala: Heavy Silks & Heritage Weaves',
      'For weddings and major festivals, opt for rich Banarasi silk, Kanjeevaram, or zari-embroidered Organza sarees in warm tones like Terracotta Rose, Crimson, or Royal Mustard. Pair with a structured elbow-length velvet or brocade blouse. Keep jewellery bold — jadau chokers or gold jhumkas bring instant poise.',
      '### 2. Modern Office Wear: Breathable Linen & Chanderi',
      'Corporate elegance requires comfort and clean lines. Choose lightweight handloom cotton, linen, or muted Chanderi sarees in pastel undertones. Pair with high-neck boat blouses or sleek mandarin collars. A simple leather watch and silver stud earrings complete the polished executive look.',
      '### 3. Contemporary Casual: Pre-Stitched & Printed Georgette',
      'Weekend outings call for hassle-free drapes. Floral georgette sarees and pre-stitched ruffle sarees pair beautifully with crop tops or denim jackets for an edgy fusion twist.'
    ],
    category: 'Styling Tips',
    author: 'Ananya Roy',
    authorRole: 'Head Stylist & Textile Curator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'August 2, 2026',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'women',
    tags: ['Saree Styling', 'Festive Fashion', 'Silk Weaves', 'PGmart Style Guide']
  },
  {
    id: 'post-2',
    slug: 'fabric-care-101-keeping-your-kurtas-fresh',
    title: 'Fabric Care 101: Keeping Your Handloom Kurtas Fresh & Vibrant',
    excerpt: 'Learn essential wash, dry, and storage techniques to preserve hand-dye colors, chikankari embroidery, and pure organic cotton threads for years.',
    content: [
      'Pure handloom fabrics are living textiles — they respond to climate, wash frequency, and storage conditions. Natural terracotta, indigo, and madder dyes deserve gentle care to maintain their rich hue without fading or bleeding.',
      '### Washing Handloom Cotton & Silk Kurtas',
      'Always separate dark hand-dyed garments during the first three washes. Use cold water with a mild, pH-neutral liquid detergent. Avoid harsh bleaching agents or fabric softeners containing silicone, as they weaken natural cellulose fibers.',
      '### Drying & Ironing Guidelines',
      'Never wring pure cotton or silk kurtas. Gently press out excess water with a clean towel and shade-dry inside out. Direct sunlight can bleach natural pigments. Steam-iron on low-to-medium heat while the fabric is slightly damp.',
      '### Off-Season Storage Secrets',
      'Store your handloom kurtas in breathable muslin cotton bags rather than plastic covers. Toss in dried neem leaves or cedarwood balls to protect against moisture and moths without synthetic chemicals.'
    ],
    category: 'Fabric Guide',
    author: 'Priyam Ghoshal',
    authorRole: 'Master Artisan & Textile Engineer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'July 28, 2026',
    readTime: '4 min read',
    featuredImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'women',
    tags: ['Fabric Care', 'Handloom Cotton', 'Chikankari', 'Textile Preservation']
  },
  {
    id: 'post-3',
    slug: 'behind-the-brand-our-artisanal-sourcing-promise',
    title: 'Behind the Brand: Our Sourcing Promise & Direct Weaver Partnerships',
    excerpt: 'Discover how PGmart empowers 1,200+ traditional weavers across West Bengal, Varanasi, and Jaipur with fair wages and ethical production practices.',
    content: [
      'Every thread tells a human story. At PGmart, our commitment goes beyond delivering beautiful garments — we bridge the gap between rural Indian artisans and fashion-conscious shoppers across the world.',
      '### Empowering Artisan Communities',
      'By cutting out traditional multi-tier middlemen, PGmart ensures that over 75% of garment value reaches our master weavers and embroiderers directly. Our clusters in Fulia, Shantipur, and Banaras receive guaranteed year-round employment, safe looms, and healthcare benefits for their families.',
      '### Earth-Tone Palette Inspiration',
      'Our signature Rose Clay palette (#C0654B) pays homage to the kilns of rural Bengal. Every collection reflects organic earth dyes, vegetable inks, and zero-discharge water recycling facilities.'
    ],
    category: 'Behind the Brand',
    author: 'Swarnali Sen',
    authorRole: 'Co-Founder & Ethics Director',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'July 20, 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'women',
    tags: ['Artisan Heritage', 'Ethical Fashion', 'Weaver Empowerment', 'PGmart Story']
  },
  {
    id: 'post-4',
    slug: 'building-a-versatile-western-capsule-wardrobe',
    title: 'Building a Versatile Western Capsule Wardrobe for 2026',
    excerpt: 'Master the 10-piece capsule wardrobe with high-rise denim, classic linen blazers, ribbed tees, and effortless co-ord sets.',
    content: [
      'A capsule wardrobe isn\'t about minimalism — it\'s about maximum versatility. With 10 well-tailored western wear staples from PGmart\'s Urban Edit, you can create over 30 distinct outfits for work, brunch, traveling, and evening cocktails.',
      '### Key Capsule Essentials',
      '• **The Tailored Linen Blazer**: Instant structure over dresses or denim.\n• **High-Rise Vintage Denim**: Breathable cotton denim that molds to your shape.\n• **Ribbed Crewneck Tees**: Neutral shades like Off-White, Warm Terracotta, and Espresso.\n• **The Midi Slip Dress**: Layer under a knit sweater or wear solo with gold hoops.',
      '### Mix & Match Strategy',
      'Stick to a unified color palette where every top pairs with at least 3 bottoms. Neutral earth tones make dressing stress-free every morning.'
    ],
    category: 'Seasonal Edit',
    author: 'Rohan Mehta',
    authorRole: 'Senior Trend Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'July 14, 2026',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'women',
    tags: ['Capsule Wardrobe', 'Western Edit', 'Minimalist Style', 'Trend Guide']
  },
  {
    id: 'post-5',
    slug: 'lingerie-and-innerwear-fit-secrets',
    title: 'Lingerie & Innerwear Fit Secrets: Comfort Engineered for Indian Weather',
    excerpt: 'Understand seam types, micro-modal fabrics, and wire-free support designed for maximum breathability under heavy ethnic wear.',
    content: [
      'The foundation of every flawless outfit starts from within. Wearing the right innerwear dramatically enhances garment drape, posture, and all-day confidence, especially in humid tropical climates.',
      '### Finding Your Perfect Band & Cup Size',
      'Over 80% of women wear incorrect bra sizes without realizing it. Measure snuggly around your ribcage right under your bust for the band size, then around the fullest part of your bust for the cup calculation.',
      '### Fabric Innovations: Micro-Modal & Organic Bamboo',
      'Unlike synthetic nylons that trap sweat, PGmart\'s Bare Essentials collection uses ultra-soft micro-modal and bamboo cotton blends that offer 3x higher absorbency and 100% hypoallergenic comfort.'
    ],
    category: 'Fabric Guide',
    author: 'Dr. Meera Iyer',
    authorRole: 'Ergonomic Garment Specialist',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'July 05, 2026',
    readTime: '4 min read',
    featuredImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'undergarments',
    tags: ['Innerwear Fit', 'Micro Modal', 'Comfort First', 'Lingerie Secrets']
  },
  {
    id: 'post-6',
    slug: 'mens-shirt-styling-formals-to-weekend-chic',
    title: 'Men\'s Shirt Styling: Transitioning Formals to Weekend Chic',
    excerpt: 'Upgrade your menswear game with pure linen mandarin collar shirts, oxford cottons, and relaxed Cuban collar prints.',
    content: [
      'Modern menswear is no longer restricted to rigid corporate blues and whites. Today\'s well-dressed gentleman seamlessly blends formal precision with relaxed weekend comfort.',
      '### The Modern Office Edit',
      'Pair crisp 100% Egyptian cotton formal shirts in Rose Clay, Olive, or Ice Blue with tailored flat-front trousers. Add leather loafers and a matching belt for a clean, sophisticated edge.',
      '### The Casual Weekend Twist',
      'Unbutton a linen mandarin shirt over a white ribbed vest and pair with relaxed chinos or drawstring linen pants. Cuff the sleeves twice for an easygoing resort vibe.'
    ],
    category: 'Styling Tips',
    author: 'Vikram Sengupta',
    authorRole: 'Menswear Design Director',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'June 28, 2026',
    readTime: '4 min read',
    featuredImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlug: 'men',
    tags: ['Menswear', 'Linen Shirts', 'Office Formals', 'Smart Casual']
  }
];
