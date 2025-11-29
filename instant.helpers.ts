/**
 * InstantDB Permission Helpers
 *
 * This file contains helper functions for checking RBAC permissions
 * in the InstantDB schema. It provides utilities for both group-level
 * and event-level permission checks.
 */

// Type definitions for the permission system
export type ResourceType =
  | 'agendaItems'
  | 'amendments'
  | 'amendmentCollaborators'
  | 'amendmentPaths'
  | 'amendmentVoteEntries'
  | 'amendmentVotes'
  | 'blogs'
  | 'blogBloggers'
  | 'changeRequests'
  | 'changeRequestVotes'
  | 'comments'
  | 'commentVotes'
  | 'conversations'
  | 'conversationParticipants'
  | 'documentCollaborators'
  | 'documentCursors'
  | 'documents'
  | 'documentVersions'
  | 'electionCandidates'
  | 'elections'
  | 'electionVotes'
  | 'events'
  | 'eventParticipants'
  | 'follows'
  | 'groupMemberships'
  | 'groupRelationships'
  | 'groups'
  | 'hashtags'
  | 'links'
  | 'meetingBookings'
  | 'meetingSlots'
  | 'messages'
  | 'notifications'
  | 'participants'
  | 'payments'
  | 'positions'
  | 'roles'
  | 'actionRights'
  | 'speakerList'
  | 'statements'
  | 'stats'
  | 'stripeCustomers'
  | 'stripePayments'
  | 'stripeSubscriptions'
  | 'subscribers'
  | 'threads'
  | 'threadVotes'
  | 'timelineEvents'
  | 'todoAssignments'
  | 'todos'
  | '$users'
  | '$files';

export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'manage_participants'
  | 'manage_members'
  | 'manage_speakers'
  | 'manage_votes'
  | 'manage_relationships'
  | 'vote'
  | 'comment'
  | 'edit';

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
  group?: {
    id: string;
    roles?: Role[];
  };
}

export interface Participation {
  id: string;
  event?: {
    id: string;
  };
  role?: Role;
}

/**
 * Check if user has group-level permission for a specific resource and action
 *
 * @param memberships - User's group memberships with roles
 * @param groupId - ID of the group to check permissions for
 * @param resource - Resource type (e.g., 'events', 'amendments')
 * @param action - Action type (e.g., 'create', 'update', 'delete')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * const canCreateEvents = hasGroupPermission(
 *   user.memberships,
 *   groupId,
 *   'events',
 *   'create'
 * );
 */
export function hasGroupPermission(
  memberships: Membership[] | undefined,
  groupId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!memberships) return false;

  return memberships.some(
    m =>
      m.group?.id === groupId &&
      m.group?.roles?.some(role =>
        role.actionRights?.some(
          right =>
            right.resource === resource && right.action === action && right.group?.id === groupId
        )
      )
  );
}

/**
 * Check if user has event-level permission for a specific resource and action
 *
 * @param participations - User's event participations with roles
 * @param eventId - ID of the event to check permissions for
 * @param resource - Resource type (e.g., 'events', 'agendaItems')
 * @param action - Action type (e.g., 'update', 'manage_participants')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * const canUpdateEvent = hasEventPermission(
 *   user.participations,
 *   eventId,
 *   'events',
 *   'update'
 * );
 */
export function hasEventPermission(
  participations: Participation[] | undefined,
  eventId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!participations) return false;

  return participations.some(
    p =>
      p.event?.id === eventId &&
      p.role?.actionRights?.some(
        right =>
          right.resource === resource && right.action === action && right.event?.id === eventId
      )
  );
}

/**
 * Check if user has amendment-level permission for a specific resource and action
 *
 * @param amendment - The amendment object with roles
 * @param userId - ID of the user to check
 * @param resource - Resource type (e.g., 'amendments', 'documents')
 * @param action - Action type (e.g., 'update', 'delete')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * const canUpdateAmendment = hasAmendmentPermission(
 *   amendment,
 *   userId,
 *   'amendments',
 *   'update'
 * );
 */
