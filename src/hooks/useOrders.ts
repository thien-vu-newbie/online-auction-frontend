import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type ShippingAddressRequest } from '@/lib/api/orders';
import { toast } from 'sonner';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (productId: string) => ordersApi.createPaymentIntent(productId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo payment intent');
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.confirmPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Xác nhận thanh toán thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xác nhận thanh toán');
    },
  });
};

export const useMyOrders = (params?: { page?: number; limit?: number; role?: 'buyer' | 'seller' }) => {
  return useQuery({
    queryKey: ['orders', 'my-orders', params],
    queryFn: () => ordersApi.getMyOrders(params),
  });
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.getOrderById(orderId!),
    enabled: !!orderId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, address }: { orderId: string; address: ShippingAddressRequest }) =>
      ordersApi.updateShippingAddress(orderId, address),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      toast.success('Đã cập nhật địa chỉ giao hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật địa chỉ');
    },
  });
};

export const useConfirmShipped = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, trackingNumber }: { orderId: string; trackingNumber: string }) =>
      ordersApi.confirmShipped(orderId, { trackingNumber }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      toast.success('Đã xác nhận gửi hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xác nhận gửi hàng');
    },
  });
};

export const useConfirmReceived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.confirmReceived(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      toast.success('Đã xác nhận nhận hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xác nhận nhận hàng');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersApi.cancelOrder(orderId, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    },
  });
};
