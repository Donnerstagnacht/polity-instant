import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AmendmentGroups } from '@/features/groups/ui/AmendmentGroups'
import { useGroupAmendments } from '@/features/groups/hooks/useGroupAmendments'
import { useGroupData } from '@/features/groups/hooks/useGroupData'

export const Route = createFileRoute('/_authed/group/$id/amendments')({
  component: GroupAmendmentsPage,
})

function GroupAmendmentsPage() {
  const { id } = Route.useParams()
  const { amendments } = useGroupAmendments(id)
  const { group } = useGroupData(id) as any

  const groupedAmendments = useMemo(() => {
    const passed: any[] = []
    const underReview: any[] = []
    const drafting: any[] = []
    const rejected: any[] = []

    amendments.forEach((a: any) => {
      const status = (a.status || '').toLowerCase()
      if (status === 'passed') passed.push(a)
      else if (status === 'rejected') rejected.push(a)
      else if (
        status === 'internal_voting' ||
        status === 'event_voting' ||
        status === 'internal_suggesting' ||
        status === 'event_suggesting' ||
        status === 'under review'
      )
        underReview.push(a)
      else drafting.push(a)
    })

    return { passed, underReview, drafting, rejected }
  }, [amendments])

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-3xl font-bold">Amendments</h1>
      <AmendmentGroups
        groupedAmendments={groupedAmendments}
        groupName={group?.name}
        groupId={id}
      />
    </div>
  )
}
