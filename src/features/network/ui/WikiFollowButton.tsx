import React from 'react';
import { Button } from '@/components/ui/button';

interface WikiFollowButtonProps {
  following: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Dumb follow button for the user wiki.
 * Handles only display and click, not state.
 */
export const WikiFollowButton: React.FC<WikiFollowButtonProps> = ({
  following,
  onClick,
  className,
}) => (
  <Button variant={following ? 'outline' : 'default'} onClick={onClick} className={className}>
    {following ? 'Following' : 'Follow'}
  </Button>
);
