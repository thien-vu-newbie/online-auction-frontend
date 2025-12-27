import { useState } from 'react';
import { useElements, useStripe, PaymentElement } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleNotch, CreditCardIcon, CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { useConfirmPayment } from '@/hooks/useOrders';
import type { Order } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/formatters';

interface PaymentStepProps {
  order: Order;
}

export function PaymentStep({ order }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const confirmPayment = useConfirmPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${order._id}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Thanh toán thất bại');
        setProcessing(false);
        return;
      }

      // Payment succeeded, confirm on backend
      await confirmPayment.mutateAsync(order._id);
      setSucceeded(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
      setProcessing(false);
    }
  };

  if (succeeded || order.status === 'paid') {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircleIcon size={64} weight="fill" className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Thanh toán thành công!</h3>
            <p className="text-muted-foreground">
              Đơn hàng của bạn đã được thanh toán. Vui lòng cung cấp địa chỉ giao hàng.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon size={24} />
          Thanh toán đơn hàng
        </CardTitle>
        <CardDescription>
          Hoàn tất thanh toán để tiếp tục quá trình giao dịch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(order.finalPrice)}
            </span>
          </div>
        </div>

        {/* Important Notice */}
        <Alert>
          <InfoIcon size={20} className="mt-0.5" />
          <AlertDescription>
            <p className="font-medium mb-1">Lưu ý quan trọng:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Vui lòng thanh toán trong vòng 24h sau khi đấu giá kết thúc</li>
              <li>Người bán có quyền hủy giao dịch nếu bạn không thanh toán đúng hạn</li>
              <li>Nếu giao dịch bị hủy, bạn sẽ nhận đánh giá âm (-1 điểm)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Stripe Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>Thanh toán {formatCurrency(order.finalPrice)}</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Thanh toán được bảo mật bởi Stripe. Thông tin thẻ của bạn được mã hóa và bảo vệ.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
