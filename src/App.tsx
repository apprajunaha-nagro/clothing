import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeChartModal } from './components/SizeChartModal';
import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PageLoadingSkeleton } from './components/skeletons/PageLoadingSkeleton';
import { useReducedMotion } from './utils/useReducedMotion';
import { Order } from './types';

// ─── Lazy-loaded route chunks ─────────────────────────────────────────────────
// Each page loads its JS bundle only when first visited.
const HomePage            = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductListingPage  = lazy(() => import('./pages/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailPage   = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage        = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const AccountPage         = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const AdminPage           = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const StaticPages         = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.StaticPages })));
const AiStylistPage       = lazy(() => import('./pages/AiStylistPage').then(m => ({ default: m.AiStylistPage })));

// Page transition config — lightweight fade + 8px vertical slide
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const { setSearchModalOpen, setCartDrawerOpen, setQuickViewProduct, setSizeChartCategory } = useStore();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      // Restore scroll position on back/forward navigation
      requestAnimationFrame(() => window.scrollTo({ top: 0 }));
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
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  // ─── Route resolution ────────────────────────────────────────────────────────
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

      <main className="flex-1">
        {/* AnimatePresence enables exit animations; mode="wait" ensures old page
            exits before new page enters, preventing flicker. */}
        <AnimatePresence mode="wait" initial={false}>
          <Suspense fallback={<PageLoadingSkeleton />}>
            {reducedMotion ? (
              // Skip animations entirely when user prefers reduced motion
              <div key={currentPath}>
                {renderRoute()}
              </div>
            ) : (
              <motion.div
                key={currentPath}
                className="page-transition-wrapper"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                {renderRoute()}
              </motion.div>
            )}
          </Suspense>
        </AnimatePresence>
      </main>

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
