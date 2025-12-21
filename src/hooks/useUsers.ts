import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/lib/api/users';
import { toast } from 'sonner';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => usersApi.getProfile(),
  });
};

export const useMyParticipatingProducts = () => {
  return useQuery({
    queryKey: ['users', 'participating'],
    queryFn: () => usersApi.getMyParticipatingProducts(),
  });
};

export const useMyRejectedProducts = () => {
  return useQuery({
    queryKey: ['users', 'rejected'],
    queryFn: () => usersApi.getMyRejectedProducts(),
  });
};

export const useMyWonProducts = () => {
  return useQuery({
    queryKey: ['users', 'won'],
    queryFn: () => usersApi.getMyWonProducts(),
  });
};

export const useMyProducts = (page: number = 1, limit: number = 10, status?: string) => {
  return useQuery({
    queryKey: ['users', 'my-products', page, limit, status],
    queryFn: () => usersApi.getMyProducts(page, limit, status),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      toast.success('Đã cập nhật thông tin cá nhân');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    },
  });
};

export const useRequestSellerUpgrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.requestSellerUpgrade(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      toast.success('Đã gửi yêu cầu nâng cấp seller. Admin sẽ xem xét trong thời gian sớm nhất.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu');
    },
  });
};
