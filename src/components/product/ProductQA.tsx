import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChatCircleDotsIcon,
  PaperPlaneRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  StorefrontIcon,
} from '@phosphor-icons/react';
import type { Question } from '@/types';
import { formatDate } from '@/lib/formatters';

interface ProductQAProps {
  questions: Question[];
  isAuthenticated: boolean;
  isSeller: boolean;
  onAskQuestion?: (question: string) => void;
  onAnswerQuestion?: (questionId: string, answer: string) => void;
}

export function ProductQA({
  questions,
  isAuthenticated,
  isSeller,
  onAskQuestion,
  onAnswerQuestion,
}: ProductQAProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !onAskQuestion) return;
    setIsSubmitting(true);
    try {
      await onAskQuestion(newQuestion);
      setNewQuestion('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!answerText.trim() || !onAnswerQuestion) return;
    setIsSubmitting(true);
    try {
      await onAnswerQuestion(questionId, answerText);
      setAnsweringId(null);
      setAnswerText('');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              disabled={!newQuestion.trim() || isSubmitting}
              className="gap-2"
            >
              <PaperPlaneRightIcon size={18} />
              Gửi câu hỏi
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
      {questions.length === 0 ? (
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
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
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
                      <span className="font-medium">{q.askerName}</span>
                      <Badge variant="outline" className="text-xs">
                        Người mua
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground bg-muted/50 rounded-lg p-3">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="flex gap-3 ml-8">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <StorefrontIcon size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">Người bán</span>
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <CheckCircleIcon size={12} weight="fill" className="mr-1" />
                          Đã trả lời
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {q.answeredAt && formatDate(q.answeredAt)}
                        </span>
                      </div>
                      <p className="text-foreground bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-900">
                        {q.answer}
                      </p>
                    </div>
                  </div>
                ) : isSeller ? (
                  // Answer form for seller
                  <div className="ml-8">
                    {answeringId === q.id ? (
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
                            onClick={() => handleSubmitAnswer(q.id)}
                            disabled={!answerText.trim() || isSubmitting}
                          >
                            Trả lời
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnsweringId(q.id)}
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

                {index < questions.length - 1 && <Separator className="mt-6" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
