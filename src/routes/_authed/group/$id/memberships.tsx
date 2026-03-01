import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MembershipTabs } from '@/features/groups/ui/MembershipTabs'
import { ActiveMembersTable } from '@/features/groups/ui/ActiveMembersTable'
import { PendingRequestsTable } from '@/features/groups/ui/PendingRequestsTable'
import { PendingInvitationsTable } from '@/features/groups/ui/PendingInvitationsTable'
import { InviteMembersDialog } from '@/features/groups/ui/InviteMembersDialog'
import { ChangeRoleDialog } from '@/features/groups/ui/ChangeRoleDialog'
import { RolesPermissionsTable } from '@/features/groups/ui/RolesPermissionsTable'
import { AddRoleDialog } from '@/features/groups/ui/AddRoleDialog'
import { PositionsTable } from '@/features/positions/ui/PositionsTable'
import { AddPositionDialog } from '@/features/positions/ui/AddPositionDialog'
import { EditPositionDialog } from '@/features/positions/ui/EditPositionDialog'
import { AssignHolderDialog } from '@/features/groups/ui/AssignHolderDialog'
import { PositionHolderHistoryDialog } from '@/features/positions/ui/PositionHolderHistoryDialog'
import { useGroupMemberships, useGroupRoles, useGroupData } from '@/features/groups/hooks/useGroupData'
import { useGroupMutations } from '@/features/groups/hooks/useGroupMutations'
import { useMembershipSearch } from '@/features/groups/hooks/useMembershipSearch'
import { useRoleManagement } from '@/features/groups/hooks/useRoleManagement'
import { useGroupPositions } from '@/features/positions/hooks/useGroupPositions'
import { useUserSearch } from '@/zero/groups/useGroupState'
import { useAuth } from '@/providers/auth-provider'
import { EntitySearchBar } from '@/features/shared/ui/ui/entity-search-bar'
import type { MembershipTab, GroupMembershipWithUser } from '@/features/groups/types/group.types'

export const Route = createFileRoute('/_authed/group/$id/memberships')({
  component: GroupMembershipsPage,
})

