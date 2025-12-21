import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { Toaster } from '@/components/ui/sonner';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';

function App() {
  const dispatch = useAppDispatch();

  // Fetch categories on app mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Auth routes - without MainLayout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Main app routes - with MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* Future routes will be added here */}
                {/* <Route path="/products" element={<ProductListPage />} /> */}
                {/* <Route path="/search" element={<SearchPage />} /> */}
                {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
