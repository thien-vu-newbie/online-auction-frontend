import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api/comments';
import type { CreateCommentRequest } from '@/lib/api/comments';
import { toast } from 'sonner';

export const useComments = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['comments', productId],
    queryFn: () => commentsApi.getCommentsByProduct(productId!),
    enabled: !!productId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.productId] });
      toast.success(variables.parentId ? 'Đã trả lời câu hỏi' : 'Đã gửi câu hỏi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi câu hỏi');
    },
  });
};
