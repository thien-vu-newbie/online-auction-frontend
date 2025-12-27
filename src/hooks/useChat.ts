import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, type Message } from '@/lib/api/chat';
import { useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';
import { tokenStorage } from '@/lib/api/client';

export function useChatMessages(productId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', productId],
    queryFn: () => chatApi.getMessages(productId!),
    enabled: !!productId,
    refetchOnWindowFocus: false,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, content }: { productId: string; content: string }) =>
      chatApi.sendMessage(productId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.productId] });
    },
  });
}

export function useChatSocket(productId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!productId || !token) return;

    const socket = socketService.connect(token);

    const handleConnect = () => {
      console.log('🔌 Chat socket connected, joining product:', productId);
      setIsConnected(true);
      socket.emit('joinProduct', { productId });
    };

    const handleDisconnect = () => {
      console.log('🔌 Chat socket disconnected');
      setIsConnected(false);
    };

    const handleNewMessage = (message: any) => {
      console.log('📨 Received new message via WebSocket:', message);
      queryClient.setQueryData<Message[]>(['chat-messages', productId], (old) => {
        if (!old) return [message];
        const exists = old.some((m) => m._id === message._id);
        if (exists) return old;
        return [...old, message];
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
    };
  }, [productId, queryClient]);

  return { isConnected };
}
