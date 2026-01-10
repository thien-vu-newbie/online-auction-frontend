import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RobotIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/formatters';
import { usePlaceAutoBid, useUpdateAutoBid, useAutoBidConfig } from '@/hooks/useBids';

// Helper functions for price formatting
const formatPrice = (value: string | number): string => {
  const num = String(value).replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('de-DE');
};

const parsePrice = (value: string): number => {
  const cleaned = value.replace(/\./g, '');
  return Number(cleaned) || 0;
};

interface AutoBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currentPrice: number;
  stepPrice: number;
  suggestedBid: number;
}

export function AutoBidDialog({
  open,
  onOpenChange,
  productId,
  currentPrice,
  stepPrice,
  suggestedBid,
}: AutoBidDialogProps) {
  const { data: autoBidConfig, isLoading: isLoadingConfig } = useAutoBidConfig(productId);
  const placeAutoBid = usePlaceAutoBid();
  const updateAutoBid = useUpdateAutoBid();

  const isExistingConfig = autoBidConfig?.hasAutoBid ?? false;
  const minAmount = isExistingConfig ? currentPrice + stepPrice : suggestedBid;
  
  const defaultMaxBidAmount = autoBidConfig?.maxBidAmount ?? suggestedBid;
  const [maxBidAmount, setMaxBidAmount] = useState(defaultMaxBidAmount);
  const [maxBidAmountInput, setMaxBidAmountInput] = useState(formatPrice(defaultMaxBidAmount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (maxBidAmount < minAmount) {
      return;
    }

    console.log("🚀 ~ handleSubmit ~ isExistingConfig:", isExistingConfig)
    // await updateAutoBid.mutateAsync({
    //   productId,
    //   data: { maxBidAmount },
    // }); 
    if (isExistingConfig) {
      await updateAutoBid.mutateAsync({
        productId,
        data: { maxBidAmount },
      });
    } else {
      await placeAutoBid.mutateAsync({
        productId,
        data: { maxBidAmount },
      });
    }

    onOpenChange(false);
  };

  const isSubmitting = placeAutoBid.isPending || updateAutoBid.isPending;
  const isValid = maxBidAmount >= minAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <RobotIcon size={24} weight="duotone" className="text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {isExistingConfig ? 'Cập nhật Auto Bid' : 'Đặt Auto Bid'}
            </DialogTitle>
          </div>
          <DialogDescription>
            Hệ thống sẽ tự động đấu giá giúp bạn với giá vừa đủ để thắng, tối đa bằng số tiền bạn đặt.
          </DialogDescription>
        </DialogHeader>

        {isLoadingConfig ? (
          <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <InfoIcon size={16} className="!static !translate-y-0" />
              <AlertDescription className="text-sm">
                <strong>Cách hoạt động:</strong> Bạn đặt giá tối đa mà bạn sẵn sàng trả. Hệ thống
                sẽ tự động bid vừa đủ để bạn thắng, tối đa bằng số tiền bạn đặt.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giá hiện tại:</span>
                <span className="font-semibold">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bước giá:</span>
                <span className="font-semibold">{formatCurrency(stepPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giá đề nghị tối thiểu:</span>
                <span className="font-semibold text-primary">{formatCurrency(minAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBidAmount" className="flex items-center gap-2">
                Giá tối đa bạn muốn trả
                <Badge variant="secondary" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Input
                id="maxBidAmount"
                type="text"
                value={maxBidAmountInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setMaxBidAmountInput(formatPrice(input));
                  setMaxBidAmount(parsePrice(input));
                }}
                className="text-lg font-semibold"
                placeholder={formatPrice(minAmount)}
              />
              {!isValid && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <WarningCircleIcon size={14} />
                  Giá tối đa phải từ {formatCurrency(minAmount)} trở lên
                </p>
              )}
            </div>

            {isExistingConfig && autoBidConfig && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-muted/50 rounded-lg border space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircleIcon size={16} className="text-green-600" />
                  Bạn đã đặt Auto Bid
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Giá tối đa hiện tại: <span className="font-semibold">{formatCurrency(autoBidConfig.maxBidAmount)}</span></div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <ArrowsClockwiseIcon size={18} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <RobotIcon size={18} weight="fill" />
                    {isExistingConfig ? 'Cập nhật' : 'Đặt Auto Bid'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
