import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Mail, Clock, HelpCircle, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';

interface StaticPagesProps {
  pageType: 'about' | 'store-locator' | 'faqs' | 'size-guide' | 'policies';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ pageType, onNavigate }) => {
  const { settings } = useStore();
  const [storeSearch, setStoreSearch] = useState('');

  const stores = [
    { name: 'Terra & Clay Flagship Store', city: 'Kolkata', address: '4th Floor, Park Mansions, Park Street', phone: '+91 98765 43210', hours: '10:30 AM - 9:00 PM' },
    { name: 'Terra & Clay Galleria', city: 'Mumbai', address: 'Linking Road, Bandra West', phone: '+91 98765 43211', hours: '11:00 AM - 9:30 PM' },
    { name: 'Terra & Clay Boutique', city: 'New Delhi', address: 'Khan Market, High Street', phone: '+91 98765 43212', hours: '10:00 AM - 9:00 PM' },
    { name: 'Terra & Clay Style Hub', city: 'Bengaluru', address: '100 Feet Road, Indiranagar', phone: '+91 98765 43213', hours: '10:30 AM - 9:30 PM' },
  ];

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.address.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      {pageType === 'about' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">OUR HERITAGE</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">Crafting Timeless Indian Elegance</h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Founded with a commitment to sustainable craftsmanship, natural earth-toned dyes, and ultra-breathable fabrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Craftsmanship"
              className="rounded-2xl shadow-lg aspect-4/3 object-cover"
            />
            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <h3 className="text-xl font-bold font-serif text-stone-900">The Terracotta Palette</h3>
              <p>
                Our signature rose clay color (#C0654B) represents the grounded warmth of hand-kilned Indian pottery and traditional looms. Every saree, kurta, and tailored suit is crafted to offer unmatched comfort and visual poise.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <p className="font-bold text-[#C0654B] text-lg">100%</p>
                  <p className="text-[11px] text-stone-600">Organic & Handloom Silks</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <p className="font-bold text-[#C0654B] text-lg">150,000+</p>
                  <p className="text-[11px] text-stone-600">Delighted Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pageType === 'store-locator' && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">VISIT US IN PERSON</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Store Locator</h1>
          </div>

          <input
            type="text"
            value={storeSearch}
            onChange={(e) => setStoreSearch(e.target.value)}
            placeholder="Search by city (Kolkata, Mumbai, Delhi, Bengaluru)..."
            className="w-full max-w-md bg-white border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C0654B]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStores.map((st) => (
              <div key={st.name} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-900 text-sm font-serif">{st.name}</h3>
                  <span className="bg-[#F3E9E4] text-[#C0654B] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                    {st.city}
                  </span>
                </div>
                <p className="text-stone-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#C0654B] shrink-0" /> {st.address}</p>
                <p className="text-stone-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#C0654B] shrink-0" /> {st.phone}</p>
                <p className="text-stone-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {st.hours}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pageType === 'faqs' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Frequently Asked Questions</h1>
          <div className="space-y-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900 text-sm">How do I choose the correct size?</h3>
              <p className="text-stone-600">Refer to our Size Guide link on any product page or visit our Size Guide tab in customer care for chest, waist, and hip measurements in inches.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900 text-sm">What is the return policy?</h3>
              <p className="text-stone-600">We offer a 15-day easy return policy for all unworn, unwashed apparel items. Pickup is arranged from your address.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900 text-sm">Is Cash on Delivery (COD) available?</h3>
              <p className="text-stone-600">Yes! Cash on Delivery is available across 25,000+ PIN codes across India.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
