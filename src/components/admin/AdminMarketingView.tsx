import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Plus, Calendar, Trash2, Edit, Check, X, Megaphone, Ticket, Image as ImageIcon, 
  Settings, Sparkles, Send, Copy, AlertTriangle, Eye, Upload, Flame, Search
} from 'lucide-react';
import { Coupon, Banner, SiteSettings, Product } from '../../types';

export const AdminMarketingView: React.FC = () => {
  const { coupons, saveCoupon, toggleCoupon, deleteCoupon, banners, setBanners, products, setProducts, settings, updateSettings, showToast } = useStore();
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Banners List Local override/state
  const [bannersList, setBannersList] = useState<Banner[]>(banners);

  // Form toggles
  const [activeTab, setActiveTab] = useState<'banners' | 'deals' | 'coupons' | 'popups' | 'campaigns' | 'pixels'>('deals');
  const [dealSearchQuery, setDealSearchQuery] = useState('');
  
  // Banner creation fields
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bLink, setBLink] = useState('/category/women');
  const [bButtonText, setBButtonText] = useState('Shop Collection');
  const [bPosition, setBPosition] = useState<'hero' | 'category' | 'promo_strip' | 'ad_banner'>('hero');
  const [isBannerFormOpen, setIsBannerFormOpen] = useState(false);

  // Coupon creation fields
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'flat'>('flat');
  const [cValue, setCValue] = useState(200);
  const [cMinOrder, setCMinOrder] = useState(999);
  const [cUsageLimit, setCUsageLimit] = useState(500);
  const [cExpiry, setCExpiry] = useState('2026-12-31');
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);

  // Popups Config Local states
  const [promoPopupEnabled, setPromoPopupEnabled] = useState(true);
  const [exitPopupEnabled, setExitPopupEnabled] = useState(false);
  const [popupTitle, setPopupTitle] = useState('Festive Grand Bonanza! 🎉');
  const [popupOffer, setPopupOffer] = useState('Get Flat 20% off on your first traditional ethnic wear order.');

  // Pixels local states
  const [metaPixelId, setMetaPixelId] = useState('928104829104812');
  const [gtmId, setGtmId] = useState('G-KOLKATA8899');
  const [googleAdsId, setGoogleAdsId] = useState('AW-192049281');

  // Campaigns marketing setups
  const [campaignSegment, setCampaignSegment] = useState('all');
  const [campaignChannel, setCampaignChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [campaignSubject, setCampaignSubject] = useState('Celebrate in Style: Festive Silk Sarees are back in Stock!');
  const [campaignBody, setCampaignBody] = useState('Hello {{customer_name}}, prepare for the upcoming celebrations with PGmart handcrafted sarees. Free shipping over ₹999!');

  // BANNER HANDLERS WITH DEVICE UPLOAD & STORE CONTEXT SYNC
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      showToast('Image file size must be under 12MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBImage(reader.result);
        showToast('Photo uploaded from device successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditBannerImageFromDevice = (bannerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newImgUrl = reader.result;
        setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, image: newImgUrl } : b));
        setBannersList(prev => prev.map(b => b.id === bannerId ? { ...b, image: newImgUrl } : b));
        showToast('Hero banner photo updated from device!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      title: bTitle || 'Hero Fashion Banner',
      subtitle: bSubtitle || undefined,
      image: bImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
      link: bLink || '/category/women',
      buttonText: 'Shop Collection',
      position: bPosition,
      sortOrder: bannersList.length + 1,
      isActive: true
    };
    const updatedList = [...bannersList, newBanner];
    setBannersList(updatedList);
    setBanners(updatedList);
    setIsBannerFormOpen(false);
    // Reset
    setBTitle('');
    setBSubtitle('');
    setBImage('');
    setBLink('');
    showToast(`Banner frame added & synchronized with live store slider!`);
  };

  const handleToggleBannerStatus = (id: string) => {
    const updated = bannersList.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBannersList(updated);
    setBanners(updated);
    showToast('Banner active state updated on live store.');
  };

  const handleDeleteBanner = (id: string) => {
    const updated = bannersList.filter(b => b.id !== id);
    setBannersList(updated);
    setBanners(updated);
    showToast('Banner removed from hero slider.');
  };

  // COUPON HANDLERS
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;
    const newCoupon: Coupon = {
      id: `cop-${Date.now()}`,
      code: cCode.toUpperCase().replace(/\s+/g, ''),
      discountType: cType,
      value: Number(cValue),
      minOrderValue: Number(cMinOrder),
      usageLimit: Number(cUsageLimit),
      usedCount: 0,
      expiryDate: cExpiry,
      isActive: true
    };
    setCouponsList(prev => [newCoupon, ...prev]);
    setIsCouponFormOpen(false);
    setCCode('');
    showToast(`Promo Code ${newCoupon.code} is now live & valid on storefront checkouts!`);
  };

  const handleToggleCoupon = (id: string) => {
    setCouponsList(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    showToast('Coupon status updated.');
  };

  const handleDeleteCoupon = (id: string) => {
    setCouponsList(prev => prev.filter(c => c.id !== id));
    showToast('Coupon code archived.');
  };

  // CAMPAIGN DISPATCH SIMULATOR
  const handleSimulateCampaignSend = () => {
    showToast(`🚀 Initializing Bulk campaign via ${campaignChannel.toUpperCase()}...`);
    setTimeout(() => {
      showToast(`✨ Campaign successfully dispatched! Sent out to 420 active customers matching "${campaignSegment.toUpperCase()}" target segment!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      
      {/* HEADER TAB NAVIGATION */}
      <div className="bg-[#2B2620] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-stone-800 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#C0654B]" />
          <div>
            <h2 className="text-base font-bold font-serif">Marketing & Campaigns Suite</h2>
            <p className="text-[11px] text-stone-400">Increase storefront traffic, coupon codes, pop-ups, & pixel targets</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-stone-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'deals' ? 'bg-[#C0654B] text-white font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Deals of the Day</span>
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'banners' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Sliders & Banners
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'coupons' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Promo Coupons
          </button>
          <button
            onClick={() => setActiveTab('popups')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'popups' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Engagement Popups
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'campaigns' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            SMS/Email Blasts
          </button>
          <button
            onClick={() => setActiveTab('pixels')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'pixels' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Tracking Pixels
          </button>
        </div>
      </div>

      {/* DEALS OF THE DAY MANAGER */}
      {activeTab === 'deals' && (
        <div className="space-y-6">
          {/* Main Controls Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-[#C0654B] flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">Deals of the Day & Flash Sale Controls</h3>
                  <p className="text-xs text-stone-500">Control storefront deals section visibility, title, countdown timer & featured products</p>
                </div>
              </div>

              {/* Section Visibility Switch */}
              <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-stone-700">Deals Section Status:</span>
                <button
                  onClick={() => {
                    const nextVal = settings.dealsEnabled === false ? true : false;
                    updateSettings({ dealsEnabled: nextVal });
                    showToast(nextVal ? 'Deals of the Day is now LIVE on homepage!' : 'Deals of the Day section is hidden from homepage.');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer transition-colors ${
                    settings.dealsEnabled !== false ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {settings.dealsEnabled !== false ? 'ACTIVE (LIVE)' : 'DISABLED (HIDDEN)'}
                </button>
              </div>
            </div>

            {/* Quick Settings Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Section Display Title</label>
                <input
                  type="text"
                  value={settings.dealsTitle || 'Deals of the Day'}
                  onChange={(e) => updateSettings({ dealsTitle: e.target.value })}
                  placeholder="e.g. Deals of the Day"
                  className="w-full border border-stone-300 rounded-lg p-2.5 focus:border-[#C0654B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Timer Duration (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={settings.dealsTimerHours ?? 14}
                  onChange={(e) => updateSettings({ dealsTimerHours: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg p-2.5 focus:border-[#C0654B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Timer Duration (Minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={settings.dealsTimerMinutes ?? 22}
                  onChange={(e) => updateSettings({ dealsTimerMinutes: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg p-2.5 focus:border-[#C0654B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Auto Min Discount Threshold (%)</label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={settings.dealsMinDiscount ?? 20}
                  onChange={(e) => updateSettings({ dealsMinDiscount: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg p-2.5 focus:border-[#C0654B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Deal Selector List */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">
                  Featured Deal Products ({products.filter(p => p.isDealOfTheDay || p.tags?.includes('deal_of_the_day')).length} Selected)
                </h4>
                <p className="text-xs text-stone-500">Toggle products ON/OFF to explicitly feature them in the Deals of the Day section on the storefront</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dealSearchQuery}
                  onChange={(e) => setDealSearchQuery(e.target.value)}
                  placeholder="Search catalog products..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#C0654B]"
                />
              </div>
            </div>

            {/* Product Cards Grid for Toggling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
              {products
                .filter(p => p.name.toLowerCase().includes(dealSearchQuery.toLowerCase()))
                .map(product => {
                  const isDeal = product.isDealOfTheDay || product.tags?.includes('deal_of_the_day');
                  return (
                    <div
                      key={product.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isDeal ? 'border-[#C0654B] bg-[#F3E9E4]/40 shadow-xs' : 'border-stone-200 bg-stone-50/50'
                      }`}
                    >
                      <img
                        src={product.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded bg-white shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-xs text-stone-900 truncate">{product.name}</p>
                        <p className="text-[11px] text-stone-500">₹{product.discountPrice || product.basePrice} ({product.discountPercent || 0}% OFF)</p>
                        <button
                          onClick={() => {
                            const newStatus = !isDeal;
                            setProducts(prev => prev.map(p => {
                              if (p.id === product.id) {
                                const newTags = newStatus
                                  ? Array.from(new Set([...p.tags, 'deal_of_the_day' as const]))
                                  : p.tags.filter(t => t !== 'deal_of_the_day');
                                return { ...p, isDealOfTheDay: newStatus, tags: newTags };
                              }
                              return p;
                            }));
                            showToast(newStatus ? `🔥 "${product.name}" added to Deals of the Day!` : `Removed "${product.name}" from Deals.`);
                          }}
                          className={`mt-1 text-[10px] font-extrabold px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                            isDeal ? 'bg-[#C0654B] text-white hover:bg-[#8B4A38]' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{isDeal ? 'FEATURED IN DEALS' : '+ ADD TO DEALS'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 1. SLIDERS & BANNERS MANAGER */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">Homepage Sliders & Page Banners</h3>
              <p className="text-xs text-stone-400">Design promotional headers, hero sliders, and ad banners for your storefront</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Ad Banner Status Switch */}
              <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
                <span className="font-bold text-stone-700">Ad Banners (Above Deals):</span>
                <button
                  onClick={() => {
                    const nextVal = settings.adBannerEnabled === false ? true : false;
                    updateSettings({ adBannerEnabled: nextVal });
                    showToast(nextVal ? 'Ad Banners section is now LIVE above Deals of the Day!' : 'Ad Banners section is hidden.');
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-colors ${
                    settings.adBannerEnabled !== false ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {settings.adBannerEnabled !== false ? 'LIVE' : 'HIDDEN'}
                </button>
              </div>

              <button
                onClick={() => setIsBannerFormOpen(true)}
                className="px-4 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Slider Frame
              </button>
            </div>
          </div>

          {isBannerFormOpen && (
            <form onSubmit={handleSaveBanner} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 text-xs font-medium">
              <span className="font-bold text-stone-900 block text-sm border-b border-stone-100 pb-2">Schedule Promo Banner Frame</span>
              
              {/* Device Photo Upload Box */}
              <div className="border border-dashed border-stone-300 rounded-xl p-4 bg-stone-50 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 text-xs">Hero / Ad Banner Photo (Device Upload)</label>
                    <p className="text-[11px] text-stone-500">Upload high-resolution Indian model fashion photos directly from your phone or computer.</p>
                  </div>
                  
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    accept="image/*"
                    onChange={handleDeviceFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo from Device</span>
                  </button>
                </div>

                {/* Or image URL input */}
                <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">Or Image URL:</span>
                  <input
                    type="text"
                    value={bImage}
                    onChange={(e) => setBImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or data:image/..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg outline-none text-xs font-mono"
                  />
                </div>

                {/* Live Preview Box */}
                {bImage && (
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-stone-200 shadow-inner max-h-48 bg-stone-900">
                    <img src={bImage} alt="Banner Preview" className="w-full h-full object-contain" />
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      ✓ Live Upload Preview Ready
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Banner Title / Name (Internal Reference)</label>
                  <input
                    type="text"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    placeholder="e.g. Royal Silk Saree Collection 2026"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Placement Scope</label>
                  <select
                    value={bPosition}
                    onChange={(e) => setBPosition(e.target.value as any)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  >
                    <option value="hero">Main Hero Slider (Homepage)</option>
                    <option value="ad_banner">Ad Banner (Just Above Deals of the Day)</option>
                    <option value="category">Category Segment</option>
                    <option value="promo_strip">Bottom Promo Strip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Link Destination Target / Redirect Route</label>
                <input
                  type="text"
                  value={bLink}
                  onChange={(e) => setBLink(e.target.value)}
                  placeholder="e.g. /category/women?sub=w-ethnic"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Save Slider
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bannersList.map(ban => (
              <div key={ban.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-video bg-stone-900 overflow-hidden group">
                  <img src={ban.image} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  <span className="absolute top-2 left-2 text-[8px] bg-black/70 text-white font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                    {ban.position} Slider
                  </span>
                  
                  {/* Upload photo overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1.5 p-4 z-20">
                    <Upload className="w-6 h-6 text-[#C0654B]" />
                    <span className="text-xs font-bold bg-[#C0654B] px-3 py-1 rounded-full shadow-md">Replace Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditBannerImageFromDevice(ban.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="p-4 space-y-2 text-left">
                  <h4 className="font-extrabold text-stone-900 text-xs">{ban.title}</h4>
                  {ban.subtitle && <p className="text-[10px] text-stone-400 leading-snug">{ban.subtitle}</p>}
                  <p className="text-[9px] font-mono text-stone-400 truncate">Route: {ban.link}</p>
                </div>

                <div className="p-3 border-t border-stone-100 bg-stone-50 flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500">Displaying:</span>
                    <button
                      onClick={() => handleToggleBannerStatus(ban.id)}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg cursor-pointer ${
                        ban.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {ban.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteBanner(ban.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PROMO COUPONS MANAGER */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">Store Promotional Coupons</h3>
              <p className="text-xs text-stone-400">Generate discount codes to increase shopper conversions</p>
            </div>
            <button
              onClick={() => setIsCouponFormOpen(true)}
              className="px-4 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Promo Code
            </button>
          </div>

          {isCouponFormOpen && (
            <form onSubmit={handleSaveCoupon} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 text-xs font-medium">
              <span className="font-bold text-stone-900 block text-sm border-b border-stone-100 pb-2">Generate Promo Discount Code</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Coupon Promo Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20, ETHNIC99"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono text-sm font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat">Flat Amount Off (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={cValue}
                    onChange={(e) => setCValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={cMinOrder}
                    onChange={(e) => setCMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    required
                    value={cUsageLimit}
                    onChange={(e) => setCUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={cExpiry}
                    onChange={(e) => setCExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(cop => (
              <div key={cop.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between text-left space-y-3">
                <div className="flex justify-between items-start border-b border-stone-100 pb-2">
                  <div>
                    <span className="font-mono font-black text-sm tracking-wider text-stone-900 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                      {cop.code}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold font-mono ml-2 block mt-1">Exp: {cop.expiryDate}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    cop.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {cop.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-semibold text-stone-700">
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-mono text-stone-900 font-bold">
                      {cop.discountType === 'percentage' ? `${cop.value}% OFF` : `₹${cop.value} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Floor Gate:</span>
                    <span className="font-mono text-stone-500">Min. ₹{cop.minOrderValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used / Total limit:</span>
                    <span className="font-mono text-stone-500">{cop.usedCount} / {cop.usageLimit} checkouts</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100 justify-between items-center">
                  <button
                    onClick={() => handleToggleCoupon(cop.id)}
                    className="text-[10px] font-bold text-[#C0654B] hover:underline cursor-pointer"
                  >
                    Toggle Active State
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(cop.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ENGAGEMENT POPUPS */}
      {activeTab === 'popups' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">Promotional Engagement Popups</h3>
            <p className="text-xs text-stone-400">Configure pop-up triggers for first-time visitors or on exit-intent signals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-stone-700">
            {/* Pop-up 1: First Visit offer */}
            <div className="border border-stone-200 p-5 rounded-2xl space-y-4 bg-stone-50/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-sm">1. First-Visit Welcome Offer Popup</span>
                <input
                  type="checkbox"
                  checked={promoPopupEnabled}
                  onChange={(e) => setPromoPopupEnabled(e.target.checked)}
                  className="rounded cursor-pointer w-4 h-4 accent-[#C0654B]"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Popup Banner Title</label>
                  <input
                    type="text"
                    value={popupTitle}
                    onChange={(e) => setPopupTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 bg-white rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Body Text Offer details</label>
                  <textarea
                    value={popupOffer}
                    onChange={(e) => setPopupOffer(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-300 bg-white rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast('First-visit promo modal specifications updated.');
                }}
                className="px-4 py-2 bg-[#C0654B] text-white rounded-lg font-bold hover:bg-[#8B4A38] shadow-sm cursor-pointer"
              >
                Save welcome Popup
              </button>
            </div>

            {/* Pop-up 2: Exit Intent offer */}
            <div className="border border-stone-200 p-5 rounded-2xl space-y-4 bg-stone-50/40 justify-between flex flex-col">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-sm">2. Exit-Intent Rescue Popup</span>
                  <input
                    type="checkbox"
                    checked={exitPopupEnabled}
                    onChange={(e) => setExitPopupEnabled(e.target.checked)}
                    className="rounded cursor-pointer w-4 h-4 accent-[#C0654B]"
                  />
                </div>
                <p className="text-[10.5px] text-stone-400 leading-relaxed mt-2">
                  Triggers immediately when a user moves their cursor out of the viewport window (intending to close or exit). Best for recovering abandoned carts with last-minute flat delivery coupon code.
                </p>
              </div>

              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/50 flex items-start gap-2 text-[10.5px] leading-relaxed">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-[#C0654B]" />
                <span>Exit Intent requires client script to trace mouse vector movements. Toggling on will auto-simulate exit behavior popup.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast('Exit-intent tracker configured and active.');
                }}
                className="px-4 py-2 border border-[#C0654B] text-[#C0654B] hover:bg-[#C0654B]/5 rounded-lg font-bold cursor-pointer"
              >
                Enable Exit Intent Guard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CAMPAIGN BULK TRANSMITTER */}
      {activeTab === 'campaigns' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 text-left">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">SMS / Email / WhatsApp Segment Broadcasts</h3>
            <p className="text-xs text-stone-400">Trigger news notifications, festive catalogs, or cart recovery reminders instantly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-stone-700">
            {/* Filters */}
            <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800 block text-xs border-b border-stone-200 pb-2">Target Segment Filter</span>
              
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">1. Choose Audience Segment</label>
                  <select
                    value={campaignSegment}
                    onChange={(e) => setCampaignSegment(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-bold"
                  >
                    <option value="all">All Registered Customers (142 users)</option>
                    <option value="abandoned">Abandoned Cart Users (12 users)</option>
                    <option value="loyal">High LTV repeat shoppers (24 users)</option>
                    <option value="kids">Kids collection shoppers (18 users)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">2. Choose Delivery Channel</label>
                  <div className="flex gap-2 font-bold font-mono">
                    {(['email', 'sms', 'whatsapp'] as const).map(channel => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setCampaignChannel(channel)}
                        className={`flex-1 py-2 rounded-lg text-center uppercase tracking-wider ${
                          campaignChannel === channel ? 'bg-[#C0654B] text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-500'
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Template WYSIWYG */}
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-3">
                {campaignChannel === 'email' && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Email Subject Header</label>
                    <input
                      type="text"
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none font-bold text-stone-900"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Campaign Message Content Body</label>
                  <textarea
                    value={campaignBody}
                    onChange={(e) => setCampaignBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-stone-400">Supported variables: <code className="bg-stone-100 p-0.5 text-stone-600 font-bold">{"{{customer_name}}"}</code>, <code className="bg-stone-100 p-0.5 text-stone-600 font-bold">{"{{store_name}}"}</code></span>
                </div>

                <div className="flex justify-end pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleSimulateCampaignSend}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <Send className="w-4 h-4" /> Trigger Blast Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PIXELS SETTINGS */}
      {activeTab === 'pixels' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-left">
          <div className="border-b border-stone-100 pb-2">
            <h3 className="text-base font-bold font-serif text-stone-900">Facebook Meta Pixels & Google Analytics Tags</h3>
            <p className="text-xs text-stone-400">Paste tracking tags here. They are dynamically placed site-wide to measure conversions & ad performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-stone-700">
            {/* Meta Pixel */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3">
              <span className="font-bold text-stone-800 block text-xs">1. Meta Pixel ID</span>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 19284719283719"
                className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none font-mono"
              />
              <p className="text-[10px] text-stone-400 leading-snug">Tracks events like "Add to Cart", "Initiate Checkout", and "Purchase" for custom audience retargeting on Facebook & Instagram.</p>
            </div>

            {/* GA4 */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3">
              <span className="font-bold text-stone-800 block text-xs">2. Google Analytics (GA4) Tag</span>
              <input
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="e.g. G-XXXXXXX"
                className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none font-mono"
              />
              <p className="text-[10px] text-stone-400 leading-snug">Essential for demographic profiling, channel attribution, bounce rate auditing, and monitoring organic search entries.</p>
            </div>

            {/* Google Ads conversion */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3">
              <span className="font-bold text-stone-800 block text-xs">3. Google Ads Tracking Tag</span>
              <input
                type="text"
                value={googleAdsId}
                onChange={(e) => setGoogleAdsId(e.target.value)}
                placeholder="e.g. AW-XXXXXXXX"
                className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none font-mono"
              />
              <p className="text-[10px] text-stone-400 leading-snug">Attributes store sales directly to your paid Google search & shopping ad campaigns. Vital for return-on-ad-spend (ROAS) analytics.</p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              onClick={() => {
                showToast('Tracking analytics keys saved and placed.');
              }}
              className="px-6 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
            >
              Save Pixel Identifiers
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
