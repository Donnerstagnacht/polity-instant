import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUserMemberships } from '@/features/users/hooks/useUserMemberships'
import { useUserMembershipsFilters } from '@/features/users/hooks/useUserMembershipsFilters'
import { useUserData } from '@/features/users/hooks/useUserData'
import { GroupMembershipsTab } from '@/features/users/ui/GroupMembershipsTab'
import { EventParticipationsTab } from '@/features/users/ui/EventParticipationsTab'
import { AmendmentCollaborationsTab } from '@/features/users/ui/AmendmentCollaborationsTab'
import { BlogRelationsTab } from '@/features/users/ui/BlogRelationsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EntitySearchBar } from '@/components/ui/entity-search-bar'
import { Users, Calendar, FileEdit, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/_authed/user/$id/memberships')({
  component: UserMembershipsPage,
})

function UserMembershipsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useUserData(id)
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || ''

  const {
    memberships,
    participations,
    collaborations,
    blogRelations,
    leaveGroup,
    acceptGroupInvitation,
    declineGroupInvitation,
    withdrawGroupRequest,
    withdrawFromEvent,
    acceptEventInvitation,
    declineEventInvitation,
    withdrawEventRequest,
    leaveCollaboration,
    acceptCollaborationInvitation,
    declineCollaborationInvitation,
    withdrawCollaborationRequest,
    leaveBlog,
    acceptBlogInvitation,
    declineBlogInvitation,
    withdrawBlogRequest,
  } = useUserMemberships(id, userName)

  const {
    searchQuery,
    setSearchQuery,
    membershipsByStatus,
    participationsByStatus,
    collaborationsByStatus,
    blogRelationsByStatus,
    filteredMemberships,
    filteredParticipations,
    filteredCollaborations,
    filteredBlogRelations,
  } = useUserMembershipsFilters({ memberships, participations, collaborations, blogRelations })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Memberships</h1>
      <EntitySearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        placeholder="Search memberships..."
      />
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups ({filteredMemberships.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events ({filteredParticipations.length})
          </TabsTrigger>
          <TabsTrigger value="amendments" className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            Amendments ({filteredCollaborations.length})
          </TabsTrigger>
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs ({filteredBlogRelations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <GroupMembershipsTab
            membershipsByStatus={membershipsByStatus}
            onAcceptInvitation={acceptGroupInvitation}
            onDeclineInvitation={declineGroupInvitation}
            onLeave={(membershipId) => {
              const m = memberships.find((mem: any) => mem.id === membershipId)
              if (m) leaveGroup(membershipId, (m as any).group?.id || '')
            }}
            onWithdrawRequest={withdrawGroupRequest}
            onNavigate={(groupId) => navigate({ to: `/group/${groupId}` })}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventParticipationsTab
            participationsByStatus={participationsByStatus}
            onAcceptInvitation={acceptEventInvitation}
            onDeclineInvitation={declineEventInvitation}
            onLeave={(participationId) => {
              const p = participations.find((par: any) => par.id === participationId)
              if (p) withdrawFromEvent(participationId, (p as any).event?.id || '')
            }}
            onWithdrawRequest={withdrawEventRequest}
            onNavigate={(eventId) => navigate({ to: `/event/${eventId}` })}
          />
        </TabsContent>

        <TabsContent value="amendments">
          <AmendmentCollaborationsTab
            collaborationsByStatus={collaborationsByStatus}
            onAcceptInvitation={acceptCollaborationInvitation}
            onDeclineInvitation={declineCollaborationInvitation}
            onLeave={(collaborationId) => {
              const c = collaborations.find((col: any) => col.id === collaborationId)
              if (c) leaveCollaboration(collaborationId, (c as any).amendment?.id || '')
            }}
            onWithdrawRequest={withdrawCollaborationRequest}
            onNavigate={(amendmentId) => navigate({ to: `/amendment/${amendmentId}` })}
          />
        </TabsContent>

        <TabsContent value="blogs">
          <BlogRelationsTab
            blogRelationsByStatus={blogRelationsByStatus}
            onAcceptInvitation={acceptBlogInvitation}
            onDeclineInvitation={declineBlogInvitation}
            onLeave={leaveBlog}
            onWithdrawRequest={withdrawBlogRequest}
            onNavigate={(blogId) => navigate({ to: `/blog/${blogId}` })}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
