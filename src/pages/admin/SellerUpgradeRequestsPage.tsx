import { useState } from 'react';
import { CheckSquareIcon, CheckIcon } from '@phosphor-icons/react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { usePendingSellerRequests, useUpgradeSeller } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/formatters';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function SellerUpgradeRequestsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePendingSellerRequests(page, 20);
  const upgradeSeller = useUpgradeSeller();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  const handleApprove = async () => {
    if (!selectedUserId) return;
    await upgradeSeller.mutateAsync({ userId: selectedUserId });
    setConfirmDialogOpen(false);
    setSelectedUserId(null);
  };

  const openConfirmDialog = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setConfirmDialogOpen(true);
  };

  const getRatingPercentage = (positive: number, negative: number) => {
    const total = positive + negative;
    if (total === 0) return 'Chưa có';
    return `${((positive / total) * 100).toFixed(0)}%`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Yêu cầu nâng cấp Seller</h1>
            <p className="text-muted-foreground mt-1">
              Duyệt yêu cầu nâng cấp từ Bidder lên Seller (7 ngày)
            </p>
          </div>
        </div>

        {/* Stats */}
        <div>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Yêu cầu đang chờ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.pagination.total || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu</CardTitle>
            <CardDescription>
              Xem xét và duyệt yêu cầu nâng cấp tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : data?.requests.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquareIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Không có yêu cầu nào đang chờ</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Ngày tạo tài khoản</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.requests.map((request) => (
                      <TableRow
                        key={request._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{request.fullName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {request.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-green-600 font-medium">
                              +{request.ratingPositive}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-red-600 font-medium">
                              -{request.ratingNegative}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              ({getRatingPercentage(request.ratingPositive, request.ratingNegative)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.sellerUpgradeRequestDate)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500">Đang chờ duyệt</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openConfirmDialog(request._id, request.fullName)}
                            disabled={upgradeSeller.isPending}
                            className="gap-1"
                          >
                            <CheckIcon size={16} weight="bold" />
                            Duyệt
                          </Button>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleApprove}
        title="Xác nhận nâng cấp Seller"
        description={`Bạn có chắc muốn nâng cấp tài khoản của ${selectedUserName} lên Seller?\n\nQuyền seller sẽ có hiệu lực trong 7 ngày.`}
        confirmText="Duyệt"
        cancelText="Hủy"
      />
    </AdminLayout>
  );
}
