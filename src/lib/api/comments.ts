import { apiClient } from './client';

export interface CommentUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface Comment {
  _id: string;
  userId: CommentUser;
  productId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  productId: string;
  content: string;
  parentId?: string;
}

export interface CommentsResponse {
  product: {
    _id: string;
    name: string;
  };
  comments: Comment[];
}

export const commentsApi = {
  async createComment(data: CreateCommentRequest) {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },

  async getCommentsByProduct(productId: string) {
    const response = await apiClient.get<CommentsResponse>(
      `/comments/products/${productId}`
    );
    return response.data;
  },
};
