import { cn } from '@/i18n/i18n.types';
import { StateSwitcher } from '@/navigation/toggles/state-switcher';
import { NavItemList } from '@/navigation/nav-items/nav-item-list';
import { NavUserAvatar } from '@/navigation/nav-items/nav-user-avatar';
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
          'fixed left-0 right-0 z-40 bg-background',
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
        'fixed top-0 z-40 flex h-full w-16 flex-col border-r bg-background',
        isPrimary ? 'left-0' : 'right-0 border-l border-r-0'
      )}
    >
      {isPrimary ? (
        <>
          <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
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
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
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
