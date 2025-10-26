'use client';

import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useSubscribeEvent } from '../hooks/useSubscribeEvent';

interface EventSubscribeButtonProps {
  eventId: string;
  onSubscribeChange?: (isSubscribed: boolean) => void;
}

export function EventSubscribeButton({ eventId, onSubscribeChange }: EventSubscribeButtonProps) {
  const { isSubscribed, toggleSubscribe, isLoading } = useSubscribeEvent(eventId);

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
