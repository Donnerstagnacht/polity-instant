'use client';

import { Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

interface HashtagDisplayProps {
  hashtags: { id: string; tag: string }[];
  title?: string;
  clickable?: boolean;
  centered?: boolean;
  className?: string;
  badgeClassName?: string;
}

export function HashtagDisplay({
  hashtags,
  title = '',
  clickable = true,
  centered = false,
  className,
  badgeClassName,
}: HashtagDisplayProps) {
  const router = useRouter();

  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  const handleHashtagClick = (tag: string) => {
    if (clickable) {
      // Only set the hashtag filter, not the search query
      router.push(`/search?hashtag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className={cn('space-y-2', centered ? 'flex flex-col items-center' : '', className)}>
      {title && <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>}
      <div className={cn('flex flex-wrap gap-2', centered ? 'justify-center' : 'justify-start')}>
        {hashtags.map(({ id, tag }) => (
          <Badge
            key={id}
            variant="secondary"
            className={cn(clickable ? 'cursor-pointer hover:bg-primary/20' : '', badgeClassName)}
            onClick={() => handleHashtagClick(tag)}
          >
            <Hash className="mr-1 h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
