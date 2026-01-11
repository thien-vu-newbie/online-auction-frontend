import { apiClient } from './client';

export interface RatingUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface RatingProduct {
  _id: string;
  name: string;
}

export interface Rating {
  _id: string;
  fromUserId: RatingUser;
  toUserId: RatingUser;
  productId: RatingProduct;
  rating: 1 | -1;
  comment: string;
  isSellerToWinner: boolean;
  isCancelledTransaction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingRequest {
  productId: string;
  toUserId: string;
  rating: 1 | -1;
  comment: string;
}

export interface UpdateRatingRequest {
  rating: 1 | -1;
  comment: string;
}

export interface RatingsResponse {
  ratings: Rating[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  summary?: {
    ratingPositive: number;
    ratingNegative: number;
    ratingPercentage: number;
  };
}

export interface UserRatingsResponse {
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  ratings: Rating[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  summary: {
    ratingPositive: number;
    ratingNegative: number;
    ratingPercentage: number;
  };
}

export interface ProductRatingsResponse {
  productId: string;
  productName: string;
  ratings: Rating[];
}

export const ratingsApi = {
  async createRating(data: CreateRatingRequest) {
    const response = await apiClient.post('/ratings', data);
    return response.data;
  },

  async updateRating(ratingId: string, data: UpdateRatingRequest) {
    const response = await apiClient.patch(`/ratings/${ratingId}`, data);
    return response.data;
  },

  async getMyReceivedRatings(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<RatingsResponse>('/ratings/my-received', {
      params: { page, limit },
    });
    return response.data;
  },

  async getMyGivenRatings(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<RatingsResponse>('/ratings/my-given', {
      params: { page, limit },
    });
    return response.data;
  },

  async getRatingsForProduct(productId: string) {
    const response = await apiClient.get<ProductRatingsResponse>(
      `/ratings/products/${productId}`
    );
    return response.data;
  },

  async cancelTransaction(productId: string) {
    const response = await apiClient.post(
      `/ratings/products/${productId}/cancel-transaction`
    );
    return response.data;
  },

  async getUserRatings(userId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<UserRatingsResponse>(`/ratings/users/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};
