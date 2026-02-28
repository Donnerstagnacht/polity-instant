import { Badge } from '@/features/shared/ui/ui/badge';
import { cn } from '@/features/shared/utils/utils';
import { getRightLabel, RIGHT_GRADIENTS, type RightType } from '@/features/network/ui/RightFilters';

interface RightBadgeProps {
  right: string;
  variant?: 'gradient' | 'outline';
  className?: string;
}

export function RightBadge({ right, variant = 'gradient', className }: RightBadgeProps) {
  const label = getRightLabel(right);

  if (variant === 'outline') {
    return (
      <Badge variant="outline" className={cn('text-xs', className)}>
        {label}
      </Badge>
    );
  }

  const gradient = RIGHT_GRADIENTS[right as RightType];

  return (
    <Badge
      className={cn(
        'border-0 text-xs text-white',
        gradient ?? 'bg-muted text-muted-foreground',
        className
      )}
    >
      {label}
    </Badge>
  );
}
