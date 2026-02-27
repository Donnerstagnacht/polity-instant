import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'
import type { CreateFormStyle, Theme, PreferenceLanguage, PreferenceNavigationView } from './schema'

/**
 * Reactive state hook for user preferences.
 * Returns the user's persisted preferences and loading state.
 */
export function usePreferenceState() {
  const [preference, preferenceResult] = useQuery(
    queries.preferences.byUser({})
  )

  const isLoading = preferenceResult.type === 'unknown'

  const createFormStyle: CreateFormStyle =
    (preference?.create_form_style as CreateFormStyle) ?? 'carousel'

  const theme: Theme =
    (preference?.theme as Theme) ?? 'system'

  const language: PreferenceLanguage =
    (preference?.language as PreferenceLanguage) ?? 'en'

  const navigationView: PreferenceNavigationView =
    (preference?.navigation_view as PreferenceNavigationView) ?? 'asButtonList'

  return {
    preference,
    createFormStyle,
    theme,
    language,
    navigationView,
    isLoading,
  }
}
