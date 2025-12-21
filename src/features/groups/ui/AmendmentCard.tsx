'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';

interface AmendmentCardProps {
  amendment: any;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'bg-gray-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'approved':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    case 'active':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function AmendmentCard({ amendment }: AmendmentCardProps) {
  return (
    <a href={`/amendment/${amendment.id}`} className="block">
      <Card className="cursor-pointer transition-colors hover:bg-accent">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="default" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              Amendment
            </Badge>
            <Badge className={`text-xs ${getStatusColor(amendment.status)}`}>
              {amendment.status}
            </Badge>
          </div>
          <CardTitle className="text-lg">{amendment.title}</CardTitle>
          {amendment.subtitle && (
            <CardDescription className="line-clamp-2">{amendment.subtitle}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {amendment.code && (
            <div className="font-mono text-sm text-muted-foreground">Code: {amendment.code}</div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(amendment.date).toLocaleDateString()}</span>
            </div>
            {amendment.supporters !== undefined && (
              <div className="flex items-center gap-1">
                <span>{amendment.supporters} supporters</span>
              </div>
            )}
          </div>
          {amendment.owner && (
            <p className="text-xs text-muted-foreground">By {amendment.owner.name || 'Unknown'}</p>
          )}
          {amendment.hashtags && amendment.hashtags.length > 0 && (
            <div className="pt-2">
              <HashtagDisplay hashtags={amendment.hashtags.slice(0, 3)} />
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
