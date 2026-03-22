import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const votingPasswordQueries = {
  // Check if user has a voting password set (does not expose hash)
  userHasVotingPassword: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.voting_password
        .where('user_id', user_id)
        .one()
  ),
}
