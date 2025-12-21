import { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, EyeIcon } from '@phosphor-icons/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminUsers, useAdminUserById } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/formatters';

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const { data, isLoading } = useAdminUsers(page, 20);
  const { data: selectedUser, isLoading: userLoading } = useAdminUserById(selectedUserId || undefined);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedUserId(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'seller':
        return <Badge className="bg-blue-500">Seller</Badge>;
      default:
        return <Badge variant="outline">Bidder</Badge>;
    }
  };

  const getRatingPercentage = (positive: number, negative: number) => {
    const total = positive + negative;
    if (total === 0) return 'Chưa có';
    return `${((positive / total) * 100).toFixed(0)}%`;
  };

  const filteredUsers = data?.users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng người dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.pagination.total || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sellers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.users.filter((u) => u.role === 'seller').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.users.filter((u) => u.role === 'admin').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách người dùng</CardTitle>
                <CardDescription>Tìm kiếm và xem chi tiết người dùng</CardDescription>
              </div>
              <div className="relative w-64">
                <MagnifyingGlassIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow
                        key={user._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-green-600 font-medium">
                              +{user.ratingPositive}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-red-600 font-medium">
                              -{user.ratingNegative}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({getRatingPercentage(user.ratingPositive, user.ratingNegative)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          {user.isEmailVerified ? (
                            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                              <ShieldCheckIcon size={14} weight="fill" />
                              Đã xác thực
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Chưa xác thực
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewUser(user._id)}
                                >
                                  <EyeIcon size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xem chi tiết</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {page} / {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết của người dùng
            </DialogDescription>
          </DialogHeader>
          
          {userLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vai trò</p>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái email</p>
                  <div className="mt-1">
                    {selectedUser.isEmailVerified ? (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <ShieldCheckIcon size={14} weight="fill" />
                        Đã xác thực
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Chưa xác thực
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-green-600 font-medium">
                      +{selectedUser.ratingPositive}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-red-600 font-medium">
                      -{selectedUser.ratingNegative}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({getRatingPercentage(selectedUser.ratingPositive, selectedUser.ratingNegative)})
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                {selectedUser.role === 'seller' && selectedUser.sellerUpgradeExpiry && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Quyền seller hết hạn</p>
                    <p className="font-medium">{formatDate(selectedUser.sellerUpgradeExpiry)}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
