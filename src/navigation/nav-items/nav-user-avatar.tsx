import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/instant/auth';
import { UserMenu } from '@/components/auth/UserMenu';
import type { NavigationView } from '@/navigation/types/navigation.types';

export function NavUserAvatar({
  navigationView,
  className,
  isMobile,
}: {
  navigationView: NavigationView;
  isMobile: boolean;
  className?: string;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // If no id is provided, use a default based on variant
  const popoverId = isMobile ? 'user-avatar-mobile' : 'user-avatar';

  if (!isAuthenticated || !user) {
    return null;
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  if (navigationView === 'asButton') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} />
      </div>
    );
  }

  if (navigationView === 'asButtonList') {
    if (isMobile) {
      return (
        <div className={cn('flex items-center justify-center', className)}>
          <UserMenu isMobile={isMobile} />
        </div>
      );
    }

    return (
      <Popover open={hoveredItem === popoverId}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => setHoveredItem(popoverId)}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn('flex items-center justify-center', className)}
          >
            <UserMenu isMobile={isMobile} />
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-auto p-2" sideOffset={8}>
          <span className="text-sm font-medium">{user.name || user.email.split('@')[0]}</span>
        </PopoverContent>
      </Popover>
    );
  }

  if (navigationView === 'asLabeledButtonList' && isMobile) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} />
      </div>
    );
  }

  // Desktop asLabeledButtonList
  return (
    <Popover open={hoveredItem === popoverId}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex h-12 w-full items-center justify-start gap-3 px-3 hover:bg-accent',
            className
          )}
          onMouseEnter={() => setHoveredItem(popoverId)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name || user.email} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name || user.email.split('@')[0]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-auto p-2" sideOffset={8}>
        <UserMenu />
      </PopoverContent>
    </Popover>
  );
}
