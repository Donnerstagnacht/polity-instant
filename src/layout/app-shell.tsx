import { type ReactNode, useState, useEffect, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Toaster } from '@/features/shared/ui/ui/sonner.tsx';
import { DynamicNavigation } from '@/features/navigation/dynamic-navigation.tsx';
import { NavigationCommandDialog } from '@/features/navigation/command-dialog.tsx';
import { useScreenResponsiveDetector, useScreenStore } from '@/features/shared/global-state/screen.store.tsx';
import { useNavigationStore } from '@/features/navigation/state/navigation.store.tsx';
import { useThemeInitializer } from '@/features/shared/global-state/theme.store.tsx';
import { I18nSyncProvider } from '@/i18n/i18n-sync-provider.tsx';
import { PWAInstallPrompt } from '@/features/pwa/pwa-install-prompt.tsx';
import type {
  NavigationItem,
  NavigationType,
  NavigationView,
} from '@/features/navigation/types/navigation.types.tsx';
import { useNavigation } from '@/features/navigation/state/useNavigation.tsx';
import { useAuth } from '@/providers/auth-provider.tsx';
import { useZeroReady } from '@/providers/zero-provider.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { createNavItemsUnauthenticated } from '@/features/navigation/nav-items/nav-items-unauthenticated.tsx';
import { usePreferenceSync } from '@/zero/preferences/usePreferenceSync.ts';

export function AppShell({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="bg-background min-h-screen">{children}</div>;
  }

  return <AppShellInner>{children}</AppShellInner>;
}

function AppShellInner({ children }: { children: ReactNode }) {
  useThemeInitializer({ defaultTheme: 'system', storageKey: 'theme' });
  useScreenResponsiveDetector();

  const { user } = useAuth();
  const zeroReady = useZeroReady();

  if (user && zeroReady) {
    return <AuthenticatedShell>{children}</AuthenticatedShell>;
  }

  return <UnauthenticatedShell>{children}</UnauthenticatedShell>;
}

function UnauthenticatedShell({ children }: { children: ReactNode }) {
  const { screenType, isMobileScreen } = useScreenStore();
  const { navigationType, navigationView } = useNavigationStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigationItems = useMemo(() => createNavItemsUnauthenticated(navigate, t), [navigate, t]);
  const isMobile = screenType === 'mobile' || (screenType === 'automatic' && isMobileScreen);

  return (
    <I18nSyncProvider>
      <div className="bg-background min-h-screen">
        {['primary', 'combined'].includes(navigationType) && (
          <DynamicNavigation
            navigationType="primary"
            navigationView={navigationView}
            navigationItems={navigationItems}
            screenType={screenType}
          />
        )}
        <main
          className={`transition-all duration-300 ${getMarginClasses({
            isMobile,
            navigationView,
            navigationType,
            secondaryNavItems: null,
          })}`}
        >
          {children}
        </main>

        <NavigationCommandDialog primaryNavItems={navigationItems} secondaryNavItems={null} />

        <Toaster richColors position="top-right" />
        <PWAInstallPrompt />
      </div>
    </I18nSyncProvider>
  );
}

function AuthenticatedShell({ children }: { children: ReactNode }) {
  usePreferenceSync();
  const { screenType, isMobileScreen } = useScreenStore();
  const { navigationType, navigationView } = useNavigationStore();
  const { primaryNavItems, secondaryNavItems } = useNavigation();
  const pathname = useRouterState({ select: s => s.location.pathname });

  const isMobile = screenType === 'mobile' || (screenType === 'automatic' && isMobileScreen);
  const isFullWidth = pathname === '/home' || pathname === '/search';

  return (
    <I18nSyncProvider>
      <div className="bg-background min-h-screen">
        {['primary', 'combined'].includes(navigationType) && (
          <DynamicNavigation
            navigationType="primary"
            navigationView={navigationView}
            navigationItems={primaryNavItems}
            screenType={screenType}
          />
        )}
        {secondaryNavItems && ['secondary', 'combined'].includes(navigationType) && (
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
            navigationView,
            navigationType,
            secondaryNavItems,
          })}`}
        >
          <div className={`mx-auto px-4 py-6 ${isFullWidth ? '' : 'max-w-7xl'}`}>{children}</div>
        </main>

        <NavigationCommandDialog
          primaryNavItems={primaryNavItems}
          secondaryNavItems={secondaryNavItems}
        />

        <Toaster richColors position="top-right" />
        <PWAInstallPrompt />
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
  const isSecondaryNavVisible =
    secondaryNavItems &&
    secondaryNavItems.length > 0 &&
    ['secondary', 'combined'].includes(navigationType);

  const marginLeft = getMarginLeftForPrimaryDesktop({ isMobile, navigationView });
  const marginRight = getMarginRightForSecondaryDesktop({
    isMobile,
    state: navigationView,
    isSecondaryNavVisible,
  });
  const marginTop = getMarginTopForSecondaryMobile({
    isMobile,
    navigationView,
    isSecondaryNavVisible,
  });
  const marginBottom = getMarginBottomForPrimaryMobile({ isMobile, navigationView });

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
  if (navigationView === 'asButtonList') return 'mt-16';
  if (navigationView === 'asLabeledButtonList') return 'mt-20';
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
  if (navigationView === 'asButtonList') return 'mb-16';
  if (navigationView === 'asLabeledButtonList') return 'mb-20';
  return '';
}
