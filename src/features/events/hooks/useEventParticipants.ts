import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useUserState } from '@/zero/users';
import { useEventRoles } from '@/zero/events/useEventState';
import { useAuth } from '@/providers/auth-provider';
import { useEventData } from './useEventData';
import { useEventMutations } from './useEventMutations';

// Define available action rights for events
export const ACTION_RIGHTS = [
  { resource: 'events', action: 'view', label: 'View Event' },
  { resource: 'events', action: 'update', label: 'Update Event' },
  { resource: 'events', action: 'delete', label: 'Delete Event' },
  { resource: 'events', action: 'manage', label: 'Manage Event' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'events', action: 'active_voting', label: 'Active Voting Rights' },
  {
    resource: 'events',
    action: 'passive_voting',
    label: 'Passive Voting Rights (Can Be Candidate)',
  },
  { resource: 'agendaItems', action: 'view', label: 'View Agenda Items' },
  { resource: 'agendaItems', action: 'create', label: 'Create Agenda Items' },
  { resource: 'agendaItems', action: 'update', label: 'Update Agenda Items' },
  { resource: 'agendaItems', action: 'delete', label: 'Delete Agenda Items' },
  { resource: 'agendaItems', action: 'manage', label: 'Manage Agenda' },
  { resource: 'notifications', action: 'manageNotifications', label: 'Manage Notifications' },
];

export function useEventParticipants(eventId: string) {
  const navigate = useNavigate();

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

  const { createRole, deleteRole, assignActionRight, removeActionRight } = useGroupActions();

  // Query all users for user search
  const { allUsers: usersData, isLoading: isLoadingUsers } = useUserState({ includeAllUsers: true });

  // Check if current user is admin
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Query event-scoped roles separately (event has no 'roles' relationship)
  const { roles: eventRoles } = useEventRoles(eventId);
  const rolesData = { roles: eventRoles };
  const organizerRole = eventRoles.find((role) => role.name === 'Organizer');
  const participantRole = eventRoles.find((role) => role.name === 'Participant');

  // Get existing participant IDs to exclude from invite search
  const existingParticipantIds = participants.map((p) => p.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = (usersData).filter((user) => {
    if (!user?.id) return false;
    if (existingParticipantIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return (
      fullName.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
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
      await inviteParticipants(selectedUsers, undefined, currentUserId, event?.title ?? undefined);

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
  const handleRemoveParticipant = async (participantId: string, userId?: string) => {
    try {
      await removeParticipant(participantId, userId, currentUserId, event?.title ?? undefined);
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  // Handle changing participant role
  const handleChangeRole = async (participantId: string, newRoleId: string) => {
    if (!newRoleId) return;

    try {
      await changeParticipantRole(participantId, newRoleId);
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  // Handle accepting request
  const handleAcceptRequest = async (participantId: string, userId?: string) => {
    try {
      await approveParticipation(participantId, userId, currentUserId, event?.title ?? undefined);
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

    try {
      const roleId = crypto.randomUUID();
      await createRole({
        id: roleId,
        name: newRoleName,
        description: newRoleDescription,
        scope: 'event',
        sort_order: 0,
        event_id: eventId,
        group_id: null,
        amendment_id: null,
        blog_id: null,
      });

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
      await deleteRole({ id: roleId });
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
        const role = rolesData?.roles?.find((r) => r.id === roleId);
        const actionRightToRemove = role?.action_rights?.find(
          (ar) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await removeActionRight({ id: actionRightToRemove.id });
        }
      } else {
        const actionRightId = crypto.randomUUID();
        await assignActionRight({
          id: actionRightId,
          resource,
          action,
          role_id: roleId,
          event_id: eventId,
          group_id: null,
          amendment_id: null,
          blog_id: null,
        });
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
    return participants.filter((participant) => {
      const userName = `${participant.user?.first_name ?? ''} ${participant.user?.last_name ?? ''}`.trim().toLowerCase();
      const userEmail = participant.user?.email?.toLowerCase() || '';
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
    () => filteredParticipants.filter((p) => p.status === 'requested'),
    [filteredParticipants]
  );
  const activeParticipants = useMemo(
    () =>
      filteredParticipants.filter(
        (p) =>
          p.status === 'member' ||
          p.status === 'confirmed' ||
          p.status === 'admin' ||
          p.role?.name === 'Organizer'
      ),
    [filteredParticipants]
  );
  const invitedUsers = useMemo(
    () => filteredParticipants.filter((p) => p.status === 'invited'),
    [filteredParticipants]
  );

  return {
    event,
    participants,
    isLoading,
    error,
    currentUserId,
    rolesData,
    organizerRole,
    participantRole,
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
      goBack: () => navigate({ to: '..' }),
    },
  };
}
