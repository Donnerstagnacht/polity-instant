'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/ui/ui/alert-dialog.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar.tsx';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider.tsx';
import { useGroupState } from '@/zero/groups/useGroupState.ts';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { cn } from '@/features/shared/utils/utils.ts';
import type { User as UserType } from '@/features/users/types/user.types.ts';

interface UserMenuProps {
  className?: string;
  isMobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  user?: UserType | null;
}

export function UserMenu({
  className,
  isMobile,
  open,
  onOpenChange,
  user: userData,
}: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Query user's group memberships with nested group data
  const { currentUserMembershipsWithGroups } = useGroupState({
    includeCurrentUserMembershipsWithGroups: true,
  });
  const membershipsData = { groupMemberships: currentUserMembershipsWithGroups };

  // Filter active memberships (member or admin)
  const activeGroups = useMemo(() => {
    const memberships = membershipsData?.groupMemberships || [];
    return memberships
      .filter(
        (m: any) => m.group && (m.status === 'active' || m.status === 'admin' || m.role === 'admin')
      )
      .map((m: any) => m.group)
      .slice(0, 5); // Limit to 5 groups to keep menu manageable
  }, [membershipsData]);

  if (!authUser) return null;

  // Prefer user data, fallback to auth data
  const displayName = userData?.name || authUser.email?.split('@')[0] || 'User';
  const displayAvatar = userData?.avatar;
  const displayEmail = authUser.email || '';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: '/' });
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleUserClick = () => {
    if (authUser?.id) {
      navigate({ to: `/user/${authUser.id}` });
    } else {
      console.error('User ID not found:', authUser);
    }
  };

  const handleSettingsClick = () => {
    if (authUser?.id) {
      navigate({ to: `/user/${authUser.id}/settings` });
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate({ to: `/group/${groupId}` });
  };

  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : displayEmail.substring(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            data-user-menu-trigger
            variant="ghost"
            className={cn(
              'h-10 w-10 rounded-full p-0 hover:bg-accent',
              isMobile && 'h-12 w-12',
              className
            )}
          >
            <Avatar className={cn('h-8 w-8', isMobile && 'h-10 w-10')}>
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback className="text-xs font-medium">{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="z-50 w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleUserClick}>
            <User className="mr-2 h-4 w-4" />
            {t('navigation.userMenu.profile')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            {t('navigation.userMenu.settings')}
          </DropdownMenuItem>

          {activeGroups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {t('common.labels.groups')}
              </DropdownMenuLabel>
              {activeGroups.map((group: any) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={group.imageURL} alt={group.name} />
                      <AvatarFallback className="text-[10px]">
                        {group.name?.[0]?.toUpperCase() || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{group.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('auth.logout.button')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('auth.logout.button')}</AlertDialogTitle>
            <AlertDialogDescription>{t('auth.logout.confirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('auth.logout.button')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
