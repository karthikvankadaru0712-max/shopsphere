import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SocketProvider } from './context/SocketContext';

import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AiConcierge } from './components/smart/AiConcierge';

// Eagerly loaded core critical paths
import { HomePage } from './pages/home/HomePage';
import { ShopPage } from './pages/shop/ShopPage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrderConfirmationPage } from './pages/checkout/OrderConfirmationPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Lazy-loaded routes for performance & code-splitting
const MatchScorePage = lazy(() => import('./pages/smart/MatchScorePage').then(m => ({ default: m.MatchScorePage })));
const VibeFindPage = lazy(() => import('./pages/smart/VibeFindPage').then(m => ({ default: m.VibeFindPage })));
const GiftFinderPage = lazy(() => import('./pages/smart/GiftFinderPage').then(m => ({ default: m.GiftFinderPage })));
const CollectionsPage = lazy(() => import('./pages/smart/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import('./pages/smart/CollectionDetailPage').then(m => ({ default: m.CollectionDetailPage })));
const ComparePage = lazy(() => import('./pages/smart/ComparePage').then(m => ({ default: m.ComparePage })));

const AccountLayout = lazy(() => import('./pages/account/AccountLayout').then(m => ({ default: m.AccountLayout })));
const AccountOverviewPage = lazy(() => import('./pages/account/AccountOverviewPage').then(m => ({ default: m.AccountOverviewPage })));
const AccountOrdersPage = lazy(() => import('./pages/account/AccountOrdersPage').then(m => ({ default: m.AccountOrdersPage })));
const OrderDetailPage = lazy(() => import('./pages/account/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const AccountOwnershipPage = lazy(() => import('./pages/account/AccountOwnershipPage').then(m => ({ default: m.AccountOwnershipPage })));
const AccountWishlistPage = lazy(() => import('./pages/account/AccountWishlistPage').then(m => ({ default: m.AccountWishlistPage })));
const AccountPriceAlertsPage = lazy(() => import('./pages/account/AccountPriceAlertsPage').then(m => ({ default: m.AccountPriceAlertsPage })));
const AccountNotificationsPage = lazy(() => import('./pages/account/AccountNotificationsPage'));
const AccountAddressesPage = lazy(() => import('./pages/account/AccountAddressesPage'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminReturnsPage = lazy(() => import('./pages/admin/AdminReturnsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));

const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
import {
  AboutPage,
  ContactPage,
  HelpCenterPage,
  ShippingPolicyPage,
  ReturnPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/static/StaticPages';

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-sphere-cream p-8">
    <div className="w-10 h-10 rounded-2xl bg-sphere-violet/20 border border-sphere-violet/40 flex items-center justify-center text-sphere-violet animate-bounce mb-3 shadow-xs">
      <span className="font-black text-sm">S</span>
    </div>
    <p className="text-xs font-bold text-gray-500 tracking-wide animate-pulse">
      Curating ShopSphere experience...
    </p>
  </div>
);

const Shell = () => (
  <>
    <AnnouncementBar />
    <Navbar />
    <main className="min-h-screen bg-sphere-cream">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <CartDrawer />
    <AiConcierge />
    <Footer />
  </>
);

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sphere-cream text-sm font-semibold text-sphere-charcoal">
        Loading your ShopSphere session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<Shell />}>
      <Route index element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/matchscore" element={<MatchScorePage />} />
      <Route path="/vibefind" element={<VibeFindPage />} />
      <Route path="/gift-finder" element={<GiftFinderPage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/collections/:id" element={<CollectionDetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpCenterPage />} />
      <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
      <Route path="/return-policy" element={<ReturnPolicyPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      <Route path="/account" element={<ProtectedRoute />}>
        <Route element={<AccountLayout />}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="product-library" element={<AccountOwnershipPage />} />
          <Route path="wishlist" element={<AccountWishlistPage />} />
          <Route path="price-alerts" element={<AccountPriceAlertsPage />} />
          <Route path="notifications" element={<AccountNotificationsPage />} />
          <Route path="addresses" element={<AccountAddressesPage />} />
          <Route path="collections" element={<AccountOverviewPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="returns" element={<AdminReturnsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
              <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
            </WishlistProvider>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
