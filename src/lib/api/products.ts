import { apiClient } from './client';
import type { Product } from '@/types';

// Backend response types (raw from API)
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

interface BackendProductDetail extends BackendProduct {
  descriptionHistory: Array<{
    _id: string;
    productId: string;
    content: string;
    addedAt: string;
  }>;
  relatedProducts: Array<{
    _id: string;
    name: string;
    images: string[];
    currentPrice: number;
    endTime: string;
    bidCount: number;
    startTime: string;
  }>;
}

// Paginated response
interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

// Helper to calculate seller rating percentage
const calculateRating = (positive?: number, negative?: number): number => {
  const total = (positive || 0) + (negative || 0);
  if (total === 0) return 100;
  return Math.round(((positive || 0) / total) * 100);
};

// Helper to check if product is new (posted within 30 minutes)
const isNewProduct = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  return diffMinutes <= 30;
};

// Helper to generate slug from category name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Transform backend product to frontend Product type
export const transformProduct = (backendProduct: BackendProduct): Product => {
  const seller = typeof backendProduct.sellerId === 'object' ? backendProduct.sellerId : null;
  const category = typeof backendProduct.categoryId === 'object' ? backendProduct.categoryId : null;
  const winner = typeof backendProduct.currentWinnerId === 'object' ? backendProduct.currentWinnerId : null;

  const categoryName = category?.name || 'Không xác định';
  
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description,
    currentPrice: backendProduct.currentPrice,
    buyNowPrice: backendProduct.buyNowPrice,
    startPrice: backendProduct.startPrice,
    bidStep: backendProduct.stepPrice,
    imageUrl: backendProduct.thumbnail,
    images: backendProduct.images,
    categoryId: category?._id || (backendProduct.categoryId as string),
    categoryName,
    categorySlug: generateSlug(categoryName),
    sellerId: seller?._id || (backendProduct.sellerId as string),
    sellerName: seller?.fullName || 'Không xác định',
    sellerRating: seller ? calculateRating(seller.ratingPositive, seller.ratingNegative) : 100,
    highestBidderId: winner?._id,
    highestBidderName: winner?.fullName ? `****${winner.fullName.slice(-4)}` : undefined,
    highestBidderRating: winner ? calculateRating(winner.ratingPositive, winner.ratingNegative) : undefined,
    bidCount: backendProduct.bidCount,
    startTime: backendProduct.startTime,
    endTime: backendProduct.endTime,
    createdAt: backendProduct.createdAt,
    isNew: isNewProduct(backendProduct.createdAt),
    autoExtend: backendProduct.autoExtend,
    allowUnratedBidders: backendProduct.allowUnratedBidders,
    isRejected: (backendProduct as any).isRejected || false,
    isWinning: (backendProduct as any).isWinning || false,
  };
};

// Transform related product (minimal fields)
const transformRelatedProduct = (product: BackendProductDetail['relatedProducts'][0]): Product => {
  // Use first image from images array as thumbnail
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
  
  return {
    id: product._id,
    name: product.name,
    description: '',
    currentPrice: product.currentPrice,
    startPrice: product.currentPrice,
    bidStep: 0,
    imageUrl: imageUrl,
    images: product.images || [],
    categoryId: '',
    categoryName: '',
    categorySlug: '',
    sellerId: '',
    sellerName: '',
    sellerRating: 100,
    bidCount: product.bidCount,
    startTime: product.startTime,
    endTime: product.endTime,
    createdAt: '',
    autoExtend: false,
  };
};

// API Functions

/**
 * Get top products ending soon (for homepage)
 */
export const getTopEndingSoon = async (limit: number = 5): Promise<Product[]> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-ending-soon', {
    params: { limit },
  });
  return response.data.products.map(transformProduct);
};

/**
 * Get top products with most bids (for homepage)
 */
export const getTopMostBids = async (limit: number = 5): Promise<Product[]> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-most-bids', {
    params: { limit },
  });
  return response.data.products.map(transformProduct);
};

/**
 * Get top products with highest price (for homepage)
 */
export const getTopHighestPrice = async (limit: number = 5): Promise<Product[]> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-highest-price', {
    params: { limit },
  });
  return response.data.products.map(transformProduct);
};

/**
 * Get product by ID (with description history and related products)
 */
export interface ProductDetailResponse {
  product: Product;
  descriptionHistory: Array<{
    id: string;
    content: string;
    addedAt: string;
  }>;
  relatedProducts: Product[];
}

export const getProductById = async (id: string): Promise<ProductDetailResponse> => {
  const response = await apiClient.get<BackendProductDetail>(`/products/${id}`);
  const data = response.data;

  return {
    product: transformProduct(data),
    descriptionHistory: data.descriptionHistory.map((h) => ({
      id: h._id,
      content: h.content,
      addedAt: h.addedAt,
    })),
    relatedProducts: data.relatedProducts.map(transformRelatedProduct),
  };
};

/**
 * Get products by category with pagination
 */
export interface CategoryProductsParams {
  categoryId: string;
  page?: number;
  limit?: number;
}

export interface CategoryProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export const getProductsByCategory = async (
  params: CategoryProductsParams
): Promise<CategoryProductsResponse> => {
  const { categoryId, page = 1, limit = 12 } = params;
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>(
    `/products/category/${categoryId}`,
    { params: { page, limit } }
  );

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

/**
 * Search products
 */
export interface SearchProductsParams {
  name?: string;
  categoryId?: string;
  sortBy?: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'end_time_asc' | 'bids_desc';
  page?: number;
  limit?: number;
}

export const searchProducts = async (
  params: SearchProductsParams
): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/search', {
    params,
  });

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

/**
 * Search products within a category
 */
export const searchProductsInCategory = async (
  categoryId: string,
  params: Omit<SearchProductsParams, 'categoryId'>
): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>(
    `/products/category/${categoryId}/search`,
    { params }
  );

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

/**
 * Get top products with pagination (for "View All" pages)
 */
export const getTopEndingSoonPaginated = async (page: number = 1, limit: number = 12): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-ending-soon', {
    params: { page, limit },
  });

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

export const getTopMostBidsPaginated = async (page: number = 1, limit: number = 12): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-most-bids', {
    params: { page, limit },
  });

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

export const getTopHighestPricePaginated = async (page: number = 1, limit: number = 12): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products/homepage/top-highest-price', {
    params: { page, limit },
  });

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

export const getAllProductsPaginated = async (page: number = 1, limit: number = 12): Promise<CategoryProductsResponse> => {
  const response = await apiClient.get<PaginatedResponse<BackendProduct>>('/products', {
    params: { page, limit },
  });

  return {
    products: response.data.products.map(transformProduct),
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

/**
 * Buy product now with buyNowPrice
 */
export const buyNow = async (productId: string): Promise<Product> => {
  const response = await apiClient.post<BackendProduct>(`/products/${productId}/buy-now`);
  return transformProduct(response.data);
};
