import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EyeIcon, TrashIcon, TagIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useAdmin';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function CategoryManagementPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState<{ name: string; parentId: string | undefined }>({ name: '', parentId: undefined });

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    await createCategory.mutateAsync({
      name: formData.name.trim(),
      parentId: formData.parentId || undefined,
    });
    setCreateDialogOpen(false);
    setFormData({ name: '', parentId: undefined });
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    await updateCategory.mutateAsync({
      id: selectedCategory.id,
      data: {
        name: formData.name,
        parentId: formData.parentId || undefined,
      },
    });
    setEditDialogOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', parentId: undefined });
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    await deleteCategory.mutateAsync(selectedCategory.id);
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const openEditDialog = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId || undefined,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: any) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const flatCategories = categories?.flatMap((cat) => [
    cat,
    ...(cat.children || []).map((child) => ({ ...child, parentName: cat.name })),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
            <p className="text-muted-foreground mt-1">
              Tạo, sửa, xóa danh mục sản phẩm (2 cấp)
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <PlusIcon size={18} weight="bold" />
            Thêm danh mục
          </Button>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách danh mục</CardTitle>
            <CardDescription>
              Không được xóa danh mục đã có sản phẩm hoặc danh mục con
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {flatCategories?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TagIcon size={20} weight="fill" className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category.name}</span>
                          {category.parentName && (
                            <Badge variant="outline" className="text-xs">
                              {category.parentName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {category.parentName ? 'Danh mục con' : 'Danh mục cha'}
                        </p>
                      </div>
                    </div>
                    <TooltipProvider>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/category/${category.slug}`)}
                            >
                              <EyeIcon size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem danh mục</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(category)}
                            >
                              <PencilSimpleIcon size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa danh mục</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => openDeleteDialog(category)}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa danh mục</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Tạo danh mục cấp 1 (để trống parent) hoặc cấp 2
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className='mb-2' htmlFor="name">Tên danh mục</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Điện tử"
              />
            </div>
            <div>
              <Label className='mb-2' htmlFor="parent">Danh mục cha (tùy chọn)</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Không có (Danh mục cấp 1)" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || createCategory.isPending}>
              {createCategory.isPending ? 'Đang tạo...' : 'Tạo danh mục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>Cập nhật tên hoặc danh mục cha</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className='mb-2' htmlFor="edit-name">Tên danh mục</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label className='mb-2' htmlFor="edit-parent">Danh mụcLabel(tùy chọn)</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Không có (Danh mục cấp 1)" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    ?.filter((cat) => cat.id !== selectedCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name || updateCategory.isPending}>
              {updateCategory.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${selectedCategory?.name}"?\n\nLưu ý: Không thể xóa nếu danh mục có sản phẩm hoặc danh mục con.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </AdminLayout>
  );
}
