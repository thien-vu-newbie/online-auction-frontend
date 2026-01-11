import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  StarIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
} from '@phosphor-icons/react';
import { useUserRatings } from '@/hooks/useRatings';
import { formatDate } from '@/lib/formatters';

export function UserRatingsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useUserRatings(userId, page, limit);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-24 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardContent className="py-12 text-center">
            <UserIcon size={64} className="mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy người dùng</h2>
            <p className="text-muted-foreground mb-6">
              Người dùng này không tồn tại hoặc đã bị xóa
            </p>
            <Link to="/">
              <Button>
                <ArrowLeftIcon size={18} />
                Về trang chủ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, ratings, pagination, summary } = data;
  const totalRatings = summary.ratingPositive + summary.ratingNegative;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeftIcon size={18} />
          Quay lại
        </Link>

        {/* User Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{user.fullName}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <EnvelopeIcon size={16} />
                  {user.email}
                </div>

                {/* Rating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                      <StarIcon size={24} weight="fill" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {summary.ratingPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Đánh giá tích cực
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                      <ThumbsUpIcon size={24} weight="fill" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {summary.ratingPositive}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tích cực
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-red-100 text-red-600">
                      <ThumbsDownIcon size={24} weight="fill" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {summary.ratingNegative}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tiêu cực
                      </div>
                    </div>
                  </div>
                </div>

                <Progress
                  value={summary.ratingPercentage}
                  className="h-2 mt-4"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ratings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Đánh giá nhận được ({totalRatings})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <StarIcon size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating, index) => (
                  <motion.div
                    key={rating._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-sm">
                          {rating.fromUserId.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {rating.fromUserId.fullName}
                          </span>
                          {rating.rating === 1 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <ThumbsUpIcon size={14} weight="fill" className="mr-1" />
                              Tích cực
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                              <ThumbsDownIcon size={14} weight="fill" className="mr-1" />
                              Tiêu cực
                            </Badge>
                          )}
                          {rating.isCancelledTransaction && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Giao dịch bị hủy
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rating.comment || 'Không có bình luận'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Sản phẩm: {rating.productId.name}</span>
                          <span>•</span>
                          <span>{formatDate(rating.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {index < ratings.length - 1 && <Separator />}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
