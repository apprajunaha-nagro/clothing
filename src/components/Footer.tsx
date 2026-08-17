import React from 'react';
import { useStore } from '../context/StoreContext';
import { initialBlogPosts } from '../data/blogPosts';
import { Truck, RotateCcw, ShieldCheck, CreditCard, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, ArrowRight, Sparkles, BookOpen, Calendar, Clock, User } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentPath = '/' }) => {
  const { settings, isAdminLoggedIn, blogPosts } = useStore();
  const isHomePage = currentPath === '/' || currentPath === '';

  // Dynamically resolve "Our Story" blog post from live store/database
  const allPosts = (blogPosts && blogPosts.length > 0) ? blogPosts : initialBlogPosts;
  const ourStoryPost = allPosts.find(p => p.id === 'post-our-story' || p.category === 'Our Story' || p.slug === 'our-story' || p.slug?.toLowerCase().includes('our-story') || p.title?.toLowerCase().includes('our story'))
    || allPosts.find(p => p.category === 'Our Story')
    || allPosts[0];

  const ourStoryBg = ourStoryPost?.featuredImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=60';
  const ourStoryExcerpt = ourStoryPost?.excerpt || (Array.isArray(ourStoryPost?.content) && ourStoryPost.content[0]) || 'Born in Shantipur, Bengal — PGmart delivers authentic Indian craftsmanship & luxury ethnic wear at direct-from-weaver fair pricing.';
  const ourStorySlug = ourStoryPost?.slug || 'our-story';

  return (
    <footer className="bg-[#2B2620] text-stone-300 border-t border-stone-800 text-left">

      {/* ── OUR STORY GLIMPSE (HOMEPAGE ONLY) ── */}
      {isHomePage && (
        <section className="relative overflow-hidden bg-[#18130E] border-b border-stone-800/80">
          {/* Ambient blurred backdrop of the featured image */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none scale-105 transition-all duration-1000 blur-xs"
            style={{
              backgroundImage: `url(${ourStoryBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#18130E]/90 via-[#18130E]/80 to-[#18130E]/95 pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Post Featured Image Card with Badges */}
              <div 
                className="lg:col-span-5 relative group cursor-pointer" 
                onClick={() => onNavigate(`/blog/${ourStorySlug}`)}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-700/60 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 bg-stone-900">
                  <img
                    src={ourStoryBg}
                    alt={ourStoryPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-[#C0654B] text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>{ourStoryPost.category || 'Our Story'}</span>
                  </div>

                  {/* Author Banner */}
                  <div className="absolute bottom-3 inset-x-3 text-left flex items-center gap-2.5 bg-stone-950/60 backdrop-blur-md p-2 rounded-xl border border-stone-700/50">
                    <img
                      src={ourStoryPost.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                      alt={ourStoryPost.author}
                      className="w-7 h-7 rounded-full object-cover border border-[#C0654B]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-bold truncate">{ourStoryPost.author}</p>
                      <p className="text-[10px] text-stone-400 truncate">{ourStoryPost.authorRole}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Excerpt, Stats, Tags & CTA */}
              <div className="lg:col-span-7 text-left space-y-4">
                
                {/* Brand Tag / Category header */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[#C0654B] font-extrabold text-[11px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5 bg-[#C0654B]/15 px-2.5 py-1 rounded-full border border-[#C0654B]/30">
                    <BookOpen className="w-3 h-3 text-[#C0654B]" /> {ourStoryPost.category ? `${ourStoryPost.category.toUpperCase()} • BEHIND PGMART` : 'OUR STORY • BEHIND PGMART'}
                  </span>
                  <span className="text-stone-600 hidden sm:inline">•</span>
                  <span className="text-stone-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-500" /> {ourStoryPost.readTime || '5 min read'}
                  </span>
                </div>

                {/* Main Dynamic Story Title */}
                <h2 
                  onClick={() => onNavigate(`/blog/${ourStorySlug}`)}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight leading-snug hover:text-[#C0654B] transition-colors cursor-pointer"
                >
                  {ourStoryPost.title}
                </h2>

                {/* Excerpt / Summary */}
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light line-clamp-3 sm:line-clamp-4">
                  {ourStoryExcerpt}
                </p>

                {/* Tags */}
                {Array.isArray(ourStoryPost.tags) && ourStoryPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ourStoryPost.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="bg-stone-800/80 text-stone-300 border border-stone-700/60 text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 py-2.5 border-y border-stone-800/80 text-center">
                  {[
                    { value: '1,200+', label: 'Artisans' },
                    { value: '400+', label: 'Products' },
                    { value: '50K+', label: 'Customers' },
                    { value: '2019', label: 'Founded' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-sm sm:text-base font-extrabold text-white font-serif">{stat.value}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA Button & Date */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onNavigate(`/blog/${ourStorySlug}`)}
                    className="inline-flex items-center gap-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-[#C0654B]/40 group cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" /> Published {ourStoryPost.publishedDate}
                  </span>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* 1. BENEFIT ICONS STRIP (Pantaloons / Max Fashion Style) */}
      <div className="bg-[#1F1B17] py-8 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C0654B]/20 text-[#C0654B] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">On all prepaid orders over ₹999</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C0654B]/20 text-[#C0654B] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">15-Day Easy Returns</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Hassle-free doorstep pickup</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C0654B]/20 text-[#C0654B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">100% Authentic</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Direct from certified artisans & mills</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C0654B]/20 text-[#C0654B] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Secure Payments</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">UPI, Cards, Netbanking & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        {/* Col 1: Brand, Bio & Contact */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/pgmart_logo_new.png"
              alt="PGmart Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-stone-800 shadow-xs shrink-0"
            />
            <div>
              <h3
                className="text-lg font-black text-white tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontStyle: 'normal' }}
              >
                {settings.storeName} <span className="text-xs text-stone-400 font-bold tracking-normal">(Pratap Garments)</span>
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">{settings.tagline}</p>
            </div>
          </div>
          <p className="text-stone-400 leading-relaxed text-xs max-w-xl">
            PGmart is India's most trusted online shopping destination bringing together authentic ethnic fashion, contemporary western styles, kids apparel, and premium innerwear with 100% quality guarantee.
          </p>

          <div className="space-y-1.5 text-stone-300">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>Kapda Patti, Jharia, Dhanbad, Jharkhand 828111</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>{settings.contactPhone}</span>
            </p>
            <a 
              href={`https://wa.me/91${(settings.whatsappNumber || '9471155434').replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-emerald-400 text-emerald-400 font-semibold transition-colors"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp: +91 {settings.whatsappNumber || '9471155434'}</span>
            </a>
          </div>

          {/* Social Media Links */}
          <div className="pt-2 flex items-center space-x-3 text-stone-400">
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Col 2: Customer Care & Navigation */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-stone-800 pb-2">
            Customer Care & Journal
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li><button onClick={() => onNavigate('/blog')} className="hover:text-[#C0654B] font-bold text-[#C0654B] cursor-pointer flex items-center gap-1.5"><span>📖 PGmart Journal (Blog)</span></button></li>
            <li><button onClick={() => onNavigate('/account')} className="hover:text-[#C0654B] cursor-pointer">My Account & Orders</button></li>
            <li><button onClick={() => onNavigate('/store-locator')} className="hover:text-[#C0654B] cursor-pointer">Find Nearest Store</button></li>
            <li><button onClick={() => onNavigate('/size-guide')} className="hover:text-[#C0654B] cursor-pointer">Size Guide & Chart</button></li>
            <li><button onClick={() => onNavigate('/faqs')} className="hover:text-[#C0654B] cursor-pointer">FAQs & Help Center</button></li>
            <li><button onClick={() => onNavigate('/return-policy')} className="hover:text-[#C0654B] cursor-pointer">Return Policy</button></li>
          </ul>
        </div>
      </div>

      {/* 3. COPYRIGHT & LEGAL BAR */}
      <div className="bg-[#191613] py-4 border-t border-stone-800/80 text-[11px] text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. All Rights Reserved. GSTIN: {settings.gstNumber}</p>
          <div className="flex items-center flex-wrap gap-4 text-stone-400">
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:underline cursor-pointer">Privacy Policy</button>
            <button
              onClick={() => onNavigate(isAdminLoggedIn ? '/admin' : '/admin/login')}
              className="hover:underline cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
