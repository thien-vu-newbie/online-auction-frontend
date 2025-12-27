import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '@/lib/api/watchlist';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

interface WatchlistContextValue {
  watchlistProductIds: Set<string>;
  isInWatchlist: (productId: string) => boolean;
  addToWatchlist: (productId: string) => Promise<void>;
  removeFromWatchlist: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // Fetch all watchlist items once (no pagination - get all)
  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['watchlist', 'all'],
    queryFn: () => watchlistApi.getMyWatchlist(1, 1000), // Fetch up to 1000 items
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Create a Set of product IDs for O(1) lookup
  const watchlistProductIds = useMemo(() => {
    if (!watchlistData?.products) return new Set<string>();
    return new Set(watchlistData.products.map(p => p.id));
  }, [watchlistData]);

  // Mutation for adding to watchlist
  const addMutation = useMutation({
    mutationFn: (productId: string) => watchlistApi.addToWatchlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Đã thêm vào danh sách yêu thích');
    },
    onError: (error: unknown) => {
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Không thể thêm vào danh sách yêu thích');
    },
  });

  // Mutation for removing from watchlist
  const removeMutation = useMutation({
    mutationFn: (productId: string) => watchlistApi.removeFromWatchlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onError: (error: unknown) => {
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Không thể xóa khỏi danh sách yêu thích');
    },
  });

  const value: WatchlistContextValue = {
    watchlistProductIds,
    isInWatchlist: (productId: string) => watchlistProductIds.has(productId),
    addToWatchlist: async (productId: string) => {
      await addMutation.mutateAsync(productId);
    },
    removeFromWatchlist: async (productId: string) => {
      await removeMutation.mutateAsync(productId);
    },
    isLoading,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!context) {
    throw new Error('useWatchlistContext must be used within WatchlistProvider');
  }
  
  // Return safe defaults for non-authenticated users
  if (!isAuthenticated) {
    return {
      watchlistProductIds: new Set<string>(),
      isInWatchlist: () => false,
      addToWatchlist: async () => {},
      removeFromWatchlist: async () => {},
      isLoading: false,
    };
  }
  
  return context;
}

// Hook for checking if a product is in watchlist
export function useWatchlistCheck(productId: string): boolean {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const context = useContext(WatchlistContext);
  
  if (!isAuthenticated || !context) {
    return false;
  }
  
  return context.isInWatchlist(productId);
}