export function hasAmendmentPermission(
  amendment: Amendment | undefined,
  userId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!amendment?.amendmentRoleCollaborators || !amendment?.roles) return false;

  // Check if user is a collaborator
  const collaboration = amendment.amendmentRoleCollaborators.find(c => c.user?.id === userId);
  if (!collaboration?.role) return false;

  // Find the role and check its action rights
  const role = amendment.roles.find(r => r.name === collaboration.role);
  if (!role?.actionRights) return false;

  return role.actionRights.some(
    right =>
      right.resource === resource && right.action === action && right.amendment?.id === amendment.id
  );
}

/**
 * Check if user has permission either through group membership, event participation, or amendment collaboration
 *
 * @param memberships - User's group memberships
 * @param participations - User's event participations
 * @param amendment - Amendment object (optional)
 * @param userId - ID of the user
 * @param groupId - ID of the group (optional)
 * @param eventId - ID of the event (optional)
 * @param resource - Resource type
 * @param action - Action type
 * @returns true if user has the permission through any path
 *
 * @example
 * const canManageParticipants = hasPermission(
 *   user.memberships,
 *   user.participations,
 *   amendment,
 *   user.id,
 *   groupId,
 *   eventId,
 *   'events',
 *   'manage_participants'
 * );
 */
export function hasPermission(
  memberships: Membership[] | undefined,
  participations: Participation[] | undefined,
  amendment: Amendment | undefined,
  userId: string,
  groupId: string | undefined,
  eventId: string | undefined,
  resource: ResourceType,
  action: ActionType
): boolean {
  const hasGroupPerm = groupId ? hasGroupPermission(memberships, groupId, resource, action) : false;

  const hasEventPerm = eventId
    ? hasEventPermission(participations, eventId, resource, action)
    : false;

  const hasAmendmentPerm = amendment
    ? hasAmendmentPermission(amendment, userId, resource, action)
    : false;

  return hasGroupPerm || hasEventPerm || hasAmendmentPerm;
}

/**
 * Get all permissions for a user in a specific group
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @returns Array of action rights for the group
 *
 * @example
 * const permissions = getGroupPermissions(user.memberships, groupId);
 */
export function getGroupPermissions(
  memberships: Membership[] | undefined,
  groupId: string
): ActionRight[] {
  if (!memberships) return [];

  const groupMembership = memberships.find(m => m.group?.id === groupId);
  if (!groupMembership?.group?.roles) return [];

  const permissions: ActionRight[] = [];

  for (const role of groupMembership.group.roles) {
    if (role.actionRights) {
      permissions.push(...role.actionRights.filter(right => right.group?.id === groupId));
    }
  }

  return permissions;
}

/**
 * Get all permissions for a user in a specific event
 *
 * @param participations - User's event participations
 * @param eventId - ID of the event
 * @returns Array of action rights for the event
 *
 * @example
 * const permissions = getEventPermissions(user.participations, eventId);
 */
export function getEventPermissions(
  participations: Participation[] | undefined,
  eventId: string
): ActionRight[] {
  if (!participations) return [];

  const participation = participations.find(p => p.event?.id === eventId);
  if (!participation?.role?.actionRights) return [];

  return participation.role.actionRights.filter(right => right.event?.id === eventId);
}

/**
 * Get all permissions for a user in a specific amendment
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user
 * @returns Array of action rights for the amendment
 *
 * @example
 * const permissions = getAmendmentPermissions(amendment, userId);
 */
export function getAmendmentPermissions(
  amendment: Amendment | undefined,
  userId: string
): ActionRight[] {
  if (!amendment?.amendmentRoleCollaborators || !amendment?.roles) return [];

  const collaboration = amendment.amendmentRoleCollaborators?.find(c => c.user?.id === userId);
  if (!collaboration?.role) return [];

  const role = amendment.roles.find(r => r.name === collaboration.role);
  if (!role?.actionRights) return [];

  return role.actionRights.filter(right => right.amendment?.id === amendment.id);
}

/**
 * Check if user has any role in a group
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @returns true if user is a member of the group
 *
 * @example
 * const isMember = isGroupMember(user.memberships, groupId);
 */
export function isGroupMember(memberships: Membership[] | undefined, groupId: string): boolean {
  if (!memberships) return false;
  return memberships.some(m => m.group?.id === groupId);
}

/**
 * Check if user is participating in an event
 *
 * @param participations - User's event participations
 * @param eventId - ID of the event
 * @returns true if user is a participant in the event
 *
 * @example
 * const isParticipant = isEventParticipant(user.participations, eventId);
 */
