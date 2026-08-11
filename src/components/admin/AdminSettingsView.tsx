import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Settings, Palette, Shield, Truck, Download, Save, RefreshCw, Eye, 
  MapPin, CheckCircle, Database, History, UserCheck, AlertCircle 
} from 'lucide-react';
import { SiteSettings } from '../../types';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, products, orders } = useStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'store' | 'theme' | 'shipping' | 'roles' | 'backup'>('store');

  // Form states initialized from settings context
  const [sName, setSName] = useState(settings.storeName || 'PGmart');
  const [sEmail, setSEmail] = useState(settings.supportEmail || settings.contactEmail || 'support@pgmart.com');
  const [sPhone, setSPhone] = useState(settings.supportPhone || settings.contactPhone || '+91 94711 55434');
  const [sAddress, setSAddress] = useState(settings.address || '');
  const [sGst, setSGst] = useState(settings.gstNumber || '');
  const [sCurrency, setSCurrency] = useState('INR (₹)');

  // Customizable Theme palette state
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#C0654B');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryDarkColor || '#2B2620');
  const [fontFamily, setFontFamily] = useState('Lora & Playfair Display');

  // Shipping Zones state
  const [shippingZones, setShippingZones] = useState([
    { id: 'z1', name: 'West Bengal (Local)', charge: 49, minOrder: 999, active: true },
    { id: 'z2', name: 'Metros (Delhi, Mumbai, Bengaluru)', charge: 79, minOrder: 1499, active: true },
    { id: 'z3', name: 'Rest of India', charge: 119, minOrder: 1999, active: true },
    { id: 'z4', name: 'International Shipping', charge: 2499, minOrder: 15000, active: false },
  ]);

  // Admin logins and roles states
  const adminUsers = [
    { name: 'Priyam Ghoshal', email: 'priyam@pgmart.com', role: 'Super Admin', lastLogin: 'Today, 09:12 AM', ip: '192.168.1.14' },
    { name: 'Swarnali Sen', email: 'logistics@pgmart.com', role: 'Logistics Manager', lastLogin: 'Yesterday, 04:30 PM', ip: '103.45.2.89' },
    { name: 'Rahul Dev', email: 'support@pgmart.com', role: 'Support Agent', lastLogin: '3 days ago', ip: '122.10.85.12' },
  ];

  // System Audit Logs states
  const auditLogs = [
    { timestamp: '2026-08-03 09:22:15', user: 'Priyam Ghoshal', action: 'Created new product variant "Banarasi Silk Saree XL"', type: 'catalog' },
    { timestamp: '2026-08-03 08:14:10', user: 'Swarnali Sen', action: 'Dispatched order #PGM-5201 via Delhivery Express', type: 'logistics' },
    { timestamp: '2026-08-02 18:44:59', user: 'Priyam Ghoshal', action: 'Generated coupon code "FESTIVE15"', type: 'marketing' },
    { timestamp: '2026-08-02 11:30:25', user: 'Rahul Dev', action: 'Approved product review by "Aishwarya Roy"', type: 'moderation' },
  ];

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
      ...settings,
      primaryColor,
      secondaryColor
    });
    showToast('Brand color accents and display typographies loaded successfully.');
  };

  const handleUpdateShippingZone = (id: string, charge: number, minOrder: number, active: boolean) => {
    setShippingZones(prev => prev.map(z => z.id === id ? { ...z, charge, minOrder, active } : z));
    showToast('Shipping zone threshold rate adjusted.');
  };

  // FULL DATABASE JSON BACKUP GENERATOR
  const handleDownloadFullBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      storeSettings: settings,
      shippingZones,
      productsCatalog: products,
      storeOrdersHistory: orders,
      adminLogs: auditLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `terra_ethnic_db_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    showToast('Complete JSON Database Backup downloaded successfully.');
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
            onClick={() => setActiveSettingsTab('theme')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'theme' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            UI Customization
          </button>
          <button
            onClick={() => setActiveSettingsTab('shipping')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'shipping' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Logistics Zones
          </button>
          <button
            onClick={() => setActiveSettingsTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSettingsTab === 'roles' ? 'bg-[#C0654B] text-white' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Logins & Audit
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

      {/* 3. LOGISTICS SHIPPING ZONES */}
      {activeSettingsTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs font-semibold text-stone-700 text-left">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">Logistical Delivery Zones & Delivery Fees</h3>
            <p className="text-xs text-stone-400">Set direct flat delivery fees and order minimum thresholds for free shipping</p>
          </div>

          <div className="border border-stone-200 rounded-xl divide-y divide-stone-100">
            {shippingZones.map(zone => (
              <div key={zone.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C0654B]" />
                    <span>{zone.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-400">Automated based on buyer delivery zipcodes at checkout screen</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-0.5">Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={zone.charge}
                      onChange={(e) => handleUpdateShippingZone(zone.id, Number(e.target.value), zone.minOrder, zone.active)}
                      className="w-20 p-1.5 border border-stone-300 rounded bg-white text-center font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-0.5">Free Shipping threshold (₹)</label>
                    <input
                      type="number"
                      value={zone.minOrder}
                      onChange={(e) => handleUpdateShippingZone(zone.id, zone.charge, Number(e.target.value), zone.active)}
                      className="w-24 p-1.5 border border-stone-300 rounded bg-white text-center font-bold font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-3">
                    <span className="text-[10px] text-stone-400 font-bold">Scope active:</span>
                    <button
                      onClick={() => handleUpdateShippingZone(zone.id, zone.charge, zone.minOrder, !zone.active)}
                      className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold cursor-pointer ${
                        zone.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {zone.active ? 'Active' : 'Deactivated'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ADMIN USER LOGINS & AUDIT LOGS */}
      {activeSettingsTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-700 font-semibold text-left">
          
          {/* Active Logins (Left side) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 lg:col-span-1">
            <div className="border-b border-stone-100 pb-2">
              <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Access moderation</span>
              <h3 className="text-xs font-bold font-serif text-stone-900">Active Admin Staff Logins</h3>
            </div>

            <div className="space-y-3.5">
              {adminUsers.map(user => (
                <div key={user.email} className="p-3 border border-stone-100 rounded-xl bg-stone-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{user.name}</span>
                    <span className="bg-stone-200 text-stone-700 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                  <p className="text-[9px] text-stone-400 font-mono">Last session: {user.lastLogin} from IP {user.ip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs (Right side) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 lg:col-span-2">
            <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Security Trace logs</span>
                <h3 className="text-xs font-bold font-serif text-stone-900">System Admin Activity Audit Trail</h3>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase font-mono">Immutable Logbook</span>
            </div>

            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {auditLogs.map((log, index) => (
                <div key={index} className="p-3 hover:bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-bold text-stone-800 text-[11px]">{log.action}</p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium font-mono">
                      <span>By: {log.user}</span>
                      <span>•</span>
                      <span className="bg-stone-100 text-stone-500 px-1 rounded text-[8px] uppercase">{log.type}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono self-end sm:self-center shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
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
