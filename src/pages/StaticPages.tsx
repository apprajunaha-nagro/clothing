import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Mail, Clock, HelpCircle, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';

interface StaticPagesProps {
  pageType: 'about' | 'store-locator' | 'faqs' | 'size-guide' | 'policies' | 'privacy-policy' | 'terms';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ pageType, onNavigate }) => {
  const { settings } = useStore();
  const [storeSearch, setStoreSearch] = useState('');

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
      {/* PRIVACY POLICY & TERMS OF SERVICE PAGES */}
      {(pageType === 'privacy-policy' || pageType === 'terms' || pageType === 'policies') && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-xs space-y-8 text-stone-800 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 pb-4 space-y-1">
            <span className="text-xs font-extrabold text-[#C0654B] uppercase tracking-widest">LEGAL & COMPLIANCE</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {pageType === 'privacy-policy' ? 'Privacy Policy & Terms of Service' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-stone-500 font-medium">Last Updated: 8 August 2026</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs leading-relaxed text-stone-700">
            These Terms of Service ("Terms") govern your access to and use of the PGmart website (<strong>pgmart.in</strong>), mobile experience, and related services (collectively, the "Platform"), operated by We ("we," "us," or "our"). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
          </div>

          <div className="space-y-6 divide-y divide-stone-100 text-xs sm:text-sm">
            {/* 1. Eligibility */}
            <div className="pt-4 first:pt-0 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">1. Eligibility</h2>
              <p className="text-stone-600">
                You must be at least 18 years of age, or using the Platform under the supervision of a parent or legal guardian, to create an account or place an order. By using the Platform, you represent that you meet this requirement and that all information you provide is accurate and current.
              </p>
            </div>

            {/* 2. Account Registration */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">2. Account Registration</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                <li>You agree to provide accurate, complete, and current information during registration and to update it as needed.</li>
                <li>We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in fraudulent activity.</li>
              </ul>
            </div>

            {/* 3. Products, Pricing & Availability */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">3. Products, Pricing & Availability</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>We strive to display product information (images, descriptions, pricing) as accurately as possible. Actual product colour may vary slightly due to screen settings and lighting.</li>
                <li>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
                <li>Prices, offers, and product availability are subject to change without prior notice. We reserve the right to limit quantities and refuse orders at our discretion.</li>
                <li>In the event of a pricing or listing error, we reserve the right to cancel the affected order and issue a full refund.</li>
              </ul>
            </div>

            {/* 4. Orders & Payment */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">4. Orders & Payment</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Placing an order constitutes an offer to purchase; a contract is formed only upon our confirmation of the order (e.g., order confirmation email/SMS).</li>
                <li>We accept payment via the methods listed at checkout (UPI, cards, net banking, wallets, and Cash on Delivery where available). Payments are processed through secure, PCI-DSS compliant third-party gateways; We do not store your card or banking credentials.</li>
                <li>Orders may be cancelled by us due to non-availability of stock, inability to verify payment/delivery details, or suspected fraudulent activity, in which case any amount paid will be refunded.</li>
              </ul>
            </div>

            {/* 5. Shipping & Delivery */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">5. Shipping & Delivery</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Estimated delivery timelines are provided at checkout based on your delivery pincode and are indicative, not guaranteed.</li>
                <li>Risk of loss and title for products pass to you upon delivery to the shipping address provided.</li>
                <li>Delays caused by courier partners, weather, regulatory restrictions, or other events beyond our reasonable control are not our responsibility, though we will make reasonable efforts to keep you informed.</li>
                <li>Please inspect your package upon delivery and report any visible damage or tampering to our customer support within 24–48 hours.</li>
              </ul>
            </div>

            {/* 6. Returns, Refunds & Exchanges */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">6. Returns, Refunds & Exchanges</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Products are eligible for return/exchange within <strong>7–15 days</strong> of delivery, provided they are unused, unwashed, with original tags and packaging intact, subject to category-specific exceptions (e.g., innerwear/undergarments are non-returnable for hygiene reasons unless defective).</li>
                <li>To initiate a return, raise a request through your account's "My Orders" section or contact customer support.</li>
                <li>Approved refunds will be processed to the original payment method within <strong>5–7 business days</strong> of the returned item passing quality check, or as store credit/replacement, at your election where offered.</li>
                <li>We reserve the right to refuse a return that does not meet the above conditions.</li>
              </ul>
            </div>

            {/* 7. Coupons, Discounts & Promotions */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">7. Coupons, Discounts & Promotions</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Coupon codes and promotional offers are valid only for the period and conditions specified and cannot be combined unless explicitly stated.</li>
                <li>We reserve the right to modify, suspend, or withdraw any promotional offer at any time without prior notice.</li>
                <li>Any misuse of coupon codes (e.g., unauthorised sharing, bulk redemption) may result in order cancellation and/or account suspension.</li>
              </ul>
            </div>

            {/* 8. AI Stylist & Interactive Features */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">8. AI Stylist & Interactive Features</h2>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>The AI Stylist chatbot and outfit visualizer are provided for informational and styling suggestion purposes only. Recommendations are generated using AI models and do not guarantee availability, fit, colour accuracy, or suitability.</li>
                <li>Do not submit sensitive personal information through the AI chat features beyond what is necessary for styling assistance.</li>
              </ul>
            </div>

            {/* 9. User Conduct */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">9. User Conduct</h2>
              <p className="text-stone-600 mb-1">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Use the Platform for any unlawful purpose or in violation of these Terms.</li>
                <li>Upload or transmit viruses, malicious code, or attempt unauthorised access to our systems.</li>
                <li>Post false, misleading, defamatory, or infringing reviews or content.</li>
                <li>Scrape, reverse-engineer, or resell products/content obtained from the Platform without authorisation.</li>
              </ul>
              <p className="text-stone-600 pt-1">We reserve the right to remove content and suspend or terminate accounts that violate this section.</p>
            </div>

            {/* 10. Intellectual Property */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">10. Intellectual Property</h2>
              <p className="text-stone-600">
                All content on the Platform, including logos, product images, text, graphics, and our brand name, is the property of us or our licensors and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from this content without our prior written consent.
              </p>
            </div>

            {/* 11. Limitation of Liability */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">11. Limitation of Liability</h2>
              <p className="text-stone-600">
                To the maximum extent permitted by law, We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of data, loss of profits, or delays in delivery caused by third-party logistics partners. Our total liability for any claim arising from your use of the Platform shall not exceed the amount paid by you for the relevant order.
              </p>
            </div>

            {/* 12. Indemnification */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">12. Indemnification</h2>
              <p className="text-stone-600">
                You agree to indemnify and hold us, our officers, employees, and partners harmless from any claims, damages, or expenses arising from your violation of these Terms or misuse of the Platform.
              </p>
            </div>

            {/* 13. Governing Law & Dispute Resolution */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">13. Governing Law & Dispute Resolution</h2>
              <p className="text-stone-600">
                These Terms are governed by the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts at <strong>Dhanbad, Jharkhand, India</strong>. Before initiating formal proceedings, you agree to first attempt to resolve the dispute informally by contacting our customer support.
              </p>
            </div>

            {/* 14. Changes to These Terms */}
            <div className="pt-4 space-y-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">14. Changes to These Terms</h2>
              <p className="text-stone-600">
                We may revise these Terms from time to time. Material changes will be notified via the Platform or by email. Continued use of the Platform after such changes constitutes your acceptance of the revised Terms.
              </p>
            </div>

            {/* 15. Contact Us */}
            <div className="pt-4 space-y-3">
              <h2 className="text-base font-bold text-stone-900 font-serif">15. Contact Us</h2>
              <p className="text-stone-600">For any questions regarding these Terms, please contact:</p>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1 text-xs text-stone-700">
                <p className="font-bold text-stone-900">PGmart Customer Care</p>
                <p><strong>Email:</strong> support@pgmart.in</p>
                <p><strong>Phone:</strong> +91 94711 55434</p>
                <p><strong>Address:</strong> Kapda Patti, Jharia, Dhanbad, Jharkhand 828111</p>
              </div>
            </div>
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
