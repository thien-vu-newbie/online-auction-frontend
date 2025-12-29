import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  GavelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ListIcon,
  SignInIcon,
  UserPlusIcon,
  CaretDownIcon,
  SignOutIcon,
  ShieldCheckIcon,
  StorefrontIcon,
} from '@phosphor-icons/react';
import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      {/* Top bar */}
      {/* <div className="hidden md:block border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Chào mừng đến với Sàn Đấu Giá Trực Tuyến #1 Việt Nam</span>
            <div className="flex items-center gap-4">
              <Link to="/help" className="hover:text-primary transition-colors">Trợ giúp</Link>
              <Link to="/about" className="hover:text-primary transition-colors">Về chúng tôi</Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <ListIcon size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                  <GavelIcon size={28} weight="duotone" />
                  <span>AuctionHub</span>
                </Link>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {category.name}
                      </div>
                      {category.children?.map((child) => (
                        <Link
                          key={child.id}
                          to={`/category/${child.slug}`}
                          className="block py-2 px-3 rounded-md hover:bg-accent transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <GavelIcon size={32} weight="duotone" className="text-primary relative" />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AuctionHub
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <MagnifyingGlassIcon
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm (hỗ trợ tiếng Việt không dấu)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Danh mục
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] grid-cols-2">
                    {categoriesLoading ? (
                      <div className="col-span-2 text-center py-4 text-muted-foreground">
                        Đang tải danh mục...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-muted-foreground">
                        Không có danh mục
                      </div>
                    ) : categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <NavigationMenuLink asChild>
                          <Link
                            to={`/category/${category.slug}`}
                            className="block font-semibold text-sm hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>
                        </NavigationMenuLink>
                        <div className="space-y-1">
                          {category.children?.map((child) => (
                            <NavigationMenuLink key={child.id} asChild>
                              <Link
                                to={`/category/${child.slug}`}
                                className={cn(
                                  "block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                                )}
                              >
                                {child.name}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <MagnifyingGlassIcon size={22} />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Watchlist */}
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/watchlist">
                    <HeartIcon size={22} />
                  </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <CaretDownIcon size={16} className="hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-bids">Đang đấu giá</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/won-auctions">Đã thắng</Link>
                    </DropdownMenuItem>
                    {user?.role === 'seller' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/post-product" className="text-primary font-medium">
                            <StorefrontIcon size={16} weight="fill" className="mr-2" />
                            Đăng sản phẩm
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users" className="text-primary font-medium">
                            <ShieldCheckIcon size={16} weight="fill" className="mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive cursor-pointer"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <SignOutIcon size={16} className="mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/login" className="gap-2">
                    <SignInIcon size={18} />
                    Đăng nhập
                  </Link>
                </Button>
                <Button size="sm" asChild className="gap-2">
                  <Link to="/register">
                    <UserPlusIcon size={18} className="hidden sm:block" />
                    <UserIcon size={18} className="sm:hidden" />
                    <span className="hidden sm:inline">Đăng ký</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
