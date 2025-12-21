import { apiClient } from './client';

export interface BidHistoryItem {
  _id: string;
  productId: string;
  bidderId: {
    _id: string;
    fullName: string;
  };
  bidAmount: number;
  bidTime: string;
  isRejected: boolean;
}

export interface BidHistoryResponse {
  bids: BidHistoryItem[];
  product: {
    _id: string;
    name: string;
    currentPrice: number;
  };
}

export interface PlaceAutoBidRequest {
  maxBidAmount: number;
}

export interface UpdateAutoBidRequest {
  maxBidAmount: number;
}

export interface AutoBidConfig {
  _id: string;
  productId: string;
  bidderId: string;
  maxBidAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const bidsApi = {
  async getBidHistory(productId: string) {
    const response = await apiClient.get<BidHistoryResponse>(
      `/bids/products/${productId}/history`
    );
    return response.data;
  },

  async placeAutoBid(productId: string, data: PlaceAutoBidRequest) {
    const response = await apiClient.post(
      `/bids/products/${productId}/auto-bid`,
      data
    );
    return response.data;
  },

  async getMyAutoBidConfig(productId: string) {
    const response = await apiClient.get<AutoBidConfig>(
      `/bids/products/${productId}/auto-bid/my-config`
    );
    return response.data;
  },

  async updateAutoBid(productId: string, data: UpdateAutoBidRequest) {
    const response = await apiClient.patch(
      `/bids/products/${productId}/auto-bid`,
      data
    );
    return response.data;
  },

  async toggleAutoBid(productId: string) {
    const response = await apiClient.patch(
      `/bids/products/${productId}/auto-bid/toggle`
    );
    return response.data;
  },
};
