import { apiClient } from './client';
import { transformProduct } from './products';

interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  startPrice: number;
  stepPrice: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  autoExtend?: boolean;
  allowUnratedBidders?: boolean;
}

interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  startPrice?: number;
  stepPrice?: number;
  buyNowPrice?: number;
  startTime?: string;
  endTime?: string;
  autoExtend?: boolean;
  allowUnratedBidders?: boolean;
}

interface AddDescriptionRequest {
  content: string;
}

export const sellerApi = {
  async createProduct(data: CreateProductRequest, images: File[]) {
    const formData = new FormData();
    
    // Append product data
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('categoryId', data.categoryId);
    formData.append('startPrice', data.startPrice.toString());
    formData.append('stepPrice', data.stepPrice.toString());
    if (data.buyNowPrice) {
      formData.append('buyNowPrice', data.buyNowPrice.toString());
    }
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);
    formData.append('autoExtend', (data.autoExtend ?? false).toString());
    formData.append('allowUnratedBidders', (data.allowUnratedBidders ?? false).toString());
    
    // Append images (minimum 4 required)
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProduct(productId: string, data: UpdateProductRequest, images?: File[]) {
    // If images are provided, use FormData
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Append product data
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
      if (data.startPrice !== undefined) formData.append('startPrice', data.startPrice.toString());
      if (data.stepPrice !== undefined) formData.append('stepPrice', data.stepPrice.toString());
      if (data.buyNowPrice !== undefined) formData.append('buyNowPrice', data.buyNowPrice.toString());
      if (data.startTime !== undefined) formData.append('startTime', data.startTime);
      if (data.endTime !== undefined) formData.append('endTime', data.endTime);
      if (data.autoExtend !== undefined) formData.append('autoExtend', data.autoExtend.toString());
      if (data.allowUnratedBidders !== undefined) formData.append('allowUnratedBidders', data.allowUnratedBidders.toString());
      
      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await apiClient.patch(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return transformProduct(response.data);
    }
    
    // No images, send JSON
    const response = await apiClient.patch(`/products/${productId}`, data);
    return transformProduct(response.data);
  },

  async addProductDescription(productId: string, data: AddDescriptionRequest) {
    const response = await apiClient.post(`/products/${productId}/description`, data);
    return response.data;
  },

  async rejectBidder(productId: string, bidderId: string) {
    const response = await apiClient.delete(`/bids/products/${productId}/reject/${bidderId}`);
    return response.data;
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

  async rateUser(productId: string, ratedUserId: string, rating: 1 | -1, comment: string) {
    const response = await apiClient.post('/ratings', {
      productId,
      ratedUserId,
      rating,
      comment,
    });
    return response.data;
  },

  async cancelTransaction(productId: string) {
    const response = await apiClient.post(`/ratings/products/${productId}/cancel-transaction`);
    return response.data;
  },
};
