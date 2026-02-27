import { table, string, number } from '@rocicorp/zero'

export const userPreference = table('user_preference')
  .columns({
    id: string(),
    user_id: string(),
    create_form_style: string(),
    theme: string(),
    language: string(),
    navigation_view: string(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
