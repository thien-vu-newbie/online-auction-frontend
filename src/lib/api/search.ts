import { apiClient } from './client';
import type { Product } from '@/types';

// Backend response structure
interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  sellerId: {
    _id: string;
    fullName: string;
    email: string;
  };
  images: string[];
  thumbnail: string;
  currentPrice: number;
  buyNowPrice?: number;
  startPrice: number;
  stepPrice: number;
  startTime: string;
  endTime: string;
  status: string;
  bidCount: number;
  currentWinnerId?: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
  autoExtend: boolean;
}

export const SortBy = {
  CREATED_DESC: 'created_desc',
  END_TIME_DESC: 'endTime_desc',
  PRICE_ASC: 'price_asc',
} as const;

export type SortByType = typeof SortBy[keyof typeof SortBy];

export interface SearchParams {
  name?: string;
  categoryId?: string;
  sortBy?: SortByType;
  page?: number;
  limit?: number;
}

interface BackendSearchResponse {
  products: BackendProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Transform backend product to frontend Product type
function transformProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description,
    currentPrice: backendProduct.currentPrice,
    buyNowPrice: backendProduct.buyNowPrice,
    startPrice: backendProduct.startPrice,
    bidStep: backendProduct.stepPrice,
    imageUrl: backendProduct.thumbnail || backendProduct.images[0],
    images: backendProduct.images,
    categoryId: backendProduct.categoryId._id,
    categoryName: backendProduct.categoryId.name,
    categorySlug: backendProduct.categoryId.slug,
    sellerId: backendProduct.sellerId._id,
    sellerName: backendProduct.sellerId.fullName,
    sellerRating: 0, // Not available in search response
    highestBidderId: backendProduct.currentWinnerId?._id,
    highestBidderName: backendProduct.currentWinnerId?.fullName,
    bidCount: backendProduct.bidCount,
    startTime: backendProduct.startTime,
    endTime: backendProduct.endTime,
    createdAt: backendProduct.createdAt,
    autoExtend: backendProduct.autoExtend,
  };
}

export const searchApi = {
  searchProducts: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.get<BackendSearchResponse>('/products/search', { params });
    return {
      ...data,
      products: data.products.map(transformProduct),
    };
  },
};
