import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PackageIcon, CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { useConfirmReceived } from '@/hooks/useOrders';
import type { Order } from '@/lib/api/orders';

interface ReceivedConfirmationStepProps {
  order: Order;
}

export function ReceivedConfirmationStep({ order }: ReceivedConfirmationStepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const confirmReceived = useConfirmReceived();

  const handleConfirm = async () => {
    await confirmReceived.mutateAsync(order._id);
    setConfirmed(true);
  };

  if (confirmed || order.status === 'completed') {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircleIcon size={64} weight="fill" className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Đã xác nhận nhận hàng!</h3>
            <p className="text-muted-foreground">
              Giao dịch hoàn tất. Bạn có thể đánh giá người bán để giúp cộng đồng.
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
          <PackageIcon size={24} />
          Xác nhận nhận hàng
        </CardTitle>
        <CardDescription>
          Xác nhận bạn đã nhận được hàng để hoàn tất giao dịch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Info */}
        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Thông tin vận chuyển:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã vận đơn:</span>
                <span className="font-mono font-semibold">{order.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày gửi:</span>
                <span>
                  {order.shippedAt && new Date(order.shippedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          <Alert>
            <InfoIcon size={20} className="mt-0.5" />
            <AlertDescription>
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Vui lòng kiểm tra hàng hóa kỹ càng trước khi xác nhận</li>
                <li>Sau khi xác nhận, giao dịch sẽ được hoàn tất</li>
                <li>Bạn sẽ có thể đánh giá người bán sau khi xác nhận</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full"
          size="lg"
          disabled={confirmReceived.isPending}
        >
          {confirmReceived.isPending ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
        </Button>
      </CardContent>
    </Card>
  );
}
