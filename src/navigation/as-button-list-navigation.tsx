import { cn } from '@/i18n/i18n.types.ts';
import { StateSwitcher } from '@/navigation/toggles/state-switcher.tsx';
import { NavItemList } from '@/navigation/nav-items/nav-item-list.tsx';
import { NavUserAvatar } from '@/navigation/nav-items/nav-user-avatar.tsx';
import { Separator } from '@/components/ui/separator';
import type { NavigationProps } from './types/navigation.types';

export function AsButtonListNavigation({
  navigationItems,
  navigationType,
  isMobile,
  navigationView,
}: NavigationProps) {
  const isPrimary = navigationType === 'primary';

  if (isMobile) {
    return (
      <div
        className={cn(
          'bg-background fixed right-0 left-0 z-40',
          isPrimary ? 'bottom-0 border-t' : 'top-0 border-b'
        )}
      >
        <div className="flex items-center py-2">
          <NavItemList
            navigationItems={navigationItems}
            isMobile={isMobile}
            isPrimary={isPrimary}
            navigationView={navigationView}
          />
          {isPrimary && <Separator orientation="vertical" className="mx-2 h-8" />}
          {isPrimary && <NavUserAvatar navigationView="asButtonList" isMobile={isMobile} />}
          {isPrimary && (
            <div className="flex items-center gap-2 px-2">
              <StateSwitcher isMobile={isMobile} navigationType={navigationType} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div
      className={cn(
        'bg-background fixed top-0 z-40 flex h-full w-16 flex-col border-r',
        isPrimary ? 'left-0' : 'right-0 border-r-0 border-l'
      )}
    >
      {isPrimary ? (
        <>
          <div className="scrollbar-hide flex-1 overflow-y-auto py-4">
            <NavItemList
              navigationItems={navigationItems}
              isMobile={isMobile}
              isPrimary={isPrimary}
              navigationView={navigationView}
            />
          </div>
          <div className="flex-shrink-0 border-t">
            <div className="flex flex-col items-center gap-2 p-2">
              <NavUserAvatar isMobile={isMobile} navigationView="asButtonList" />

              <div className="flex flex-col items-center gap-2">
                <StateSwitcher isMobile={isMobile} navigationType={navigationType} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="scrollbar-hide flex-1 overflow-y-auto py-4">
          <NavItemList
            navigationItems={navigationItems}
            isMobile={false}
            isPrimary={isPrimary}
            navigationView={navigationView}
          />
        </div>
      )}
    </div>
  );
}
