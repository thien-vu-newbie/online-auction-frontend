import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTopEndingSoon,
  getTopMostBids,
  getTopHighestPrice,
  getProductById,
  getProductsByCategory,
  searchProducts,
  searchProductsInCategory,
  buyNow,
  type CategoryProductsParams,
  type SearchProductsParams,
  type ProductDetailResponse,
  type CategoryProductsResponse,
} from '@/lib/api/products';
import type { Product } from '@/types';

// Query keys for cache management
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  homepage: () => [...productKeys.all, 'homepage'] as const,
  endingSoon: (limit: number) => [...productKeys.homepage(), 'ending-soon', limit] as const,
  mostBids: (limit: number) => [...productKeys.homepage(), 'most-bids', limit] as const,
  highestPrice: (limit: number) => [...productKeys.homepage(), 'highest-price', limit] as const,
  category: (categoryId: string, params: object) => [...productKeys.all, 'category', categoryId, params] as const,
  search: (params: object) => [...productKeys.all, 'search', params] as const,
};

/**
 * Hook to fetch top ending soon products (for homepage)
 */
export function useTopEndingSoon(limit: number = 5) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.endingSoon(limit),
    queryFn: () => getTopEndingSoon(limit),
    staleTime: 30 * 1000, // 30 seconds - refresh more often for ending soon
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to fetch top most bids products (for homepage)
 */
export function useTopMostBids(limit: number = 5) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.mostBids(limit),
    queryFn: () => getTopMostBids(limit),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch top highest price products (for homepage)
 */
export function useTopHighestPrice(limit: number = 5) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.highestPrice(limit),
    queryFn: () => getTopHighestPrice(limit),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch product detail by ID
 */
export function useProductDetail(id: string | undefined) {
  return useQuery<ProductDetailResponse, Error>({
    queryKey: productKeys.detail(id || ''),
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch products by category with pagination
 */
export function useProductsByCategory(params: CategoryProductsParams) {
  return useQuery<CategoryProductsResponse, Error>({
    queryKey: productKeys.category(params.categoryId, { page: params.page, limit: params.limit }),
    queryFn: () => getProductsByCategory(params),
    enabled: !!params.categoryId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to search products
 */
export function useSearchProducts(params: SearchProductsParams) {
  return useQuery<CategoryProductsResponse, Error>({
    queryKey: productKeys.search(params),
    queryFn: () => searchProducts(params),
    enabled: !!params.name || !!params.categoryId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to search products within a category
 */
export function useSearchProductsInCategory(
  categoryId: string | undefined,
  params: Omit<SearchProductsParams, 'categoryId'>
) {
  return useQuery<CategoryProductsResponse, Error>({
    queryKey: productKeys.search({ categoryId, ...params }),
    queryFn: () => searchProductsInCategory(categoryId!, params),
    enabled: !!categoryId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to buy product now with buyNowPrice
 */
export function useBuyNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => buyNow(productId),
    onSuccess: (data) => {
    toast.success('Mua sản phẩm thành công!');
    queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) });
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
},
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể mua sản phẩm';
      toast.error(message);
    },
  });
}
