import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  GavelIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  FacebookLogoIcon,
  TwitterLogoIcon,
  InstagramLogoIcon,
  YoutubeLogo,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-muted/30 to-muted/80 border-t">
      {/* Newsletter section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">
                Đăng ký nhận thông tin
              </h3>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo về các sản phẩm đấu giá hot và ưu đãi đặc biệt
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn..."
                className="bg-background"
              />
              <Button className="gap-2 shrink-0">
                <PaperPlaneTiltIcon size={18} weight="fill" />
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <GavelIcon size={32} weight="duotone" className="text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AuctionHub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sàn đấu giá trực tuyến hàng đầu Việt Nam. 
              Kết nối người mua và người bán một cách an toàn, minh bạch.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <FacebookLogoIcon size={20} weight="fill" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <TwitterLogoIcon size={20} weight="fill" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <InstagramLogoIcon size={20} weight="fill" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <YoutubeLogo size={20} weight="fill" />
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Danh mục phổ biến</h4>
            <ul className="space-y-2">
              {['Điện thoại di động', 'Đồng hồ', 'Túi xách', 'Tranh nghệ thuật', 'Xe máy'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/category/${item}`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2">
              {[
                { label: 'Hướng dẫn đấu giá', href: '/guide' },
                { label: 'Quy định & chính sách', href: '/policy' },
                { label: 'Câu hỏi thường gặp', href: '/faq' },
                { label: 'Điều khoản sử dụng', href: '/terms' },
                { label: 'Liên hệ', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPinIcon size={18} className="text-primary shrink-0 mt-0.5" />
                <span>227 Nguyễn Văn Cừ, Q.5, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <PhoneIcon size={18} className="text-primary shrink-0" />
                <span>1900 1234 56</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <EnvelopeIcon size={18} className="text-primary shrink-0" />
                <span>support@auctionhub.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 AuctionHub. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
