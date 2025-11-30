'use client';

import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type EntityType = 'group' | 'blog' | 'amendment' | 'event' | 'user';

interface SubscribeButtonProps {
  entityType: EntityType;
  entityId: string;
  isSubscribed: boolean;
  isLoading?: boolean;
  onToggleSubscribe: () => void;
  className?: string;
}

/**
 * Generic subscribe button for any entity (group, blog, amendment, event, user).
 * Handles only display and click, not state.
 */
export function SubscribeButton({
  isSubscribed,
  isLoading = false,
  onToggleSubscribe,
  className,
}: SubscribeButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant={isSubscribed ? 'outline' : 'default'}
      onClick={onToggleSubscribe}
      className={className}
      disabled={isLoading}
    >
      {isSubscribed ? (
        <>
          <BellOff className="mr-2 h-4 w-4" />
          {t('components.actionBar.unsubscribe')}
        </>
      ) : (
        <>
          <Bell className="mr-2 h-4 w-4" />
          {t('components.actionBar.subscribe')}
        </>
      )}
    </Button>
  );
}
