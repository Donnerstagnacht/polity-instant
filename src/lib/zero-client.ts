import { Zero, type ZeroOptions } from '@rocicorp/zero'
import { schema } from '@/zero/schema'
import { mutators } from '@/zero/mutators'

export function createZeroClient(userID: string, email: string) {
  const opts: ZeroOptions = {
    schema,
    mutators,
    userID,
    context: { userID, email },
    cacheURL: import.meta.env.VITE_ZERO_CACHE_URL!,
    queryURL: `${import.meta.env.VITE_APP_URL}/api/zero/query`,
    mutateURL: `${import.meta.env.VITE_APP_URL}/api/zero/mutate`,
  }

  return new Zero(opts)
}
