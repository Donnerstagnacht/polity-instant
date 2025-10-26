import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

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
}) => (
  <Button
    variant={subscribed ? 'outline' : 'default'}
    onClick={onClick}
    className={className}
    disabled={isLoading}
  >
    {subscribed ? (
      <>
        <BellOff className="mr-2 h-4 w-4" />
        Unsubscribe
      </>
    ) : (
      <>
        <Bell className="mr-2 h-4 w-4" />
        Subscribe
      </>
    )}
  </Button>
);
