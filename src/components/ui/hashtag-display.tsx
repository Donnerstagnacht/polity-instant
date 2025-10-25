'use client';

import { Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface HashtagDisplayProps {
  hashtags: { id: string; tag: string }[];
  title?: string;
  clickable?: boolean;
}

export function HashtagDisplay({
  hashtags,
  title = 'Hashtags',
  clickable = true,
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
    <div className="space-y-2">
      {title && <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>}
      <div className="flex flex-wrap gap-2">
        {hashtags.map(({ id, tag }) => (
          <Badge
            key={id}
            variant="secondary"
            className={`${clickable ? 'cursor-pointer hover:bg-primary/20' : ''}`}
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
