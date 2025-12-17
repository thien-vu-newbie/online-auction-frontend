import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GavelIcon, InfoIcon } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/formatters';

interface BidInputProps {
  suggestedBid: number;
  bidStep: number;
  onBid: (amount: number) => void;
}

export function BidInput({ suggestedBid, bidStep, onBid }: BidInputProps) {
  const [bidAmount, setBidAmount] = useState(suggestedBid);

  const handleBid = () => {
    onBid(bidAmount);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Nhập giá đặt</span>
        <span className="text-muted-foreground">
          Đề nghị: {formatCurrency(suggestedBid)}
        </span>
      </div>
      <div className="flex gap-2 items-stretch">
        <Input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          min={suggestedBid}
          step={bidStep}
          className="text-lg font-semibold h-11"
        />
        <Button
          onClick={handleBid}
          disabled={bidAmount < suggestedBid}
          className="gap-2 px-6 cursor-pointer h-11"
        >
          <GavelIcon size={20} weight="fill" />
          Đặt giá
        </Button>
      </div>
      {bidAmount < suggestedBid && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <InfoIcon size={12} />
          Giá đặt phải từ {formatCurrency(suggestedBid)} trở lên
        </p>
      )}
    </div>
  );
}
