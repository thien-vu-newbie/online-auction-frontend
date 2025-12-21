import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChatCircleDotsIcon,
  PaperPlaneRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  StorefrontIcon,
} from '@phosphor-icons/react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { formatDate } from '@/lib/formatters';

interface ProductQAProps {
  productId: string;
  isAuthenticated: boolean;
  isSeller: boolean;
  currentUserId?: string;
}

export function ProductQA({
  productId,
  isAuthenticated,
  isSeller,
}: ProductQAProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const { data, isLoading } = useComments(productId);
  const createComment = useCreateComment();

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    await createComment.mutateAsync({
      productId,
      content: newQuestion,
    });
    setNewQuestion('');
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;
    await createComment.mutateAsync({
      productId,
      content: answerText,
      parentId: questionId,
    });
    setAnsweringId(null);
    setAnswerText('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const comments = data?.comments || [];
  const rootComments = comments.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Ask Question Form */}
      {isAuthenticated && !isSeller && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Textarea
            placeholder="Đặt câu hỏi cho người bán về sản phẩm này..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || createComment.isPending}
              className="gap-2"
            >
              <PaperPlaneRightIcon size={18} />
              {createComment.isPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
            </Button>
          </div>
        </motion.div>
      )}

      {!isAuthenticated && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Vui lòng{' '}
            <a href="/login" className="text-primary font-medium hover:underline">
              đăng nhập
            </a>{' '}
            để đặt câu hỏi
          </p>
        </div>
      )}

      <Separator />

      {/* Questions List */}
      {rootComments.length === 0 ? (
        <div className="text-center py-12">
          <ChatCircleDotsIcon
            size={48}
            className="mx-auto text-muted-foreground/50 mb-4"
          />
          <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Hãy là người đầu tiên đặt câu hỏi!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {rootComments.map((q, index) => {
              const reply = q.replies?.[0];
              
              return (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-4"
                >
                  {/* Question */}
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <UserIcon size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{q.userId.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          Người mua
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(q.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground bg-muted/50 rounded-lg p-3">
                        {q.content}
                      </p>
                    </div>
                  </div>

                  {/* Answer */}
                  {reply ? (
                    <div className="flex gap-3 ml-8">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <StorefrontIcon size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{reply.userId.fullName}</span>
                          <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircleIcon size={12} weight="fill" className="mr-1" />
                            Đã trả lời
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-900">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ) : isSeller ? (
                    // Answer form for seller
                    <div className="ml-8">
                      {answeringId === q._id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <Textarea
                          placeholder="Nhập câu trả lời..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswerText('');
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() => handleSubmitAnswer(q._id)}
                            disabled={!answerText.trim() || createComment.isPending}
                          >
                            {createComment.isPending ? 'Đang gửi...' : 'Trả lời'}
                          </Button>
                        </div>
                      </motion.div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAnsweringId(q._id)}
                          className="gap-2"
                        >
                          <PaperPlaneRightIcon size={16} />
                          Trả lời câu hỏi này
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Waiting for answer badge
                    <div className="ml-8 flex items-center gap-2 text-muted-foreground text-sm">
                      <ClockIcon size={16} />
                      <span>Đang chờ người bán trả lời</span>
                    </div>
                  )}

                  {index < rootComments.length - 1 && <Separator className="mt-6" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
