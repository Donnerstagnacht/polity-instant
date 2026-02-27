import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const preferenceQueries = {
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.user_preference.where('user_id', userID).one()
  ),
}
