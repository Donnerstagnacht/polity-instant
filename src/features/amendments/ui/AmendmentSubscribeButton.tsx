'use client';

import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useSubscribeAmendment } from '../hooks/useSubscribeAmendment';

interface AmendmentSubscribeButtonProps {
  amendmentId: string;
  onSubscribeChange?: (isSubscribed: boolean) => void;
}

export function AmendmentSubscribeButton({
  amendmentId,
  onSubscribeChange,
}: AmendmentSubscribeButtonProps) {
  const { isSubscribed, toggleSubscribe, isLoading } = useSubscribeAmendment(amendmentId);

  const handleClick = async () => {
    await toggleSubscribe();
    onSubscribeChange?.(!isSubscribed);
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} variant="outline">
      {isSubscribed ? (
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
}
