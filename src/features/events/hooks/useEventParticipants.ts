import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { db } from '../../../../db/db';
import { tx, id } from '@instantdb/react';
import { useEventData } from './useEventData';
import { useEventMutations } from './useEventMutations';

// Define available action rights for events
export const ACTION_RIGHTS = [
  { resource: 'events', action: 'update', label: 'Update Event' },
  { resource: 'events', action: 'delete', label: 'Delete Event' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'agendaItems', action: 'create', label: 'Create Agenda Items' },
  { resource: 'agendaItems', action: 'update', label: 'Update Agenda Items' },
  { resource: 'agendaItems', action: 'delete', label: 'Delete Agenda Items' },
  { resource: 'agendaItems', action: 'manage', label: 'Manage Agenda' },
  { resource: 'notifications', action: 'manageNotifications', label: 'Manage Notifications' },
];

export function useEventParticipants(eventId: string) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('participants');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  // Query event and participants using hook
  const { event, participants, isLoading, error } = useEventData(eventId);

  // Query all users for user search
  const { data: usersData, isLoading: isLoadingUsers } = db.useQuery({
    $users: {},
  });

  // Check if current user is admin
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  // Use event-scoped roles, not group roles
  const rolesData = { roles: event?.roles || [] };

  // Get existing participant IDs to exclude from invite search
  const existingParticipantIds = participants.map(p => p.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.$users?.filter(user => {
    if (!user?.id) return false;
    if (existingParticipantIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Initialize event mutations hook
  const { inviteParticipants, removeParticipant, changeParticipantRole, approveParticipation } =
    useEventMutations(eventId);

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      await inviteParticipants(selectedUsers);

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite participants:', error);
    } finally {
      setIsInviting(false);
    }
  };

  // Handle removing participant
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant(participantId);
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  // Handle changing participant role
  const handleChangeRole = async (participantId: string, newRole: string) => {
    try {
      await changeParticipantRole(participantId, newRole);
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  // Handle accepting request
  const handleAcceptRequest = async (participantId: string) => {
    try {
      await approveParticipation(participantId);
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  // Role management handlers
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!event?.group?.id) {
      toast.error('Event group not found');
      return;
    }

    try {
      const roleId = id();
      await db.transact([
        tx.roles[roleId]
          .create({
            name: newRoleName,
            description: newRoleDescription,
            scope: 'event',
          })
          .link({ group: event.group.id }),
      ]);

      toast.success('Role created successfully');

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role. Please try again.');
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await db.transact([tx.roles[roleId].delete()]);
      toast.success('Role removed successfully');
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast.error('Failed to remove role. Please try again.');
    }
  };

  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHasRight: boolean
  ) => {
    try {
      if (currentlyHasRight) {
        const role = rolesData?.roles?.find(r => r.id === roleId);
        const actionRightToRemove = role?.actionRights?.find(
          (ar: any) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await db.transact([tx.actionRights[actionRightToRemove.id].delete()]);
        }
      } else {
        const actionRightId = id();
        await db.transact([
          tx.actionRights[actionRightId]
            .create({
              resource,
              action,
            })
            .link({ roles: roleId, event: eventId }),
        ]);
      }
    } catch (error) {
      console.error('Failed to toggle action right:', error);
      toast.error('Failed to update permission. Please try again.');
    }
  };

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;

    const query = searchQuery.toLowerCase();
    return participants.filter((participant: any) => {
      const userName = participant.user?.name?.toLowerCase() || '';
      const userEmail = participant.user?.contactEmail?.toLowerCase() || '';
      const userHandle = participant.user?.handle?.toLowerCase() || '';
      const status = participant.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        userHandle.includes(query) ||
        status.includes(query)
      );
    });
  }, [participants, searchQuery]);

  const pendingRequests = useMemo(
    () => filteredParticipants.filter((p: any) => p.status === 'requested'),
    [filteredParticipants]
  );
  const activeParticipants = useMemo(
    () =>
      filteredParticipants.filter(
        (p: any) =>
          p.status === 'member' ||
          p.status === 'confirmed' ||
          p.status === 'admin' ||
          p.role?.name === 'Organizer'
      ),
    [filteredParticipants]
  );
  const invitedUsers = useMemo(
    () => filteredParticipants.filter((p: any) => p.status === 'invited'),
    [filteredParticipants]
  );

  return {
    event,
    participants,
    isLoading,
    error,
    currentUserId,
    rolesData,
    filteredUsers,
    isLoadingUsers,

    state: {
      searchQuery,
      setSearchQuery,
      inviteSearchQuery,
      setInviteSearchQuery,
      selectedUsers,
      setSelectedUsers,
      inviteDialogOpen,
      setInviteDialogOpen,
      isInviting,
      activeTab,
      setActiveTab,
      newRoleName,
      setNewRoleName,
      newRoleDescription,
      setNewRoleDescription,
      addRoleDialogOpen,
      setAddRoleDialogOpen,
    },

    derived: {
      pendingRequests,
      activeParticipants,
      invitedUsers,
    },

    actions: {
      toggleUserSelection,
      inviteUsers: handleInviteUsers,
      removeParticipant: handleRemoveParticipant,
      changeRole: handleChangeRole,
      acceptRequest: handleAcceptRequest,
      addRole: handleAddRole,
      removeRole: handleRemoveRole,
      toggleActionRight: handleToggleActionRight,
      goBack: () => router.back(),
    },
  };
}
