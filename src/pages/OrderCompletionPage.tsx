import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircleIcon,
  ClockIcon,
  PackageIcon,
  TruckIcon,
  StarIcon,
  XCircleIcon,
  CreditCardIcon,
  MapPinIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useOrder, useCreatePaymentIntent } from '@/hooks/useOrders';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/lib/formatters';
import { PaymentStep } from '@/components/order/PaymentStep';
import { ShippingAddressStep } from '@/components/order/ShippingAddressStep';
import { ShippingConfirmationStep } from '@/components/order/ShippingConfirmationStep';
import { ReceivedConfirmationStep } from '@/components/order/ReceivedConfirmationStep';
import { RatingStep } from '@/components/order/RatingStep';
import { CancelOrderDialog } from '@/components/order/CancelOrderDialog';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export function OrderCompletionPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  console.log("🚀 ~ OrderCompletionPage ~ order:", order)
  const { user } = useAppSelector((state) => state.auth);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const createPaymentIntent = useCreatePaymentIntent();

  const isBuyer = user?.id === order?.buyerId?._id;
  const isSeller = user?.id === order?.sellerId?._id;

  // Fetch clientSecret for payment
  useEffect(() => {
    if (order && isBuyer && order.status === 'pending_payment' && !clientSecret && !createPaymentIntent.isPending) {
      createPaymentIntent.mutate(order.productId._id, {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.productId._id, order?.status, isBuyer]);

  useEffect(() => {
    if (!isLoading && (!order || (!isBuyer && !isSeller))) {
      navigate('/');
    }
  }, [order, isLoading, isBuyer, isSeller, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return null;
  }

  const steps = [
    {
      key: 'payment',
      label: 'Thanh toán',
      icon: CreditCardIcon,
      completed: ['paid', 'shipped', 'completed'].includes(order.status),
      active: order.status === 'pending_payment',
    },
    {
      key: 'shipping',
      label: 'Địa chỉ giao hàng',
      icon: MapPinIcon,
      completed: !!order.shippingAddress && ['shipped', 'completed'].includes(order.status),
      active: order.status === 'paid' && !order.shippingAddress,
    },
    {
      key: 'shipped',
      label: 'Gửi hàng',
      icon: TruckIcon,
      completed: order.status === 'shipped' || order.status === 'completed',
      active: order.status === 'paid' && !!order.shippingAddress && !order.shippedAt,
    },
    {
      key: 'received',
      label: 'Nhận hàng',
      icon: PackageIcon,
      completed: order.status === 'completed',
      active: order.status === 'shipped',
    },
    {
      key: 'rating',
      label: 'Đánh giá',
      icon: StarIcon,
      completed: false,
      active: order.status === 'completed',
    },
  ];

  const getStatusBadge = () => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending_payment: { label: 'Chờ thanh toán', variant: 'outline' },
      paid: { label: 'Đã thanh toán', variant: 'default' },
      shipped: { label: 'Đã gửi hàng', variant: 'default' },
      completed: { label: 'Hoàn thành', variant: 'default' },
      cancelled: { label: 'Đã hủy', variant: 'destructive' },
    };

    const config = statusConfig[order.status] || { label: order.status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto pt-20 pb-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hoàn tất đơn hàng</h1>
              <p className="text-muted-foreground mt-1">
                Mã đơn: <span className="font-mono">{order._id}</span>
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Order cancelled notice */}
          {order.status === 'cancelled' && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <XCircleIcon size={24} className="text-destructive flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">Đơn hàng đã bị hủy</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.cancelReason || 'Người bán đã hủy giao dịch này'}
                    </p>
                    {order.cancelledAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Hủy lúc: {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <img
                  src={order.productId.images?.[0] || '/placeholder.png'}
                  alt={order.productId.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{order.productId.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {formatCurrency(order.finalPrice)}
                  </p>
                  <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Người bán:</span> {order.sellerId.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Người mua:</span> {order.buyerId.fullName}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        {order.status !== 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle>Tiến trình đơn hàng</CardTitle>
              <CardDescription>Theo dõi quá trình hoàn tất giao dịch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          step.completed
                            ? 'bg-primary text-white'
                            : step.active
                            ? 'bg-primary/20 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircleIcon size={24} weight="fill" />
                        ) : step.active ? (
                          <ClockIcon size={24} weight="fill" />
                        ) : (
                          <step.icon size={24} />
                        )}
                      </div>
                      <p
                        className={`text-xs mt-2 text-center font-medium ${
                          step.active ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          step.completed ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Action Steps */}
        {order.status === 'cancelled' ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <XCircleIcon size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Đơn hàng này đã bị hủy. Không thể tiếp tục giao dịch.
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Step 1: Payment */}
            {order.status === 'pending_payment' && isBuyer && (
              clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentStep order={order} />
                </Elements>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">Đang khởi tạo thanh toán...</p>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {order.status === 'pending_payment' && isSeller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon size={24} />
                    Chờ người mua thanh toán
                  </CardTitle>
                  <CardDescription>
                    Người mua đang trong quá trình thanh toán đơn hàng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <WarningIcon size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Bạn có thể hủy giao dịch nếu người mua không thanh toán trong vòng 24h
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Khi hủy, hệ thống sẽ tự động đánh giá -1 cho người mua
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full"
                  >
                    Hủy giao dịch
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            {order.status === 'paid' && !order.shippingAddress && isBuyer && (
              <ShippingAddressStep order={order} />
            )}

            {order.status === 'paid' && !order.shippingAddress && isSeller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon size={24} />
                    Chờ người mua gửi địa chỉ
                  </CardTitle>
                  <CardDescription>
                    Người mua đang cập nhật địa chỉ giao hàng
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Step 3: Confirm Shipped */}
            {order.status === 'paid' && order.shippingAddress && !order.shippedAt && isSeller && (
              <ShippingConfirmationStep order={order} />
            )}

            {order.status === 'paid' && order.shippingAddress && !order.shippedAt && isBuyer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon size={24} />
                    Chờ người bán gửi hàng
                  </CardTitle>
                  <CardDescription>
                    Người bán đang chuẩn bị và gửi hàng cho bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Địa chỉ nhận hàng:</strong></p>
                    <div className="bg-muted p-4 rounded-lg">
                      <p>{order.shippingAddress.fullName} - {order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirm Received */}
            {order.status === 'shipped' && isBuyer && (
              <ReceivedConfirmationStep order={order} />
            )}

            {order.status === 'shipped' && isSeller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TruckIcon size={24} />
                    Đã gửi hàng
                  </CardTitle>
                  <CardDescription>
                    Chờ người mua xác nhận đã nhận hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Mã vận đơn:</strong> <span className="font-mono">{order.trackingNumber}</span></p>
                    <p><strong>Thời gian gửi:</strong> {order.shippedAt && new Date(order.shippedAt).toLocaleString('vi-VN')}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Rating */}
            {order.status === 'completed' && (
              <RatingStep order={order} isBuyer={isBuyer} isSeller={isSeller} />
            )}
          </>
        )}

        {/* Cancel Order Dialog */}
        {isSeller && (
          <CancelOrderDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            orderId={order._id}
          />
        )}
      </div>
    </MainLayout>
  );
}