function GroupMembershipsPage() {
  const { id: groupId } = Route.useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { group } = useGroupData(groupId)
  const groupName = (group as any)?.name || 'Group'

  // ── Tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MembershipTab>('memberships')

  // ── Memberships data & search ──────────────────────────────────────
  const { activeMemberships, invitedMemberships, requestedMemberships } =
    useGroupMemberships(groupId)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const { activeMembers, pendingRequests, pendingInvitations } = useMembershipSearch(
    [...activeMemberships, ...requestedMemberships, ...invitedMemberships],
    memberSearchQuery
  )

  // ── Invite dialog state ────────────────────────────────────────────
  const [inviteOpen, setInviteOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isInviting, setIsInviting] = useState(false)
  const existingMemberIds = activeMemberships.map((m: any) => m.user?.id).filter(Boolean)
  const { users: searchedUsers, isLoading: usersLoading } = useUserSearch(
    userSearchQuery,
    existingMemberIds
  )

  // ── Membership mutations ───────────────────────────────────────────
  const { inviteUsers, approveMembership, rejectMembership, removeMember, changeMemberRole } =
    useGroupMutations(groupId)

  // ── Change role dialog state ───────────────────────────────────────
  const [changeRoleOpen, setChangeRoleOpen] = useState(false)
  const [changeRoleMembership, setChangeRoleMembership] = useState<GroupMembershipWithUser | null>(null)

  const handleOpenChangeRoleDialog = (membership: GroupMembershipWithUser) => {
    setChangeRoleMembership(membership)
    setChangeRoleOpen(true)
  }

  const handleConfirmRoleChange = async (newRoleId: string) => {
    if (!changeRoleMembership) return
    const userId = changeRoleMembership.user?.id
    if (userId) {
      const roleName = (roles as any[]).find((r) => r.id === newRoleId)?.name
      await changeMemberRole(changeRoleMembership.id, newRoleId, userId, authUser?.id, undefined, groupName, roleName)
    }
  }

  const handleInvite = async () => {
    if (selectedUserIds.length === 0) return
    setIsInviting(true)
    try {
      await inviteUsers(selectedUserIds)
      setSelectedUserIds([])
      setInviteOpen(false)
    } finally {
      setIsInviting(false)
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  // ── Roles data & management ────────────────────────────────────────
  const { roles } = useGroupRoles(groupId)
  const { addRole, removeRole, reorderRoles, toggleActionRight } = useRoleManagement(groupId)
  const [addRoleOpen, setAddRoleOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')

  const handleAddRole = async () => {
    const nextSortOrder = (roles as any[]).length
    const result = await addRole(newRoleName, newRoleDescription, nextSortOrder)
    if (result.success) {
      setNewRoleName('')
      setNewRoleDescription('')
      setAddRoleOpen(false)
    }
  }

  const handleTogglePermission = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHas: boolean
  ) => {
    const role = (roles as any[]).find((r) => r.id === roleId)
    await toggleActionRight(roleId, resource, action, currentlyHas, role?.action_rights || [])
  }

  // ── Positions data & management ────────────────────────────────────
  const positionHook = useGroupPositions(groupId)

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Group Memberships</h1>
      <EntitySearchBar
        searchQuery={memberSearchQuery}
        onSearchQueryChange={setMemberSearchQuery}
        placeholder="Search members..."
        className="mb-4"
      />
      <MembershipTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        membershipsContent={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <InviteMembersDialog
                isOpen={inviteOpen}
                onOpenChange={setInviteOpen}
                searchQuery={userSearchQuery}
                onSearchQueryChange={setUserSearchQuery}
                users={searchedUsers as any[]}
                selectedUsers={selectedUserIds}
                onToggleUser={handleToggleUser}
                onInvite={handleInvite}
                isLoading={usersLoading}
                isInviting={isInviting}
                disabled={(group as any)?.group_type === 'hierarchical'}
                disabledReason="Members join through subgroups"
              />
            </div>
            <PendingRequestsTable
              requests={pendingRequests as any[]}
              onApprove={(membershipId, userId) => approveMembership(membershipId, userId, undefined, authUser?.id, undefined, groupName)}
              onReject={(membershipId, userId) => rejectMembership(membershipId, userId, authUser?.id, undefined, groupName)}
              onNavigateToUser={(userId) => navigate({ to: '/user/$id', params: { id: userId } })}
            />
            <PendingInvitationsTable
              invitations={pendingInvitations as any[]}
              onWithdraw={(membershipId, userId) => rejectMembership(membershipId, userId, authUser?.id, undefined, groupName)}
              onNavigateToUser={(userId) => navigate({ to: '/user/$id', params: { id: userId } })}
            />
            <ActiveMembersTable
              members={activeMembers as any[]}
              roles={roles as any[]}
              onChangeRole={(membershipId, roleId, userId) => changeMemberRole(membershipId, roleId, userId, authUser?.id, undefined, groupName, (roles as any[]).find((r) => r.id === roleId)?.name)}
              onOpenChangeRoleDialog={handleOpenChangeRoleDialog}
              onRemove={(membershipId, userId) => removeMember(membershipId, userId, undefined, authUser?.id, undefined, groupName)}
              onNavigateToUser={(userId) => navigate({ to: '/user/$id', params: { id: userId } })}
            />
            <ChangeRoleDialog
              isOpen={changeRoleOpen}
              onOpenChange={setChangeRoleOpen}
              memberName={
                changeRoleMembership
                  ? [changeRoleMembership.user?.first_name, changeRoleMembership.user?.last_name].filter(Boolean).join(' ') || 'Unknown User'
                  : ''
              }
              currentRole={changeRoleMembership?.role ? { id: changeRoleMembership.role.id, name: changeRoleMembership.role.name, ...(changeRoleMembership.role as any) } : null}
              roles={roles as any[]}
              onConfirm={handleConfirmRoleChange}
            />
          </div>
        }
        rolesContent={
          <RolesPermissionsTable
            roles={roles as any[]}
            onTogglePermission={handleTogglePermission}
            onRemoveRole={removeRole}
            onReorderRoles={reorderRoles}
            addRoleButton={
              <AddRoleDialog
                isOpen={addRoleOpen}
                onOpenChange={setAddRoleOpen}
                roleName={newRoleName}
                onRoleNameChange={setNewRoleName}
                roleDescription={newRoleDescription}
                onRoleDescriptionChange={setNewRoleDescription}
                onAdd={handleAddRole}
              />
            }
          />
        }
        positionsContent={
          <>
            <PositionsTable
              positions={positionHook.positions}
              canManage={true}
              onEdit={positionHook.actions.openEdit}
              onDelete={(positionId) => positionHook.actions.delete(positionId)}
              onAssignHolder={positionHook.actions.openAssignHolder}
              onRemoveHolder={(positionId) => positionHook.actions.removeHolder(positionId)}
              onViewHistory={positionHook.actions.openHistory}
              onCreateElection={(positionId) =>
                positionHook.actions.createElection(positionId)
              }
              addPositionButton={
                <AddPositionDialog
                  open={positionHook.dialogs.add.open}
                  onOpenChange={positionHook.dialogs.add.setOpen}
                  onSubmit={() => positionHook.actions.create()}
                  form={positionHook.form}
                />
              }
            />
            <EditPositionDialog
              open={positionHook.dialogs.edit.open}
              onOpenChange={positionHook.dialogs.edit.setOpen}
              onSubmit={positionHook.actions.update}
              form={positionHook.form}
            />
            <AssignHolderDialog
              open={positionHook.dialogs.assignHolder.open}
              onOpenChange={positionHook.dialogs.assignHolder.setOpen}
              position={positionHook.selectedPosition}
              groupId={groupId}
              onAssign={(userId, reason) =>
                positionHook.selectedPosition &&
                positionHook.actions.assignHolder(
                  positionHook.selectedPosition.id,
                  userId,
                  reason
                )
              }
            />
            <PositionHolderHistoryDialog
              open={positionHook.dialogs.history.open}
              onOpenChange={positionHook.dialogs.history.setOpen}
              position={positionHook.selectedPosition}
            />
          </>
        }
      />
    </div>
  )
}
