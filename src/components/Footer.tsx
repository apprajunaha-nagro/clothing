import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, RotateCcw, ShieldCheck, CreditCard, Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, Youtube, Settings, ArrowRight, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentPath = '/' }) => {
  const { settings, isAdminLoggedIn, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const isHomePage = currentPath === '/' || currentPath === '';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast(`Thank you for subscribing with ${newsletterEmail}! Welcome to Terra Club.`);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#2B2620] text-stone-300 border-t border-stone-800 text-left">

      {/* ── OUR STORY GLIMPSE (HOMEPAGE ONLY) ── */}
      {isHomePage && (
        <div className="relative overflow-hidden bg-[#1A120C]">
        {/* Background texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A120C]/80 via-[#1A120C]/60 to-[#1A120C]/95 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center space-y-8">

          {/* Big Logo + Name */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C0654B]/30 rounded-3xl blur-xl scale-110" />
              <img
                src="/src/assets/images/pgmart_logo_1785764319471.jpg"
                alt="PGmart Logo"
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#C0654B]/40 shadow-2xl"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-serif text-white tracking-wide leading-none">
                PGmart ( Pratap Garments )
              </h2>
              <p className="text-[#C0654B] font-bold text-xs sm:text-sm uppercase tracking-[0.3em]">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Story Excerpt */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#C0654B]/20 border border-[#C0654B]/30 text-[#C0654B] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Our Story
            </div>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
              Born in a rain-soaked weaver's workshop in Shantipur, Bengal — PGmart was built on a single promise:
              that <span className="text-white font-semibold">authentic Indian craftsmanship</span> deserves fair prices,
              for the weavers who make it and the people who wear it.
            </p>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              From 12 products in 2019 to India's most trusted fashion destination — every thread of our journey
              is woven with purpose, people, and the colours of the Bhagirathi.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-4 border-y border-stone-800/60">
            {[
              { value: '1,200+', label: 'Artisan Partners' },
              { value: '400+', label: 'Curated Products' },
              { value: '50K+', label: 'Happy Customers' },
              { value: '2019', label: 'Founded' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-serif">{stat.value}</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onNavigate('/blog/our-story')}
            className="inline-flex items-center gap-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-sm px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-[#C0654B]/30 hover:shadow-xl group cursor-pointer"
          >
            <span>Read Our Full Story</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Col 1: Brand & Bio */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/pgmart_logo_1785764319471.jpg"
              alt="PGmart Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover border border-stone-800 shadow-xs"
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
          <p className="text-stone-400 leading-relaxed text-xs pr-4">
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
            <a
              href={`mailto:${settings.supportEmail || settings.contactEmail || 'suppport@pgmart.in'}`}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>{settings.supportEmail || settings.contactEmail || 'suppport@pgmart.in'}</span>
            </a>
          </div>
        </div>

        {/* Col 2: Shop Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-stone-800 pb-2">
            Categories
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li><button onClick={() => onNavigate('/category/women')} className="hover:text-[#C0654B] cursor-pointer">Women's Ethnic & Western</button></li>
            <li><button onClick={() => onNavigate('/category/men')} className="hover:text-[#C0654B] cursor-pointer">Men's Shirts & Formals</button></li>
            <li><button onClick={() => onNavigate('/category/kids')} className="hover:text-[#C0654B] cursor-pointer">Kids & Infants Apparel</button></li>
            <li><button onClick={() => onNavigate('/category/undergarments')} className="hover:text-[#C0654B] cursor-pointer">Lingerie & Innerwear</button></li>

            <li><button onClick={() => onNavigate('/category/sale')} className="hover:text-red-400 font-bold cursor-pointer">Clearance Sale (Up to 60% OFF)</button></li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
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
            <li><button onClick={() => onNavigate('/return-policy')} className="hover:text-[#C0654B] cursor-pointer">Returns & Exchanges</button></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-stone-800 pb-2">
            Join Terra Club
          </h4>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Subscribe for early access to new seasonal launches, VIP discounts, and style lookbooks.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C0654B]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-[#C0654B] hover:bg-[#8B4A38] text-white px-3 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="pt-2 flex items-center space-x-3 text-stone-400">
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#C0654B] transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* 3. COPYRIGHT & LEGAL BAR */}
      <div className="bg-[#191613] py-4 border-t border-stone-800/80 text-[11px] text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. All Rights Reserved. GSTIN: {settings.gstNumber}</p>
          <div className="flex items-center flex-wrap gap-4 text-stone-400">
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:underline cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:underline cursor-pointer">Terms of Service</button>
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
