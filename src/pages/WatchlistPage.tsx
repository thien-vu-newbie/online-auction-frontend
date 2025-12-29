import { ProductCard } from '@/components/product/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { HeartIcon, HeartStraightIcon } from '@phosphor-icons/react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';

export function WatchlistPage() {
  const { data: watchlistData, isLoading } = useWatchlist();
  const products: Product[] = watchlistData?.products || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-foreground">Danh sách yêu thích</span>
          </div>

          {/* Title & Description */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <HeartStraightIcon size={24} weight="duotone" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Danh sách yêu thích
              </h1>
              <p className="text-muted-foreground text-lg">
                Các sản phẩm bạn đã đánh dấu yêu thích
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <HeartIcon size={32} className="text-muted-foreground" weight="duotone" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-muted-foreground mb-4">
              Khám phá và thêm các sản phẩm bạn quan tâm vào danh sách yêu thích
            </p>
            <Button variant="outline" asChild>
              <Link to="/products">Khám phá sản phẩm</Link>
            </Button>
          </Card>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Tổng cộng <span className="font-semibold text-foreground">{products.length}</span> sản phẩm
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
