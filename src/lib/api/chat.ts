import { apiClient } from './client';

export interface Message {
  _id: string;
  productId: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getMessages: async (productId: string): Promise<Message[]> => {
    const { data } = await apiClient.get(`/chat/products/${productId}/messages`);
    return data;
  },

  sendMessage: async (productId: string, content: string): Promise<Message> => {
    const { data } = await apiClient.post('/chat/messages', {
      productId,
      content,
    });
    return data;
  },
};
