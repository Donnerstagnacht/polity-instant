'use client';

import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useSubscribeBlog } from '../hooks/useSubscribeBlog';

interface BlogSubscribeButtonProps {
  blogId: string;
  onSubscribeChange?: (isSubscribed: boolean) => void;
}

export function BlogSubscribeButton({ blogId, onSubscribeChange }: BlogSubscribeButtonProps) {
  const { isSubscribed, toggleSubscribe, isLoading } = useSubscribeBlog(blogId);

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
