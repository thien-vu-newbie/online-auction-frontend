import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  GavelIcon,
  HeartIcon,
  HeartStraightIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  StarIcon,
  ShoppingCartSimpleIcon,
  CalendarIcon,
  FireIcon,
  ShieldCheckIcon,
  InfoIcon,
  ChatCircleDotsIcon,
  ListBulletsIcon,
  ArrowsClockwiseIcon,
  WarningCircleIcon,
  RobotIcon,
} from '@phosphor-icons/react';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { BidHistory } from '@/components/product/BidHistory';
import { ProductQA } from '@/components/product/ProductQA';
import { ProductCard } from '@/components/product/ProductCard';
import { AutoBidDialog } from '@/components/product/AutoBidDialog';
import { DescriptionHistory } from '@/components/seller/DescriptionHistory';
import { AddDescriptionDialog } from '@/components/seller/AddDescriptionDialog';
import { useAppSelector } from '@/store/hooks';
import { useProductDetail, useBuyNow } from '@/hooks/useProducts';
import { useCheckWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist';
import {
  formatCurrency,
  formatDate,
  getRelativeTime,
  isEndingSoon,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Fetch product data from API
  const { data, isLoading, error } = useProductDetail(productId);
  
  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // Watchlist hooks
  const { data: isInWatchlist, isLoading: watchlistLoading } = useCheckWatchlist(productId);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  // Buy now hook
  const buyNow = useBuyNow();

  // Auto-bid dialog state
  const [autoBidDialogOpen, setAutoBidDialogOpen] = useState(false);
  const [addDescriptionDialogOpen, setAddDescriptionDialogOpen] = useState(false);
  const [buyNowDialogOpen, setBuyNowDialogOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <Skeleton className="h-6 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <WarningCircleIcon size={64} className="mx-auto text-destructive" />
            <h2 className="text-xl font-bold">Không tìm thấy sản phẩm</h2>
            <p className="text-muted-foreground">
              Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.
            </p>
            <Button asChild>
              <Link to="/">Quay về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // After this point, product is guaranteed to be defined
  const suggestedBid = product.currentPrice + product.bidStep;
  const isSeller = user?.id === product.sellerId;

  // Time-based calculations
  const now = new Date();
  const endDate = new Date(product.endTime);
  const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const endingSoon = isEndingSoon(product.endTime);
  const hasEnded = endDate < now;
  const isWithin3Days = diffDays <= 3;

  const handleBuyNow = () => {
    if (!productId) return;
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua sản phẩm');
      navigate('/login');
      return;
    }

    if (!product?.buyNowPrice) {
      toast.error('Sản phẩm không có giá mua ngay');
      return;
    }

    // Open confirm dialog
    setBuyNowDialogOpen(true);
  };

  const confirmBuyNow = () => {
    if (!productId) return;
    buyNow.mutate(productId);
    setBuyNowDialogOpen(false);
    // Product detail will auto-reload via query invalidation
    // User can then go to order page via the "Xem chi tiết đơn hàng" button
  };

  const toggleWatchlist = () => {
    if (!productId) return;
    
    if (isInWatchlist) {
      removeFromWatchlist.mutate(productId);
    } else {
      addToWatchlist.mutate(productId);
    }
  };

  const handleBuyerCompleteOrder = async () => {
    console.log('🔵 BUYER handler called - checking for existing order');
    if (!productId) return;
    
    setIsCreatingOrder(true);
    try {
      const { ordersApi } = await import('@/lib/api/orders');
      
      // First, check if order already exists
      const ordersResponse = await ordersApi.getMyOrders({ role: 'buyer' });
      const existingOrder = ordersResponse.orders.find(o => o.productId._id === productId);
      
      if (existingOrder) {
        // Order exists, navigate to it
        console.log('✅ Existing order found, navigating:', existingOrder._id);
        navigate(`/orders/${existingOrder._id}`);
      } else {
        // No order yet, create payment intent (this creates the order)
        console.log('➕ No order found, creating payment intent');
        const response = await ordersApi.createPaymentIntent(productId);
        navigate(`/orders/${response.orderId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải đơn hàng');
      setIsCreatingOrder(false);
    }
  };

  const handleSellerViewOrder = async () => {
    console.log('🟢 SELLER handler called - finding existing order');
    if (!productId) return;
    
    setIsCreatingOrder(true);
    try {
      // Seller: Find existing order
      const { ordersApi } = await import('@/lib/api/orders');
      const response = await ordersApi.getMyOrders({ role: 'seller' });
      const order = response.orders.find(o => o.productId._id === productId);
      
      if (order) {
        navigate(`/orders/${order._id}`);
      } else {
        toast.error('Chưa có đơn hàng cho sản phẩm này');
        setIsCreatingOrder(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải đơn hàng');
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 pt-20 pb-10 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/category/${product.categorySlug}`}>
                {product.categoryName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Link to={`/category/${product.categorySlug}`}>
                  <Badge variant="secondary" className="gap-1 hover:bg-secondary/80">
                    <TagIcon size={12} />
                    {product.categoryName}
                  </Badge>
                </Link>
                {endingSoon && !hasEnded && (
                  <Badge variant="destructive" className="gap-1 animate-pulse">
                    <FireIcon size={12} weight="fill" />
                    Sắp kết thúc
                  </Badge>
                )}
                {hasEnded && (
                  <Badge variant="secondary">Đã kết thúc</Badge>
                )}
                {product.autoExtend && !hasEnded && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="gap-1">
                          <ArrowsClockwiseIcon size={12} />
                          Tự động gia hạn
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tự động gia hạn 10 phút nếu có lượt đấu giá mới trong 5 phút cuối</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 space-y-4">
                {/* Current Price */}
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Giá hiện tại</span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(product.currentPrice)}
                  </span>
                </div>

                {/* Buy Now Price */}
                {product.buyNowPrice && !hasEnded && (
                  <div className="flex items-baseline justify-between pb-4 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShoppingCartSimpleIcon size={16} />
                      Mua ngay
                    </span>
                    <span className="text-xl font-semibold text-emerald-600">
                      {formatCurrency(product.buyNowPrice)}
                    </span>
                  </div>
                )}

                {/* Bid Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <GavelIcon size={18} className="text-muted-foreground" />
                    <span>
                      <strong>{product.bidCount}</strong> lượt đấu giá
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TagIcon size={18} className="text-muted-foreground" />
                    <span>
                      Bước giá: <strong>{formatCurrency(product.bidStep)}</strong>
                    </span>
                  </div>
                </div>

                {/* Highest Bidder */}
                {product.highestBidderName && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        <UserIcon size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.highestBidderName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <StarIcon size={12} weight="fill" className="text-amber-500" />
                        <span>{product.highestBidderRating}% đánh giá tích cực</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Đang dẫn đầu
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Info */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon size={12} />
                      Thời điểm đăng
                    </p>
                    <p className="font-medium">{formatDate(product.startTime)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ClockIcon size={12} />
                      Thời điểm kết thúc
                    </p>
                    <p className={cn(
                      'font-medium',
                      endingSoon && 'text-destructive'
                    )}>
                      {isWithin3Days
                        ? getRelativeTime(product.endTime)
                        : formatDate(product.endTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Winner Action - Complete Order */}
            {hasEnded && isAuthenticated && product.highestBidderId === user?.id && !isSeller && (() => {
              console.log('✅ Rendering WINNER button');
              return true;
            })() && (
              <Card className="border-primary">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                      <GavelIcon size={32} weight="fill" className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Chúc mừng! Bạn đã thắng đấu giá</h3>
                    <p className="text-muted-foreground">
                      Vui lòng hoàn tất thanh toán và theo dõi đơn hàng
                    </p>
                  </div>
                  <Button
                    onClick={handleBuyerCompleteOrder}
                    className="w-full gap-2 h-12"
                    size="lg"
                    disabled={isCreatingOrder}
                  >
                    <ShoppingCartSimpleIcon size={20} />
                    {isCreatingOrder ? 'Đang tải...' : 'Xem đơn hàng'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Seller Action - View Order */}
            {hasEnded && isAuthenticated && isSeller && product.highestBidderId && (() => {
              console.log('✅ Rendering SELLER button');
              return true;
            })() && (
              <Card className="border-primary">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                      <ShieldCheckIcon size={32} weight="fill" className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Đấu giá đã kết thúc</h3>
                    <p className="text-muted-foreground">
                      Người thắng: <strong>{product.highestBidderName}</strong>
                    </p>
                  </div>
                  <Button
                    onClick={handleSellerViewOrder}
                    variant="outline"
                    className="w-full gap-2 h-12"
                    disabled={isCreatingOrder}
                    size="lg"
                  >
                    <InfoIcon size={20} />
                    {isCreatingOrder ? 'Đang tải...' : 'Xem chi tiết đơn hàng'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Bid Actions */}
            {!hasEnded && !isSeller && isAuthenticated && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  {/* Auto-bid Button */}
                  <Button
                    onClick={() => setAutoBidDialogOpen(true)}
                    className="w-full gap-2 h-12 cursor-pointer"
                    size="lg"
                  >
                    <RobotIcon size={20} weight="fill" />
                    Đặt Auto Bid
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Hệ thống tự động đấu giá giúp bạn với giá tối ưu
                  </p>

                  {/* Buy Now Button */}
                  {product.buyNowPrice && (
                    <>
                      <Separator />
                      <Button
                        onClick={handleBuyNow}
                        disabled={buyNow.isPending}
                        variant="outline"
                        className="w-full gap-2 h-12 text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        size="lg"
                      >
                        <ShoppingCartSimpleIcon size={20} />
                        {buyNow.isPending ? 'Đang xử lý...' : `Mua ngay với giá ${formatCurrency(product.buyNowPrice)}`}
                      </Button>
                    </>
                  )}

                  {/* Watchlist Button */}
                  <Separator />
                  <Button
                    onClick={toggleWatchlist}
                    variant="ghost"
                    className={cn(
                      'w-full gap-2 cursor-pointer',
                      isInWatchlist && 'text-destructive hover:text-destructive'
                    )}
                  >
                    {isInWatchlist ? (
                      <>
                        <HeartStraightIcon size={20} weight="fill" />
                        Đã thêm vào yêu thích
                      </>
                    ) : (
                      <>
                        <HeartIcon size={20} />
                        Thêm vào danh sách yêu thích
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && !hasEnded && !isSeller && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Vui lòng đăng nhập để tham gia đấu giá
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {product.sellerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/seller/${product.sellerId}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {product.sellerName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <StarIcon
                          size={16}
                          weight="fill"
                          className="text-amber-500"
                        />
                        <span className="text-sm font-medium">
                          {product.sellerRating}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        đánh giá tích cực
                      </span>
                    </div>
                    <Progress
                      value={product.sellerRating}
                      className="h-1.5 mt-2"
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                          <ShieldCheckIcon size={24} weight="fill" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Người bán đã xác thực</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="description" className="gap-2 data-[state=active]:bg-background cursor-pointer">
                <InfoIcon size={18} />
                Mô tả sản phẩm
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background cursor-pointer">
                <ListBulletsIcon size={18} />
                Lịch sử đấu giá
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2 data-[state=active]:bg-background cursor-pointer">
                <ChatCircleDotsIcon size={18} />
                Hỏi đáp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="space-y-4">
                {isSeller && !hasEnded && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setAddDescriptionDialogOpen(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <InfoIcon size={18} />
                      Bổ sung mô tả
                    </Button>
                  </div>
                )}
                <DescriptionHistory
                  history={product.descriptionHistory || []}
                  currentDescription={product.description}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GavelIcon size={20} />
                    Lịch sử đấu giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BidHistory 
                    productId={productId!}
                    isSeller={isSeller}
                    hasEnded={hasEnded}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChatCircleDotsIcon size={20} />
                    Câu hỏi & Trả lời
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductQA
                    productId={productId!}
                    isAuthenticated={isAuthenticated}
                    isSeller={isSeller}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sản phẩm cùng danh mục</h2>
            <Link
              to={`/category/${product.categorySlug}`}
              className="text-primary hover:underline text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <ProductCard product={relatedProduct} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Auto-bid Dialog */}
      {productId && !hasEnded && (
        <AutoBidDialog
          open={autoBidDialogOpen}
          onOpenChange={setAutoBidDialogOpen}
          productId={productId}
          currentPrice={product.currentPrice}
          stepPrice={product.bidStep}
          suggestedBid={suggestedBid}
        />
      )}

      {/* Add Description Dialog */}
      {productId && isSeller && (
        <AddDescriptionDialog
          open={addDescriptionDialogOpen}
          onOpenChange={setAddDescriptionDialogOpen}
          productId={productId}
          productName={product.name}
        />
      )}

      {/* Buy Now Confirmation Dialog */}
      <AlertDialog open={buyNowDialogOpen} onOpenChange={setBuyNowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShoppingCartSimpleIcon size={24} className="text-emerald-600" />
              Xác nhận mua sản phẩm
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-base">
                Bạn có chắc chắn muốn mua sản phẩm này không?
              </p>
              {product && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Giá mua ngay:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(product.buyNowPrice || 0)}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Sau khi mua, bạn sẽ cần thanh toán trong vòng 24 giờ.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBuyNow}
              disabled={buyNow.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {buyNow.isPending ? 'Đang xử lý...' : 'Xác nhận mua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
