import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, RotateCcw, ShieldCheck, CreditCard, Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast(`Thank you for subscribing with ${newsletterEmail}! Welcome to Terra Club.`);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#2B2620] text-stone-300 border-t border-stone-800 text-left">
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
              <h3 className="font-sans text-xl font-extrabold text-white tracking-wide">{settings.storeName}</h3>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">{settings.tagline}</p>
            </div>
          </div>
          <p className="text-stone-400 leading-relaxed text-xs pr-4">
            PGmart is India's most trusted online shopping destination bringing together authentic ethnic fashion, contemporary western styles, kids apparel, and premium innerwear with 100% quality guarantee.
          </p>

          <div className="space-y-1.5 text-stone-300">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>{settings.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>{settings.contactPhone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C0654B] shrink-0" />
              <span>{settings.contactEmail}</span>
            </p>
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
            Customer Care
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li><button onClick={() => onNavigate('/account')} className="hover:text-[#C0654B] cursor-pointer">My Account & Orders</button></li>
            <li><button onClick={() => onNavigate('/track-order')} className="hover:text-[#C0654B] cursor-pointer">Track Your Package</button></li>
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
          <div className="flex flex-wrap gap-4 text-stone-400">
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:underline cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:underline cursor-pointer">Terms of Service</button>
            <button onClick={() => onNavigate('/shipping-policy')} className="hover:underline cursor-pointer">Shipping Policy</button>
            <button onClick={() => onNavigate('/admin')} className="text-[#C0654B] hover:underline font-bold cursor-pointer">Admin Portal</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
