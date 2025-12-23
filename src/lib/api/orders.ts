import { apiClient } from './client';

export interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    description?: string;
    images: string[];
    currentPrice: number;
  };
  sellerId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  buyerId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  finalPrice: number;
  status: 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  paidAt?: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  trackingNumber?: string;
  shippedAt?: string;
  receivedAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  amount: number;
}

export interface ShippingAddressRequest {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export interface ConfirmShippedRequest {
  trackingNumber: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export const ordersApi = {
  createPaymentIntent: async (productId: string): Promise<CreatePaymentIntentResponse> => {
    const { data } = await apiClient.post(`/orders/products/${productId}/create-payment-intent`);
    return data;
  },

  confirmPayment: async (orderId: string): Promise<{ message: string; order: Order }> => {
    const { data } = await apiClient.post(`/orders/${orderId}/confirm-payment`);
    return data;
  },

  getMyOrders: async (params?: { page?: number; limit?: number; role?: 'buyer' | 'seller' }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const { data } = await apiClient.get('/orders/my-orders', { params });
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data.order; // Backend returns { order, role }
  },

  updateShippingAddress: async (
    orderId: string,
    address: ShippingAddressRequest
  ): Promise<{ message: string; order: Order }> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/shipping-address`, address);
    return data;
  },

  confirmShipped: async (
    orderId: string,
    request: ConfirmShippedRequest
  ): Promise<{ message: string; order: Order }> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/confirm-shipped`, request);
    return data;
  },

  confirmReceived: async (orderId: string): Promise<{ message: string; order: Order }> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/confirm-received`);
    return data;
  },

  cancelOrder: async (
    orderId: string,
    request: CancelOrderRequest
  ): Promise<{ message: string; order: Order }> => {
    const { data } = await apiClient.post(`/orders/${orderId}/cancel`, request);
    return data;
  },
};
