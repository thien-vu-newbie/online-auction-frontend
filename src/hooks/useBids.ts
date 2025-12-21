import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bidsApi } from '@/lib/api/bids';
import type { PlaceAutoBidRequest, UpdateAutoBidRequest } from '@/lib/api/bids';
import { toast } from 'sonner';

export const useBidHistory = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['bids', 'history', productId],
    queryFn: () => bidsApi.getBidHistory(productId!),
    enabled: !!productId,
  });
};

export const useSellerBidHistory = (productId: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['bids', 'seller-history', productId],
    queryFn: () => bidsApi.getSellerBidHistory(productId!),
    enabled: !!productId && enabled,
  });
};

export const useAutoBidConfig = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['bids', 'auto-bid', productId],
    queryFn: () => bidsApi.getMyAutoBidConfig(productId!),
    enabled: !!productId,
    retry: false,
  });
};

export const usePlaceAutoBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: PlaceAutoBidRequest }) =>
      bidsApi.placeAutoBid(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'auto-bid', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'participating'] });
      toast.success('Đã đặt auto bid thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đặt auto bid');
    },
  });
};

export const useUpdateAutoBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateAutoBidRequest }) =>
      bidsApi.updateAutoBid(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'auto-bid', productId] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Đã cập nhật auto bid thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật auto bid');
    },
  });
};

export const useToggleAutoBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => bidsApi.toggleAutoBid(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'auto-bid', productId] });
      toast.success('Đã thay đổi trạng thái auto bid');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái auto bid');
    },
  });
};
