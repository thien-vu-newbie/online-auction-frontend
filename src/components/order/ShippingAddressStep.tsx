import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPinIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useUpdateShippingAddress } from '@/hooks/useOrders';
import type { Order } from '@/lib/api/orders';

const shippingSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingAddressStepProps {
  order: Order;
}

export function ShippingAddressStep({ order }: ShippingAddressStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const updateAddress = useUpdateShippingAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: order.shippingAddress || undefined,
  });

  const onSubmit = async (data: ShippingFormData) => {
    await updateAddress.mutateAsync({
      orderId: order._id,
      address: data,
    });
    setSubmitted(true);
  };

  if (submitted || order.shippingAddress) {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircleIcon size={64} weight="fill" className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Đã cập nhật địa chỉ!</h3>
            <p className="text-muted-foreground mb-4">
              Người bán sẽ chuẩn bị và gửi hàng đến địa chỉ của bạn.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left max-w-md mx-auto">
              <p className="font-medium">{order.shippingAddress?.fullName} - {order.shippingAddress?.phone}</p>
              <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress?.address}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon size={24} />
          Địa chỉ giao hàng
        </CardTitle>
        <CardDescription>
          Vui lòng cung cấp địa chỉ để người bán gửi hàng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0909123456"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Nguyễn Huệ"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã *</Label>
              <Input
                id="ward"
                {...register('ward')}
                placeholder="Phường Bến Nghé"
              />
              {errors.ward && (
                <p className="text-sm text-destructive">{errors.ward.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện *</Label>
              <Input
                id="district"
                {...register('district')}
                placeholder="Quận 1"
              />
              {errors.district && (
                <p className="text-sm text-destructive">{errors.district.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh/Thành phố *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="TP. Hồ Chí Minh"
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={updateAddress.isPending}
          >
            {updateAddress.isPending ? 'Đang cập nhật...' : 'Xác nhận địa chỉ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
