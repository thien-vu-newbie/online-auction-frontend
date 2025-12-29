import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchProducts } from '@/hooks/useSearch';
import { SortBy, type SortByType } from '@/lib/api/search';
import { useAppSelector } from '@/store/hooks';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SortAscendingIcon,
  SparkleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NEW_PRODUCT_MINUTES = 60; // Products posted within 60 minutes are considered "new"

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<SortByType>(
    (searchParams.get('sort') as SortByType) || SortBy.CREATED_DESC
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const { data, isLoading, error } = useSearchProducts({
    name: searchParams.get('q') || undefined,
    categoryId: searchParams.get('category') || undefined,
    sortBy,
    page,
    limit: 12,
  });

  // Sync URL params with state and update from Header search
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  // Sync state changes back to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== SortBy.CREATED_DESC) params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortBy, page, setSearchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByType);
    setPage(1);
  };

  const isProductNew = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes <= NEW_PRODUCT_MINUTES;
  };

  const totalPages = data ? Math.ceil(data.total / (data.limit || 12)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tìm kiếm sản phẩm</h1>
          <p className="text-muted-foreground">
            Khám phá hàng ngàn sản phẩm đấu giá từ người bán uy tín
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Filters Row */}
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <FunnelIcon size={20} className="text-muted-foreground" />
                  <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <SortAscendingIcon size={20} className="text-muted-foreground" />
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SortBy.CREATED_DESC}>
                        <div className="flex items-center gap-2">
                          <SparkleIcon size={16} />
                          Mới nhất
                        </div>
                      </SelectItem>
                      <SelectItem value={SortBy.END_TIME_DESC}>
                        <div className="flex items-center gap-2">
                          <ClockIcon size={16} />
                          Sắp kết thúc
                        </div>
                      </SelectItem>
                      <SelectItem value={SortBy.PRICE_ASC}>
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon size={16} />
                          Giá thấp đến cao
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Đang lọc:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Từ khóa: "{searchQuery}"
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary">
                    Danh mục: {categories.find((c) => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className="h-6 px-2"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        {!isLoading && data && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{data.total}</span> sản phẩm
              {searchQuery && ` cho "${searchQuery}"`}
            </p>
            <p className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-destructive">Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.</p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && data && data.products.length === 0 && (
          <Card className="p-12 text-center">
            <MagnifyingGlassIcon size={64} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPage(1);
              }}
            >
              Xem tất cả sản phẩm
            </Button>
          </Card>
        )}

        {/* Products Grid */}
        {!isLoading && data && data.products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {/* New Product Badge */}
                  {isProductNew(product.createdAt) && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge
                        variant="default"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg animate-pulse"
                      >
                        <SparkleIcon size={14} weight="fill" className="mr-1" />
                        Mới đăng{' '}
                        {formatDistanceToNow(new Date(product.createdAt), {
                          locale: vi,
                          addSuffix: true,
                        })}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
