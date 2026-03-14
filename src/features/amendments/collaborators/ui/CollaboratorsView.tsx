/**
 * Main view for managing amendment collaborators
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { EntitySearchBar } from '@/features/shared/ui/ui/entity-search-bar';
import { useCollaborators } from '../hooks/useCollaborators';
import { useCollaboratorMutations } from '../hooks/useCollaboratorMutations';
import { InviteDialog } from './InviteDialog.tsx';
import { PendingRequestsCard } from './PendingRequestsCard.tsx';
import { ActiveCollaboratorsCard } from './ActiveCollaboratorsCard.tsx';
import { PendingInvitationsCard } from './PendingInvitationsCard.tsx';
import { RolesManagementCard } from './RolesManagementCard.tsx';

interface CollaboratorsViewProps {
  amendmentId: string;
  amendmentTitle: string;
  currentUserId: string | undefined;
}

export function CollaboratorsView({
  amendmentId,
  amendmentTitle,
  currentUserId,
}: CollaboratorsViewProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('collaborators');

  const {
    roles,
    pendingRequests,
    activeCollaborators,
    pendingInvitations,
  } = useCollaborators(amendmentId, currentUserId, searchQuery);

  const mutations = useCollaboratorMutations();

  const navigateToUser = (userId: string) => {
    navigate({ to: `/user/${userId}` });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Amendment Collaborators</h1>
        <p className="mt-2 text-muted-foreground">
          {amendmentTitle} - Manage collaborators, requests, and invitations
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <EntitySearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          placeholder="Search collaborators by name, role, or status..."
        />
      </div>

      {/* Tabs for Collaborators and Roles */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="space-y-6">
          {/* Invite Section */}
          <div>
            <InviteDialog 
              amendmentId={amendmentId} 
              existingCollaborators={activeCollaborators}
              roles={roles}
              onInviteUsers={mutations.inviteUsers}
            />
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <PendingRequestsCard
              requests={pendingRequests}
              onNavigateToUser={navigateToUser}
              onApproveRequest={mutations.approveRequest}
              onRejectRequest={mutations.rejectRequest}
            />
          )}

          {/* Active Collaborators */}
          <ActiveCollaboratorsCard
            collaborators={activeCollaborators}
            roles={roles}
            onNavigateToUser={navigateToUser}
            onChangeRole={mutations.changeCollaboratorRole}
            onPromoteToAdmin={mutations.promoteToAdmin}
            onDemoteToMember={mutations.demoteToMember}
            onRemoveCollaborator={mutations.removeCollaborator}
          />

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <PendingInvitationsCard
              invitations={pendingInvitations}
              onNavigateToUser={navigateToUser}
              onWithdrawInvitation={mutations.withdrawInvitation}
            />
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <RolesManagementCard
            amendmentId={amendmentId}
            roles={roles}
            onCreateRole={mutations.createRole}
            onDeleteRole={mutations.deleteRole}
            onToggleActionRight={mutations.toggleActionRight}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
