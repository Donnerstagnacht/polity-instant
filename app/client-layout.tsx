'use client';

// import './i18n/i18n'; // Initialize i18n on client side - temporarily disabled
import { Toaster } from '@/components/ui/sonner';
import { DynamicNavigation } from '@/navigation/dynamic-navigation';
import { NavigationCommandDialog } from '@/navigation/command-dialog';
import { useScreenResponsiveDetector, useScreenStore } from '@/global-state/screen.store';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { useThemeInitializer } from '@/global-state/theme.store';
import { I18nSyncProvider } from '@/providers/i18n-sync-provider';
import type {
  NavigationItem,
  NavigationType,
  NavigationView,
} from '@/navigation/types/navigation.types';
import { useNavigation } from '@/navigation/state/useNavigation';
import { useAuthStore } from '@/lib/instant/auth';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize theme, screen responsive detection, and auth state
  useThemeInitializer({ defaultTheme: 'system', storageKey: 'theme' });
  useScreenResponsiveDetector();

  const { screenType, isMobileScreen } = useScreenStore();
  const { navigationType, navigationView } = useNavigationStore();
  const { primaryNavItems, secondaryNavItems, unauthenticatedNavItems } = useNavigation();
  const { isAuthenticated } = useAuthStore();

  // Determine navigation items based on authentication status
  const navigationItems = isAuthenticated ? primaryNavItems : unauthenticatedNavItems;

  const isMobile = screenType === 'mobile' || (screenType === 'automatic' && isMobileScreen);

  return (
    <I18nSyncProvider>
      <div className="min-h-screen bg-background">
        {['primary', 'combined'].includes(navigationType) && (
          <DynamicNavigation
            navigationType="primary"
            navigationView={navigationView}
            navigationItems={navigationItems}
            screenType={screenType}
          />
        )}
        {isAuthenticated &&
          secondaryNavItems &&
          ['secondary', 'combined'].includes(navigationType) && (
            <DynamicNavigation
              navigationType="secondary"
              navigationView={navigationView}
              navigationItems={secondaryNavItems}
              screenType={screenType}
            />
          )}
        <main
          className={`transition-all duration-300 ${getMarginClasses({
            isMobile,
            navigationView: navigationView,
            navigationType: navigationType,
            secondaryNavItems,
          })}`}
        >
          {children}
        </main>

        {/* Command Dialog for global search */}
        <NavigationCommandDialog
          primaryNavItems={navigationItems}
          secondaryNavItems={secondaryNavItems}
        />

        <Toaster richColors position="top-right" />
      </div>
    </I18nSyncProvider>
  );
}

function getMarginClasses({
  isMobile,
  navigationView,
  navigationType,
  secondaryNavItems,
}: {
  isMobile: boolean;
  navigationView: NavigationView;
  navigationType: NavigationType;
  secondaryNavItems: NavigationItem[] | null;
}) {
  // Check if secondary nav should be visible based on priority
  const isSecondaryNavVisible =
    secondaryNavItems &&
    secondaryNavItems.length > 0 &&
    ['secondary', 'combined'].includes(navigationType);

  const marginLeft = getMarginLeftForPrimaryDesktop({
    isMobile,
    navigationView: navigationView,
  });
  const marginRight = getMarginRightForSecondaryDesktop({
    isMobile,
    state: navigationView,
    isSecondaryNavVisible,
  });
  const marginTop = getMarginTopForSecondaryMobile({
    isMobile,
    navigationView: navigationView,
    isSecondaryNavVisible,
  });
  const marginBottom = getMarginBottomForPrimaryMobile({
    isMobile,
    navigationView: navigationView,
  });

  return [marginLeft, marginRight, marginTop, marginBottom].filter(Boolean).join(' ');
}

function getMarginLeftForPrimaryDesktop({
  isMobile,
  navigationView,
}: {
  isMobile: boolean;
  navigationView: NavigationView;
}): string {
  if (isMobile) return '';

  if (navigationView === 'asButton') return '';
  if (navigationView === 'asButtonList') return 'ml-16';
  if (navigationView === 'asLabeledButtonList') return 'ml-64';

  return '';
}

function getMarginRightForSecondaryDesktop({
  isMobile,
  state,
  isSecondaryNavVisible,
}: {
  isMobile: boolean;
  state: NavigationView;
  isSecondaryNavVisible: boolean | null;
}): string {
  if (isMobile) return '';

  if (state === 'asButton') return '';
  if (state === 'asButtonList' && isSecondaryNavVisible) return 'mr-16';
  if (state === 'asLabeledButtonList' && isSecondaryNavVisible) return 'mr-64';

  return '';
}

function getMarginTopForSecondaryMobile({
  isMobile,
  navigationView,
  isSecondaryNavVisible,
}: {
  isMobile: boolean;
  navigationView: NavigationView;
  isSecondaryNavVisible: boolean | null;
}): string {
  if (!isMobile || !isSecondaryNavVisible) return '';

  if (navigationView === 'asButtonList') {
    return 'mt-16';
  }

  if (navigationView === 'asLabeledButtonList') {
    return 'mt-20';
  }

  return '';
}

function getMarginBottomForPrimaryMobile({
  isMobile,
  navigationView,
}: {
  isMobile: boolean;
  navigationView: NavigationView;
}): string {
  if (!isMobile) return '';

  if (navigationView === 'asButtonList') {
    return 'mb-16';
  }

  if (navigationView === 'asLabeledButtonList') {
    return 'mb-20';
  }

  return '';
}
