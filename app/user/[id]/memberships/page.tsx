'use client';

import { use } from 'react';
import { AuthGuard, OwnerOnlyGuard } from '@/features/auth';
import { useAuthStore } from '@/features/auth/auth';
import { useUserMemberships } from '@/features/user/hooks/useUserMemberships';
import { useUserMembershipsFilters } from '@/features/user/hooks/useUserMembershipsFilters';
import { Input } from '@/components/ui/input';
import { Search, Users, Calendar, FileEdit, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupMembershipsTab } from '@/features/user/ui/GroupMembershipsTab';
import { EventParticipationsTab } from '@/features/user/ui/EventParticipationsTab';
import { AmendmentCollaborationsTab } from '@/features/user/ui/AmendmentCollaborationsTab';
import { BlogRelationsTab } from '@/features/user/ui/BlogRelationsTab';

export default function MembershipsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();
  const router = useRouter();

  // Use the memberships hook
  const {
    memberships,
    participations,
    collaborations,
    blogRelations,
    isLoading,
    leaveGroup,
    withdrawFromEvent,
    leaveCollaboration,
    leaveBlog,
    acceptGroupInvitation,
    declineGroupInvitation,
    acceptEventInvitation,
    declineEventInvitation,
    acceptCollaborationInvitation,
    declineCollaborationInvitation,
    acceptBlogInvitation,
    declineBlogInvitation,
    withdrawGroupRequest,
    withdrawEventRequest,
    withdrawCollaborationRequest,
    withdrawBlogRequest,
  } = useUserMemberships(resolvedParams.id, authUser?.name);

  // Use the filters hook
  const {
    searchQuery,
    setSearchQuery,
    filteredMemberships,
    filteredParticipations,
    filteredCollaborations,
    filteredBlogRelations,
    membershipsByStatus,
    participationsByStatus,
    collaborationsByStatus,
    blogRelationsByStatus,
  } = useUserMembershipsFilters({
    memberships,
    participations,
    collaborations,
    blogRelations,
  });

  // Navigation handlers
  const handleNavigateToGroup = (groupId: string) => router.push(`/group/${groupId}`);
  const handleNavigateToEvent = (eventId: string) => router.push(`/event/${eventId}`);
  const handleNavigateToAmendment = (amendmentId: string) =>
    router.push(`/amendment/${amendmentId}`);
  const handleNavigateToBlog = (blogId: string) => router.push(`/blog/${blogId}`);

  return (
    <AuthGuard requireAuth={true}>
      <OwnerOnlyGuard targetUserId={resolvedParams.id}>
      <div className="container mx-auto max-w-7xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Memberships & Participation</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your group memberships, event participations, and amendment
            collaborations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
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

          {/* Groups Tab */}
          <TabsContent value="groups">
            <GroupMembershipsTab
              membershipsByStatus={membershipsByStatus}
              onAcceptInvitation={acceptGroupInvitation}
              onDeclineInvitation={declineGroupInvitation}
              onLeave={(id) => {
                const membership = memberships.find((m: any) => m.id === id);
                if (membership?.group?.id) {
                  leaveGroup(id, membership.group.id);
                }
              }}
              onWithdrawRequest={withdrawGroupRequest}
              onNavigate={handleNavigateToGroup}
            />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventParticipationsTab
              participationsByStatus={participationsByStatus}
              onAcceptInvitation={acceptEventInvitation}
              onDeclineInvitation={declineEventInvitation}
              onLeave={(id) => {
                const participation = participations.find((p: any) => p.id === id);
                if (participation?.event?.id) {
                  withdrawFromEvent(id, participation.event.id);
                }
              }}
              onWithdrawRequest={withdrawEventRequest}
              onNavigate={handleNavigateToEvent}
            />
          </TabsContent>

          {/* Amendments Tab */}
          <TabsContent value="amendments">
            <AmendmentCollaborationsTab
              collaborationsByStatus={collaborationsByStatus}
              onAcceptInvitation={acceptCollaborationInvitation}
              onDeclineInvitation={declineCollaborationInvitation}
              onLeave={(id) => {
                const collaboration = collaborations.find((c: any) => c.id === id);
                if (collaboration?.amendment?.id) {
                  leaveCollaboration(id, collaboration.amendment.id);
                }
              }}
              onWithdrawRequest={withdrawCollaborationRequest}
              onNavigate={handleNavigateToAmendment}
            />
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs">
            <BlogRelationsTab
              blogRelationsByStatus={blogRelationsByStatus}
              onAcceptInvitation={acceptBlogInvitation}
              onDeclineInvitation={declineBlogInvitation}
              onLeave={leaveBlog}
              onWithdrawRequest={withdrawBlogRequest}
              onNavigate={handleNavigateToBlog}
            />
          </TabsContent>
        </Tabs>
      </div>
      </OwnerOnlyGuard>
    </AuthGuard>
  );
}