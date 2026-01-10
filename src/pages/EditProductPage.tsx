import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { CategorySelect } from '@/components/ui/category-select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeftIcon, Info, ImageIcon, XIcon } from '@phosphor-icons/react';
import { useUpdateProduct } from '@/hooks/useSeller';
import { useProductDetail } from '@/hooks/useProducts';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';

// Helper functions for price formatting
const formatPrice = (value: string): string => {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('de-DE');
};

const parsePrice = (value: string): string => {
  return value.replace(/\./g, '');
};

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categories = useAppSelector((state) => state.categories.categories);
  const updateProduct = useUpdateProduct();
  const { data, isLoading } = useProductDetail(id!);
  
  const product = data?.product;

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasBids = product ? product.bidCount > 0 : false;

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

  // Redirect if product has bids (protection against direct URL access)
  useEffect(() => {
    if (product && product.bidCount > 0) {
      navigate(`/product/${id}`);
    }
  }, [product, id, navigate]);

  useEffect(() => {
    if (product) {
      const startDate = new Date(product.startTime);
      const endDate = new Date(product.endTime);
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        startPrice: product.startPrice?.toString() || '',
        stepPrice: product.bidStep?.toString() || '',
        buyNowPrice: product.buyNowPrice?.toString() || '',
        startTime: !isNaN(startDate.getTime()) ? format(startDate, "yyyy-MM-dd'T'HH:mm") : '',
        endTime: !isNaN(endDate.getTime()) ? format(endDate, "yyyy-MM-dd'T'HH:mm") : '',
        autoExtend: product.autoExtend || false,
        allowUnratedBidders: product.allowUnratedBidders || false,
      });

      // Set existing images as previews (but not as File objects)
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images);
      }
    }
  }, [product, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Clear previous errors
    setErrors({});
    const newErrors: Record<string, string> = {};

    const updateData: any = {};

    if (hasBids) {
      // Chỉ gửi description nếu có thay đổi
      if (formData.description !== product?.description) {
        if (!formData.description || formData.description.trim() === '' || formData.description === '<p></p>') {
          newErrors.description = 'Mô tả không được để trống';
        }
        updateData.description = formData.description;
      }
    } else {
      // Validate all fields when no bids
      if (!formData.name || formData.name.trim() === '') {
        newErrors.name = 'Tên sản phẩm không được để trống';
      }
      if (!formData.description || formData.description.trim() === '' || formData.description === '<p></p>') {
        newErrors.description = 'Mô tả không được để trống';
      }
      if (!formData.categoryId) {
        newErrors.categoryId = 'Vui lòng chọn danh mục';
      }
      if (!formData.startPrice || Number(formData.startPrice) < 0) {
        newErrors.startPrice = 'Giá khởi điểm phải lớn hơn hoặc bằng 0';
      }
      if (!formData.stepPrice || Number(formData.stepPrice) < 1000) {
        newErrors.stepPrice = 'Bước giá phải lớn hơn hoặc bằng 1,000 VNĐ';
      }
      if (formData.buyNowPrice && Number(formData.buyNowPrice) < 0) {
        newErrors.buyNowPrice = 'Giá mua ngay phải lớn hơn hoặc bằng 0';
      }
      if (!formData.startTime) {
        newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
      }
      if (!formData.endTime) {
        newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
      }
      if (formData.startTime && formData.endTime) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        if (end <= start) {
          newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }
      }
      
      // Check images when editing without bids
      if (imagePreviews.length < 4) {
        newErrors.images = 'Cần tối thiểu 4 hình ảnh';
      }

      // If validation fails, show errors and return
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Gửi toàn bộ thông tin
      updateData.name = formData.name;
      updateData.description = formData.description;
      updateData.categoryId = formData.categoryId;
      updateData.startPrice = Number(formData.startPrice);
      updateData.stepPrice = Number(formData.stepPrice);
      updateData.buyNowPrice = formData.buyNowPrice ? Number(formData.buyNowPrice) : undefined;
      updateData.startTime = new Date(formData.startTime).toISOString();
      updateData.endTime = new Date(formData.endTime).toISOString();
      updateData.autoExtend = formData.autoExtend;
      updateData.allowUnratedBidders = formData.allowUnratedBidders;
    }

    // If validation fails for hasBids case
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Send images only if new images were uploaded (File objects exist)
    await updateProduct.mutateAsync({ 
      productId: id, 
      data: updateData,
      images: images.length > 0 ? images : undefined,
    });
    navigate(`/product/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={18} />
            Quay lại
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {hasBids ? 'Bổ sung mô tả sản phẩm' : 'Chỉnh sửa sản phẩm'}
              </CardTitle>
              <CardDescription>
                {hasBids
                  ? 'Sản phẩm đã có người đấu giá. Bạn chỉ có thể bổ sung mô tả.'
                  : 'Chỉnh sửa thông tin sản phẩm của bạn.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasBids && (
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Sản phẩm đã có {product.bidCount} lượt đấu giá. Bạn chỉ có thể bổ sung mô tả, không thể thay đổi các thông tin khác.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!hasBids && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên sản phẩm *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                  </>
                )}

                {hasBids && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Không thể chỉnh sửa khi đã có người đấu giá
                    </p>
                  </div>
                )}

                {!hasBids && (
                  <div className="space-y-2">
                    <Label>Hình ảnh (Tối thiểu 4 ảnh) *</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={preview}
                            alt={`Hình ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border"
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
                      {imagePreviews.length < 4 && (
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
                      {imagePreviews.length}/4 ảnh. Bạn có thể giữ nguyên hoặc thay đổi hình ảnh.
                    </p>
                    {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {hasBids ? 'Bổ sung mô tả *' : 'Mô tả sản phẩm *'}
                  </Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder={
                      hasBids
                        ? 'Nhập mô tả bổ sung. Nội dung này sẽ được thêm vào cuối mô tả hiện tại.'
                        : 'Nhập mô tả chi tiết về sản phẩm...'
                    }
                    minHeight="200px"
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                {!hasBids && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Danh mục *</Label>
                      <CategorySelect
                        categories={categories}
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        placeholder="Chọn danh mục"
                        showAllOption={false}
                      />
                      {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startPrice">Giá khởi điểm (VNĐ) *</Label>
                        <Input
                          id="startPrice"
                          type="text"
                          value={formatPrice(formData.startPrice)}
                          onChange={(e) => setFormData({ ...formData, startPrice: parsePrice(e.target.value) })}
                          required
                          placeholder="1.000.000"
                          className={errors.startPrice ? 'border-red-500' : ''}
                        />
                        {errors.startPrice && <p className="text-sm text-red-500">{errors.startPrice}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stepPrice">Bước giá (VNĐ) *</Label>
                        <Input
                          id="stepPrice"
                          type="text"
                          value={formatPrice(formData.stepPrice)}
                          onChange={(e) => setFormData({ ...formData, stepPrice: parsePrice(e.target.value) })}
                          required
                          placeholder="100.000"
                          className={errors.stepPrice ? 'border-red-500' : ''}
                        />
                        {errors.stepPrice && <p className="text-sm text-red-500">{errors.stepPrice}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyNowPrice">Giá mua ngay (VNĐ)</Label>
                      <Input
                        id="buyNowPrice"
                        type="text"
                        value={formatPrice(formData.buyNowPrice)}
                        onChange={(e) => setFormData({ ...formData, buyNowPrice: parsePrice(e.target.value) })}
                        placeholder="Tùy chọn (VD: 5.000.000)"
                        className={errors.buyNowPrice ? 'border-red-500' : ''}
                      />
                      {errors.buyNowPrice && <p className="text-sm text-red-500">{errors.buyNowPrice}</p>}
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
                          className={errors.startTime ? 'border-red-500' : ''}
                        />
                        {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          required
                          className={errors.endTime ? 'border-red-500' : ''}
                        />
                        {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
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
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={updateProduct.isPending}>
                    {updateProduct.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
