import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { usePreferenceState } from './usePreferenceState'
import type { CreateFormStyle, Theme, PreferenceLanguage, PreferenceNavigationView } from './schema'

/**
 * Action hook for user preference mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function usePreferenceActions() {
  const zero = useZero()
  const { t } = useTranslation()
  const { preference } = usePreferenceState()

  const upsertPreference = useCallback(
    async (fields: {
      create_form_style?: CreateFormStyle
      theme?: Theme
      language?: PreferenceLanguage
      navigation_view?: PreferenceNavigationView
    }) => {
      if (preference) {
        await zero.mutate(
          mutators.preferences.update({
            id: preference.id,
            ...fields,
          })
        )
      } else {
        await zero.mutate(
          mutators.preferences.create({
            id: crypto.randomUUID(),
            create_form_style: fields.create_form_style ?? 'carousel',
            theme: fields.theme ?? 'system',
            language: fields.language ?? 'en',
            navigation_view: fields.navigation_view ?? 'asButtonList',
          })
        )
      }
    },
    [zero, preference]
  )

  const updateFormStyle = useCallback(
    async (style: CreateFormStyle) => {
      try {
        await upsertPreference({ create_form_style: style })
        toast.success(t('pages.create.preferences.formStyleUpdated'))
      } catch (error) {
        console.error('Failed to update form style:', error)
        toast.error(t('pages.create.preferences.formStyleUpdateFailed'))
        throw error
      }
    },
    [upsertPreference, t]
  )

  const updateTheme = useCallback(
    async (theme: Theme) => {
      try {
        await upsertPreference({ theme })
      } catch (error) {
        console.error('Failed to update theme preference:', error)
      }
    },
    [upsertPreference]
  )

  const updateLanguage = useCallback(
    async (language: PreferenceLanguage) => {
      try {
        await upsertPreference({ language })
      } catch (error) {
        console.error('Failed to update language preference:', error)
      }
    },
    [upsertPreference]
  )

  const updateNavigationView = useCallback(
    async (navigationView: PreferenceNavigationView) => {
      try {
        await upsertPreference({ navigation_view: navigationView })
      } catch (error) {
        console.error('Failed to update navigation view preference:', error)
      }
    },
    [upsertPreference]
  )

  return {
    updateFormStyle,
    updateTheme,
    updateLanguage,
    updateNavigationView,
  }
}
