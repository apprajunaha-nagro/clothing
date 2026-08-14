import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Mail, Clock, HelpCircle, ShieldCheck, Ruler, ArrowRight, Sparkles } from 'lucide-react';
import { parsePrivacySections } from '../data/seedData';

interface StaticPagesProps {
  pageType: 'about' | 'store-locator' | 'faqs' | 'size-guide' | 'policies' | 'privacy-policy';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ pageType, onNavigate }) => {
  const { settings } = useStore();
  const [storeSearch, setStoreSearch] = useState('');

  const privacySections = parsePrivacySections(settings.privacyPolicy);

  const stores = [
    { name: 'PGmart Flagship Store', city: 'Jharia, Dhanbad', address: 'Kapda Patti, Jharia, Dhanbad, Jharkhand 828111', phone: '+91 94711 55434', hours: '10:30 AM - 9:00 PM' },
  ];

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.address.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* PRIVACY POLICY PAGE */}
      {(pageType === 'privacy-policy' || pageType === 'policies') && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-xs space-y-8 text-stone-800 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 pb-4 space-y-1">
            <span className="text-xs font-extrabold text-[#C0654B] uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C0654B]" /> LEGAL & PRIVACY
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs text-stone-500 font-medium">Official Privacy Document • {settings.storeName || 'PGmart'}</p>
          </div>

          <div className="space-y-6 divide-y divide-stone-100 text-xs sm:text-sm">
            {privacySections.map((sec, idx) => {
              const lines = sec.content.split('\n').map(l => l.trim()).filter(Boolean);
              const isBulletList = lines.length > 1 && lines.every(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));

              return (
                <div key={sec.id || `sec-${idx}`} className="pt-5 first:pt-0 space-y-2">
                  <h2 className="text-base font-bold text-stone-900 font-serif">
                    {sec.title}
                  </h2>
                  
                  {isBulletList ? (
                    <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                      {lines.map((line, lIdx) => (
                        <li key={lIdx}>
                          {line.replace(/^[•\-\*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-2 text-stone-600 whitespace-pre-line leading-relaxed">
                      {sec.content}
                    </div>
                  )}

                  {/* If this is the contact section or has contact mentions, include store details badge */}
                  {(sec.id === 'contact' || sec.title.toLowerCase().includes('contact') || idx === privacySections.length - 1) && (
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mt-3 space-y-1 text-xs text-stone-700">
                      <p className="font-bold text-stone-900">{settings.storeName || 'PGmart Customer Care'}</p>
                      <p><strong>Email:</strong> {settings.supportEmail || settings.contactEmail || 'support@pgmart.in'}</p>
                      <p><strong>Phone:</strong> {settings.supportPhone || settings.contactPhone || '+91 94711 55434'}</p>
                      <p><strong>Address:</strong> {settings.address || 'Kapda Patti, Jharia, Dhanbad, Jharkhand 828111'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            placeholder="Search by city (Dhanbad, Jharia)..."
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

      {pageType === 'size-guide' && (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">PGMART FITTING & SIZING</span>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900 mt-1">Apparel Size Guide & Measurement Chart</h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl">
              Find your perfect fit across ethnic wear, western apparel, men's shirts, and plus-size curves with our standard Indian sizing chart.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Women's Ethnic & Western */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-base font-serif">Women's Sizing Chart (Kurtis, Sarees, Dresses & Tops)</h3>
                <span className="bg-[#F3E9E4] text-[#C0654B] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">Women</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-stone-200 text-stone-700 text-center">
                  <thead>
                    <tr className="bg-[#F3E9E4] text-[#2B2620] font-bold">
                      <th className="border border-stone-200 p-2.5">Brand Size</th>
                      <th className="border border-stone-200 p-2.5">Bust / Chest (in)</th>
                      <th className="border border-stone-200 p-2.5">Waist (in)</th>
                      <th className="border border-stone-200 p-2.5">Hip (in)</th>
                      <th className="border border-stone-200 p-2.5">Kurti Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XS</td>
                      <td className="border border-stone-200 p-2">32 - 34</td>
                      <td className="border border-stone-200 p-2">26 - 28</td>
                      <td className="border border-stone-200 p-2">34 - 36</td>
                      <td className="border border-stone-200 p-2">38</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">S</td>
                      <td className="border border-stone-200 p-2">34 - 36</td>
                      <td className="border border-stone-200 p-2">28 - 30</td>
                      <td className="border border-stone-200 p-2">36 - 38</td>
                      <td className="border border-stone-200 p-2">39</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">M</td>
                      <td className="border border-stone-200 p-2">36 - 38</td>
                      <td className="border border-stone-200 p-2">30 - 32</td>
                      <td className="border border-stone-200 p-2">38 - 40</td>
                      <td className="border border-stone-200 p-2">40</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">L</td>
                      <td className="border border-stone-200 p-2">38 - 40</td>
                      <td className="border border-stone-200 p-2">32 - 34</td>
                      <td className="border border-stone-200 p-2">40 - 42</td>
                      <td className="border border-stone-200 p-2">41</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XL</td>
                      <td className="border border-stone-200 p-2">40 - 42</td>
                      <td className="border border-stone-200 p-2">34 - 36</td>
                      <td className="border border-stone-200 p-2">42 - 44</td>
                      <td className="border border-stone-200 p-2">42</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XXL / Curves</td>
                      <td className="border border-stone-200 p-2">44 - 46</td>
                      <td className="border border-stone-200 p-2">38 - 40</td>
                      <td className="border border-stone-200 p-2">46 - 48</td>
                      <td className="border border-stone-200 p-2">43</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Men's Apparel */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-base font-serif">Men's Sizing Chart (Kurtas, Formal & Casual Shirts)</h3>
                <span className="bg-[#F3E9E4] text-[#C0654B] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">Men</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-stone-200 text-stone-700 text-center">
                  <thead>
                    <tr className="bg-[#F3E9E4] text-[#2B2620] font-bold">
                      <th className="border border-stone-200 p-2.5">Collar Size</th>
                      <th className="border border-stone-200 p-2.5">Chest Size (in)</th>
                      <th className="border border-stone-200 p-2.5">Waist (in)</th>
                      <th className="border border-stone-200 p-2.5">Shoulder (in)</th>
                      <th className="border border-stone-200 p-2.5">Shirt Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">38 / S</td>
                      <td className="border border-stone-200 p-2">38</td>
                      <td className="border border-stone-200 p-2">32 - 34</td>
                      <td className="border border-stone-200 p-2">17.5</td>
                      <td className="border border-stone-200 p-2">28.5</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">40 / M</td>
                      <td className="border border-stone-200 p-2">40</td>
                      <td className="border border-stone-200 p-2">34 - 36</td>
                      <td className="border border-stone-200 p-2">18.0</td>
                      <td className="border border-stone-200 p-2">29.0</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">42 / L</td>
                      <td className="border border-stone-200 p-2">42</td>
                      <td className="border border-stone-200 p-2">36 - 38</td>
                      <td className="border border-stone-200 p-2">18.5</td>
                      <td className="border border-stone-200 p-2">30.0</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">44 / XL</td>
                      <td className="border border-stone-200 p-2">44</td>
                      <td className="border border-stone-200 p-2">38 - 40</td>
                      <td className="border border-stone-200 p-2">19.0</td>
                      <td className="border border-stone-200 p-2">31.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Measurement Tips */}
            <div className="bg-[#F3E9E4] p-6 rounded-2xl border border-[#C0654B]/30 space-y-2 text-stone-800">
              <h4 className="font-bold text-sm font-serif text-[#C0654B]">How to Measure Your Body:</h4>
              <p>• <strong>Bust / Chest:</strong> Measure around the fullest part of your chest keeping tape horizontal.</p>
              <p>• <strong>Waist:</strong> Measure around the narrowest part of your waistline.</p>
              <p>• <strong>Hips:</strong> Stand with feet together and measure around the fullest part of hips.</p>
              <p>• <strong>Need Personal Help?</strong> Contact our Customer Care team at +91 94711 55434 for personalized fitting guidance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
