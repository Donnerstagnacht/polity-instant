import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar.tsx';
import { cn } from '@/features/shared/utils/utils.ts';
import { useAuth } from '@/providers/auth-provider.tsx';
import { useZeroReady } from '@/providers/zero-provider.tsx';
import { useUserData } from '@/features/users/hooks/useUserData.ts';
import { UserMenu } from '@/features/navigation/UserMenu.tsx';
import type { NavigationView } from '@/features/navigation/types/navigation.types.tsx';

export function NavUserAvatar(props: {
  navigationView: NavigationView;
  isMobile: boolean;
  className?: string;
}) {
  const { user: authUser } = useAuth();
  const zeroReady = useZeroReady();

  if (!authUser || !zeroReady) {
    return null;
  }

  return <NavUserAvatarInner {...props} />;
}

function NavUserAvatarInner({
  navigationView,
  className,
  isMobile,
}: {
  navigationView: NavigationView;
  isMobile: boolean;
  className?: string;
}) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user: user } = useUserData(authUser?.id);

  if (!authUser) {
    return null;
  }

  const displayName = user?.name || authUser.email?.split('@')[0] || 'User';
  const displayAvatar = user?.avatar;

  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : (authUser.email?.substring(0, 2) || 'U').toUpperCase();

  if (navigationView === 'asButton') {
    const handleClick = () => {
      if (authUser?.id) {
        navigate({ to: `/user/${authUser.id}` });
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
          <AvatarImage src={displayAvatar || undefined} alt={displayName} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{displayName}</span>
      </div>
    );
  }

  if (navigationView === 'asButtonList') {
    // Both mobile and desktop: just show UserMenu (which has its own popover with logout, etc.)
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} user={user} />
      </div>
    );
  }

  if (navigationView === 'asLabeledButtonList' && isMobile) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <UserMenu isMobile={isMobile} user={user} />
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
      <UserMenu
        isMobile={isMobile}
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
        user={user}
      />
      <span className="cursor-pointer truncate text-sm font-medium" onClick={handleNameClick}>
        {displayName}
      </span>
    </div>
  );
}
