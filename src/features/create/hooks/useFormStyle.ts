import { useMemo } from 'react'
import { usePreferenceState } from '@/zero/preferences/usePreferenceState'
import { useIsMobile } from '@/features/timeline/hooks/useIsMobile'
import { BREAKPOINTS } from '@/features/timeline/hooks/useIsMobile'
import type { ResolvedFormMode } from '../types/create-form.types'

/**
 * Resolves the user's form style preference to a concrete display mode.
 * - 'one_page' / 'carousel' → used directly
 * - 'auto' → desktop (≥lg) = one_page, mobile/tablet = carousel
 */
export function useFormStyle(): { formMode: ResolvedFormMode; isLoading: boolean } {
  const { createFormStyle, isLoading } = usePreferenceState()
  const isMobileOrTablet = useIsMobile(BREAKPOINTS.lg)

  const formMode = useMemo<ResolvedFormMode>(() => {
    if (createFormStyle === 'auto') {
      return isMobileOrTablet ? 'carousel' : 'one_page'
    }
    return createFormStyle === 'one_page' ? 'one_page' : 'carousel'
  }, [createFormStyle, isMobileOrTablet])

  return { formMode, isLoading }
}
