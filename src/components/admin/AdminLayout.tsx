import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  TagIcon,
  PackageIcon,
  CheckSquareIcon,
  SignOutIcon,
  ChartBarIcon,
  ChartLineIcon,
} from '@phosphor-icons/react';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: typeof UsersIcon;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: ChartLineIcon,
  },
  {
    label: 'Quản lý người dùng',
    path: '/admin/users',
    icon: UsersIcon,
  },
  {
    label: 'Quản lý danh mục',
    path: '/admin/categories',
    icon: TagIcon,
  },
  {
    label: 'Quản lý sản phẩm',
    path: '/admin/products',
    icon: PackageIcon,
  },
  {
    label: 'Yêu cầu nâng cấp Seller',
    path: '/admin/seller-requests',
    icon: CheckSquareIcon,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <ChartBarIcon size={24} weight="bold" className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30'
                          : 'hover:bg-slate-100 text-slate-700'
                      )}
                    >
                      <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-200">
              <Button
                variant="outline"
                className="w-full gap-2 hover:bg-destructive hover:text-white transition-colors"
                onClick={handleLogout}
              >
                <SignOutIcon size={18} />
                Đăng xuất
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
