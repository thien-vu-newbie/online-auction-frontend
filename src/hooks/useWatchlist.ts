import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '@/lib/api/watchlist';
import { toast } from 'sonner';

export const useWatchlist = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['watchlist', page, limit],
    queryFn: () => watchlistApi.getMyWatchlist(page, limit),
  });
};

export const useCheckWatchlist = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['watchlist', 'check', productId],
    queryFn: () => watchlistApi.checkInWatchlist(productId!),
    enabled: !!productId,
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => watchlistApi.addToWatchlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', 'check', productId] });
      toast.success('Đã thêm vào danh sách yêu thích');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thêm vào danh sách yêu thích');
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => watchlistApi.removeFromWatchlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', 'check', productId] });
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa khỏi danh sách yêu thích');
    },
  });
};
