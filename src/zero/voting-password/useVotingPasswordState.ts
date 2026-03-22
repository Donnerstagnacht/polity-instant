import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

export function useVotingPasswordState(options: { userId?: string } = {}) {
  const { userId } = options

  const [votingPassword, votingPasswordResult] = useQuery(
    userId ? queries.votingPassword.userHasVotingPassword({ user_id: userId }) : undefined
  )

  const hasVotingPassword = useMemo(() => !!votingPassword, [votingPassword])

  return {
    hasVotingPassword,
    isLoading: userId ? votingPasswordResult.type === 'unknown' : false,
  }
}
