import { type ReactNode, useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { DynamicNavigation } from '@/navigation/dynamic-navigation'
import { NavigationCommandDialog } from '@/navigation/command-dialog'
import { useScreenResponsiveDetector, useScreenStore } from '@/global-state/screen.store'
import { useNavigationStore } from '@/navigation/state/navigation.store'
import { useThemeInitializer } from '@/global-state/theme.store'
import { I18nSyncProvider } from '@/i18n/i18n-sync-provider'
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import type { NavigationItem, NavigationType, NavigationView } from '@/navigation/types/navigation.types'
import { useNavigation } from '@/navigation/state/useNavigation'
import { useAuth } from '@/providers/auth-provider'
import { useZeroReady } from '@/providers/zero-provider'
import { useTranslation } from '@/hooks/use-translation'
import { createNavItemsUnauthenticated } from '@/navigation/nav-items/nav-items-unauthenticated'

export function AppShell({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  if (!isClient) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return <AppShellInner>{children}</AppShellInner>
}

function AppShellInner({ children }: { children: ReactNode }) {
  useThemeInitializer({ defaultTheme: 'system', storageKey: 'theme' })
  useScreenResponsiveDetector()

  const { user } = useAuth()
  const zeroReady = useZeroReady()

  if (user && zeroReady) {
    return <AuthenticatedShell>{children}</AuthenticatedShell>
  }

  return <UnauthenticatedShell>{children}</UnauthenticatedShell>
}

function UnauthenticatedShell({ children }: { children: ReactNode }) {
  const { screenType, isMobileScreen } = useScreenStore()
  const { navigationType, navigationView } = useNavigationStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const navigationItems = useMemo(
    () => createNavItemsUnauthenticated(navigate, t),
    [navigate, t]
  )
  const isMobile = screenType === 'mobile' || (screenType === 'automatic' && isMobileScreen)

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

        <NavigationCommandDialog
          primaryNavItems={navigationItems}
          secondaryNavItems={null}
        />

        <Toaster richColors position="top-right" />
        <PWAInstallPrompt />
      </div>
    </I18nSyncProvider>
  )
}

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const { screenType, isMobileScreen } = useScreenStore()
  const { navigationType, navigationView } = useNavigationStore()
  const { primaryNavItems, secondaryNavItems } = useNavigation()

  const isMobile = screenType === 'mobile' || (screenType === 'automatic' && isMobileScreen)

  return (
    <I18nSyncProvider>
      <div className="min-h-screen bg-background">
        {['primary', 'combined'].includes(navigationType) && (
          <DynamicNavigation
            navigationType="primary"
            navigationView={navigationView}
            navigationItems={primaryNavItems}
            screenType={screenType}
          />
        )}
        {secondaryNavItems &&
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
            navigationView,
            navigationType,
            secondaryNavItems,
          })}`}
        >
          {children}
        </main>

        <NavigationCommandDialog
          primaryNavItems={primaryNavItems}
          secondaryNavItems={secondaryNavItems}
        />

        <Toaster richColors position="top-right" />
        <PWAInstallPrompt />
      </div>
    </I18nSyncProvider>
  )
}

function getMarginClasses({
  isMobile,
  navigationView,
  navigationType,
  secondaryNavItems,
}: {
  isMobile: boolean
  navigationView: NavigationView
  navigationType: NavigationType
  secondaryNavItems: NavigationItem[] | null
}) {
  const isSecondaryNavVisible =
    secondaryNavItems &&
    secondaryNavItems.length > 0 &&
    ['secondary', 'combined'].includes(navigationType)

  const marginLeft = getMarginLeftForPrimaryDesktop({ isMobile, navigationView })
  const marginRight = getMarginRightForSecondaryDesktop({
    isMobile,
    state: navigationView,
    isSecondaryNavVisible,
  })
  const marginTop = getMarginTopForSecondaryMobile({
    isMobile,
    navigationView,
    isSecondaryNavVisible,
  })
  const marginBottom = getMarginBottomForPrimaryMobile({ isMobile, navigationView })

  return [marginLeft, marginRight, marginTop, marginBottom].filter(Boolean).join(' ')
}

function getMarginLeftForPrimaryDesktop({
  isMobile,
  navigationView,
}: {
  isMobile: boolean
  navigationView: NavigationView
}): string {
  if (isMobile) return ''
  if (navigationView === 'asButton') return ''
  if (navigationView === 'asButtonList') return 'ml-16'
  if (navigationView === 'asLabeledButtonList') return 'ml-64'
  return ''
}

function getMarginRightForSecondaryDesktop({
  isMobile,
  state,
  isSecondaryNavVisible,
}: {
  isMobile: boolean
  state: NavigationView
  isSecondaryNavVisible: boolean | null
}): string {
  if (isMobile) return ''
  if (state === 'asButton') return ''
  if (state === 'asButtonList' && isSecondaryNavVisible) return 'mr-16'
  if (state === 'asLabeledButtonList' && isSecondaryNavVisible) return 'mr-64'
  return ''
}

function getMarginTopForSecondaryMobile({
  isMobile,
  navigationView,
  isSecondaryNavVisible,
}: {
  isMobile: boolean
  navigationView: NavigationView
  isSecondaryNavVisible: boolean | null
}): string {
  if (!isMobile || !isSecondaryNavVisible) return ''
  if (navigationView === 'asButtonList') return 'mt-16'
  if (navigationView === 'asLabeledButtonList') return 'mt-20'
  return ''
}

function getMarginBottomForPrimaryMobile({
  isMobile,
  navigationView,
}: {
  isMobile: boolean
  navigationView: NavigationView
}): string {
  if (!isMobile) return ''
  if (navigationView === 'asButtonList') return 'mb-16'
  if (navigationView === 'asLabeledButtonList') return 'mb-20'
  return ''
}
