import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageIcon, XIcon } from '@phosphor-icons/react';
import { useCreateProduct } from '@/hooks/useSeller';
import { useAppSelector } from '@/store/hooks';

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const categories = useAppSelector((state) => state.categories.categories);
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    startPrice: '',
    stepPrice: '',
    buyNowPrice: '',
    startTime: '',
    endTime: '',
    autoExtend: false,
    allowUnratedBidders: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      return;
    }

    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length < 4) {
      return;
    }

    await createProduct.mutateAsync({
      data: {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        startPrice: Number(formData.startPrice),
        stepPrice: Number(formData.stepPrice),
        buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        autoExtend: formData.autoExtend,
        allowUnratedBidders: formData.allowUnratedBidders,
      },
      images,
    });

    onOpenChange(false);
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      startPrice: '',
      stepPrice: '',
      buyNowPrice: '',
      startTime: '',
      endTime: '',
      autoExtend: false,
      allowUnratedBidders: false,
    });
    setImages([]);
    setImagePreviews([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đăng sản phẩm đấu giá</DialogTitle>
          <DialogDescription>
            Nhập đầy đủ thông tin sản phẩm. Tối thiểu 4 ảnh.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả sản phẩm *</Label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
              minHeight="200px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Danh mục *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh * (Tối thiểu 4 ảnh)</Label>
            <div className="grid grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <XIcon size={14} />
                  </Button>
                </div>
              ))}
              {images.length < 4 && (
                <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <ImageIcon size={32} className="text-muted-foreground" />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {images.length}/4 ảnh đã tải lên
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startPrice">Giá khởi điểm (VNĐ) *</Label>
              <Input
                id="startPrice"
                type="number"
                value={formData.startPrice}
                onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepPrice">Bước giá (VNĐ) *</Label>
              <Input
                id="stepPrice"
                type="number"
                value={formData.stepPrice}
                onChange={(e) => setFormData({ ...formData, stepPrice: e.target.value })}
                required
                min="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyNowPrice">Giá mua ngay (VNĐ)</Label>
            <Input
              id="buyNowPrice"
              type="number"
              value={formData.buyNowPrice}
              onChange={(e) => setFormData({ ...formData, buyNowPrice: e.target.value })}
              min="0"
              placeholder="Tùy chọn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Thời gian kết thúc *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoExtend">Tự động gia hạn</Label>
                <p className="text-sm text-muted-foreground">
                  Khi có bid mới trước 5 phút kết thúc, tự động gia hạn 10 phút
                </p>
              </div>
              <Switch
                id="autoExtend"
                checked={formData.autoExtend}
                onCheckedChange={(checked) => setFormData({ ...formData, autoExtend: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowUnratedBidders">Cho phép bidder chưa có đánh giá</Label>
                <p className="text-sm text-muted-foreground">
                  Bidder chưa có rating cũng có thể đấu giá
                </p>
              </div>
              <Switch
                id="allowUnratedBidders"
                checked={formData.allowUnratedBidders}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowUnratedBidders: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={createProduct.isPending || images.length < 4}>
              {createProduct.isPending ? 'Đang tạo...' : 'Đăng sản phẩm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
