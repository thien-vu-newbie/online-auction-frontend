import { useQuery } from '@tanstack/react-query';
import { getAllCategories, getCategoryById } from '@/lib/api/categories';
import type { Category } from '@/types';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: categoryKeys.lists(),
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategoryById(id: string | undefined) {
  return useQuery<Category, Error>({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