export function isEventParticipant(
  participations: Participation[] | undefined,
  eventId: string
): boolean {
  if (!participations) return false;
  return participations.some(p => p.event?.id === eventId);
}

/**
 * Check if user has a specific role in a group
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @param roleName - Name of the role to check
 * @returns true if user has the specified role in the group
 *
 * @example
 * const isAdmin = hasGroupRole(user.memberships, groupId, 'admin');
 */
export function hasGroupRole(
  memberships: Membership[] | undefined,
  groupId: string,
  roleName: string
): boolean {
  if (!memberships) return false;

  return memberships.some(
    m => m.group?.id === groupId && m.group?.roles?.some(role => role.name === roleName)
  );
}

/**
 * Check if user has a specific role in an event
 *
 * @param participations - User's event participations
 * @param eventId - ID of the event
 * @param roleName - Name of the role to check
 * @returns true if user has the specified role in the event
 *
 * @example
 * const isHost = hasEventRole(user.participations, eventId, 'host');
 */
export function hasEventRole(
  participations: Participation[] | undefined,
  eventId: string,
  roleName: string
): boolean {
  if (!participations) return false;

  return participations.some(p => p.event?.id === eventId && p.role?.name === roleName);
}

// ============================================================================
// Amendment-specific Permission Helpers
// ============================================================================

export interface Amendment {
  id: string;
  status?: string;
  user?: { id: string };
  group?: { id: string };
  amendmentRoleCollaborators?: AmendmentCollaborator[];
  roles?: Role[];
}

export interface AmendmentCollaborator {
  id: string;
  user?: { id: string };
  status?: string;
  role?: string;
}

/**
 * Check if user is the author of an amendment
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @returns true if user is the amendment author
 *
 * @example
 * const isAuthor = isAmendmentAuthor(amendment, auth.id);
 */
export function isAmendmentAuthor(amendment: Amendment | undefined, userId: string): boolean {
  if (!amendment) return false;
  return amendment.user?.id === userId;
}

/**
 * Check if user is a collaborator on an amendment
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @returns true if user is a collaborator
 *
 * @example
 * const isCollab = isAmendmentCollaborator(amendment, auth.id);
 */
export function isAmendmentCollaborator(amendment: Amendment | undefined, userId: string): boolean {
  if (!amendment?.amendmentRoleCollaborators) return false;
  return amendment.amendmentRoleCollaborators?.some(c => c.user?.id === userId) || false;
}

/**
 * Check if user can view an amendment (published or group member)
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can view the amendment
 *
 * @example
 * const canView = canViewAmendment(amendment, auth.id, user.memberships);
 */
export function canViewAmendment(
  amendment: Amendment | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!amendment) return false;

  // Published amendments are public
  if (amendment.status === 'published') return true;

  // Author can always view
  if (amendment.user?.id === userId) return true;

  // Collaborators can view
  if (amendment.amendmentRoleCollaborators?.some(c => c.user?.id === userId)) return true;

  // Group members can view
  if (amendment.group?.id && memberships) {
    return isGroupMember(memberships, amendment.group.id);
  }

  return false;
}

/**
 * Check if user can edit an amendment (author, collaborator with permission, or via group/amendment role)
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships (optional)
 * @returns true if user can edit the amendment
 *
 * @example
 * const canEdit = canEditAmendment(amendment, auth.id, user.memberships);
 */
