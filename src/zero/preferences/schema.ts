import { z } from 'zod'
import { timestampSchema } from '../shared/helpers'

// ============================================
// User Preference
// ============================================
export const createFormStyleEnum = z.enum(['one_page', 'carousel', 'auto'])
export const themeEnum = z.enum(['dark', 'light', 'system'])
export const languageEnum = z.enum(['en', 'de'])
export const navigationViewEnum = z.enum(['asButton', 'asButtonList', 'asLabeledButtonList'])

const baseUserPreferenceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  create_form_style: createFormStyleEnum,
  theme: themeEnum,
  language: languageEnum,
  navigation_view: navigationViewEnum,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectUserPreferenceSchema = baseUserPreferenceSchema

export const createUserPreferenceSchema = baseUserPreferenceSchema
  .omit({ id: true, created_at: true, updated_at: true, user_id: true })
  .extend({ id: z.string() })

export const updateUserPreferenceSchema = z.object({
  id: z.string(),
  create_form_style: createFormStyleEnum.optional(),
  theme: themeEnum.optional(),
  language: languageEnum.optional(),
  navigation_view: navigationViewEnum.optional(),
})

// ============================================
// Inferred Types
// ============================================
export type UserPreference = z.infer<typeof selectUserPreferenceSchema>
export type CreateFormStyle = z.infer<typeof createFormStyleEnum>
export type Theme = z.infer<typeof themeEnum>
export type PreferenceLanguage = z.infer<typeof languageEnum>
export type PreferenceNavigationView = z.infer<typeof navigationViewEnum>
