import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GavelIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  TrophyIcon,
} from '@phosphor-icons/react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk5OUYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-2xl animate-bounce" />

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Hơn 1,000 sản phẩm đang đấu giá
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Khám phá &{' '}
            </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Đấu giá
            </span>
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              những sản phẩm độc đáo
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sàn đấu giá trực tuyến hàng đầu Việt Nam - nơi bạn có thể tìm thấy và sở hữu 
            những sản phẩm giá trị với mức giá tốt nhất.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link to="/products">
                <GavelIcon size={20} weight="fill" />
                Bắt đầu đấu giá
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8" asChild>
              <Link to="/how-it-works">
                Tìm hiểu thêm
                <ArrowRightIcon size={18} />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <UsersIcon size={24} className="text-primary" weight="duotone" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">50K+</div>
              <div className="text-sm text-muted-foreground">Người dùng</div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <TrophyIcon size={24} className="text-primary" weight="duotone" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Đấu giá thành công</div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheckIcon size={24} className="text-primary" weight="duotone" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">An toàn & Minh bạch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            className="fill-muted/30"
          />
        </svg>
      </div>
    </section>
  );
}
