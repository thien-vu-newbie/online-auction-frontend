import { useState } from 'react';
import { TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@phosphor-icons/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
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
import { useDeleteProduct, useAdminProducts } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ProductManagementPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data, isLoading } = useAdminProducts(page, 20);
  const deleteProduct = useDeleteProduct();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct.mutateAsync(selectedProduct._id);
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const openDeleteDialog = (product: any) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    
    if (end < now) {
      return <Badge variant="secondary">Đã kết thúc</Badge>;
    }
    
    const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) {
      return <Badge variant="destructive">Sắp kết thúc</Badge>;
    }
    
    return <Badge className="bg-green-500">Đang diễn ra</Badge>;
  };

  const filteredProducts = data?.products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
            <p className="text-muted-foreground mt-1">
              Xem và gỡ bỏ sản phẩm vi phạm chính sách
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.total || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Đang đấu giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.products.filter((p) => new Date(p.endTime) > new Date()).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách sản phẩm</CardTitle>
                <CardDescription>Xem chi tiết và gỡ sản phẩm nếu cần</CardDescription>
              </div>
              <div className="relative w-64">
                <MagnifyingGlassIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Tìm theo tên sản phẩm..."
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
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Người bán</TableHead>
                      <TableHead>Giá hiện tại</TableHead>
                      <TableHead>Số lượt đấu giá</TableHead>
                      <TableHead>Thời gian kết thúc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.map((product) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium line-clamp-1">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.categoryName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{product.sellerId?.fullName || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(product.currentPrice)}
                        </TableCell>
                        <TableCell className="text-center">{product.bidCount}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(product.endTime)}
                        </TableCell>
                        <TableCell>{getStatusBadge(product.endTime)}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/product/${product._id}`)}
                                  >
                                    <EyeIcon size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xem chi tiết</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-white"
                                    onClick={() => openDeleteDialog(product)}
                                  >
                                    <TrashIcon size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa sản phẩm</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận gỡ sản phẩm"
        description={`Bạn có chắc muốn gỡ sản phẩm "${selectedProduct?.name}"?\n\nHành động này không thể hoàn tác.`}
        confirmText="Gỡ sản phẩm"
        cancelText="Hủy"
      />
    </AdminLayout>
  );
}
