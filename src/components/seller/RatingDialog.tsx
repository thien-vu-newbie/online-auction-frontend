import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThumbsUpIcon, ThumbsDownIcon } from '@phosphor-icons/react';
import { useRateUser, useCancelTransaction } from '@/hooks/useSeller';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  ratedUserId: string;
  ratedUserName: string;
  isCancelTransaction?: boolean;
}

export function RatingDialog({
  open,
  onOpenChange,
  productId,
  productName,
  ratedUserId,
  ratedUserName,
  isCancelTransaction = false,
}: RatingDialogProps) {
  const [rating, setRating] = useState<'1' | '-1'>('1');
  const [comment, setComment] = useState('');
  const rateUser = useRateUser();
  const cancelTransaction = useCancelTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCancelTransaction) {
      await cancelTransaction.mutateAsync(productId);
    } else {
      await rateUser.mutateAsync({
        productId,
        ratedUserId,
        rating: Number(rating) as 1 | -1,
        comment,
      });
    }

    onOpenChange(false);
    setRating('1');
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCancelTransaction ? 'Hủy giao dịch' : 'Đánh giá người dùng'}
          </DialogTitle>
          <DialogDescription>
            {isCancelTransaction ? (
              <>
                Hủy giao dịch với <strong>{ratedUserName}</strong> cho sản phẩm{' '}
                <strong>{productName}</strong>. Người thắng sẽ tự động nhận đánh giá -1.
              </>
            ) : (
              <>
                Đánh giá <strong>{ratedUserName}</strong> cho sản phẩm{' '}
                <strong>{productName}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCancelTransaction && (
            <div className="space-y-3">
              <Label>Đánh giá *</Label>
              <RadioGroup value={rating} onValueChange={(value) => setRating(value as '1' | '-1')}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="1" id="positive" />
                  <Label
                    htmlFor="positive"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <ThumbsUpIcon size={20} className="text-green-600" weight="fill" />
                    <span>Tích cực (+1)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="-1" id="negative" />
                  <Label
                    htmlFor="negative"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <ThumbsDownIcon size={20} className="text-red-600" weight="fill" />
                    <span>Tiêu cực (-1)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét {isCancelTransaction ? '' : '*'}</Label>
            <Textarea
              id="comment"
              value={
                isCancelTransaction ? 'Người thắng không thanh toán' : comment
              }
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required={!isCancelTransaction}
              disabled={isCancelTransaction}
              placeholder={isCancelTransaction ? '' : 'Nhập nhận xét của bạn...'}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={rateUser.isPending || cancelTransaction.isPending}
              variant={isCancelTransaction ? 'destructive' : 'default'}
            >
              {rateUser.isPending || cancelTransaction.isPending
                ? 'Đang xử lý...'
                : isCancelTransaction
                  ? 'Xác nhận hủy'
                  : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
