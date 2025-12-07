import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { ArrowRightIcon } from '@phosphor-icons/react';
import type { Product } from '@/types';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProductSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  products: Product[];
  viewAllLink?: string;
  className?: string;
  variant?: 'default' | 'gradient';
}

export function ProductSection({
  title,
  description,
  icon,
  products,
  viewAllLink,
  className,
  variant = 'default',
}: ProductSectionProps) {
  return (
    <section className={cn(
      "py-12",
      variant === 'gradient' && "bg-gradient-to-b from-muted/50 to-background",
      className
    )}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              {icon && (
                <span className="text-primary">{icon}</span>
              )}
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Button variant="ghost" asChild className="gap-2 self-start sm:self-auto">
              <Link to={viewAllLink}>
                Xem tất cả
                <ArrowRightIcon size={16} />
              </Link>
            </Button>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có sản phẩm nào trong danh mục này
          </div>
        )}
      </div>
    </section>
  );
}
