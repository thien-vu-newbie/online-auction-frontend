import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Add padding top to account for fixed header */}
      <div className="flex-1 pt-[104px] md:pt-[120px]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
