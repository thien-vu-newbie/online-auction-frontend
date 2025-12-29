import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
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
  ClockIcon,
  FireIcon,
  TrendUpIcon,
  SparkleIcon,
  SortAscendingIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  getTopEndingSoonPaginated,
  getTopMostBidsPaginated,
  getTopHighestPricePaginated,
  getAllProductsPaginated,
  type CategoryProductsResponse,
} from '@/lib/api/products';

// Sort types
type SortType = 'ending-soon' | 'most-bids' | 'highest-price' | 'newest';

interface SortOption {
  value: SortType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sortOptions: SortOption[] = [
  {
    value: 'ending-soon',
    label: 'Sắp kết thúc',
    icon: <ClockIcon size={24} weight="duotone" />,
    description: 'Những sản phẩm đang trong giai đoạn cuối cùng',
  },
  {
    value: 'most-bids',
    label: 'Nhiều lượt đấu giá nhất',
    icon: <FireIcon size={24} weight="duotone" />,
    description: 'Những sản phẩm được quan tâm nhiều nhất',
  },
  {
    value: 'highest-price',
    label: 'Giá cao nhất',
    icon: <TrendUpIcon size={24} weight="duotone" />,
    description: 'Những sản phẩm giá trị đang được đấu giá',
  },
  {
    value: 'newest',
    label: 'Mới nhất',
    icon: <SparkleIcon size={24} weight="duotone" />,
    description: 'Sản phẩm mới đăng gần đây',
  },
];

export function ProductsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = (searchParams.get('sort') as SortType) || 'ending-soon';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [sort, setSort] = useState<SortType>(sortParam);
  const [page, setPage] = useState(pageParam);

  const currentSortOption = sortOptions.find(opt => opt.value === sort) || sortOptions[0];

  // Fetch products based on sort type
  const { data, isLoading, error } = useQuery<CategoryProductsResponse>({
    queryKey: ['products-list', sort, page],
    queryFn: async () => {
      const limit = 12;

      switch (sort) {
        case 'ending-soon':
          return getTopEndingSoonPaginated(page, limit);
        case 'most-bids':
          return getTopMostBidsPaginated(page, limit);
        case 'highest-price':
          return getTopHighestPricePaginated(page, limit);
        case 'newest':
          return getAllProductsPaginated(page, limit);
        default:
          return getTopEndingSoonPaginated(page, limit);
      }
    },
    staleTime: 30 * 1000,
  });

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [sort, page, setSearchParams]);

  const handleSortChange = (value: string) => {
    setSort(value as SortType);
    setPage(1);
  };

  const totalPages = data?.totalPages || 0;
  const products = data?.products || [];

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
            <span className="text-foreground">{currentSortOption.label}</span>
          </div>

          {/* Title & Description */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              {currentSortOption.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {currentSortOption.label}
              </h1>
              <p className="text-muted-foreground text-lg">
                {currentSortOption.description}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Results count */}
              {!isLoading && data && (
                <div className="text-muted-foreground">
                  Tìm thấy <span className="font-semibold text-foreground">{data.total}</span> sản phẩm
                </div>
              )}

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SortAscendingIcon size={20} className="text-muted-foreground" />
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-destructive">Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại.</p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {currentSortOption.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-4">
              Hiện tại không có sản phẩm nào trong danh mục này
            </p>
            <Button variant="outline" asChild>
              <Link to="/">Quay về trang chủ</Link>
            </Button>
          </Card>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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
