import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';
import { ProductsListPage } from '@/pages/ProductsListPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { PostProductPage } from '@/pages/PostProductPage';
import { EditProductPage } from '@/pages/EditProductPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SellerUpgradeRequestsPage } from './pages/admin/SellerUpgradeRequestsPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { OrderCompletionPage } from './pages/OrderCompletionPage';
import { UserRatingsPage } from './pages/UserRatingsPage';
import { Toaster } from '@/components/ui/sonner';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { WatchlistProvider } from '@/contexts/WatchlistContext';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

function App() {
  const dispatch = useAppDispatch();

  // Fetch categories on app mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <WatchlistProvider>
      <Router>
        <ScrollToTop />
        <Routes>
        {/* Auth routes - without MainLayout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireAdmin>
              <CategoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <ProductManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/seller-requests"
          element={
            <ProtectedRoute requireAdmin>
              <SellerUpgradeRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Order Completion Route */}
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderCompletionPage />
            </ProtectedRoute>
          }
        />

        {/* Main app routes - with MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/products" element={<ProductsListPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/user/:userId/ratings" element={<UserRatingsPage />} />
                <Route 
                  path="/watchlist" 
                  element={
                    <ProtectedRoute>
                      <WatchlistPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/post-product" 
                  element={
                    <ProtectedRoute>
                      <PostProductPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-product/:id" 
                  element={
                    <ProtectedRoute>
                      <EditProductPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
    </WatchlistProvider>
  );
}

export default App;
