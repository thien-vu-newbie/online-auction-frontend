import { apiClient } from './client';

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'bidder' | 'seller' | 'admin';
  isEmailVerified: boolean;
  ratingPositive: number;
  ratingNegative: number;
  sellerUpgradeExpiry?: string;
  createdAt: string;
}

export interface SystemConfig {
  newProductHighlightMinutes: number;
  autoExtendThresholdMinutes: number;
  autoExtendDurationMinutes: number;
}

export interface UpgradeSellerRequest {
  userId: string;
}

export interface UpdateConfigRequest {
  newProductHighlightMinutes?: number;
  autoExtendThresholdMinutes?: number;
  autoExtendDurationMinutes?: number;
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getAllUsers: async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  resetUserPassword: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  // Seller Upgrade
  async upgradeSeller(data: UpgradeSellerRequest) {
    const response = await apiClient.post('/admin/upgrade-seller', data);
    return response.data;
  },

  async getPendingSellerRequests(page: number = 1, limit: number = 20) {
    const response = await apiClient.get<{
      users: AdminUser[];
      total: number;
      page: number;
      totalPages: number;
    }>('/admin/seller-upgrade-requests', {
      params: { page, limit },
    });
    return response.data;
  },

  // System Config
  async getConfig() {
    const response = await apiClient.get<SystemConfig>('/admin/config');
    return response.data;
  },

  async updateConfig(data: UpdateConfigRequest) {
    const response = await apiClient.patch('/admin/config', data);
    return response.data;
  },

  // Category Management
  async createCategory(data: { name: string; parentId?: string }) {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: { name?: string; parentId?: string }) {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Product Management
  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async getProducts(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/products', {
      params: { page, limit },
    });
    return response.data;
  },
};
