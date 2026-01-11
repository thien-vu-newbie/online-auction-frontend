import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import type { UpgradeSellerRequest, UpdateConfigRequest } from '@/lib/api/admin';
import { toast } from 'sonner';

// Dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

// User Management
export const useAdminUsers = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: () => adminApi.getAllUsers(page, limit),
  });
};

export const useAdminUserById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUserById(userId!),
    enabled: !!userId,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Đã xóa người dùng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.resetUserPassword(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Đã reset mật khẩu và gửi email cho người dùng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể reset mật khẩu');
    },
  });
};

// Seller Upgrade
export const useUpgradeSeller = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpgradeSellerRequest) => adminApi.upgradeSeller(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'seller-requests'] });
      toast.success('Đã nâng cấp seller thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể nâng cấp seller');
    },
  });
};

export const usePendingSellerRequests = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['admin', 'seller-requests', page, limit],
    queryFn: () => adminApi.getPendingSellerRequests(page, limit),
  });
};

// System Config
export const useSystemConfig = () => {
  return useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => adminApi.getConfig(),
  });
};

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConfigRequest) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] });
      toast.success('Đã cập nhật cấu hình thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật cấu hình');
    },
  });
};

// Category Management
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; parentId?: string }) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã tạo danh mục thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo danh mục');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; parentId?: string } }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã cập nhật danh mục thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật danh mục');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã xóa danh mục thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục');
    },
  });
};

// Product Management
export const useAdminProducts = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['admin', 'products', page, limit],
    queryFn: () => adminApi.getProducts(page, limit),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Đã xóa sản phẩm thành công');
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm');
    },
  });
};