export function canEditAmendment(
  amendment: Amendment | undefined,
  userId: string,
  memberships?: Membership[] | undefined
): boolean {
  if (!amendment) return false;

  // Author can edit
  if (amendment.user?.id === userId) return true;

  // Active collaborators can edit (legacy string-based role)
  if (
    amendment.amendmentRoleCollaborators?.some(c => c.user?.id === userId && c.status === 'member')
  ) {
    return true;
  }

  // Check amendment-level role permissions
  if (hasAmendmentPermission(amendment, userId, 'amendments', 'update')) {
    return true;
  }

  // Check group-level role permissions
  if (amendment.group?.id && memberships) {
    if (hasGroupPermission(memberships, amendment.group.id, 'amendments', 'update')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can delete an amendment
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can delete the amendment
 *
 * @example
 * const canDelete = canDeleteAmendment(amendment, auth.id, user.memberships);
 */
export function canDeleteAmendment(
  amendment: Amendment | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!amendment) return false;

  // Author can delete
  if (amendment.user?.id === userId) return true;

  // Check group admin permissions
  if (amendment.group?.id && memberships) {
    return hasGroupPermission(memberships, amendment.group.id, 'amendments', 'delete');
  }

  return false;
}

// ============================================================================
// Document-specific Permission Helpers
// ============================================================================

export interface Document {
  id: string;
  owner?: { id: string };
  group?: { id: string };
  collaborators?: DocumentCollaborator[];
  isPublic?: boolean;
}

export interface DocumentCollaborator {
  id: string;
  user?: { id: string };
  canEdit?: boolean;
}

/**
 * Check if user can view a document
 *
 * @param document - The document object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can view the document
 *
 * @example
 * const canView = canViewDocument(document, auth.id, user.memberships);
 */
export function canViewDocument(
  document: Document | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!document) return false;

  // Owner can view
  if (document.owner?.id === userId) return true;

  // Collaborators can view
  if (document.collaborators?.some(c => c.user?.id === userId)) return true;

  // Group members can view
  if (document.group?.id && memberships) {
    return isGroupMember(memberships, document.group.id);
  }

  // Public documents
  if (document.isPublic) return true;

  return false;
}

/**
 * Check if user can edit a document
 *
 * @param document - The document object
 * @param userId - ID of the user to check
 * @returns true if user can edit the document
 *
 * @example
 * const canEdit = canEditDocument(document, auth.id);
 */
export function canEditDocument(document: Document | undefined, userId: string): boolean {
  if (!document) return false;

  // Owner can edit
  if (document.owner?.id === userId) return true;

  // Collaborators with edit permission can edit
  if (document.collaborators?.some(c => c.user?.id === userId && c.canEdit === true)) {
    return true;
  }

  return false;
}

// ============================================================================
// Event-specific Permission Helpers
// ============================================================================

export interface Event {
  id: string;
  group?: { id: string };
  creator?: { id: string };
  participants?: EventParticipant[];
  isPublic?: boolean;
}

export interface EventParticipant {
  id: string;
  user?: { id: string };
  status?: string;
  role?: string;
}

/**
 * Check if user can view an event
 *
 * @param event - The event object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can view the event
 *
 * @example
 * const canView = canViewEvent(event, auth.id, user.memberships);
 */
export function canViewEvent(
  event: Event | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!event) return false;

  // Public events
  if (event.isPublic) return true;

  // Group members can view
  if (event.group?.id && memberships) {
    return isGroupMember(memberships, event.group.id);
  }

  // Participants can view
  if (event.participants?.some(p => p.user?.id === userId)) return true;

  return false;
}

/**
 * Check if user can manage an event (create, update, delete)
 *
 * @param event - The event object (or null for create check)
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @param participations - User's event participations
 * @param action - The action to check ('create', 'update', 'delete')
 * @returns true if user can perform the action
 *
 * @example
 * const canUpdate = canManageEvent(event, auth.id, user.memberships, user.participations, 'update');
 */
