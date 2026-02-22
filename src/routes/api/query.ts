import { createAPIFileRoute } from '@tanstack/react-start/api'
import { handleQueryRequest } from '@rocicorp/zero/server'
import { mustGetQuery } from '@rocicorp/zero'
import { queries } from '@/zero/queries'
import { schema } from '@/zero/schema'
import { getAuthFromRequest } from '@/server/zero-auth'

export const APIRoute = createAPIFileRoute('/api/query')({
  POST: async ({ request }) => {
    const ctx = await getAuthFromRequest(request)

    const result = await handleQueryRequest(
      (name, args) => {
        const query = mustGetQuery(queries, name)
        return query.fn({ args, ctx })
      },
      schema,
      request,
    )

    return Response.json(result)
  },
})
