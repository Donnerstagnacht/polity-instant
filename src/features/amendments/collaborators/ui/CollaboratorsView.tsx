/**
 * Main view for managing amendment collaborators
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { useCollaborators } from '../hooks/useCollaborators';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('collaborators');

  const {
    roles,
    pendingRequests,
    activeCollaborators,
    pendingInvitations,
  } = useCollaborators(amendmentId, currentUserId, searchQuery);

  const navigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="container mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Amendment Collaborators</h1>
        <p className="mt-2 text-muted-foreground">
          {amendmentTitle} - Manage collaborators, requests, and invitations
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search collaborators by name, role, or status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
            />
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <PendingRequestsCard
              requests={pendingRequests}
              onNavigateToUser={navigateToUser}
            />
          )}

          {/* Active Collaborators */}
          <ActiveCollaboratorsCard
            collaborators={activeCollaborators}
            roles={roles}
            onNavigateToUser={navigateToUser}
          />

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <PendingInvitationsCard
              invitations={pendingInvitations}
              onNavigateToUser={navigateToUser}
            />
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <RolesManagementCard amendmentId={amendmentId} roles={roles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
