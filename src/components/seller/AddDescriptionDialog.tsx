import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAddProductDescription } from '@/hooks/useSeller';
import { productKeys } from '@/hooks/useProducts';

interface AddDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function AddDescriptionDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: AddDescriptionDialogProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const addDescription = useAddProductDescription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDescription.mutateAsync({ productId, content });
    
    // Invalidate queries to refresh the product detail page
    queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    
    onOpenChange(false);
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bổ sung mô tả sản phẩm</DialogTitle>
          <DialogDescription>
            Thêm thông tin mô tả cho: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung bổ sung *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Nhập mô tả bổ sung. Nội dung này sẽ được thêm vào cuối mô tả hiện tại..."
              minHeight="200px"
            />
            <p className="text-sm text-muted-foreground">
              ✏️ Nội dung sẽ được gắn thêm (append) với timestamp vào lịch sử mô tả, không thay thế mô tả cũ
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={addDescription.isPending || !content.trim()}>
              {addDescription.isPending ? 'Đang thêm...' : 'Bổ sung mô tả'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
