import { AsButtonNavigation } from '@/navigation/as-button-navigation';
import { AsButtonListNavigation } from '@/navigation/as-button-list-navigation';
import { AsLabeledButtonListNavigation } from '@/navigation/as-labeled-button-list-navigation';
import type {
  NavigationItem,
  NavigationView,
  NavigationType,
  ScreenType,
} from '@/navigation/types/navigation.types';
import { useScreenStore } from '@/global-state/screen.store';

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
