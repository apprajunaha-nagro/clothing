import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeChartModal } from './components/SizeChartModal';
import { ChatbotWidget } from './components/ChatbotWidget';
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
const BlogPage            = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage        = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));

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
    if (currentPath === '/wishlist' || currentPath.startsWith('/wishlist')) {
      return <ProductListingPage onNavigate={navigateTo} categorySlug="wishlist" />;
    }
    if (currentPath === '/account' || currentPath.startsWith('/account')) {
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
    if (currentPath === '/blog') {
      return <BlogPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return <BlogPostPage onNavigate={navigateTo} slug={slug} />;
    }
    if (currentPath === '/privacy-policy') {
      return <StaticPages pageType="privacy-policy" onNavigate={navigateTo} />;
    }
    if (currentPath === '/terms') {
      return <StaticPages pageType="terms" onNavigate={navigateTo} />;
    }
    if (currentPath === '/shipping-policy' || currentPath === '/return-policy') {
      return <StaticPages pageType="policies" onNavigate={navigateTo} />;
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

      {!isAdminRoute && <Footer onNavigate={navigateTo} currentPath={currentPath} />}

      {/* OVERLAYS & MODALS */}
      <Toast />
      <CartDrawer onNavigate={navigateTo} />
      <SearchModal onNavigate={navigateTo} />
      <QuickViewModal onNavigate={navigateTo} />
      <SizeChartModal />

      {/* FLOATING CUSTOMER SUPPORT CHATBOT WIDGET */}
      {!isAdminRoute && <ChatbotWidget onNavigate={navigateTo} />}
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
