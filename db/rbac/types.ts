/**
 * RBAC Type Definitions
 *
 * All type definitions for the Role-Based Access Control system.
 */

// Resource types (all entities that can have permissions)
export type ResourceType =
  | 'agendaItems'
  | 'amendments'
  | 'blogs'
  | 'blogBloggers'
  | 'changeRequests'
  | 'comments'
  | 'commentVotes'
  | 'conversations'
  | 'documents'
  | 'documentCollaborators'
  | 'elections'
  | 'electionCandidates'
  | 'events'
  | 'eventParticipants'
  | 'follows'
  | 'groups'
  | 'groupMemberships'
  | 'groupRelationships'
  | 'messages'
  | 'notifications'
  | 'payments'
  | 'positions'
  | 'roles'
  | 'actionRights'
  | 'todos'
  | 'todoAssignments'
  | '$users'
  | '$files';

// Action types with inheritance
export type ActionType =
  | 'view'
  | 'manage'
  | 'create'
  | 'update'
  | 'delete'
  | 'vote'
  | 'comment'
  | 'moderate'
  | 'invite_members'
  | 'manage_roles'
  | 'manage_participants'
  | 'manage_members'
  | 'manage_speakers'
  | 'manage_votes'
  | 'manage_relationships';

export interface ActionRight {
  id: string;
  resource: ResourceType;
  action: ActionType;
  group?: { id: string };
  event?: { id: string };
  amendment?: { id: string };
  blog?: { id: string };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: 'group' | 'event' | 'amendment' | 'blog';
  actionRights?: ActionRight[];
}

export interface Membership {
  id: string;
  group?: { id: string; roles?: Role[] };
  role?: Role;
}

export interface Participation {
  id: string;
  event?: { id: string };
  role?: Role;
}

export interface BloggerRelation {
  id: string;
  blog?: { id: string };
  role?: Role;
}

export interface AmendmentCollaborator {
  id: string;
  user?: { id: string };
  roleName?: string;
  status?: string;
}

export interface AmendmentRoleCollaborator {
  id: string;
  user?: { id: string };
  role?: Role;
}

export interface Amendment {
  id: string;
  user?: { id: string }; // Author
  owner?: { id: string }; // Owner relation from schema
  group?: { id: string };
  status?: string;
  collaborators?: AmendmentCollaborator[];
  amendmentRoleCollaborators?: AmendmentRoleCollaborator[];
  roles?: Role[];
}

export interface PermissionContext {
  groupId?: string;
  eventId?: string;
  blogId?: string;
  amendmentId?: string;
  amendment?: Amendment; // Pass the amendment object for permission checks
}
