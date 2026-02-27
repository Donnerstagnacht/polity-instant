import { useCallback, useEffect, useRef } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { usePreferenceState } from './usePreferenceState'
import { mutators } from '../mutators'
import { useThemeStore } from '@/global-state/theme.store'
import { useLanguageStore } from '@/global-state/language.store'
import { useNavigationStore } from '@/navigation/state/navigation.store'
import type { ThemeType } from '@/global-state/theme.store'
import type { Language } from '@/global-state/language.store'
import type { NavigationView } from '@/navigation/types/navigation.types'

/**
 * Bidirectional sync between persisted DB preferences and Zustand stores.
 * Must be called inside ZeroProvider (authenticated shell only).
 *
 * 1. On initial load: DB → Zustand (restores preferences)
 * 2. On store changes: Zustand → DB (persists preferences)
 */
export function usePreferenceSync() {
  const zero = useZero()
  const { preference, isLoading } = usePreferenceState()
  const hasSynced = useRef(false)
  const preferenceRef = useRef(preference)
  preferenceRef.current = preference

  const setTheme = useThemeStore(state => state.setTheme)
  const theme = useThemeStore(state => state.theme)

  const setLanguage = useLanguageStore(state => state.setLanguage)
  const language = useLanguageStore(state => state.language)

  const setNavigationView = useNavigationStore(state => state.setNavigationView)
  const navigationView = useNavigationStore(state => state.navigationView)

  // Track previous values to avoid writing back what we just loaded
  const prevTheme = useRef(theme)
  const prevLanguage = useRef(language)
  const prevNavigationView = useRef(navigationView)

  const persistField = useCallback(
    (fields: Record<string, string>) => {
      const pref = preferenceRef.current
      if (!pref) {
        zero.mutate(
          mutators.preferences.create({
            id: crypto.randomUUID(),
            create_form_style: 'carousel',
            theme: 'system',
            language: 'en',
            navigation_view: 'asButtonList',
            ...fields,
          })
        )
      } else {
        zero.mutate(
          mutators.preferences.update({
            id: pref.id,
            ...fields,
          })
        )
      }
    },
    [zero]
  )

  // DB → Zustand: restore preferences on first load
  useEffect(() => {
    if (isLoading || hasSynced.current || !preference) return

    hasSynced.current = true

    // Apply DB values to Zustand stores and update prev refs
    // so the Zustand→DB effects don't write them back
    if (preference.theme) {
      const dbTheme = preference.theme as ThemeType
      prevTheme.current = dbTheme
      setTheme(dbTheme)
    }

    if (preference.language) {
      const dbLang = preference.language as Language
      prevLanguage.current = dbLang
      setLanguage(dbLang)
    }

    if (preference.navigation_view) {
      const dbNav = preference.navigation_view as NavigationView
      prevNavigationView.current = dbNav
      setNavigationView(dbNav)
    }
  }, [preference, isLoading, setTheme, setLanguage, setNavigationView])

  // Zustand → DB: persist theme changes
  useEffect(() => {
    if (!hasSynced.current) return
    if (theme === prevTheme.current) return
    prevTheme.current = theme
    persistField({ theme })
  }, [theme, persistField])

  // Zustand → DB: persist language changes
  useEffect(() => {
    if (!hasSynced.current) return
    if (language === prevLanguage.current) return
    prevLanguage.current = language
    persistField({ language })
  }, [language, persistField])

  // Zustand → DB: persist navigation view changes
  useEffect(() => {
    if (!hasSynced.current) return
    if (navigationView === prevNavigationView.current) return
    prevNavigationView.current = navigationView
    persistField({ navigation_view: navigationView })
  }, [navigationView, persistField])
}
