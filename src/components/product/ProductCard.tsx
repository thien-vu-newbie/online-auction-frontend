import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  HeartIcon,
  HeartStraightIcon,
  ClockIcon,
  GavelIcon,
  TagIcon,
  FireIcon,
  SparkleIcon,
  UserIcon,
  WarningIcon,
  CalendarIcon,
} from '@phosphor-icons/react';
import type { Product } from '@/types';
import { formatCurrency, getRelativeTime, isEndingSoon, formatDateOnly } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useWatchlistCheck, useWatchlistContext } from '@/contexts/WatchlistContext';
import { useAppSelector } from '@/store/hooks';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const endingSoon = isEndingSoon(product.endTime);
  const hasEnded = new Date(product.endTime) < new Date();

  // Optimized watchlist check - no individual API calls
  const isInWatchlist = useWatchlistCheck(product.id);
  const watchlistContext = useWatchlistContext();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !watchlistContext) {
      navigate('/login');
      return;
    }

    if (isInWatchlist) {
      await watchlistContext.removeFromWatchlist(product.id);
    } else {
      await watchlistContext.addToWatchlist(product.id);
    }
  };


  return (
    <Card 
      onClick={handleCardClick}
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 py-0 cursor-pointer h-full flex flex-col",
        product.isNew && "ring-2 ring-primary/50 shadow-primary/20",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
        {/* Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-primary/90 backdrop-blur-sm gap-1 shadow-lg">
              <SparkleIcon size={14} weight="fill" />
              Mới
            </Badge>
          )}
          {product.isRejected && (
            <Badge variant="destructive" className="backdrop-blur-sm gap-1 shadow-lg">
              <WarningIcon size={14} weight="fill" />
              Bị từ chối
            </Badge>
          )}
          {endingSoon && !hasEnded && !product.isRejected && (
            <Badge variant="destructive" className="backdrop-blur-sm gap-1 shadow-lg animate-pulse">
              <FireIcon size={14} weight="fill" />
              Sắp kết thúc
            </Badge>
          )}
          {hasEnded && (
            <Badge variant="secondary" className="bg-black/70 text-white">
              Đã kết thúc
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWatchlistToggle}
                className={cn(
                  "absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer",
                  isInWatchlist ? "text-destructive hover:text-destructive" : "hover:text-destructive"
                )}
              >
                {isInWatchlist ? (
                  <HeartStraightIcon size={18} weight="fill" />
                ) : (
                  <HeartIcon size={18} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isInWatchlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Start time badge - position varies based on product status */}
        <div className={cn(
          "absolute right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
          hasEnded ? "bottom-3" : "bottom-11"
        )}>
          <Badge className="bg-black/90 text-white backdrop-blur-sm gap-1.5 shadow-lg text-sm">
            <CalendarIcon size={16} weight="fill" />
            {formatDateOnly(product.startTime)}
          </Badge>
        </div>

        {/* Quick bid button */}
        {!hasEnded && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <Button className="w-full gap-2 shadow-lg cursor-pointer" size="sm">
              <GavelIcon size={16} weight="fill" />
              Đặt giá ngay
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Category */}
        {product.categoryName && (
          <Link 
            to={`/category/${product.categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <TagIcon size={12} />
            {product.categoryName}
          </Link>
        )}
        {/* Title */}
        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Price section */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Giá hiện tại</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.currentPrice)}
            </span>
          </div>
          {product.buyNowPrice && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Mua ngay</span>
              <span className="font-medium text-emerald-600">
                {formatCurrency(product.buyNowPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Spacer to push stats and time to bottom */}
        <div className="flex-1" />

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <GavelIcon size={14} />
            <span>{product.bidCount} lượt</span>
          </div>
          
          {product.highestBidderName && (
            <div className="flex items-center gap-1">
              <UserIcon size={14} />
              <span>{product.highestBidderName}</span>
            </div>
          )}
        </div>

        {/* Time remaining */}
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          endingSoon ? "text-destructive" : "text-muted-foreground"
        )}>
          <ClockIcon size={16} className={endingSoon ? "animate-pulse" : ""} />
          <span>{getRelativeTime(product.endTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
