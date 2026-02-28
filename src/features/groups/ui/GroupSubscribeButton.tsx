import React from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface GroupSubscribeButtonProps {
  subscribed: boolean;
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * Subscribe button for group subscriptions.
 * Handles only display and click, not state.
 */
export const GroupSubscribeButton: React.FC<GroupSubscribeButtonProps> = ({
  subscribed,
  onClick,
  className,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      variant={subscribed ? 'outline' : 'default'}
      onClick={onClick}
      className={className}
      disabled={isLoading}
    >
      {subscribed ? (
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
};
