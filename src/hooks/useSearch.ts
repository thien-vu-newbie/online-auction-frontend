import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchParams } from '@/lib/api/search';

export function useSearchProducts(params: SearchParams) {
  return useQuery({
    queryKey: ['search-products', params],
    queryFn: () => searchApi.searchProducts(params),
    enabled: true,
    staleTime: 1000 * 60, // 1 minute
  });
}
