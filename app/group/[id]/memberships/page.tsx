'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { useAuthStore } from '@/features/auth/auth';
import { useGroupData, useGroupMemberships, useGroupRoles, useUserSearch } from '@/features/groups/hooks/useGroupData';
import { useGroupMutations } from '@/features/groups/hooks/useGroupMutations';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { useMembershipSearch } from '@/features/groups/hooks/useMembershipSearch';
import { useRoleManagement } from '@/features/groups/hooks/useRoleManagement';
import { PendingRequestsTable } from '@/features/groups/ui/PendingRequestsTable';
import { ActiveMembersTable } from '@/features/groups/ui/ActiveMembersTable';
import { PendingInvitationsTable } from '@/features/groups/ui/PendingInvitationsTable';
import { InviteMembersDialog } from '@/features/groups/ui/InviteMembersDialog';
import { AddRoleDialog } from '@/features/groups/ui/AddRoleDialog';
import { RolesPermissionsTable } from '@/features/groups/ui/RolesPermissionsTable';
import { MembershipTabs } from '@/features/groups/ui/MembershipTabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { MembershipTab } from '@/features/groups/types/group.types';

export default function GroupMembershipsManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user: authUser } = useAuthStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<MembershipTab>('memberships');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  // Data hooks
  const { group } = useGroupData(resolvedParams.id);
  const { memberships } = useGroupMemberships(resolvedParams.id);
  const { roles } = useGroupRoles(resolvedParams.id);
  const { users: searchedUsers, isLoading: isLoadingUsers } = useUserSearch(inviteSearchQuery, memberships);
  const { isAdmin } = useGroupMembership(resolvedParams.id);

  // Business logic hooks
  const groupMutations = useGroupMutations(resolvedParams.id);
  const roleManagement = useRoleManagement(resolvedParams.id);
  const { pendingRequests, activeMembers, pendingInvitations } = useMembershipSearch(
    memberships,
    searchQuery
  );

  // Handlers
  const navigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      await groupMutations.inviteUsers(
        selectedUsers,
        undefined,
        authUser?.id,
        authUser?.name,
        group?.name
      );

      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } finally {
      setIsInviting(false);
    }
  };

  const handleApproveRequest = async (membershipId: string) => {
    if (!isAdmin) return;

    const membership = memberships.find((m) => m.id === membershipId);
    const userId = membership?.user?.id;
    if (!userId) return;

    await groupMutations.approveMembership(
      membershipId,
      userId,
      group?.conversation?.id,
      authUser?.id,
      authUser?.name
    );
  };

  const handleRejectRequest = async (membershipId: string) => {
    if (!isAdmin) return;

    const membership = memberships.find((m) => m.id === membershipId);
    const userId = membership?.user?.id;
    if (!userId) return;

    await groupMutations.rejectMembership(
      membershipId,
      userId,
      authUser?.id,
      authUser?.name
    );
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!isAdmin) return;

    const membership = memberships.find((m) => m.id === membershipId);
    const userId = membership?.user?.id;
    if (!userId) return;

    await groupMutations.removeMember(
      membershipId,
      userId,
      group?.conversation?.id,
      authUser?.id,
      authUser?.name
    );
  };

  const handleChangeRole = async (membershipId: string, newRoleId: string) => {
    if (!isAdmin) return;

    const membership = memberships.find((m) => m.id === membershipId);
    const userId = membership?.user?.id;
    if (!userId) return;

    await groupMutations.changeMemberRole(
      membershipId,
      newRoleId,
      userId,
      authUser?.id,
      authUser?.name
    );
  };

  const handlePromoteToAdmin = async (membershipId: string) => {
    if (!isAdmin) return;
    const boardMemberRole = roles.find((r) => r.name === 'Board Member');
    if (boardMemberRole) {
      await groupMutations.promoteToAdmin(membershipId, boardMemberRole.id);
    }
  };

  const handleDemoteToMember = async (membershipId: string) => {
    if (!isAdmin) return;
    await groupMutations.demoteToMember(membershipId);
  };

  const handleAddRole = async () => {
    const result = await roleManagement.addRole(newRoleName, newRoleDescription);
    if (result.success) {
      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    await roleManagement.removeRole(roleId);
  };

  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHasRight: boolean
  ) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    await roleManagement.toggleActionRight(
      roleId,
      resource,
      action,
      currentlyHasRight,
      role.actionRights || []
    );
  };

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="groupMemberships"
        context={{ groupId: resolvedParams.id }}
      >
        <div className="container mx-auto max-w-7xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Manage Group Memberships</h1>
            <p className="mt-2 text-muted-foreground">
              {group?.name || 'Group'} - Manage members, requests, and invitations
            </p>
          </div>

          {/* Search Bar and Invite Button */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, role, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <InviteMembersDialog
              isOpen={inviteDialogOpen}
              onOpenChange={setInviteDialogOpen}
              searchQuery={inviteSearchQuery}
              onSearchQueryChange={setInviteSearchQuery}
              users={searchedUsers}
              selectedUsers={selectedUsers}
              onToggleUser={toggleUserSelection}
              onInvite={handleInviteUsers}
              isLoading={isLoadingUsers}
              isInviting={isInviting}
            />
          </div>

          {/* Tabs */}
          <MembershipTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            membershipsContent={
              <>
                <PendingRequestsTable
                  requests={pendingRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onNavigateToUser={navigateToUser}
                />
                <ActiveMembersTable
                  members={activeMembers}
                  roles={roles}
                  onChangeRole={handleChangeRole}
                  onPromote={handlePromoteToAdmin}
                  onDemote={handleDemoteToMember}
                  onRemove={handleRemoveMember}
                  onNavigateToUser={navigateToUser}
                />
                <PendingInvitationsTable
                  invitations={pendingInvitations}
                  onWithdraw={handleRemoveMember}
                  onNavigateToUser={navigateToUser}
                />
              </>
            }
            rolesContent={
              <RolesPermissionsTable
                roles={roles}
                onTogglePermission={handleToggleActionRight}
                onRemoveRole={handleRemoveRole}
                addRoleButton={
                  <AddRoleDialog
                    isOpen={addRoleDialogOpen}
                    onOpenChange={setAddRoleDialogOpen}
                    roleName={newRoleName}
                    onRoleNameChange={setNewRoleName}
                    roleDescription={newRoleDescription}
                    onRoleDescriptionChange={setNewRoleDescription}
                    onAdd={handleAddRole}
                  />
                }
              />
            }
          />
        </div>
      </PermissionGuard>
    </AuthGuard>
  );
}