export function canManageEvent(
  event: Event | undefined | null,
  userId: string,
  memberships: Membership[] | undefined,
  participations: Participation[] | undefined,
  action: 'create' | 'update' | 'delete'
): boolean {
  // For create, check group permissions
  if (action === 'create' && event?.group?.id) {
    return hasGroupPermission(memberships, event.group.id, 'events', 'create');
  }

  if (!event) return false;

  // Check group permissions
  if (event.group?.id && memberships) {
    if (hasGroupPermission(memberships, event.group.id, 'events', action)) {
      return true;
    }
  }

  // Check event-level permissions
  if (participations) {
    if (hasEventPermission(participations, event.id, 'events', action)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Voting and Election Helpers
// ============================================================================

/**
 * Check if user can vote in an election
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @param electionStatus - Status of the election
 * @returns true if user can vote
 *
 * @example
 * const canVote = canVoteInElection(user.memberships, groupId, election.status);
 */
export function canVoteInElection(
  memberships: Membership[] | undefined,
  groupId: string,
  electionStatus: string
): boolean {
  if (electionStatus !== 'open') return false;
  return isGroupMember(memberships, groupId);
}

/**
 * Check if user can manage elections (create, update, delete)
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @returns true if user can manage elections
 *
 * @example
 * const canManage = canManageElections(user.memberships, groupId);
 */
export function canManageElections(
  memberships: Membership[] | undefined,
  groupId: string
): boolean {
  return hasGroupPermission(memberships, groupId, 'elections', 'manage');
}

// ============================================================================
// Todo Permission Helpers
// ============================================================================

export interface Todo {
  id: string;
  creator?: { id: string };
  group?: { id: string };
  assignments?: TodoAssignment[];
}

export interface TodoAssignment {
  id: string;
  user?: { id: string };
}

/**
 * Check if user can view a todo
 *
 * @param todo - The todo object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can view the todo
 *
 * @example
 * const canView = canViewTodo(todo, auth.id, user.memberships);
 */
export function canViewTodo(
  todo: Todo | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!todo) return false;

  // Creator can view
  if (todo.creator?.id === userId) return true;

  // Assignees can view
  if (todo.assignments?.some(a => a.user?.id === userId)) return true;

  // Group members can view
  if (todo.group?.id && memberships) {
    return isGroupMember(memberships, todo.group.id);
  }

  return false;
}

/**
 * Check if user can edit a todo
 *
 * @param todo - The todo object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can edit the todo
 *
 * @example
 * const canEdit = canEditTodo(todo, auth.id, user.memberships);
 */
export function canEditTodo(
  todo: Todo | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!todo) return false;

  // Creator can edit
  if (todo.creator?.id === userId) return true;

  // Check group permissions
  if (todo.group?.id && memberships) {
    return hasGroupPermission(memberships, todo.group.id, 'todos', 'update');
  }

  return false;
}

// ============================================================================
// Blog Permission Helpers
// ============================================================================

export interface Blog {
  id: string;
  user?: { id: string };
  group?: { id: string };
  published?: boolean;
  bloggers?: BlogBlogger[];
  roles?: Role[];
}

export interface BlogBlogger {
  id: string;
  user?: { id: string };
  status?: string;
  role?: string;
}

export interface BloggerRelation {
  id: string;
  blog?: { id: string };
  role?: Role;
}

/**
 * Check if user has blog-level permission for a specific resource and action
 *
 * @param bloggerRelations - User's blog blogger relationships with roles
 * @param blogId - ID of the blog to check permissions for
 * @param resource - Resource type (e.g., 'blogs', 'comments')
 * @param action - Action type (e.g., 'update', 'delete', 'manage')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * const canUpdateBlog = hasBlogPermission(
 *   user.bloggerRelations,
 *   blogId,
 *   'blogs',
 *   'update'
 * );
 */
export function hasBlogPermission(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!bloggerRelations) return false;

  return bloggerRelations.some(
    b =>
      b.blog?.id === blogId &&
      b.role?.actionRights?.some(
        right => right.resource === resource && right.action === action && right.blog?.id === blogId
      )
  );
}

/**
 * Get all permissions for a user in a specific blog
 *
 * @param bloggerRelations - User's blog blogger relationships
 * @param blogId - ID of the blog
 * @returns Array of action rights for the blog
 *
 * @example
 * const permissions = getBlogPermissions(user.bloggerRelations, blogId);
 */
export function getBlogPermissions(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string
): ActionRight[] {
  if (!bloggerRelations) return [];

  const bloggerRelation = bloggerRelations.find(b => b.blog?.id === blogId);
  if (!bloggerRelation?.role?.actionRights) return [];

  return bloggerRelation.role.actionRights.filter(right => right.blog?.id === blogId);
}

/**
 * Check if user is the author of a blog
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @returns true if user is the blog author
 *
 * @example
 * const isAuthor = isBlogAuthor(blog, auth.id);
 */
export function isBlogAuthor(blog: Blog | undefined, userId: string): boolean {
  if (!blog) return false;
  return blog.user?.id === userId;
}

/**
 * Check if user is a blogger (owner or writer) on a blog
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @returns true if user is a blogger
 *
 * @example
 * const isBlogger = isBlogBlogger(blog, auth.id);
 */
export function isBlogBlogger(blog: Blog | undefined, userId: string): boolean {
  if (!blog?.bloggers) return false;
  return blog.bloggers.some(b => b.user?.id === userId);
}

/**
 * Check if user is an owner of a blog (has owner role)
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @param bloggerRelations - User's blogger relationships
 * @returns true if user is a blog owner
 *
 * @example
 * const isOwner = isBlogOwner(blog, auth.id, user.bloggerRelations);
 */
