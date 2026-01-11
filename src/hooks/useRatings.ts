import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '@/lib/api/ratings';
import type { CreateRatingRequest, UpdateRatingRequest } from '@/lib/api/ratings';
import { toast } from 'sonner';

export const useMyReceivedRatings = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['ratings', 'received', page, limit],
    queryFn: () => ratingsApi.getMyReceivedRatings(page, limit),
  });
};

export const useMyGivenRatings = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['ratings', 'given', page, limit],
    queryFn: () => ratingsApi.getMyGivenRatings(page, limit),
  });
};

export const useProductRatings = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['ratings', 'product', productId],
    queryFn: () => ratingsApi.getRatingsForProduct(productId!),
    enabled: !!productId,
  });
};

export const useUserRatings = (userId: string | undefined, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId, page, limit],
    queryFn: () => ratingsApi.getUserRatings(userId!, page, limit),
    enabled: !!userId,
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingRequest) => ratingsApi.createRating(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      toast.success('Đã đánh giá thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đánh giá');
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, data }: { ratingId: string; data: UpdateRatingRequest }) =>
      ratingsApi.updateRating(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      toast.success('Đã cập nhật đánh giá');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật đánh giá');
    },
  });
};

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => ratingsApi.cancelTransaction(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      toast.success('Đã hủy giao dịch và đánh giá -1 người thắng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể hủy giao dịch');
    },
  });
};
