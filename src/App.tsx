import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Future routes will be added here */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/products" element={<ProductListPage />} /> */}
          {/* <Route path="/product/:id" element={<ProductDetailPage />} /> */}
          {/* <Route path="/category/:slug" element={<CategoryPage />} /> */}
          {/* <Route path="/search" element={<SearchPage />} /> */}
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
          {/* <Route path="/watchlist" element={<WatchlistPage />} /> */}
          {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
        </Routes>
      </MainLayout>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
