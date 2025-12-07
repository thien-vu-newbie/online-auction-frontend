import { HeroSection } from '@/components/home/HeroSection';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { ProductSection } from '@/components/product/ProductSection';
import { useAppSelector } from '@/store/hooks';
import {
  ClockIcon,
  FireIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';

export function HomePage() {
  const { endingSoon, mostBids, highestPrice } = useAppSelector(
    (state) => state.products
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Ending Soon Products */}
      <ProductSection
        title="Sắp kết thúc"
        description="Những sản phẩm đang trong giai đoạn cuối cùng - Nhanh tay đặt giá!"
        icon={<ClockIcon size={32} weight="duotone" />}
        products={endingSoon}
        viewAllLink="/products?sort=ending-soon"
        variant="gradient"
      />

      {/* Most Bids Products */}
      <ProductSection
        title="Nhiều lượt đấu giá nhất"
        description="Những sản phẩm được quan tâm nhiều nhất trên sàn"
        icon={<FireIcon size={32} weight="duotone" />}
        products={mostBids}
        viewAllLink="/products?sort=most-bids"
      />

      {/* Highest Price Products */}
      <ProductSection
        title="Giá cao nhất"
        description="Những sản phẩm giá trị đang được đấu giá"
        icon={<TrendUpIcon size={32} weight="duotone" />}
        products={highestPrice}
        viewAllLink="/products?sort=highest-price"
        variant="gradient"
      />
    </main>
  );
}
