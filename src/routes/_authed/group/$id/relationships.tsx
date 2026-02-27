import { useCallback, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useGroupNetwork } from '@/features/network/hooks/useGroupNetwork'
import { GroupRelationshipsManager } from '@/features/network/ui/GroupRelationshipsManager'

export const Route = createFileRoute('/_authed/group/$id/relationships')({
  component: GroupRelationshipsPage,
})

function GroupRelationshipsPage() {
  const { id } = Route.useParams()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Relationships</h1>
      <GroupRelationshipsManager groupId={id} />
    </div>
  )
}
