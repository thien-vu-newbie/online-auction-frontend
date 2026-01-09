import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '@/lib/api/seller';
import { toast } from 'sonner';

export const useMyProducts = (page: number = 1, limit: number = 10, status?: string) => {
  return useQuery({
    queryKey: ['seller', 'products', page, limit, status],
    queryFn: () => sellerApi.getMyProducts(page, limit, status),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, images }: { data: any; images: File[] }) =>
      sellerApi.createProduct(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      toast.success('Sản phẩm đã được tạo thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo sản phẩm');
    },
  });
};
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data, images }: { productId: string; data: any; images?: File[] }) =>
      sellerApi.updateProduct(productId, data, images),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      toast.success('Đã cập nhật sản phẩm');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
    },
  });
};
export const useAddProductDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, content }: { productId: string; content: string }) =>
      sellerApi.addProductDescription(productId, { content }),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      toast.success('Đã bổ sung mô tả sản phẩm');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể bổ sung mô tả');
    },
  });
};

export const useRejectBidder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, bidderId }: { productId: string; bidderId: string }) =>
      sellerApi.rejectBidder(productId, bidderId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'seller-history', productId] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Đã từ chối người đấu giá');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể từ chối người đấu giá');
    },
  });
};

export const useRateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      ratedUserId,
      rating,
      comment,
    }: {
      productId: string;
      ratedUserId: string;
      rating: 1 | -1;
      comment: string;
    }) => sellerApi.rateUser(productId, ratedUserId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      toast.success('Đã đánh giá người dùng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đánh giá');
    },
  });
};

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => sellerApi.cancelTransaction(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      toast.success('Đã hủy giao dịch và đánh giá -1');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể hủy giao dịch');
    },
  });
};
