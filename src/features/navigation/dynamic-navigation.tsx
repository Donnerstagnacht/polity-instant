import { AsButtonNavigation } from '@/features/navigation/as-button-navigation.tsx';
import { AsButtonListNavigation } from '@/features/navigation/as-button-list-navigation.tsx';
import { AsLabeledButtonListNavigation } from '@/features/navigation/as-labeled-button-list-navigation.tsx';
import type {
  NavigationItem,
  NavigationView,
  NavigationType,
  ScreenType,
} from '@/features/navigation/types/navigation.types.tsx';
import { useScreenStore } from '@/features/shared/global-state/screen.store.tsx';

export function DynamicNavigation({
  navigationView,
  navigationType,
  screenType,
  navigationItems,
}: {
  navigationView: NavigationView;
  navigationType: NavigationType;
  screenType: ScreenType;
  navigationItems: NavigationItem[];
}) {
  const isMobile = useScreenStore(state => state.isMobileScreen);

  const isMobileDevice = screenType === 'mobile' || (screenType === 'automatic' && isMobile);

  if (navigationView === 'asButton') {
    return (
      <AsButtonNavigation
        navigationItems={navigationItems}
        navigationView={navigationView}
        navigationType={navigationType}
        isMobile={isMobileDevice}
      />
    );
  }

  if (navigationView === 'asButtonList') {
    return (
      <AsButtonListNavigation
        navigationItems={navigationItems}
        navigationView={navigationView}
        navigationType={navigationType}
        isMobile={isMobileDevice}
      />
    );
  }

  if (navigationView === 'asLabeledButtonList') {
    return (
      <AsLabeledButtonListNavigation
        navigationItems={navigationItems}
        navigationView={navigationView}
        navigationType={navigationType}
        isMobile={isMobileDevice}
      />
    );
  }

  return null;
}