export function isBlogOwner(
  blog: Blog | undefined,
  userId: string,
  bloggerRelations: BloggerRelation[] | undefined
): boolean {
  if (!blog || !bloggerRelations) return false;

  // Check if user has owner role through blogger relations
  return bloggerRelations.some(b => b.blog?.id === blog.id && b.role?.name === 'Owner');
}

/**
 * Check if user can view a blog (published or blogger or group member)
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @returns true if user can view the blog
 *
 * @example
 * const canView = canViewBlog(blog, auth.id, user.memberships);
 */
export function canViewBlog(
  blog: Blog | undefined,
  userId: string,
  memberships: Membership[] | undefined
): boolean {
  if (!blog) return false;

  // Published blogs are public
  if (blog.published === true) return true;

  // Author can always view
  if (blog.user?.id === userId) return true;

  // Bloggers can view
  if (blog.bloggers?.some(b => b.user?.id === userId)) return true;

  // Group members can view
  if (blog.group?.id && memberships) {
    return isGroupMember(memberships, blog.group.id);
  }

  return false;
}

/**
 * Check if user can edit a blog (author, blogger with permission, or via group/blog role)
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships (optional)
 * @param bloggerRelations - User's blogger relationships (optional)
 * @returns true if user can edit the blog
 *
 * @example
 * const canEdit = canEditBlog(blog, auth.id, user.memberships, user.bloggerRelations);
 */
export function canEditBlog(
  blog: Blog | undefined,
  userId: string,
  memberships?: Membership[] | undefined,
  bloggerRelations?: BloggerRelation[] | undefined
): boolean {
  if (!blog) return false;

  // Author can edit
  if (blog.user?.id === userId) return true;

  // Bloggers can edit (legacy string-based check)
  if (
    blog.bloggers?.some(
      b => b.user?.id === userId && (b.status === 'owner' || b.status === 'writer')
    )
  ) {
    return true;
  }

  // Check blog-level role permissions
  if (bloggerRelations && hasBlogPermission(bloggerRelations, blog.id, 'blogs', 'update')) {
    return true;
  }

  // Check group-level role permissions
  if (blog.group?.id && memberships) {
    if (hasGroupPermission(memberships, blog.group.id, 'blogs', 'update')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can delete a blog
 *
 * @param blog - The blog object
 * @param userId - ID of the user to check
 * @param memberships - User's group memberships
 * @param bloggerRelations - User's blogger relationships
 * @returns true if user can delete the blog
 *
 * @example
 * const canDelete = canDeleteBlog(blog, auth.id, user.memberships, user.bloggerRelations);
 */
export function canDeleteBlog(
  blog: Blog | undefined,
  userId: string,
  memberships: Membership[] | undefined,
  bloggerRelations: BloggerRelation[] | undefined
): boolean {
  if (!blog) return false;

  // Author can delete
  if (blog.user?.id === userId) return true;

  // Check blog-level permissions (owners)
  if (bloggerRelations && hasBlogPermission(bloggerRelations, blog.id, 'blogs', 'delete')) {
    return true;
  }

  // Check group admin permissions
  if (blog.group?.id && memberships) {
    return hasGroupPermission(memberships, blog.group.id, 'blogs', 'delete');
  }

  return false;
}

/**
 * Check if user has a specific role in a blog
 *
 * @param bloggerRelations - User's blog blogger relationships
 * @param blogId - ID of the blog
 * @param roleName - Name of the role to check
 * @returns true if user has the specified role in the blog
 *
 * @example
 * const isOwner = hasBlogRole(user.bloggerRelations, blogId, 'Owner');
 */
export function hasBlogRole(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string,
  roleName: string
): boolean {
  if (!bloggerRelations) return false;

  return bloggerRelations.some(b => b.blog?.id === blogId && b.role?.name === roleName);
}

/**
 * Check if user is a blogger in a blog
 *
 * @param bloggerRelations - User's blog blogger relationships
 * @param blogId - ID of the blog
 * @returns true if user is a blogger in the blog
 *
 * @example
 * const isBlogger = isBloggerInBlog(user.bloggerRelations, blogId);
 */
export function isBloggerInBlog(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string
): boolean {
  if (!bloggerRelations) return false;
  return bloggerRelations.some(b => b.blog?.id === blogId);
}
