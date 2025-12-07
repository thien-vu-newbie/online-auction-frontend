import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  DeviceMobileIcon,
  WatchIcon,
  HandbagIcon,
  PaintBrushIcon,
  CarIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  'dien-tu': <DeviceMobileIcon size={32} weight="duotone" />,
  'thoi-trang': <WatchIcon size={32} weight="duotone" />,
  'nghe-thuat': <PaintBrushIcon size={32} weight="duotone" />,
  'xe-co': <CarIcon size={32} weight="duotone" />,
};

const categoryGradients: Record<string, string> = {
  'dien-tu': 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
  'thoi-trang': 'from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30',
  'nghe-thuat': 'from-purple-500/20 to-violet-500/20 hover:from-purple-500/30 hover:to-violet-500/30',
  'xe-co': 'from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30',
};

const categoryIconColors: Record<string, string> = {
  'dien-tu': 'text-blue-500',
  'thoi-trang': 'text-pink-500',
  'nghe-thuat': 'text-purple-500',
  'xe-co': 'text-emerald-500',
};

export function CategoryShowcase() {
  const { categories } = useAppSelector((state) => state.categories);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">
            Khám phá theo danh mục
          </h2>
          <p className="text-muted-foreground">
            Tìm kiếm sản phẩm yêu thích theo từng danh mục
          </p>
        </div>

        {/* Categories grid - using grid with auto-rows for equal heights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
          {categories.map((category: Category) => (
            <Link key={category.id} to={`/category/${category.slug}`} className="h-full">
              <Card className={cn(
                "group cursor-pointer overflow-hidden transition-all duration-300 h-full",
                "bg-gradient-to-br",
                categoryGradients[category.slug] || 'from-gray-500/20 to-slate-500/20'
              )}>
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-background/80 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                      categoryIconColors[category.slug] || 'text-primary'
                    )}>
                      {categoryIcons[category.slug] || <HandbagIcon size={32} weight="duotone" />}
                    </div>

                    {/* Name */}
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.children?.length || 0} danh mục con
                      </p>
                    </div>

                    {/* Subcategories - flex-1 to fill remaining space */}
                    <div className="space-y-1 mt-4 flex-1">
                      {category.children?.slice(0, 3).map((child) => (
                        <div 
                          key={child.id}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {child.name}
                        </div>
                      ))}
                      {(category.children?.length || 0) > 3 && (
                        <div className="text-sm text-primary flex items-center gap-1 font-medium">
                          <ArrowRightIcon size={14} />
                          +{(category.children?.length || 0) - 3} danh mục khác
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
