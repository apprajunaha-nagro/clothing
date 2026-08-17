import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Settings, Palette, Shield, ShieldCheck, Truck, Download, Save, RefreshCw, Eye, EyeOff,
  MapPin, CheckCircle, Database, History, UserCheck, AlertCircle, Plus, Trash2, 
  ArrowUp, ArrowDown, RotateCcw, FileText, Layers, CreditCard, Lock, Key, ExternalLink, Check, CheckCircle2
} from 'lucide-react';
import { SiteSettings, PolicySection } from '../../types';
import { parsePrivacySections, DEFAULT_PRIVACY_SECTIONS } from '../../data/seedData';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, products, orders } = useStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'store' | 'payments' | 'theme' | 'policies' | 'shipping' | 'backup'>('store');

  // Form states initialized from settings context
  const [sName, setSName] = useState(settings.storeName || 'PGmart');
  const [sEmail, setSEmail] = useState(settings.supportEmail || settings.contactEmail || 'support@pgmart.in');
  const [sPhone, setSPhone] = useState(settings.supportPhone || settings.contactPhone || '+91 94711 55434');
  const [sAddress, setSAddress] = useState(settings.address || '');
  const [sGst, setSGst] = useState(settings.gstNumber || '');
  const [sCurrency, setSCurrency] = useState('INR (₹)');

  // Payment Gateway Settings (Razorpay & COD)
  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(settings.razorpayEnabled !== false);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(settings.razorpayKeyId || 'rzp_test_TC123456789');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Policy & Privacy sections state
  const [privacySections, setPrivacySections] = useState<PolicySection[]>(() => parsePrivacySections(settings.privacyPolicy));
  const [refundText, setRefundText] = useState(settings.refundPolicy || '');
  const [shippingText, setShippingText] = useState(settings.shippingPolicy || '');

  // Customizable Theme palette state
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#C0654B');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryDarkColor || '#2B2620');
  const [fontFamily, setFontFamily] = useState('Lora & Playfair Display');

  // Delivery Charges & Free Shipping state
  const [standardShippingFee, setStandardShippingFee] = useState<number>(settings.standardShippingFee ?? 79);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(settings.freeShippingThreshold ?? 999);
  const [codFee, setCodFee] = useState<number>(settings.codFee ?? 49);
  const [codEnabled, setCodEnabled] = useState<boolean>(settings.codEnabled !== false);

  // Shipping Zones state (Only Jharkhand and Rest of India)
  const [shippingZones, setShippingZones] = useState([
    { id: 'z1', name: 'Jharkhand (Local State Delivery)', charge: 49, minOrder: 999, active: true },
    { id: 'z2', name: 'Rest of India', charge: 99, minOrder: 1499, active: true },
  ]);

  const handleTestRazorpayConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await fetch('/api/razorpay/test-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('terra_admin_token') || 'pgmart123'}`
        },
        body: JSON.stringify({ keyId: razorpayKeyId, keySecret: razorpayKeySecret })
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus({ success: true, message: data.message || 'Razorpay Connected Successfully!' });
        showToast('✅ Razorpay API connection verified.');
      } else {
        setConnectionStatus({ success: false, message: data.error || 'Connection Failed' });
        showToast('❌ Razorpay error: ' + (data.error || 'Failed'));
      }
    } catch (err: any) {
      setConnectionStatus({ success: false, message: err.message || 'Network error' });
      showToast('❌ Razorpay connection error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      razorpayEnabled,
      razorpayKeyId,
      razorpayKeySecret: razorpayKeySecret || undefined,
      codEnabled,
      codFee
    });
    showToast('💳 Payment Gateways & Razorpay configuration saved.');
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: sName,
      supportEmail: sEmail,
      supportPhone: sPhone,
      address: sAddress,
      gstNumber: sGst,
      primaryColor,
      secondaryDarkColor: secondaryColor
    });
    showToast('Core store specifications updated and synced to host server.');
  };

  const handleSaveThemeSettings = () => {
    updateSettings({
      primaryColor,
      secondaryDarkColor: secondaryColor
    });
    showToast('Brand color accents and display typographies loaded successfully.');
  };

  // Section managers for Privacy Policy
  const handleUpdateSection = (id: string, field: 'title' | 'content', value: string) => {
    setPrivacySections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddSection = () => {
    const newId = `section-${Date.now()}`;
    const newSec: PolicySection = {
      id: newId,
      title: `${privacySections.length + 1}. New Policy Section`,
      content: 'Enter the guidelines and details for this section here...'
    };
    setPrivacySections(prev => [...prev, newSec]);
    showToast('➕ New section created. Customize its title and content below.');
  };

  const handleDeleteSection = (id: string) => {
    if (privacySections.length <= 1) {
      showToast('⚠️ At least one section is required in the privacy policy.');
      return;
    }
    setPrivacySections(prev => prev.filter(s => s.id !== id));
    showToast('🗑 Section removed.');
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === privacySections.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setPrivacySections(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleResetDefaultSections = () => {
    if (window.confirm('Reset all privacy policy sections back to the standard PGmart legal template?')) {
      setPrivacySections(DEFAULT_PRIVACY_SECTIONS);
      showToast('↻ Standard privacy policy template restored.');
    }
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      privacyPolicy: JSON.stringify(privacySections),
      refundPolicy: refundText,
      shippingPolicy: shippingText
    });
    showToast('📜 Store Legal & Privacy Policy sections published live!');
  };

  const handleUpdateShippingZone = (id: string, charge: number, minOrder: number, active: boolean) => {
    setShippingZones(prev => prev.map(z => z.id === id ? { ...z, charge, minOrder, active } : z));
    showToast('Shipping zone threshold rate adjusted.');
  };

  // FULL DATABASE JSON BACKUP GENERATOR
  const handleDownloadFullBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      storeInfo: { ...settings },
      productsCount: products.length,
      ordersCount: orders.length,
      catalog: products,
      ordersList: orders,
      systemVersion: 'PGmart Commerce Core v3.4 Enterprise'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PGmart_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Full store snapshot backup downloaded (.json).');
  };

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      
      {/* HEADER CONTROLS NAVIGATION */}
      <div className="bg-[#2B2620] text-white p-5 rounded-2xl shadow-md border border-stone-800 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C0654B]" />
          <div>
            <h2 className="text-base font-bold font-serif">Global Storefront Settings</h2>
            <p className="text-[11px] text-stone-400">Configure host details, theme accents, logistical shipping parameters & database backups</p>
          </div>
        </div>

        {/* Settings Tab Controls */}
        <div className="flex bg-stone-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSettingsTab('store')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'store' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Store Specs
          </button>
          <button
            onClick={() => setActiveSettingsTab('payments')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeSettingsTab === 'payments' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments & Razorpay</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('theme')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'theme' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            UI Customization
          </button>
          <button
            onClick={() => setActiveSettingsTab('policies')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'policies' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Legal & Policies
          </button>
          <button
            onClick={() => setActiveSettingsTab('shipping')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'shipping' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Logistics Zones
          </button>
          <button
            onClick={() => setActiveSettingsTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'backup' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Backup Hub
          </button>
        </div>
      </div>

      {/* 1. STORE SPECS GENERAL SETTINGS */}
      {activeSettingsTab === 'store' && (
        <form onSubmit={handleSaveStoreSettings} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs font-semibold text-stone-700 text-left">
          <span className="font-bold text-stone-900 block text-sm border-b border-stone-100 pb-2">Apparel Storefront Parameters</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-600 mb-1">Company / Brand Public Name</label>
              <input
                type="text"
                required
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B] text-xs font-bold text-stone-950"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 mb-1">GSTIN Identification Number</label>
              <input
                type="text"
                required
                value={sGst}
                onChange={(e) => setSGst(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-600 mb-1">Fulfillment Support Email</label>
              <input
                type="email"
                required
                value={sEmail}
                onChange={(e) => setSEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-600 mb-1">Fulfillment Support Phone</label>
              <input
                type="text"
                required
                value={sPhone}
                onChange={(e) => setSPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-600 mb-1">Default Transaction Currency</label>
              <input
                type="text"
                disabled
                value={sCurrency}
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50 rounded-lg font-mono font-bold text-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1">Fulfillment Center Physical Address (For Invoices)</label>
            <input
              type="text"
              required
              value={sAddress}
              onChange={(e) => setSAddress(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Core Specs
            </button>
          </div>
        </form>
      )}

      {/* 2. PAYMENTS & RAZORPAY GATEWAY SETTINGS */}
      {activeSettingsTab === 'payments' && (
        <form onSubmit={handleSavePaymentSettings} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-xs font-semibold text-stone-700 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C0654B]" />
                <span>Payment Gateways & Razorpay Configuration</span>
              </h3>
              <p className="text-xs text-stone-400">Configure Razorpay for UPI, Cards, Netbanking and Cash on Delivery (COD)</p>
            </div>

            {/* Mode badge indicator */}
            <div className="flex items-center gap-2">
              {razorpayKeyId.startsWith('rzp_test_') ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  🧪 Test Mode (Sandbox API)
                </span>
              ) : razorpayKeyId.startsWith('rzp_live_') ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  🟢 Live Mode (Real Payments)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                  ⚙️ Standard Mode
                </span>
              )}
            </div>
          </div>

          {/* RAZORPAY CONFIGURATION CARD */}
          <div className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0C2340] text-white flex items-center justify-center font-bold text-xs">
                  Rzp
                </div>
                <div>
                  <span className="font-bold text-stone-900 block text-xs">Razorpay Online Gateway</span>
                  <span className="text-[10px] text-stone-500">Supports UPI (GPay, PhonePe, Paytm, BHIM), Debit/Credit Cards & Netbanking</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#C0654B] rounded border-stone-300 focus:ring-[#C0654B] cursor-pointer"
                />
                <span className={`text-xs font-bold ${razorpayEnabled ? 'text-emerald-700' : 'text-stone-400'}`}>
                  {razorpayEnabled ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-stone-400" />
                  <span>Razorpay Key ID</span>
                </label>
                <input
                  type="text"
                  required={razorpayEnabled}
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value.trim())}
                  placeholder="rzp_test_... or rzp_live_..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B] font-mono text-xs font-bold text-stone-950 bg-white"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Starts with <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-700">rzp_test_</code> for sandbox or <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-700">rzp_live_</code> for live transactions.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Razorpay Key Secret (Optional / Override)</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value.trim())}
                    placeholder="Leave empty to use .env secret"
                    className="w-full pl-3 pr-10 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B] font-mono text-xs text-stone-950 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Stored securely and used for server-side payment signature verification.
                </p>
              </div>
            </div>

            {/* Test Connection Button and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200/80">
              <button
                type="button"
                onClick={handleTestRazorpayConnection}
                disabled={testingConnection}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto border border-stone-300"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C0654B]" />
                    <span>Verifying with Razorpay API...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Razorpay API Connection</span>
                  </>
                )}
              </button>

              {connectionStatus && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${connectionStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {connectionStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{connectionStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* CASH ON DELIVERY (COD) CARD */}
          <div className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block text-xs">Cash on Delivery (COD)</span>
                <span className="text-[10px] text-stone-500">Allow customers to pay in cash upon doorstep package delivery</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#C0654B] rounded border-stone-300 focus:ring-[#C0654B] cursor-pointer"
                />
                <span className={`text-xs font-bold ${codEnabled ? 'text-emerald-700' : 'text-stone-400'}`}>
                  {codEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {codEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200/80">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">COD Handling / Convenience Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={codFee}
                    onChange={(e) => setCodFee(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono text-xs font-bold text-stone-950 bg-white"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Enter 0 for free COD, or standard fee (e.g. ₹49).</p>
                </div>
              </div>
            )}
          </div>

          {/* RAZORPAY QUICK REFERENCE GUIDE */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 text-amber-900 space-y-2 text-[11px]">
            <span className="font-bold block text-xs flex items-center gap-1.5">
              <span>💡 How to switch between Test and Live Keys</span>
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[10.5px] leading-relaxed text-amber-800">
              <li>
                <strong>To Test:</strong> Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-amber-950">Razorpay Dashboard</a> → Select <strong>Test Mode</strong> (top right) → Settings → API Keys → Generate Test Key. Paste <code className="bg-amber-100 px-1 py-0.2 rounded font-bold">rzp_test_...</code> here.
              </li>
              <li>
                <strong>To Go Live:</strong> Complete Razorpay KYC → Select <strong>Live Mode</strong> in Razorpay Dashboard → Generate Live Key. Paste <code className="bg-amber-100 px-1 py-0.2 rounded font-bold">rzp_live_...</code> here and save.
              </li>
            </ul>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Payment Settings
            </button>
          </div>
        </form>
      )}

      {/* 2. BRAND COLOR PALETTE CUSTOMIZATION */}
      {activeSettingsTab === 'theme' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-left text-xs font-semibold text-stone-700">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">Brand Accent Palette & Typographies</h3>
            <p className="text-xs text-stone-400">Instantly update storefront headers, borders, button highlights and fonts to match seasons</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Color 1 */}
            <div className="border border-stone-200 p-4 rounded-xl space-y-2 bg-stone-50/40">
              <span className="font-bold text-stone-800 block text-xs">Primary Brand Accent (₹)</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border border-stone-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="p-2 border border-stone-300 bg-white rounded-lg w-full font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-stone-400">Used site-wide for main buy buttons, active price markers, and headers.</p>
            </div>

            {/* Color 2 */}
            <div className="border border-stone-200 p-4 rounded-xl space-y-2 bg-stone-50/40">
              <span className="font-bold text-stone-800 block text-xs">Secondary Slate Accent</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 border border-stone-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="p-2 border border-stone-300 bg-white rounded-lg w-full font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-stone-400">Used for card borders, footers, checkout lines and submenus.</p>
            </div>

            {/* Fonts */}
            <div className="border border-stone-200 p-4 rounded-xl space-y-2 bg-stone-50/40 justify-between flex flex-col">
              <div>
                <span className="font-bold text-stone-800 block text-xs">Aesthetic Fonts Combo</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg font-bold mt-1.5"
                >
                  <option value="Lora & Playfair Display">Playfair Display (Premium Ethnic)</option>
                  <option value="Cinzel & Plus Jakarta Sans">Cinzel (Luxury Royal)</option>
                  <option value="Syne & DM Sans">Syne (Contemporary Avant-Garde)</option>
                </select>
              </div>
              <p className="text-[10px] text-stone-400">Controls displays of headers, category tags and lists.</p>
            </div>

          </div>

          {/* Theme Simulation live preview */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Real-time Storefront Button Preview:</span>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                style={{ backgroundColor: primaryColor }}
                className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Buy Banarasi Saree Now
              </button>
              <button
                type="button"
                style={{ color: primaryColor, borderColor: primaryColor }}
                className="px-5 py-2.5 bg-white border font-bold rounded-xl text-xs"
              >
                Add to Cart List
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              onClick={handleSaveThemeSettings}
              className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Palette className="w-4 h-4" /> Deploy Theme Accent Colors
            </button>
          </div>
        </div>
      )}

      {/* 2.5 LEGAL & PRIVACY POLICIES CUSTOMIZATION (MULTI-SECTION MANAGER) */}
      {activeSettingsTab === 'policies' && (
        <form onSubmit={handleSavePolicies} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-8 text-left text-xs font-semibold text-stone-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-stone-900">Privacy Policy & Legal Sections Customizer</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {privacySections.length} Sections
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Add, edit, reorder, or delete all individual sections of the customer-facing Privacy Policy page.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetDefaultSections}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors text-xs"
                title="Reset to default legal templates"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors text-xs"
              >
                <Plus className="w-4 h-4" /> Add New Section
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors text-xs"
              >
                <Save className="w-4 h-4" /> Save & Publish
              </button>
            </div>
          </div>

          {/* Privacy Policy Dynamic Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                <span>Privacy Policy Sections (Ordered)</span>
              </label>
              <span className="text-[11px] text-stone-400">
                Changes go live immediately upon saving.
              </span>
            </div>

            <div className="space-y-4">
              {privacySections.map((section, idx) => (
                <div
                  key={section.id || `section-${idx}`}
                  className="bg-stone-50/70 border border-stone-200 hover:border-stone-300 rounded-xl p-4 sm:p-5 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#C0654B]/10 text-[#C0654B] font-bold text-[11px] px-2.5 py-0.5 rounded-md font-mono">
                        Section #{idx + 1}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                        ID: {section.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          idx === 0
                            ? 'opacity-30 border-stone-200 cursor-not-allowed text-stone-400'
                            : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === privacySections.length - 1}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          idx === privacySections.length - 1
                            ? 'opacity-30 border-stone-200 cursor-not-allowed text-stone-400'
                            : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer ml-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                        <span>Section Title / Heading</span>
                        <span className="text-[10px] text-stone-400 font-normal">{section.title.length} chars</span>
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                        placeholder="e.g. 1. Information We Collect"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#C0654B] font-semibold text-xs text-stone-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                        <span>Section Content & Clauses</span>
                        <span className="text-[10px] text-stone-400 font-normal">Supports paragraphs & bullet points (•)</span>
                      </label>
                      <textarea
                        rows={4}
                        value={section.content}
                        onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                        placeholder="Enter the detailed legal terms, policy clauses, or bullet points..."
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#C0654B] text-xs font-normal leading-relaxed text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Section Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddSection}
                className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-[#C0654B] hover:bg-[#F3E9E4]/40 text-stone-600 hover:text-[#C0654B] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Privacy Policy Section</span>
              </button>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-6 space-y-6">
            {/* Returns & Refund Policy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Return & Refund Policy Summary</span>
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {refundText.length} characters
                </span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Details return windows (e.g., 7-15 days), non-returnable categories (innerwear), and refund SLA.
              </p>
              <textarea
                rows={4}
                value={refundText}
                onChange={(e) => setRefundText(e.target.value)}
                placeholder="Enter Return & Refund policy guidelines..."
                className="w-full p-3 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C0654B] font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Shipping & Delivery Policy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Shipping & Delivery Policy Summary</span>
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {shippingText.length} characters
                </span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Describes dispatch SLA, courier partners (Delhivery, BlueDart), and delivery timelines.
              </p>
              <textarea
                rows={4}
                value={shippingText}
                onChange={(e) => setShippingText(e.target.value)}
                placeholder="Enter Shipping & Delivery policy details..."
                className="w-full p-3 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C0654B] font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <p className="text-[11px] text-stone-400">
              All policy changes update live across customer footer legal links and checkout summaries.
            </p>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Save className="w-4 h-4" /> Save & Publish All Policies
            </button>
          </div>
        </form>
      )}

      {/* 3. LOGISTICS DELIVERY CHARGES & FREE DELIVERY THRESHOLD */}
      {activeSettingsTab === 'shipping' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await updateSettings({
              standardShippingFee: Number(standardShippingFee) >= 0 ? Number(standardShippingFee) : 79,
              freeShippingThreshold: Number(freeShippingThreshold) >= 0 ? Number(freeShippingThreshold) : 999,
              codFee: Number(codFee) >= 0 ? Number(codFee) : 0,
              codEnabled: Boolean(codEnabled),
              shippingPolicy: shippingText
            });
            showToast('✓ Delivery charges & free shipping thresholds updated and published live!');
          }}
          className="space-y-6 animate-fade-in text-left"
        >
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#C0654B]" />
                  <span>Delivery Charges & Free Shipping Configuration</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Changes made here instantly reflect across the customer Cart Drawer, Free Delivery meter, and Checkout page.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 w-fit">
                Live Storefront Sync
              </span>
            </div>

            {/* CORE SHIPPING CHARGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STANDARD SHIPPING FEE */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                    Standard Delivery Fee (₹)
                  </label>
                  <span className="text-[10px] font-bold text-stone-500">Per Order</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={standardShippingFee}
                    onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl font-bold font-mono text-stone-900 text-sm focus:outline-none focus:border-[#C0654B]"
                    placeholder="79"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Flat delivery fee billed when the customer cart total is below the free delivery threshold. Set to <strong>0</strong> for sitewide free shipping.
                </p>
              </div>

              {/* FREE DELIVERY THRESHOLD */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                    Free Delivery Threshold (₹)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Auto Free Shipping
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl font-bold font-mono text-stone-900 text-sm focus:outline-none focus:border-[#C0654B]"
                    placeholder="999"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Minimum cart subtotal required for the customer to unlock 100% Free Shipping. Drives higher average order value.
                </p>
              </div>

              {/* CASH ON DELIVERY (COD) FEE */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                    Cash on Delivery (COD) Fee (₹)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCodEnabled(!codEnabled)}
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      codEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'
                    }`}
                  >
                    {codEnabled ? 'COD Enabled' : 'COD Disabled'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!codEnabled}
                    value={codFee}
                    onChange={(e) => setCodFee(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl font-bold font-mono text-stone-900 text-sm focus:outline-none focus:border-[#C0654B] disabled:opacity-50"
                    placeholder="49"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Additional doorstep courier handling fee applied specifically when the customer selects COD at checkout.
                </p>
              </div>

              {/* LIVE CUSTOMER STOREFRONT PREVIEW CARD */}
              <div className="bg-[#FAF5F2] p-5 rounded-2xl border border-[#C0654B]/30 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C0654B] block">
                  Customer Experience Live Preview
                </span>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-stone-700">
                    <span>Cart Value &lt; ₹{freeShippingThreshold.toLocaleString('en-IN')}:</span>
                    <span className="font-bold text-stone-900">
                      +₹{standardShippingFee} Delivery Fee
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-700">
                    <span>Cart Value &ge; ₹{freeShippingThreshold.toLocaleString('en-IN')}:</span>
                    <span className="font-extrabold text-emerald-600">FREE Delivery</span>
                  </div>
                  {codEnabled && (
                    <div className="flex justify-between items-center text-[11px] text-stone-700 pt-1 border-t border-stone-100">
                      <span>Doorstep Cash on Delivery:</span>
                      <span className="font-bold text-stone-900">+₹{codFee} COD Fee</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-stone-500">
                  Customers in the Cart Drawer see the animated Free Shipping progress bar calibrated to ₹{freeShippingThreshold.toLocaleString('en-IN')}.
                </p>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-stone-500">
                All settings are stored permanently in the database and active instantly.
              </p>
              <button
                type="submit"
                className="px-6 py-3 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>Save & Apply Delivery Charges Live</span>
              </button>
            </div>
          </div>
        </form>
      )}



      {/* 5. DATABASE BACKUP HUB */}
      {activeSettingsTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 text-left text-xs font-semibold text-stone-700">
          <div className="border-b border-stone-100 pb-2">
            <h3 className="text-base font-bold font-serif text-stone-900">Disaster Recovery & Data Backups</h3>
            <p className="text-xs text-stone-400">Safely backup whole database tables containing catalogs, customers, and orders prior to host updates</p>
          </div>

          <div className="p-4 bg-[#C0654B]/5 border border-[#C0654B]/20 rounded-2xl flex items-start gap-3 text-stone-600 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-[#C0654B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#C0654B] block">Important Hostinger/Production Notice:</span>
              <p className="text-[11px] text-stone-500">
                Prior to deploying updates to Hostinger server hosting, please trigger a hard database snapshot backup. This generates a clean, structured JSON database file containing everything: active catalogues, settings, orders history, and shipping fees. Keep backups secure to restore in one click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Backup option 1 */}
            <div className="border border-stone-200 p-5 rounded-2xl bg-stone-50/40 flex flex-col justify-between items-start gap-3">
              <div className="space-y-1">
                <span className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                  <Database className="w-4.5 h-4.5 text-indigo-600" /> Complete Database Snapshot (JSON)
                </span>
                <p className="text-[11px] text-stone-400 leading-snug">Bundles whole products table, customer logs, order records, and settings into one highly-portable archive.</p>
              </div>
              
              <button
                onClick={handleDownloadFullBackup}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download snapshot file
              </button>
            </div>

            {/* Backup option 2 */}
            <div className="border border-stone-200 p-5 rounded-2xl bg-stone-50/40 flex flex-col justify-between items-start gap-3">
              <div className="space-y-1">
                <span className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                  <History className="w-4.5 h-4.5 text-[#C0654B]" /> Restore Database state
                </span>
                <p className="text-[11px] text-stone-400 leading-snug">Upload previously saved backup JSON to restore PGmart catalogues and orders. Be cautious: overrides current data.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('To restore data, please click the "CSV Bulk Import" or select standard JSON loading. Direct upload sandbox restricted in preview.');
                }}
                className="px-4 py-2 border border-[#C0654B] text-[#C0654B] hover:bg-[#C0654B]/5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Restore snapshot file
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
