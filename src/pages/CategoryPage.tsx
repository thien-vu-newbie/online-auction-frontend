import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DeviceMobileIcon,
  WatchIcon,
  HandbagIcon,
  PaintBrushIcon,
  CarIcon,
  FunnelIcon,
  SortAscendingIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PackageIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { ProductCard } from '@/components/product/ProductCard';
import { useAppSelector } from '@/store/hooks';
import { useProductsByCategory } from '@/hooks/useProducts';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

// Category styling configurations
const categoryIcons: Record<string, React.ReactNode> = {
  'dien-tu': <DeviceMobileIcon size={48} weight="duotone" />,
  'thoi-trang': <WatchIcon size={48} weight="duotone" />,
  'nghe-thuat': <PaintBrushIcon size={48} weight="duotone" />,
  'xe-co': <CarIcon size={48} weight="duotone" />,
};

const categoryIconColors: Record<string, string> = {
  'dien-tu': 'text-blue-600 dark:text-blue-400',
  'thoi-trang': 'text-pink-600 dark:text-pink-400',
  'nghe-thuat': 'text-purple-600 dark:text-purple-400',
  'xe-co': 'text-emerald-600 dark:text-emerald-400',
};

type SortOption = 'newest' | 'ending-soon' | 'price-asc' | 'price-desc' | 'most-bids';

const ITEMS_PER_PAGE = 12;

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useAppSelector((state) => state.categories);

  // State
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    searchParams.get('sub') || null
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // Find current category
  const currentCategory = useMemo(() => {
    // Check if slug is a parent category
    const parent = categories.find((cat: Category) => cat.slug === slug);
    if (parent) return parent;

    // Check if slug is a subcategory
    for (const cat of categories) {
      const child = cat.children?.find((c: Category) => c.slug === slug);
      if (child) {
        return { ...child, parent: cat };
      }
    }
    return null;
  }, [categories, slug]);

  const parentCategory = useMemo(() => {
    if (!currentCategory) return null;
    if ('parent' in currentCategory) {
      return (currentCategory as Category & { parent: Category }).parent;
    }
    return currentCategory;
  }, [currentCategory]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, currentPage]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (selectedSubcategory) params.set('sub', selectedSubcategory);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [sortBy, selectedSubcategory, currentPage, setSearchParams]);

  // Get the category ID for API call
  const categoryIdForApi = useMemo(() => {
    if (selectedSubcategory && parentCategory?.children) {
      const subcat = parentCategory.children.find((c: Category) => c.slug === selectedSubcategory);
      if (subcat) return subcat.id;
    }
    return currentCategory?.id || '';
  }, [selectedSubcategory, parentCategory, currentCategory]);

  // Fetch products from API
  const { 
    data: productsData, 
    isLoading: isLoadingProducts,
  } = useProductsByCategory({
    categoryId: categoryIdForApi,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  // Client-side sorting (backend returns newest first by default)
  const sortedProducts = useMemo(() => {
    if (!productsData?.products) return [];
    const products = [...productsData.products];

    switch (sortBy) {
      case 'ending-soon':
        products.sort(
          (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
        );
        break;
      case 'price-asc':
        products.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        products.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'most-bids':
        products.sort((a, b) => b.bidCount - a.bidCount);
        break;
      case 'newest':
      default:
        // Already sorted by newest from API
        break;
    }

    return products;
  }, [productsData?.products, sortBy]);

  const totalPages = productsData?.totalPages || 1;
  const totalProducts = productsData?.total || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get display category (selected subcategory or current category)
  const displayCategory = useMemo(() => {
    if (selectedSubcategory && parentCategory?.children) {
      const subcat = parentCategory.children.find((c: Category) => c.slug === selectedSubcategory);
      if (subcat) return subcat;
    }
    return currentCategory;
  }, [selectedSubcategory, parentCategory, currentCategory]);

  const categorySlug = parentCategory?.slug || 'dien-tu';
  const iconColor = categoryIconColors[categorySlug] || 'text-primary';
  const icon = categoryIcons[categorySlug] || <HandbagIcon size={48} weight="duotone" />;

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <PackageIcon size={64} className="mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Không tìm thấy danh mục</h2>
          <p className="text-muted-foreground">
            Danh mục bạn đang tìm không tồn tại
          </p>
          <Button asChild>
            <Link to="/">Quay về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Category Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b bg-muted/50"
      >
        
        {/* Add padding for fixed header */}
        <div className="container mx-auto px-4 pt-20 pb-10 relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                  Trang chủ
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {parentCategory && 'parent' in currentCategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/category/${parentCategory.slug}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {parentCategory.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {displayCategory?.name || currentCategory.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Category Header */}
          <div className="flex items-center gap-6">
            <motion.div
              key={displayCategory?.id || currentCategory.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'w-20 h-20 rounded-2xl bg-background shadow-lg flex items-center justify-center',
                iconColor
              )}
            >
              {icon}
            </motion.div>
            <div>
              <motion.h1
                key={`title-${displayCategory?.id || currentCategory.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-3xl md:text-4xl font-bold"
              >
                {displayCategory?.name || currentCategory.name}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mt-1"
              >
                {totalProducts} sản phẩm đang đấu giá
              </motion.p>
            </div>
          </div>

          {/* Subcategories */}
          {parentCategory?.children && parentCategory.children.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-2 mt-6"
            >
              <Button
                variant={selectedSubcategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedSubcategory(null);
                  setCurrentPage(1);
                }}
                className="rounded-full cursor-pointer"
              >
                Tất cả
              </Button>
              {parentCategory.children.map((child: Category) => (
                <Button
                  key={child.id}
                  variant={selectedSubcategory === child.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedSubcategory(child.slug);
                    setCurrentPage(1);
                  }}
                  className="rounded-full cursor-pointer"
                >
                  {child.name}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          {/* Left - Results count & New products indicator */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Hiển thị{' '}
              <strong className="text-foreground">
                {totalProducts > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}
              </strong>{' '}
              / {totalProducts} sản phẩm
            </span>
            {sortedProducts.some((p) => p.isNew) && (
              <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                <SparkleIcon size={12} weight="fill" />
                Có sản phẩm mới
              </Badge>
            )}
          </div>

          {/* Right - Sort & View Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAscendingIcon size={18} className="text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="cursor-pointer">Mới nhất</SelectItem>
                  <SelectItem value="ending-soon" className="cursor-pointer">Sắp kết thúc</SelectItem>
                  <SelectItem value="price-asc" className="cursor-pointer">Giá tăng dần</SelectItem>
                  <SelectItem value="price-desc" className="cursor-pointer">Giá giảm dần</SelectItem>
                  <SelectItem value="most-bids" className="cursor-pointer">Nhiều lượt đấu giá</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <FunnelIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Không có sản phẩm nào
              </h3>
              <p className="text-muted-foreground">
                Hãy thử thay đổi bộ lọc hoặc xem danh mục khác
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sortBy}-${selectedSubcategory}-${currentPage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mt-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              <CaretLeftIcon size={18} />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                const shouldShow =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                if (!shouldShow) {
                  // Show ellipsis
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span
                        key={page}
                        className="px-2 text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className="h-10 w-10 cursor-pointer"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              <CaretRightIcon size={18} />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
