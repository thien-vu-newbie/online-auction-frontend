import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
} from '@phosphor-icons/react';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { BidHistory } from '@/components/product/BidHistory';
import { ProductQA } from '@/components/product/ProductQA';
import { ProductCard } from '@/components/product/ProductCard';
import { useAppSelector } from '@/store/hooks';
import type { Product, Bid, Question } from '@/types';
import {
  formatCurrency,
  formatDate,
  getRelativeTime,
  isEndingSoon,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';

// Mock data - replace with API calls
const mockProduct: Product = {
  id: '1',
  name: 'iPhone 15 Pro Max 256GB - Natural Titanium - Fullbox 99%',
  currentPrice: 28500000,
  buyNowPrice: 32000000,
  startPrice: 25000000,
  bidStep: 500000,
  imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
  images: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800',
  ],
  description: `
    <h3>Thông tin sản phẩm</h3>
    <p>iPhone 15 Pro Max 256GB màu Natural Titanium, tình trạng 99% như mới.</p>
    <ul>
      <li>Máy fullbox, đầy đủ phụ kiện</li>
      <li>Pin 98%, bảo hành Apple đến tháng 3/2025</li>
      <li>Không trầy xước, không lỗi</li>
      <li>Face ID hoạt động tốt</li>
      <li>Tất cả chức năng đều hoạt động bình thường</li>
    </ul>
    <h3>Cam kết</h3>
    <p>Cam kết máy chính hãng, nguồn gốc rõ ràng. Hỗ trợ kiểm tra thoải mái trước khi thanh toán.</p>
  `,
  categoryId: 'phones',
  categoryName: 'Điện thoại di động',
  sellerId: 'seller1',
  sellerName: 'TechStore VN',
  sellerRating: 98,
  highestBidderId: 'bidder1',
  highestBidderName: 'Nguyễn Văn Khoa',
  highestBidderRating: 95,
  bidCount: 12,
  startTime: '2024-12-01T10:00:00Z',
  endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  createdAt: '2024-12-01T10:00:00Z',
  isNew: false,
  autoExtend: true,
};

const mockBids: Bid[] = [
  { id: '1', productId: '1', bidderId: 'bidder1', bidderName: 'Nguyễn Văn Khoa', amount: 28500000, createdAt: '2024-12-07T10:43:00Z' },
  { id: '2', productId: '1', bidderId: 'bidder2', bidderName: 'Trần Văn Kha', amount: 28000000, createdAt: '2024-12-07T09:43:00Z' },
  { id: '3', productId: '1', bidderId: 'bidder3', bidderName: 'Lê Minh Tuấn', amount: 27500000, createdAt: '2024-12-07T08:43:00Z' },
  { id: '4', productId: '1', bidderId: 'bidder4', bidderName: 'Phạm Quốc Khánh', amount: 27000000, createdAt: '2024-12-07T07:43:00Z' },
  { id: '5', productId: '1', bidderId: 'bidder5', bidderName: 'Hoàng Văn Nam', amount: 26500000, createdAt: '2024-12-06T15:30:00Z' },
];

const mockQuestions: Question[] = [
  {
    id: '1',
    productId: '1',
    askerId: 'user1',
    askerName: 'Minh Tú',
    question: 'Máy còn bảo hành Apple không ạ?',
    answer: 'Máy còn bảo hành Apple đến tháng 3/2025 nhé bạn.',
    answeredAt: '2024-12-05T14:30:00Z',
    createdAt: '2024-12-05T10:00:00Z',
  },
  {
    id: '2',
    productId: '1',
    askerId: 'user2',
    askerName: 'Hồng Nhung',
    question: 'Máy có bị rớt hay vào nước chưa ạ?',
    answer: 'Máy chưa từng rớt hay vào nước bạn nhé. Mình cam kết máy nguyên zin 100%.',
    answeredAt: '2024-12-06T09:00:00Z',
    createdAt: '2024-12-06T08:00:00Z',
  },
  {
    id: '3',
    productId: '1',
    askerId: 'user3',
    askerName: 'Văn Hùng',
    question: 'Ship COD được không shop?',
    createdAt: '2024-12-07T11:00:00Z',
  },
];

