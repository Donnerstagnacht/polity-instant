'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { db } from '../../../db';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils.ts';
import type { User as UserType } from '@/features/user/types/user.types';

interface UserMenuProps {
  className?: string;
  isMobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  profileUser?: UserType | null;
}

export function UserMenu({ className, isMobile, open, onOpenChange, profileUser }: UserMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: authUser } = db.useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Query user's group memberships
  const { data: membershipsData } = db.useQuery(
    authUser?.id
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': authUser.id,
              },
            },
            group: {},
          },
        }
      : { groupMemberships: {} }
  );

  // Filter active memberships (member or admin)
  const activeGroups = useMemo(() => {
    const memberships = membershipsData?.groupMemberships || [];
    return memberships
      .filter(
        (m: any) => m.group && (m.status === 'member' || m.status === 'admin' || m.role === 'admin')
      )
      .map((m: any) => m.group)
      .slice(0, 5); // Limit to 5 groups to keep menu manageable
  }, [membershipsData]);

  if (!authUser) return null;

  // Prefer profile data, fallback to auth data
  const displayName = profileUser?.name || authUser.email?.split('@')[0] || 'User';
  const displayAvatar = profileUser?.avatar;
  const displayEmail = authUser.email || '';

  const handleLogout = async () => {
    try {
      await db.auth.signOut();
      router.push('/');
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleProfileClick = () => {
    // Navigate to the logged-in user's profile page
    console.log('Profile click - user:', authUser);
    if (authUser?.id) {
      console.log('Navigating to /user/' + authUser.id);
      router.push(`/user/${authUser.id}`);
    } else {
      console.error('User ID not found:', authUser);
    }
  };

  const handleSettingsClick = () => {
    if (authUser?.id) {
      router.push(`/user/${authUser.id}/edit`);
    }
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/group/${groupId}`);
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

          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          {activeGroups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Groups
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('auth.logout.button')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
