import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WarningIcon, XCircleIcon } from '@phosphor-icons/react';
import { useCancelOrder } from '@/hooks/useOrders';

const cancelSchema = z.object({
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự').max(500, 'Lý do tối đa 500 ký tự'),
});

type CancelFormData = z.infer<typeof cancelSchema>;

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function CancelOrderDialog({ open, onOpenChange, orderId }: CancelOrderDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const cancelOrder = useCancelOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
  });

  const onSubmit = async (data: CancelFormData) => {
    await cancelOrder.mutateAsync({
      orderId,
      reason: data.reason,
    });
    setConfirmed(true);
    reset();
    setTimeout(() => {
      onOpenChange(false);
      setConfirmed(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <WarningIcon size={24} className="text-destructive" />
                Hủy giao dịch
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy giao dịch này không?
              </DialogDescription>
            </DialogHeader>

            <Alert variant="destructive">
              <XCircleIcon size={20} className="mt-0.5" />
              <AlertDescription>
                <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Chỉ có thể hủy khi người mua chưa thanh toán</li>
                  <li>Hệ thống sẽ tự động đánh giá <strong>-1 điểm</strong> cho người mua</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do hủy giao dịch *</Label>
                <Textarea
                  id="reason"
                  {...register('reason')}
                  placeholder="VD: Người mua không thanh toán sau 24h, không phản hồi tin nhắn..."
                  className="min-h-[100px] resize-none"
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Đóng
                </Button>
                <Button type="submit" variant="destructive" disabled={cancelOrder.isPending}>
                  {cancelOrder.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <XCircleIcon size={64} weight="fill" className="mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Đã hủy giao dịch</h3>
            <p className="text-muted-foreground">
              Giao dịch đã được hủy và người mua đã nhận đánh giá -1 điểm.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
