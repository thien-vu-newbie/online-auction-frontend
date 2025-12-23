import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TruckIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useConfirmShipped } from '@/hooks/useOrders';
import type { Order } from '@/lib/api/orders';

const shippingSchema = z.object({
  trackingNumber: z.string().min(1, 'Vui lòng nhập mã vận đơn'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingConfirmationStepProps {
  order: Order;
}

export function ShippingConfirmationStep({ order }: ShippingConfirmationStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const confirmShipped = useConfirmShipped();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const onSubmit = async (data: ShippingFormData) => {
    await confirmShipped.mutateAsync({
      orderId: order._id,
      trackingNumber: data.trackingNumber,
    });
    setSubmitted(true);
  };

  if (submitted || order.shippedAt) {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircleIcon size={64} weight="fill" className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Đã xác nhận gửi hàng!</h3>
            <p className="text-muted-foreground mb-4">
              Đơn hàng đang trên đường giao đến người mua.
            </p>
            {order.trackingNumber && (
              <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">Mã vận đơn:</p>
                <p className="text-lg font-mono font-semibold">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TruckIcon size={24} />
          Xác nhận gửi hàng
        </CardTitle>
        <CardDescription>
          Nhập mã vận đơn và xác nhận đã gửi hàng cho người mua
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Address */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Địa chỉ giao hàng:</p>
          <div className="text-sm">
            <p className="font-medium">{order.shippingAddress?.fullName} - {order.shippingAddress?.phone}</p>
            <p className="text-muted-foreground mt-1">{order.shippingAddress?.address}</p>
            <p className="text-muted-foreground">
              {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
            </p>
          </div>
        </div>

        {/* Tracking Number Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Mã vận đơn *</Label>
            <Input
              id="trackingNumber"
              {...register('trackingNumber')}
              placeholder="VD: VN123456789"
            />
            {errors.trackingNumber && (
              <p className="text-sm text-destructive">{errors.trackingNumber.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Nhập mã vận đơn từ đơn vị vận chuyển (VNPost, GHN, GHTK, v.v.)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={confirmShipped.isPending}
          >
            {confirmShipped.isPending ? 'Đang xác nhận...' : 'Xác nhận đã gửi hàng'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
