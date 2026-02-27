import type { ReactNode } from 'react'
import type { ContentType } from '@/features/timeline/constants/content-type-config'

/** A single step in a create form */
export interface CreateFormStep {
  /** i18n key for the step label shown in the progress indicator */
  label: string
  /** The content to render for this step */
  content: ReactNode
  /** Returns true if all required fields in this step are valid */
  isValid: () => boolean
  /** Whether this step is optional (skippable) */
  optional?: boolean
}

/** Configuration for a create form */
export interface CreateFormConfig {
  /** Entity type for color coding and review card gradient */
  entityType: ContentType
  /** Array of form steps (last one is typically the review step) */
  steps: CreateFormStep[]
  /** Handler called when the user clicks "Create" on the review step */
  onSubmit: () => Promise<void>
  /** Whether the form is currently submitting */
  isSubmitting: boolean
  /** i18n key for the form title */
  title: string
}

/** The three form display styles */
export type FormStyle = 'one_page' | 'carousel' | 'auto'

/** The resolved display mode (after resolving 'auto') */
export type ResolvedFormMode = 'one_page' | 'carousel'
