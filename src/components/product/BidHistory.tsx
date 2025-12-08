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
import { GavelIcon, TrophyIcon } from '@phosphor-icons/react';
import type { Bid } from '@/types';
import { formatCurrency, formatDate, maskName } from '@/lib/formatters';

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
}

export function BidHistory({ bids, currentUserId }: BidHistoryProps) {
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
            const isCurrentUser = bid.bidderId === currentUserId;

            return (
              <motion.tr
                key={bid.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  ${isHighest ? 'bg-primary/5' : ''}
                  ${isCurrentUser ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
                `}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatDate(bid.createdAt)}
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
                      {maskName(bid.bidderName)}
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
                    {formatCurrency(bid.amount)}
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
