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

interface WatchlistItem {
  _id: string;
  product: BackendProduct;
  addedAt: string;
}

interface WatchlistResponse {
  items: WatchlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const watchlistApi = {
  async addToWatchlist(productId: string) {
    const response = await apiClient.post('/watchlist', { productId });
    return response.data;
  },

  async removeFromWatchlist(productId: string) {
    const response = await apiClient.delete(`/watchlist/${productId}`);
    return response.data;
  },

  async getMyWatchlist(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<WatchlistResponse>('/watchlist/my-list', {
      params: { page, limit },
    });
    
    return {
      products: response.data.items.map(item => transformProduct(item.product)),
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages,
    };
  },

  async checkInWatchlist(productId: string) {
    const response = await apiClient.get<{ productId: string; isInWatchlist: boolean }>(
      `/watchlist/check/${productId}`
    );
    return response.data.isInWatchlist;
  },
};