const mockRelatedProducts: Product[] = [
  {
    id: '2',
    name: 'iPhone 14 Pro 128GB Space Black',
    currentPrice: 18500000,
    startPrice: 16000000,
    bidStep: 200000,
    imageUrl: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
    images: [],
    description: '',
    categoryId: 'phones',
    categoryName: 'Điện thoại di động',
    sellerId: 'seller2',
    sellerName: 'Mobile Zone',
    sellerRating: 96,
    bidCount: 8,
    startTime: '2024-12-02T10:00:00Z',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-12-02T10:00:00Z',
    autoExtend: false,
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    currentPrice: 24000000,
    buyNowPrice: 28000000,
    startPrice: 22000000,
    bidStep: 500000,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    images: [],
    description: '',
    categoryId: 'phones',
    categoryName: 'Điện thoại di động',
    sellerId: 'seller3',
    sellerName: 'Galaxy Store',
    sellerRating: 94,
    bidCount: 15,
    startTime: '2024-12-01T08:00:00Z',
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-12-01T08:00:00Z',
    autoExtend: true,
  },
  {
    id: '4',
    name: 'Google Pixel 8 Pro 256GB',
    currentPrice: 15000000,
    startPrice: 14000000,
    bidStep: 200000,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
    images: [],
    description: '',
    categoryId: 'phones',
    categoryName: 'Điện thoại di động',
    sellerId: 'seller1',
    sellerName: 'TechStore VN',
    sellerRating: 98,
    bidCount: 5,
    startTime: '2024-12-03T12:00:00Z',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-12-03T12:00:00Z',
    autoExtend: false,
  },
  {
    id: '5',
    name: 'OnePlus 12 16GB/512GB',
    currentPrice: 16500000,
    startPrice: 15000000,
    bidStep: 300000,
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400',
    images: [],
    description: '',
    categoryId: 'phones',
    categoryName: 'Điện thoại di động',
    sellerId: 'seller4',
    sellerName: 'Phone Hub',
    sellerRating: 92,
    bidCount: 3,
    startTime: '2024-12-04T14:00:00Z',
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-12-04T14:00:00Z',
    isNew: true,
    autoExtend: true,
  },
  {
    id: '6',
    name: 'Xiaomi 14 Ultra 512GB',
    currentPrice: 22000000,
    buyNowPrice: 25000000,
    startPrice: 20000000,
    bidStep: 500000,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    images: [],
    description: '',
    categoryId: 'phones',
    categoryName: 'Điện thoại di động',
    sellerId: 'seller5',
    sellerName: 'Mi Store Official',
    sellerRating: 97,
    bidCount: 10,
    startTime: '2024-12-02T16:00:00Z',
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-12-02T16:00:00Z',
    autoExtend: false,
  },
];

export function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Mock data - replace with API calls using productId
  const product = mockProduct;
  const bids = mockBids;
  const questions = mockQuestions;
  const relatedProducts = mockRelatedProducts;
  
  // Log productId for future API integration
  console.log('Loading product:', productId);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);
  
  const [bidAmount, setBidAmount] = useState(
    product.currentPrice + product.bidStep
  );
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Memoize time-based calculations
  const { endingSoon, hasEnded, isWithin3Days } = useMemo(() => {
    const now = new Date();
    const endDate = new Date(product.endTime);
    const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return {
      endingSoon: isEndingSoon(product.endTime),
      hasEnded: endDate < now,
      isWithin3Days: diffDays <= 3,
    };
  }, [product.endTime]);
  
  const suggestedBid = product.currentPrice + product.bidStep;
  const isSeller = user?.id === product.sellerId;

  const handleBid = () => {
    // TODO: Implement bid logic
    console.log('Placing bid:', bidAmount);
  };

  const handleBuyNow = () => {
    // TODO: Implement buy now logic
    console.log('Buy now');
  };

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    // TODO: Implement watchlist toggle
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/category/${product.categoryId}`}>
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
                <Link to={`/category/${product.categoryId}`}>
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

            {/* Bid Actions */}
            {!hasEnded && !isSeller && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  {/* Bid Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nhập giá đặt</span>
                      <span className="text-muted-foreground">
                        Đề nghị: {formatCurrency(suggestedBid)}
                      </span>
                    </div>
                    <div className="flex gap-2 items-stretch">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={suggestedBid}
                        step={product.bidStep}
                        className="text-lg font-semibold h-11"
                      />
                      <Button
                        onClick={handleBid}
                        disabled={bidAmount < suggestedBid}
                        className="gap-2 px-6 cursor-pointer h-11"
                      >
                        <GavelIcon size={20} weight="fill" />
                        Đặt giá
                      </Button>
                    </div>
                    {bidAmount < suggestedBid && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <InfoIcon size={12} />
                        Giá đặt phải từ {formatCurrency(suggestedBid)} trở lên
                      </p>
                    )}
                  </div>

                  {/* Buy Now Button */}
                  {product.buyNowPrice && (
                    <>
                      <Separator />
                      <Button
                        onClick={handleBuyNow}
                        variant="outline"
                        className="w-full gap-2 h-12 text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        size="lg"
                      >
                        <ShoppingCartSimpleIcon size={20} />
                        Mua ngay với giá {formatCurrency(product.buyNowPrice)}
                      </Button>
                    </>
                  )}

                  {/* Watchlist Button */}
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
                Lịch sử đấu giá ({bids.length})
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2 data-[state=active]:bg-background cursor-pointer">
                <ChatCircleDotsIcon size={18} />
                Hỏi đáp ({questions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
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
                  <BidHistory bids={bids} currentUserId={user?.id} />
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
                    questions={questions}
                    isAuthenticated={isAuthenticated}
                    isSeller={isSeller}
                    onAskQuestion={(q) => console.log('Ask:', q)}
                    onAnswerQuestion={(qId, a) => console.log('Answer:', qId, a)}
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
              to={`/category/${product.categoryId}`}
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
    </div>
  );
}
