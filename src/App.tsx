import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeChartModal } from './components/SizeChartModal';
import { Sparkles } from 'lucide-react';

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { StaticPages } from './pages/StaticPages';
import { AiStylistPage } from './pages/AiStylistPage';
import { Order } from './types';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const { setSearchModalOpen, setCartDrawerOpen, setQuickViewProduct, setSizeChartCategory } = useStore();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setCartDrawerOpen(false);
        setQuickViewProduct(null);
        setSizeChartCategory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSearchModalOpen, setCartDrawerOpen, setQuickViewProduct, setSizeChartCategory]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ROUTE PARSING LOGIC
  const renderRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      return <ProductListingPage onNavigate={navigateTo} categorySlug={slug} />;
    }

    if (currentPath.startsWith('/product/')) {
      const id = currentPath.replace('/product/', '');
      return <ProductDetailPage onNavigate={navigateTo} productId={id} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage onNavigate={navigateTo} onOrderPlaced={(order) => setPlacedOrder(order)} />;
    }

    if (currentPath.startsWith('/order-confirmation')) {
      return <OrderConfirmationPage onNavigate={navigateTo} order={placedOrder} />;
    }

    if (currentPath === '/account') {
      return <AccountPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/ai-stylist') {
      return <AiStylistPage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/admin')) {
      return <AdminPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/about') {
      return <StaticPages pageType="about" onNavigate={navigateTo} />;
    }

    if (currentPath === '/store-locator') {
      return <StaticPages pageType="store-locator" onNavigate={navigateTo} />;
    }

    if (currentPath === '/faqs') {
      return <StaticPages pageType="faqs" onNavigate={navigateTo} />;
    }

    return <HomePage onNavigate={navigateTo} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-stone-900 flex flex-col font-sans selection:bg-[#C0654B] selection:text-white">
      {!isAdminRoute && <Header onNavigate={navigateTo} currentPath={currentPath} />}
      <main className="flex-1">{renderRoute()}</main>
      {!isAdminRoute && <Footer onNavigate={navigateTo} />}

      {/* OVERLAYS & MODALS */}
      <Toast />
      <CartDrawer onNavigate={navigateTo} />
      <SearchModal onNavigate={navigateTo} />
      <QuickViewModal onNavigate={navigateTo} />
      <SizeChartModal />

      {/* FLOATING AI STYLIST WIDGET */}
      {!isAdminRoute && currentPath !== '/ai-stylist' && (
        <button
          onClick={() => navigateTo('/ai-stylist')}
          className="fixed bottom-6 right-6 z-40 bg-[#C0654B] text-white hover:bg-stone-900 px-4 py-3 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 group transition-all duration-300 animate-bounce cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
          <span>AI Stylist Lounge</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase">New</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
