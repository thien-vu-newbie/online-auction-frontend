import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GavelIcon,
  TrophyIcon,
  ProhibitIcon,
} from '@phosphor-icons/react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useBidHistory, useSellerBidHistory } from '@/hooks/useBids';
import { useRejectBidder } from '@/hooks/useSeller';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';

interface BidHistoryProps {
  productId: string;
  isSeller?: boolean;
  hasEnded?: boolean;
}

export function BidHistory({ productId, isSeller = false, hasEnded = false }: BidHistoryProps) {
  const { data: publicData, isLoading: publicLoading } = useBidHistory(productId);
  const { data: sellerData, isLoading: sellerLoading } = useSellerBidHistory(productId, isSeller);
  const rejectBidder = useRejectBidder();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);
  const [selectedBidderName, setSelectedBidderName] = useState<string>('');

  const data = isSeller ? sellerData : publicData;
  const isLoading = isSeller ? sellerLoading : publicLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const bids = isSeller 
    ? ((data as any)?.bids || []) 
    : ((data as any)?.history || []);

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <GavelIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Chưa có lượt đấu giá nào</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Hãy là người đầu tiên đặt giá!
        </p>
      </div>
    );
  }

  return (
    <>
    <ScrollArea className="h-[400px] rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
          <TableRow>
            <TableHead className="w-[180px]">Thời điểm</TableHead>
            <TableHead>Người đặt giá</TableHead>
            <TableHead className="text-right">Giá</TableHead>
            {isSeller && !hasEnded && (
              <TableHead className="w-[120px]">Hành động</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid, index) => {
            const isHighest = index === 0;
            const bidderName = bid.bidderName;
            const isRejected = isSeller && 'isRejected' in bid ? bid.isRejected : false;
            const bidderId = isSeller && 'bidderId' in bid ? bid.bidderId : null;

            return (
              <motion.tr
                key={`${bid.bidTime}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={isHighest ? 'bg-primary/5' : ''}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatDate(bid.bidTime)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isHighest && !isRejected && (
                      <TrophyIcon
                        size={18}
                        weight="fill"
                        className="text-amber-500"
                      />
                    )}
                    {isSeller && bidderId ? (
                      <Link
                        to={`/user/${bidderId}/ratings`}
                        className={`hover:text-primary hover:underline transition-colors ${isHighest ? 'font-semibold' : ''}`}
                      >
                        {bidderName}
                      </Link>
                    ) : (
                      <span className={isHighest ? 'font-semibold' : ''}>
                        {bidderName}
                      </span>
                    )}
                    {isRejected && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Đã từ chối
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      isHighest ? 'text-primary text-lg' : ''
                    }`}
                  >
                    {formatCurrency(bid.bidAmount)}
                  </span>
                </TableCell>
                {isSeller && !hasEnded && (
                  <TableCell>
                    {!isRejected && bidderId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedBidderId(bidderId);
                          setSelectedBidderName(bidderName);
                          setConfirmDialogOpen(true);
                        }}
                        disabled={rejectBidder.isPending}
                      >
                        <ProhibitIcon size={14} />
                        Từ chối
                      </Button>
                    ) : isRejected ? (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        Đã từ chối
                      </Badge>
                    ) : null}
                  </TableCell>
                )}
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>

    {/* Confirm Reject Dialog */}
    <ConfirmDialog
      open={confirmDialogOpen}
      onOpenChange={setConfirmDialogOpen}
      onConfirm={() => {
        if (selectedBidderId) {
          rejectBidder.mutate(
            {
              productId,
              bidderId: selectedBidderId,
            },
            {
              onSuccess: () => {
                setConfirmDialogOpen(false);
                setSelectedBidderId(null);
              },
            }
          );
        }
      }}
      title="Xác nhận từ chối người đấu giá"
      description={`Bạn có chắc muốn từ chối ${selectedBidderName}?\n\nNếu người này đang thắng, sản phẩm sẽ chuyển cho người đấu giá cao thứ 2.`}
      confirmText="Từ chối"
      cancelText="Hủy"
    />
  </>
  );
}
