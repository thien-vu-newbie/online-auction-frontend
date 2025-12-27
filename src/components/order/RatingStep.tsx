import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarIcon, ThumbsUpIcon, ThumbsDownIcon } from '@phosphor-icons/react';
import { useCreateRating, useProductRatings } from '@/hooks/useRatings';
import type { Order } from '@/lib/api/orders';

const ratingSchema = z.object({
  rating: z.enum(['1', '-1']),
  comment: z.string().min(10, 'Nhận xét phải có ít nhất 10 ký tự').max(500, 'Nhận xét tối đa 500 ký tự'),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface RatingStepProps {
  order: Order;
  isBuyer: boolean;
  isSeller: boolean;
}

export function RatingStep({ order, isBuyer, isSeller }: RatingStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const createRating = useCreateRating();
  const { data: productRatings } = useProductRatings(order.productId._id);

  const targetUser = isBuyer ? order.sellerId : order.buyerId;
  const targetUserRole = isBuyer ? 'người bán' : 'người mua';

  // Check if already rated
  const hasRated = productRatings?.ratings.some(
    (r) => r.fromUserId._id === (isBuyer ? order.buyerId._id : order.sellerId._id)
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: '1',
    },
  });

  const selectedRating = watch('rating');

  const onSubmit = async (data: RatingFormData) => {
    await createRating.mutateAsync({
      productId: order.productId._id,
      toUserId: targetUser._id,
      rating: parseInt(data.rating) as 1 | -1,
      comment: data.comment,
    });
    setSubmitted(true);
  };

  if (submitted || hasRated) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon size={24} weight="fill" className="text-primary" />
            Đánh giá đã gửi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã đánh giá {targetUserRole}. Đánh giá của bạn giúp cải thiện chất lượng giao dịch trong cộng đồng.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon size={24} />
          Đánh giá giao dịch
        </CardTitle>
        <CardDescription>
          Đánh giá {targetUserRole}: <strong>{targetUser.fullName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Selection */}
          <div className="space-y-3">
            <Label>Đánh giá của bạn *</Label>
            <input type="hidden" {...register('rating')} />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setValue('rating', '1')}
                className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all flex-1 ${
                  selectedRating === '1'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <ThumbsUpIcon size={28} weight={selectedRating === '1' ? 'fill' : 'regular'} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Tích cực (+1)</p>
                  <p className="text-xs text-muted-foreground">Giao dịch tốt</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue('rating', '-1')}
                className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all flex-1 ${
                  selectedRating === '-1'
                    ? 'border-destructive bg-destructive/5 shadow-sm'
                    : 'border-muted hover:border-destructive/50 hover:bg-destructive/5'
                }`}
              >
                <ThumbsDownIcon
                  size={28}
                  weight={selectedRating === '-1' ? 'fill' : 'regular'}
                  className="text-destructive"
                />
                <div className="text-left">
                  <p className="font-semibold">Tiêu cực (-1)</p>
                  <p className="text-xs text-muted-foreground">Giao dịch không tốt</p>
                </div>
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét *</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder={`Chia sẻ trải nghiệm của bạn với ${targetUserRole}...`}
              className="min-h-[120px] resize-none"
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Nhận xét của bạn sẽ được hiển thị công khai và giúp người dùng khác đưa ra quyết định.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={createRating.isPending}>
            {createRating.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Lưu ý: Bạn có thể thay đổi đánh giá của mình sau khi gửi
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
