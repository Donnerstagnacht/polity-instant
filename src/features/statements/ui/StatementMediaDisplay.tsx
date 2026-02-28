import { cn } from '@/features/shared/utils/utils';
import { Play } from 'lucide-react';

interface StatementMediaDisplayProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt?: string;
  className?: string;
}

export function StatementMediaDisplay({
  imageUrl,
  videoUrl,
  alt = 'Statement media',
  className,
}: StatementMediaDisplayProps) {
  if (!imageUrl && !videoUrl) return null;

  return (
    <div className={cn('overflow-hidden rounded-lg', className)}>
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={imageUrl ?? undefined}
          controls
          className="w-full rounded-lg"
        >
          <track kind="captions" />
        </video>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}
    </div>
  );
}
