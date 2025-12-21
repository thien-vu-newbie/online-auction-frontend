import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PencilIcon } from '@phosphor-icons/react';
import { formatDate } from '@/lib/formatters';

interface DescriptionHistoryItem {
  _id: string;
  content: string;
  addedAt: string;
}

interface DescriptionHistoryProps {
  history: DescriptionHistoryItem[];
  currentDescription: string;
}

export function DescriptionHistory({ history, currentDescription }: DescriptionHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PencilIcon size={20} />
            Mô tả sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentDescription }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PencilIcon size={20} />
          Lịch sử mô tả sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current/Initial Description */}
        <div>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentDescription }}
          />
        </div>

        {/* Description Updates History */}
        {history.map((item) => (
          <div key={item._id} className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="gap-1">
                <CalendarIcon size={12} />
                ✏️ {formatDate(item.addedAt)}
              </Badge>
            </div>
            <div 
              className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
