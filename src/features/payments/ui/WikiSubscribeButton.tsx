import React from 'react';
import { Button } from '@/components/ui/button';

interface WikiSubscribeButtonProps {
  subscribed: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Subscribe button for the user wiki.
 * Handles only display and click, not state.
 */
export const WikiSubscribeButton: React.FC<WikiSubscribeButtonProps> = ({
  subscribed,
  onClick,
  className,
}) => (
  <Button variant={subscribed ? 'outline' : 'default'} onClick={onClick} className={className}>
    {subscribed ? 'Unsubscribe' : 'Subscribe'}
  </Button>
);
