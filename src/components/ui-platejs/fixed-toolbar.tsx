import { cn } from '@/utils/utils.ts';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { useScreenStore } from '@/global-state/screen.store';
import { useNavigation } from '@/navigation/state/useNavigation';

import { Toolbar } from '../ui/toolbar.tsx';

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  const { navigationView, navigationType } = useNavigationStore();
  const { isMobileScreen } = useScreenStore();
  const { secondaryNavItems } = useNavigation();

  // Check if secondary navigation should be visible
  const isSecondaryNavVisible =
    secondaryNavItems &&
    secondaryNavItems.length > 0 &&
    ['secondary', 'combined'].includes(navigationType);

  // Calculate top offset for mobile secondary navigation
  const getTopOffset = () => {
    if (!isMobileScreen || !isSecondaryNavVisible || navigationView === 'asButton') return 'top-0';

    if (navigationView === 'asButtonList') return 'top-16'; // 64px for mobile secondary nav
    if (navigationView === 'asLabeledButtonList') return 'top-20'; // 80px for mobile secondary nav

    return 'top-0';
  };

  // Calculate left offset based on primary sidebar width (only on desktop)
  const getLeftOffset = () => {
    if (isMobileScreen) return 'left-0';

    if (navigationView === 'asButtonList') return 'left-16'; // 64px
    if (navigationView === 'asLabeledButtonList') return 'left-64'; // 256px

    return 'left-0';
  };

  // Calculate right offset based on secondary sidebar width (only on desktop)
  const getRightOffset = () => {
    if (isMobileScreen || !isSecondaryNavVisible) return 'right-0';

    if (navigationView === 'asButtonList') return 'right-16'; // 64px
    if (navigationView === 'asLabeledButtonList') return 'right-64'; // 256px

    return 'right-0';
  };

  // Calculate width based on both sidebars (only on desktop)
  const getWidth = () => {
    if (isMobileScreen) return 'w-full';

    let leftOffset = 0;
    let rightOffset = 0;

    // Calculate left offset
    if (navigationView === 'asButtonList') leftOffset = 64; // 4rem = 64px
    if (navigationView === 'asLabeledButtonList') leftOffset = 256; // 16rem = 256px

    // Calculate right offset if secondary nav is visible
    if (isSecondaryNavVisible) {
      if (navigationView === 'asButtonList') rightOffset = 64; // 4rem = 64px
      if (navigationView === 'asLabeledButtonList') rightOffset = 256; // 16rem = 256px
    }

    const totalOffset = leftOffset + rightOffset;
    return totalOffset > 0 ? `w-[calc(100%-${totalOffset}px)]` : 'w-full';
  };

  return (
    <Toolbar
      {...props}
      className={cn(
        'scrollbar-hide supports-backdrop-blur:bg-background/60 fixed z-50 justify-between overflow-x-auto border-b border-b-border bg-background/95 p-1 backdrop-blur-sm transition-all duration-300',
        getTopOffset(),
        getLeftOffset(),
        getRightOffset(),
        getWidth(),
        props.className
      )}
    />
  );
}
