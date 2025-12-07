import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GavelIcon } from '@phosphor-icons/react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <GavelIcon size={36} weight="duotone" className="text-white" />
              </div>
              <span className="text-3xl font-bold">AuctionHub</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Sàn đấu giá trực tuyến
              <br />
              <span className="text-white/80">uy tín hàng đầu</span>
            </h1>

            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Tham gia cộng đồng hàng ngàn người mua và bán. Tìm kiếm sản phẩm độc đáo với giá tốt nhất.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-white/60">Sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-sm text-white/60">Người dùng</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99%</div>
                <div className="text-sm text-white/60">Hài lòng</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        {/* <motion.div
          className="absolute bottom-32 right-20 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-medium">
              +
            </div>
            <div>
              <div className="text-sm font-medium text-white">Đấu giá thành công</div>
              <div className="text-xs text-white/60">Vừa xong</div>
            </div>
          </div>
        </motion.div> */}
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <GavelIcon size={28} weight="duotone" className="text-primary" />
            <span className="text-xl font-bold text-primary">AuctionHub</span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-muted-foreground border-t">
          © 2024 AuctionHub. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}
