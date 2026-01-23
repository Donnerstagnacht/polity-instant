/**
 * SupporterStatusBadge Component
 *
 * Displays the status of a group's support for an amendment
 * with appropriate colors and icons.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

type SupportStatus = 'active' | 'pending' | 'declined';

interface SupporterStatusBadgeProps {
  status: SupportStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  SupportStatus,
  {
    icon: React.ElementType;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
  }
> = {
  active: {
    icon: CheckCircle,
    variant: 'default',
    className:
      'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    icon: Clock,
    variant: 'secondary',
    className:
      'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  },
  declined: {
    icon: XCircle,
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function SupporterStatusBadge({
  status,
  className,
  showIcon = true,
  size = 'md',
}: SupporterStatusBadgeProps) {
  const { t } = useTranslation();

  const config = statusConfig[status];
  const Icon = config.icon;

  const translationKey = `features.amendments.supportConfirmation.comparison.${
    status === 'active' ? 'currentLabel' : status
  }`;

  // Fallback translation keys
  const statusLabels: Record<SupportStatus, string> = {
    active: t('features.amendments.supportConfirmation.comparison.currentLabel', 'Active'),
    pending: t('features.amendments.supportConfirmation.pending', 'Pending'),
    declined: t('common.declined', 'Declined'),
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' ? 'px-1.5 py-0 text-xs' : 'px-2 py-0.5 text-sm',
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {statusLabels[status]}
    </Badge>
  );
}
