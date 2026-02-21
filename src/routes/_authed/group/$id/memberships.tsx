import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { MembershipTabs } from '@/features/groups/ui/MembershipTabs'
import { useGroupMemberships } from '@/features/groups/hooks/useGroupData'
import type { MembershipTab } from '@/features/groups/types/group.types'

export const Route = createFileRoute('/_authed/group/$id/memberships')({
  component: GroupMembershipsPage,
})

function GroupMembershipsPage() {
  const { id } = Route.useParams()
  const [activeTab, setActiveTab] = useState<MembershipTab>('memberships')
  const { activeMemberships, invitedMemberships, requestedMemberships } =
    useGroupMemberships(id)

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-3xl font-bold">Group Memberships</h1>
      <MembershipTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        membershipsContent={
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {activeMemberships.length} active, {invitedMemberships.length} invited,{' '}
              {requestedMemberships.length} requested
            </p>
            {activeMemberships.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="font-medium">{m.user?.name || m.user?.email || 'Unknown'}</span>
                <span className="text-sm text-muted-foreground">{m.role?.name || m.status}</span>
              </div>
            ))}
          </div>
        }
        rolesContent={<div className="text-muted-foreground">Roles management</div>}
        positionsContent={<div className="text-muted-foreground">Positions management</div>}
      />
    </div>
  )
}
