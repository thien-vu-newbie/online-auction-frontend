import { apiClient } from './client';
import { transformProduct } from './products';

interface BackendUser {
  _id: string;
  fullName: string;
  ratingPositive?: number;
  ratingNegative?: number;
}

interface BackendCategory {
  _id: string;
  name: string;
}

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  categoryId: BackendCategory | string;
  sellerId: BackendUser | string;
  thumbnail: string;
  images: string[];
  startPrice: number;
  currentPrice: number;
  stepPrice: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  autoExtend: boolean;
  allowUnratedBidders: boolean;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  currentWinnerId?: BackendUser | string | null;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isEmailVerified: boolean;
  ratingPositive: number;
  ratingNegative: number;
  isRequestingSellerUpgrade: boolean;
  sellerUpgradeRequestDate?: string;
  sellerUpgradeExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const usersApi = {
  async getProfile() {
    const response = await apiClient.get<UserProfile>('/users/profile');
    return response.data;
  },

  async getMyParticipatingProducts(page: number = 1, limit: number = 12) {
    const response = await apiClient.get<{ products: any[]; total: number; page: number; totalPages: number }>('/users/my-participating-products', {
      params: { page, limit },
    });
    return {
      products: response.data.products.map(transformProduct),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  async getMyRejectedProducts(page: number = 1, limit: number = 12) {
    const response = await apiClient.get<{ products: any[]; total: number; page: number; totalPages: number }>('/users/my-rejected-products', {
      params: { page, limit },
    });
    return {
      products: response.data.products.map(transformProduct),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  async getMyWonProducts(page: number = 1, limit: number = 12) {
    const response = await apiClient.get<{ products: any[]; total: number; page: number; totalPages: number }>('/users/my-won-products', {
      params: { page, limit },
    });
    return {
      products: response.data.products.map(transformProduct),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  async getMyProducts(page: number = 1, limit: number = 10, status?: string) {
    const response = await apiClient.get('/users/my-products', {
      params: { page, limit, status },
    });
    return {
      products: response.data.products.map(transformProduct),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  async updateProfile(data: UpdateProfileRequest) {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest) {
    const response = await apiClient.post('/users/change-password', data);
    return response.data;
  },

  async requestSellerUpgrade() {
    const response = await apiClient.post('/users/request-seller-upgrade', {});
    return response.data;
  },
};
