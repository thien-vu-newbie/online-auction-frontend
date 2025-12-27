import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ChatCircleDotsIcon, 
  PaperPlaneRightIcon, 
  CircleNotchIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useChatMessages, useChatSocket } from '@/hooks/useChat';
import { socketService } from '@/lib/socket';
import { useAppSelector } from '@/store/hooks';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Order } from '@/lib/api/orders';

interface OrderChatProps {
  order: Order;
  isBuyer: boolean;
}

export function OrderChat({ order, isBuyer }: OrderChatProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const productId = order.productId._id;
  const { data: messages = [], isLoading } = useChatMessages(productId);
  const { isConnected } = useChatSocket(productId);
  const [isSending, setIsSending] = useState(false);

  const otherUser = isBuyer ? order.sellerId : order.buyerId;
  const otherUserRole = isBuyer ? 'Người bán' : 'Người mua';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea component uses a viewport div - need to find it
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || isSending || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const messageContent = message.trim();
    setMessage('');
    setIsSending(true);
    console.log('📤 Sending message via WebSocket:', { productId, content: messageContent });

    // Set a timeout to reset sending state if no response
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Message send timeout - resetting state');
      setIsSending(false);
    }, 5000);

    socket.emit('sendMessage', { productId, content: messageContent }, (response: any) => {
      clearTimeout(timeoutId);
      console.log('✅ Message sent response:', response);
      setIsSending(false);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-[640px] flex flex-col overflow-hidden">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <ChatCircleDotsIcon size={24} weight="fill" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Trò chuyện với {otherUserRole}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {otherUser.fullName}
                <span className="flex items-center gap-1 text-xs">
                  {isConnected ? (
                    <>
                      <CheckCircleIcon size={12} className="text-green-500" weight="fill" />
                      <span className="text-green-600">Đang kết nối</span>
                    </>
                  ) : (
                    <>
                      <WarningCircleIcon size={12} className="text-amber-500" weight="fill" />
                      <span className="text-amber-600">Đang kết nối lại...</span>
                    </>
                  )}
                </span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full" ref={scrollRef}>
            <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <CircleNotchIcon size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="p-4 rounded-full bg-muted mb-4">
                <ChatCircleDotsIcon size={48} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Chưa có tin nhắn</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Bắt đầu cuộc trò chuyện với {otherUserRole.toLowerCase()} để trao đổi thông tin về đơn hàng.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.senderId._id === user?.id;
                const showDate =
                  index === 0 ||
                  new Date(msg.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-4">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}

                    <div
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(msg.senderId.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
                      >
                        {!isCurrentUser && (
                          <span className="text-xs font-medium text-muted-foreground mb-1">
                            {msg.senderId.fullName}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder={`Nhắn tin cho ${otherUser.fullName}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none flex-1"
              disabled={isSending || !isConnected}
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending || !isConnected}
              className="px-4 h-[44px] w-[44px] flex-shrink-0"
              size="icon"
            >
              {isSending ? (
                <CircleNotchIcon size={20} className="animate-spin" />
              ) : (
                <PaperPlaneRightIcon size={20} weight="fill" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nhấn <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> để gửi,{' '}
            <kbd className="px-1 py-0.5 rounded bg-muted">Shift + Enter</kbd> để xuống dòng
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
