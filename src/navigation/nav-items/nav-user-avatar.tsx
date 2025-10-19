import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils/utils.ts';
import { useAuthStore } from '@/features/auth/auth.ts';
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
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Fullscreen overlay mode - click goes directly to profile
    const handleClick = () => {
      if (user?.id) {
        router.push(`/user/${user.id}`);
      }
    };

    return (
      <div
        className={cn(
          'flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80',
          className
        )}
        onClick={handleClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.photoURL || user.avatar || undefined}
            alt={user.name || user.email}
          />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">
          {user.name || user.email.split('@')[0]}
        </span>
      </div>
    );
  }

  if (navigationView === 'asButtonList') {
    // Both mobile and desktop: just show UserMenu (which has its own popover with logout, etc.)
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} />
      </div>
    );
  }

  if (navigationView === 'asLabeledButtonList' && isMobile) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} />
      </div>
    );
  }

  // Desktop asLabeledButtonList - show UserMenu icon and name next to it with click trigger
  const handleNameClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (!open && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsDropdownOpen(open);
  };

  return (
    <div className={cn('flex w-full items-center gap-3 px-3 py-2', className)}>
      <UserMenu isMobile={isMobile} open={isDropdownOpen} onOpenChange={handleDropdownOpenChange} />
      <span className="cursor-pointer truncate text-sm font-medium" onClick={handleNameClick}>
        {user.name || user.email.split('@')[0]}
      </span>
    </div>
  );
}
