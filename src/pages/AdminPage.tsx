import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, LayoutDashboard, FolderTree, Shirt, ShoppingCart, Users, Megaphone, 
  BarChart3, MessageSquare, Settings as SettingsIcon, Bell, Search, 
  Sun, Moon, LogOut, ExternalLink, ShieldCheck, AlertCircle, BookOpen, X, Grid, LayoutGrid, ChevronDown
} from 'lucide-react';

// Import Admin Sub-Views
import { AdminDashboardView } from '../components/admin/AdminDashboardView';
import { AdminCatalogView } from '../components/admin/AdminCatalogView';
import { AdminProductsView } from '../components/admin/AdminProductsView';
import { AdminOrdersView } from '../components/admin/AdminOrdersView';
import { AdminUserAccountsView } from '../components/admin/AdminUserAccountsView';
import { AdminMarketingView } from '../components/admin/AdminMarketingView';
import { AdminAnalyticsView } from '../components/admin/AdminAnalyticsView';
import { AdminReviewsView } from '../components/admin/AdminReviewsView';
import { AdminSettingsView } from '../components/admin/AdminSettingsView';
import { AdminBlogView } from '../components/admin/AdminBlogView';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    settings,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    showToast
  } = useStore();

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active module view
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'products' | 'orders' | 'user_accounts' | 'marketing' | 'analytics' | 'reviews' | 'blog' | 'settings'>('dashboard');

  // Dark mode simulation
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');

  // Notification Bell States
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New High-Value order #PGM-5201 placed by Ananya Sen', read: false, time: '3 mins ago' },
    { id: 2, text: 'Banarasi Silk Saree stock is low (< 5 left)', read: false, time: '1 hour ago' },
    { id: 3, text: 'New product exchange claim EX-1049 received', read: true, time: '5 hours ago' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    const success = await adminLogin(passwordInput);
    if (success) {
      setLoginError(null);
      setPasswordInput('');
      onNavigate('/admin');
    } else {
      setLoginError('Invalid administrator password.');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-8 space-y-6 text-left animate-fade-in">
          <div className="text-center space-y-2">
            <img
              src="/src/assets/images/pgmart_logo_new.png"
              alt="PGmart Logo"
              className="w-16 h-16 rounded-2xl object-contain bg-white border border-stone-200 p-1 mx-auto shadow-md"
            />
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">{settings.storeName} Admin Portal</h1>
            <p className="text-xs text-stone-500">Enter your store administrator password to access controls</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Enter administrator password"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-[#C0654B] focus:ring-2 focus:ring-[#C0654B]/20 outline-none text-sm font-mono transition-all"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors text-xs uppercase tracking-wider cursor-pointer"
            >
              Sign In to Admin Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full text-xs text-stone-500 hover:text-stone-800 py-2 font-medium transition-colors text-center cursor-pointer"
            >
              ← Back to Main Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active module component selection (Memoized for 60fps instant tab switches)
  const activeView = React.useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'catalog':
        return <AdminCatalogView />;
      case 'products':
        return <AdminProductsView />;
      case 'orders':
        return <AdminOrdersView />;
      case 'user_accounts':
        return <AdminUserAccountsView />;
      case 'marketing':
        return <AdminMarketingView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'reviews':
        return <AdminReviewsView />;
      case 'blog':
        return <AdminBlogView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <AdminDashboardView />;
    }
  }, [activeTab]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'catalog', label: 'Category', icon: FolderTree },
    { id: 'products', label: 'Product / Add Product', icon: Shirt },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'user_accounts', label: 'User Accounts', icon: Users },
    { id: 'marketing', label: 'Marketing and Promotion', icon: Megaphone },
    { id: 'analytics', label: 'Sales Intelligence', icon: BarChart3 },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
    { id: 'blog', label: 'Blog Manager', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);

  return (
    <div className={`h-screen overflow-hidden text-stone-850 flex flex-col md:flex-row transition-colors ${
      isDarkMode ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'
    }`}>
      
      {/* MOBILE ADMIN TOP BAR */}
      <div className="md:hidden bg-[#2B2620] text-stone-200 p-3 px-4 flex items-center justify-between border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img
            src="/src/assets/images/pgmart_logo_new.png"
            alt="PGmart Logo"
            className="w-7 h-7 rounded-lg object-contain bg-white border border-stone-700/60 p-0.5 shadow-md shrink-0"
          />
          <div>
            <h1 className="font-serif font-black text-white text-xs leading-tight">{settings.storeName}</h1>
            <span className="text-[9px] text-[#C0654B] font-bold uppercase tracking-wider font-mono">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="p-2 text-stone-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Exit to Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
            className="px-3 py-1.5 bg-[#C0654B] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[44px]"
          >
            <span>Modules</span>
          </button>
        </div>
      </div>

      {/* MOBILE HORIZONTAL QUICK SCROLL BAR */}
      <div className="md:hidden bg-[#1E1A16] px-3 py-2 border-b border-stone-800 flex gap-2 overflow-x-auto no-scrollbar">
        {sidebarItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileAdminMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors min-h-[36px] ${
                isActive ? 'bg-[#C0654B] text-white' : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-[#2B2620] text-stone-300 flex-col justify-between shrink-0 border-r border-stone-800/60 shadow-lg h-screen sticky top-0 font-sans select-none overflow-y-auto">
        <div>
          {/* Sidebar logo header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/pgmart_logo_new.png"
                alt="PGmart Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-700/60 p-0.5 shadow-md shrink-0"
              />
              <div>
                <h1 className="font-serif font-black text-white text-sm leading-tight">{settings.storeName}</h1>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">Control Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation link list */}
          <nav className="p-4 space-y-1 text-xs font-semibold text-left">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#C0654B] text-white font-extrabold shadow-md' 
                      : 'hover:bg-stone-800/70 hover:text-white text-stone-400'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom profile and triggers */}
        <div className="p-4 border-t border-stone-800/80 space-y-3.5 bg-stone-950/20 text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Super Admin</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-800 hover:bg-stone-850 hover:text-white transition-colors cursor-pointer text-stone-400 flex items-center justify-center gap-2 font-bold min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Exit to Storefront</span>
            </button>

            <button
              onClick={adminLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL (Independently Scrollable) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* HEADER TOOLBAR BAR */}
        <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors shadow-sm ${
          isDarkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-stone-200/80'
        }`}>
          {/* Global Search Bar */}
          <div className="relative max-w-sm w-full hidden sm:block">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Global Search order IDs, style names..."
              className="w-full pl-9 pr-3 py-2 border border-stone-200/80 rounded-xl bg-stone-50 focus:bg-white outline-none font-semibold text-stone-700 text-xs transition-all"
            />
          </div>

          {/* User controls triggers */}
          <div className="flex items-center gap-3 ml-auto">
            
            {/* Desktop Modules Quick Switcher Button */}
            <button
              onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
              className="px-3.5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Open Modules Switcher"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Modules</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                showToast(isDarkMode ? 'Light palette loaded.' : 'Lux dark palette loaded.');
              }}
              className="p-2 border border-stone-200/80 hover:bg-stone-50 rounded-xl text-stone-500 transition-colors cursor-pointer"
              title="Toggle Dark Mode Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Notification Bell Panel */}
            <div className="relative">
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                className="p-2 border border-stone-200/80 hover:bg-stone-50 rounded-xl text-stone-500 relative transition-colors cursor-pointer"
                title="System Notifications Board"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isBellOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 text-xs text-stone-800 space-y-3 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-black text-stone-900">Incoming Alerts</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-[#C0654B] hover:underline font-bold">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-2.5 rounded-xl border flex gap-2 font-medium ${
                        notif.read ? 'bg-stone-50 border-stone-100' : 'bg-red-50/50 border-red-100'
                      }`}>
                        <div className="space-y-1 text-left">
                          <p className="text-stone-800 leading-snug">{notif.text}</p>
                          <span className="text-[9px] text-stone-400 font-mono block">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsBellOpen(false)}
                    className="w-full text-center py-2 bg-stone-50 hover:bg-stone-100 rounded-xl font-bold text-stone-600"
                  >
                    Dismiss Panel
                  </button>
                </div>
              )}
            </div>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 border-l border-stone-200/80 pl-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="text-left hidden md:block">
                <span className="text-xs font-black text-stone-900 block">Priyam G.</span>
                <span className="text-[9px] text-stone-400 font-bold block uppercase tracking-wider">SuperAdmin</span>
              </div>
            </div>

          </div>
        </header>

        {/* ACTIVE MODULE CONTAINER VIEW */}
        <div className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {activeView}
        </div>

      </main>

      {/* ── MODULES QUICK SWITCHER MODAL / DRAWER ── */}
      {mobileAdminMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setMobileAdminMenuOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#2B2620] border border-stone-800 text-stone-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
            
            {/* Header */}
            <div className="p-5 bg-[#1E1A16] border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C0654B] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                  P
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">PGmart Admin Control Modules</h3>
                  <p className="text-xs text-stone-400 font-mono">Select administrative view module to jump instantly</p>
                </div>
              </div>

              <button
                onClick={() => setMobileAdminMenuOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 cursor-pointer transition-colors"
                title="Close Modules Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-[#1A1612]">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-stone-400 tracking-wider px-1">
                <span>Available Administrative Modules ({sidebarItems.length})</span>
                <span className="text-[#C0654B]">Click to Navigate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sidebarItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileAdminMenuOpen(false);
                        showToast(`Switched to ${item.label} module view`);
                      }}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-[#C0654B] text-white border-[#C0654B] font-bold shadow-lg scale-[1.01]'
                          : 'bg-[#2B2620] text-stone-300 border-stone-800/80 hover:bg-stone-800 hover:text-white hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl transition-colors ${
                          isActive ? 'bg-black/20 text-white' : 'bg-stone-800 group-hover:bg-[#C0654B] group-hover:text-white text-[#C0654B]'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm leading-tight">{item.label}</p>
                          <p className="text-[11px] opacity-70 font-mono mt-0.5">Module ID: {item.id}</p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="text-[10px] bg-white text-[#C0654B] font-black px-2.5 py-1 rounded-full uppercase font-mono shadow-xs">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-stone-500 group-hover:text-stone-300 text-xs font-bold transition-colors">
                          Open →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer controls */}
            <div className="p-4 bg-[#1E1A16] border-t border-stone-800 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  setMobileAdminMenuOpen(false);
                  onNavigate('/');
                }}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#C0654B]" />
                <span>Exit to Customer Storefront</span>
              </button>

              <button
                onClick={() => setMobileAdminMenuOpen(false)}
                className="px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

