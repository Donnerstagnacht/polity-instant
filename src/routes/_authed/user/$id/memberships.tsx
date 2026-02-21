import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MembershipStatusTable } from '@/features/users/ui/MembershipStatusTable'
import { useUserMemberships } from '@/features/users/hooks/useUserMemberships'
import { Users } from 'lucide-react'

export const Route = createFileRoute('/_authed/user/$id/memberships')({
  component: UserMembershipsPage,
})

function UserMembershipsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const {
    memberships,
    leaveGroup,
    acceptGroupInvitation,
    declineGroupInvitation,
    withdrawGroupRequest,
  } = useUserMemberships(id)

  const invited = memberships.filter((m: any) => m.status === 'invited') as any[]
  const active = memberships.filter(
    (m: any) => m.status === 'member' || m.status === 'admin'
  ) as any[]
  const requested = memberships.filter((m: any) => m.status === 'requested') as any[]

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-3xl font-bold">Memberships</h1>
      <MembershipStatusTable
        title="Group Invitations"
        description="Groups you've been invited to join"
        icon={Users}
        items={invited}
        statusType="invited"
        entityKey="group"
        fallbackIcon={Users}
        onAccept={acceptGroupInvitation}
        onDecline={declineGroupInvitation}
        onNavigate={(groupId) => navigate({ to: `/group/${groupId}` })}
      />
      <MembershipStatusTable
        title="Active Groups"
        description="Groups you are a member of"
        icon={Users}
        items={active}
        statusType="active"
        entityKey="group"
        fallbackIcon={Users}
        onLeave={(membershipId) => {
          const m = memberships.find((mem: any) => mem.id === membershipId)
          if (m) leaveGroup(membershipId, (m as any).group?.id || '')
        }}
        onNavigate={(groupId) => navigate({ to: `/group/${groupId}` })}
      />
      <MembershipStatusTable
        title="Pending Requests"
        description="Groups you've requested to join"
        icon={Users}
        items={requested}
        statusType="requested"
        entityKey="group"
        fallbackIcon={Users}
        onWithdraw={withdrawGroupRequest}
        onNavigate={(groupId) => navigate({ to: `/group/${groupId}` })}
      />
    </div>
  )
}
