import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GavelIcon, TrophyIcon } from '@phosphor-icons/react';
import { useBidHistory } from '@/hooks/useBids';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface BidHistoryProps {
  productId: string;
  currentUserId?: string;
}

function maskName(fullName: string): string {
  if (!fullName) return '****';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return `****${fullName.slice(-4)}`;
  }
  const lastName = parts[parts.length - 1];
  return `****${lastName}`;
}

export function BidHistory({ productId, currentUserId }: BidHistoryProps) {
  const { data, isLoading } = useBidHistory(productId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const bids = data?.bids || [];

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
    <ScrollArea className="h-[400px] rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
          <TableRow>
            <TableHead className="w-[180px]">Thời điểm</TableHead>
            <TableHead>Người đặt giá</TableHead>
            <TableHead className="text-right">Giá</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid, index) => {
            const isHighest = index === 0;
            const bidderId = typeof bid.bidderId === 'string' ? bid.bidderId : bid.bidderId._id;
            const bidderName = typeof bid.bidderId === 'string' ? 'Unknown' : bid.bidderId.fullName;
            const isCurrentUser = bidderId === currentUserId;

            return (
              <motion.tr
                key={bid._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  ${isHighest ? 'bg-primary/5' : ''}
                  ${isCurrentUser ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
                `}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatDate(bid.bidTime)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isHighest && (
                      <TrophyIcon
                        size={18}
                        weight="fill"
                        className="text-amber-500"
                      />
                    )}
                    <span className={isHighest ? 'font-semibold' : ''}>
                      {maskName(bidderName)}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        Bạn
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
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
