import { cn } from '@/features/shared/utils/utils.ts';
import { StateSwitcher } from '@/features/navigation/toggles/state-switcher.tsx';
import { NavItemList } from '@/features/navigation/nav-items/nav-item-list.tsx';
import { NavUserAvatar } from '@/features/navigation/nav-items/nav-user-avatar.tsx';
import { Separator } from '@/features/shared/ui/ui/separator.tsx';
import type { NavigationProps } from '@/features/navigation/types/navigation.types.tsx';

export function AsLabeledButtonListNavigation({
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
            isMobile={true}
            isPrimary={isPrimary}
            navigationView={navigationView}
          />

          {isPrimary && <Separator orientation="vertical" className="mx-2 h-12" />}
          {isPrimary && <NavUserAvatar navigationView="asLabeledButtonList" isMobile={true} />}

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
        'fixed top-0 z-40 flex h-full w-64 flex-col border-r bg-background',
        isPrimary ? 'left-0' : 'right-0 border-l border-r-0'
      )}
    >
      <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
        <NavItemList
          navigationItems={navigationItems}
          isMobile={false}
          isPrimary={isPrimary}
          navigationView={navigationView}
        />
      </div>

      <div className="flex-shrink-0 border-t">
        {isPrimary && <NavUserAvatar navigationView="asLabeledButtonList" isMobile={false} />}
        {isPrimary && (
          <div className="px-4 pb-2 pt-4">
            <StateSwitcher isMobile={false} navigationType={navigationType} />
          </div>
        )}
      </div>
    </div>
  );
}
