import { Home, X } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button';
import { StateSwitcher } from '@/navigation/toggles/state-switcher';
import { NavItemList } from '@/navigation/nav-items/nav-item-list';
import { NavUserAvatar } from '@/navigation/nav-items/nav-user-avatar';
import type { NavigationProps } from '@/navigation/types/navigation.types';
import { useState } from 'react';

export function AsButtonNavigation({
  navigationItems,
  navigationView,
  navigationType,
  isMobile,
}: NavigationProps) {
  const isPrimary = navigationType === 'primary';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {!isExpanded && (
        <NavButton isPrimary={isPrimary} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      )}

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(false)}
        >
          <CloseButton isPrimary={isPrimary} onClose={() => setIsExpanded(false)} />
          <div className="flex h-full items-center justify-center">
            <div className="flex w-full max-w-3xl flex-col items-center px-6">
              <NavItemList
                navigationItems={navigationItems}
                isMobile={isMobile}
                isPrimary={isPrimary}
                navigationView={navigationView}
              />
              {isPrimary && (
                <NavUserAvatar className="mt-8" navigationView="asButton" isMobile={isMobile} />
              )}
            </div>
          </div>
          {isPrimary && <StateSwitcher isMobile={isMobile} navigationType={navigationType} />}
        </div>
      )}
    </>
  );
}

export function NavButton({
  isPrimary,
  isExpanded,
  setIsExpanded,
  icon = <Home className="h-6 w-6" />,
}: {
  isPrimary: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        'fixed bottom-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110',
        isPrimary ? 'left-6' : 'right-6'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {icon}
    </Button>
  );
}

export function CloseButton({
  isPrimary,
  onClose,
  className,
}: {
  isPrimary: boolean;
  onClose: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'absolute top-6 z-50 h-10 w-10 rounded-full shadow-md',
        isPrimary ? 'right-6' : 'left-6', // Right if primary, Left if secondary
        className
      )}
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
