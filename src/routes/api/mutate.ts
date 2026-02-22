import { createAPIFileRoute } from '@tanstack/react-start/api'
import { PushProcessor } from '@rocicorp/zero/server'
import { mutators } from '@/zero/mutators'
import { dbProvider } from '@/zero/db-provider'
import { getAuthFromRequest } from '@/server/zero-auth'

export const APIRoute = createAPIFileRoute('/api/mutate')({
  POST: async ({ request }) => {
    const ctx = await getAuthFromRequest(request)
    const push = new PushProcessor(dbProvider, ctx)
    const result = await push.process(mutators, request)

    return Response.json(result)
  },
})
