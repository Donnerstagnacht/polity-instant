// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';

const rules = {
  roles: {
    allow: {
      view: 'isAuthenticated',
      create: 'isGroupAdmin',
      update: 'isGroupAdmin',
      delete: 'isGroupAdmin',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupAdmin',
      "'admin' in auth.ref('$user.memberships.group.roles.name')",
    ],
  },
  actionRights: {
    allow: {
      view: 'isAuthenticated',
      create: 'isGroupAdmin',
      update: 'isGroupAdmin',
      delete: 'isGroupAdmin',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupAdmin',
      "'admin' in auth.ref('$user.memberships.group.roles.name')",
    ],
  },
  participants: {
    allow: {
      view: 'isGroupMember || isSelf',
      create: 'hasGroupEventManageParticipants || hasEventManageParticipants',
      update: 'hasGroupEventManageParticipants || hasEventManageParticipants || isSelf',
      delete: 'hasGroupEventManageParticipants || hasEventManageParticipants || isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("$user.id")',
      'isGroupMember',
      'data.ref("event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupEventManageParticipants',
      "data.ref('event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_participants' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasEventManageParticipants',
      "data.ref('event.id') in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'manage_participants' in auth.ref('$user.participations.role.actionRights.action')",
    ],
  },
  amendmentCollaborators: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isAmendmentAuthor',
      'auth.id == data.ref("amendment.user.id")',
      'isGroupMember',
      'data.ref("amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isPublished',
      '"published" in data.ref("amendment.status")',
      'isAmendmentVisible',
      'isGroupMember || isPublished',
    ],
    allow: {
      view: 'isAmendmentVisible',
      create: 'isAmendmentAuthor',
      update: 'false',
      delete: 'isAmendmentAuthor || isSelf',
    },
  },
  threads: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'isGroupMember',
      'data.ref("amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isPublished',
      '"published" in data.ref("amendment.status")',
      'isAmendmentVisible',
      'isGroupMember || isPublished',
    ],
    allow: {
      view: 'isAmendmentVisible',
      create: 'isAmendmentVisible',
      update: 'isCreator',
      delete: 'isCreator',
    },
  },
  comments: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'isThreadAmendmentGroupMember',
      'data.ref("thread.amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isThreadAmendmentPublished',
      '"published" in data.ref("thread.amendment.status")',
      'isBlogGroupMember',
      'data.ref("blog.group.id") in auth.ref("$user.memberships.group.id")',
      'isBlogPublished',
      'true in data.ref("blog.published")',
      'isContentVisible',
      'isThreadAmendmentGroupMember || isThreadAmendmentPublished || isBlogGroupMember || isBlogPublished',
    ],
    allow: {
      view: 'isContentVisible',
      create: 'isContentVisible',
      update: 'isCreator',
      delete: 'isCreator',
    },
  },
  blogs: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isAuthor',
      'auth.id == data.ref("user.id")',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isBlogger',
      'auth.id in data.ref("bloggers.user.id")',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isAuthor || isBlogger)) || data.visibility == null',
      'hasGroupBlogCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'blogs' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupBlogUpdate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'blogs' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupBlogDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'blogs' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasBlogUpdate',
      "data.id in auth.ref('$user.bloggerRelations.role.actionRights.blog.id') && " +
        "'blogs' in auth.ref('$user.bloggerRelations.role.actionRights.resource') && " +
        "'update' in auth.ref('$user.bloggerRelations.role.actionRights.action')",
      'hasBlogDelete',
      "data.id in auth.ref('$user.bloggerRelations.role.actionRights.blog.id') && " +
        "'blogs' in auth.ref('$user.bloggerRelations.role.actionRights.resource') && " +
        "'delete' in auth.ref('$user.bloggerRelations.role.actionRights.action')",
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'isAuthenticated && hasGroupBlogCreate',
      update: 'isBlogger || hasGroupBlogUpdate || hasBlogUpdate',
      delete: 'hasGroupBlogDelete || hasBlogDelete',
    },
  },
  blogBloggers: {
    allow: {
      view: 'isBlogVisible || isSelf || isAuthenticated', // Allow authenticated users to see blogger relations
      create: 'isBlogOwner',
      update: 'isBlogOwner',
      delete: 'isBlogOwner || isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isBlogOwner',
      "data.ref('blog.id') in auth.ref('$user.bloggerRelations.role.actionRights.blog.id') && " +
        "'bloggers' in auth.ref('$user.bloggerRelations.role.actionRights.resource') && " +
        "'manage' in auth.ref('$user.bloggerRelations.role.actionRights.action')",
      'isBlogPublished',
      'true in data.ref("blog.published")',
      'isBlogBlogger',
      'auth.id in data.ref("blog.blogRoleBloggers.user.id")',
      'isBlogGroupMember',
      'data.ref("blog.group.id") in auth.ref("$user.memberships.group.id")',
      'isBlogVisible',
      'isBlogPublished || isBlogBlogger || isBlogGroupMember',
    ],
  },
  statements: {
    bind: [
      'isOwner',
      "auth.id in data.ref('user.id')",
      'isAuthenticated',
      'auth.id != null',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrOwner',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isOwner) || data.visibility == null',
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrOwner',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  eventParticipants: {
    bind: [
      'isParticipant',
      "auth.id in data.ref('user.id')",
      'isEventOrganizer',
      "auth.id in data.ref('event.organizer.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isEventAdmin',
      "auth.id in data.ref('event.participants.user.id') && 'admin' in data.ref('event.participants.status')",
    ],
    allow: {
      view: 'isParticipant || isEventOrganizer || isEventAdmin',
      create: 'isEventOrganizer || isSelfRequest || isEventAdmin',
      delete: 'isParticipant || isEventOrganizer || isEventAdmin',
      update: 'isParticipant || isEventOrganizer || isEventAdmin',
    },
  },
  groupMemberships: {
    bind: [
      'isMember',
      "auth.id in data.ref('user.id')",
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isGroupAdmin',
      "auth.id in data.ref('group.memberships.user.id') && ('admin' in data.ref('group.memberships.status') || 'admin' in data.ref('group.memberships.role'))",
    ],
    allow: {
      view: 'isMember || isGroupOwner || isGroupAdmin',
      create: 'isGroupOwner || isSelfRequest || isGroupAdmin',
      delete: 'isMember || isGroupOwner || isGroupAdmin',
      update: 'isMember || isGroupOwner || isGroupAdmin',
    },
  },
  follows: {
    bind: ['isFollower', "auth.id in data.ref('follower.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isFollower',
      delete: 'isFollower',
      update: 'false',
    },
  },
  $users: {
    allow: {
      view: 'isPublicOrAuthenticatedOrOwner',
      create: 'false',
      delete: 'false',
      update: 'isSelf',
    },
    bind: [
      'isSelf',
      'auth.id == data.id',
      'isAuthenticated',
      'auth.id != null',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrOwner',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isSelf) || data.visibility == null',
    ],
  },
  groupRelationships: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("parentGroup.id") in auth.ref("$user.memberships.group.id") || ' +
        'data.ref("childGroup.id") in auth.ref("$user.memberships.group.id")',
      'isParentGroupAdmin',
      "data.ref('parentGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'groups' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_relationships' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'isGroupMember',
      create: 'isParentGroupAdmin',
      update: 'isParentGroupAdmin',
      delete: 'isParentGroupAdmin',
    },
  },
  events: {
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'hasGroupEventCreatePermission',
      update: 'hasGroupEventUpdatePermission || hasEventUpdatePermission',
      delete: 'hasGroupEventDeletePermission || hasEventDeletePermission',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      "data.ref('group.id') in auth.ref('$user.memberships.group.id')",
      'isParticipant',
      "auth.id in data.ref('participants.user.id')",
      'isCreator',
      "auth.id == data.ref('creator.id')",
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isGroupMember || isParticipant)) || data.visibility == null || data.isPublic == true',
      'hasGroupEventCreatePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupEventUpdatePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupEventDeletePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasEventUpdatePermission',
      "data.id in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'update' in auth.ref('$user.participations.role.actionRights.action')",
      'hasEventDeletePermission',
      "data.id in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'delete' in auth.ref('$user.participations.role.actionRights.action')",
    ],
  },
  agendaItems: {
    allow: {
      view: 'isEventParticipant || isGroupMember',
      create: 'hasGroupAgendaItemsCreate || hasEventManageAgenda',
      update: 'hasGroupAgendaItemsUpdate || hasEventManageAgenda',
      delete: 'hasGroupAgendaItemsDelete || hasEventManageAgenda',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isEventParticipant',
      'auth.id in data.ref("event.participants.user.id")',
      'isGroupMember',
      'data.ref("event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupAgendaItemsCreate',
      "data.ref('event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'agendaItems' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupAgendaItemsUpdate',
      "data.ref('event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'agendaItems' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupAgendaItemsDelete',
      "data.ref('event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'agendaItems' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasEventManageAgenda',
      "data.ref('event.id') in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'agendaItems' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'manage' in auth.ref('$user.participations.role.actionRights.action')",
    ],
  },
  speakerList: {
    allow: {
      view: 'isEventParticipant || isGroupMember',
      create: 'isSelf || hasManageSpeakers',
      update: 'hasManageSpeakers',
      delete: 'isSelf || hasManageSpeakers',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isEventParticipant',
      'auth.id in data.ref("agendaItem.event.participants.user.id")',
      'isGroupMember',
      'data.ref("agendaItem.event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasManageSpeakers',
      "data.ref('agendaItem.event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_speakers' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  changeRequests: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'canViewAmendmentVote',
      'data.ref("amendmentVote.agendaItem.event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasManageVotes',
      "data.ref('amendmentVote.agendaItem.event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_votes' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'canViewAmendmentVote',
      create: 'canViewAmendmentVote',
      update: 'isCreator',
      delete: 'isCreator || hasManageVotes',
    },
  },
  changeRequestVotes: {
    allow: {
      view: 'canViewChangeRequest',
      create: 'isVoter && canViewChangeRequest',
      update: 'isVoter',
      delete: 'isVoter',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("voter.id")',
      'canViewChangeRequest',
      'data.ref("changeRequest.amendmentVote.agendaItem.event.group.id") in auth.ref("$user.memberships.group.id")',
    ],
  },
  conversationParticipants: {
    allow: {
      view: 'isSelf',
      create: 'isConversationParticipant',
      update: 'false',
      delete: 'isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isConversationParticipant',
      'auth.id in data.ref("conversation.participants.user.id")',
    ],
  },
  conversations: {
    allow: {
      view: 'isParticipant',
      create: 'isAuthenticated',
      update: 'isParticipant',
      delete: 'isParticipant',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isParticipant',
      'auth.id in data.ref("participants.user.id")',
    ],
  },
  documentCollaborators: {
    allow: {
      view: 'isDocumentVisible',
      create: 'isDocumentOwner',
      update: 'isDocumentOwner',
      delete: 'isDocumentOwner || isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isDocumentOwner',
      'auth.id == data.ref("document.owner.id")',
      'isDocumentVisible',
      'auth.id == data.ref("document.owner.id") || auth.id in data.ref("document.collaborators.user.id")',
    ],
  },
  documentCursors: {
    allow: {
      view: 'isDocumentCollaborator',
      create: 'isDocumentCollaborator && isSelf',
      update: 'isSelf',
      delete: 'isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isDocumentCollaborator',
      'auth.id == data.ref("document.owner.id") || auth.id in data.ref("document.collaborators.user.id")',
    ],
  },
  documents: {
    allow: {
      view: 'isOwner || isCollaborator || isGroupMember',
      create: 'isAuthenticated',
      update: 'isOwner || isCollaborator',
      delete: 'isOwner',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isOwner',
      'auth.id == data.ref("owner.id")',
      'isCollaborator',
      'auth.id in data.ref("collaborators.user.id")',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
    ],
  },
  documentVersions: {
    allow: {
      view: 'isDocumentCollaborator',
      create: 'isDocumentCollaborator',
      update: 'false',
      delete: 'isDocumentOwner',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isDocumentOwner',
      'auth.id == data.ref("document.owner.id")',
      'isDocumentCollaborator',
      'auth.id == data.ref("document.owner.id") || auth.id in data.ref("document.collaborators.user.id")',
    ],
  },

  $default: {
    allow: {
      view: 'true',
      create: 'true',
      delete: 'true',
      update: 'true',
    },
  },
  magicCodes: {
    allow: {
      view: 'false',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [],
  },
  electionCandidates: {
    allow: {
      view: 'isGroupMember',
      create: 'isSelf || hasManageElections',
      update: 'isSelf || hasManageElections',
      delete: 'isSelf || hasManageElections',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isGroupMember',
      'data.ref("election.position.group.id") in auth.ref("$user.memberships.group.id")',
      'hasManageElections',
      "data.ref('election.position.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'elections' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  elections: {
    allow: {
      view: 'isGroupMember',
      create: 'hasManageElections',
      update: 'hasManageElections',
      delete: 'hasManageElections',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("position.group.id") in auth.ref("$user.memberships.group.id")',
      'hasManageElections',
      "data.ref('position.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'elections' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  electionVotes: {
    allow: {
      view: 'isGroupMember && electionIsFinished',
      create: 'isVoter && electionIsOpen',
      update: 'isVoter && electionIsOpen',
      delete: 'isVoter && electionIsOpen',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("voter.id")',
      'isGroupMember',
      'data.ref("election.position.group.id") in auth.ref("$user.memberships.group.id")',
      'electionIsOpen',
      '"open" in data.ref("election.status")',
      'electionIsFinished',
      '"finished" in data.ref("election.status")',
    ],
  },
  positions: {
    allow: {
      view: 'isGroupMember',
      create: 'hasManagePositions',
      update: 'hasManagePositions',
      delete: 'hasManagePositions',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'hasManagePositions',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'positions' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  subscribers: {
    allow: {
      view: 'isSubscriber || isTarget',
      create: 'isSubscriber',
      update: 'false',
      delete: 'isSubscriber',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSubscriber',
      'auth.id == data.ref("subscriber.id")',
      'isTarget',
      'auth.id == data.ref("user.id") || auth.id == data.ref("group.owner.id")',
    ],
  },
  hashtags: {
    allow: {
      view: 'isAuthenticated',
      create: 'isContentCreator',
      update: 'false',
      delete: 'isContentCreator',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isContentCreator',
      'auth.id == data.ref("amendment.user.id") || ' +
        'auth.id == data.ref("blog.user.id") || ' +
        'auth.id == data.ref("event.creator.id") || ' +
        'auth.id == data.ref("group.owner.id")',
    ],
  },
  payments: {
    allow: {
      view: 'isPayer || isReceiver',
      create: 'isPayer || hasGroupPaymentCreate',
      update: 'hasGroupPaymentUpdate',
      delete: 'hasGroupPaymentDelete',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isPayer',
      'auth.id == data.ref("payerUser.id") || ' +
        'data.ref("payerGroup.id") in auth.ref("$user.memberships.group.id")',
      'isReceiver',
      'auth.id == data.ref("receiverUser.id") || ' +
        'data.ref("receiverGroup.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupPaymentCreate',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupPaymentUpdate',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupPaymentDelete',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  messages: {
    allow: {
      view: 'isConversationParticipant',
      create: 'isConversationParticipant',
      update: 'false',
      delete: 'isSender',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSender',
      'auth.id == data.ref("sender.id")',
      'isConversationParticipant',
      'auth.id in data.ref("conversation.participants.user.id")',
    ],
  },
  notifications: {
    allow: {
      view: 'isRecipient',
      create: 'false',
      update: 'isRecipient',
      delete: 'isRecipient',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isRecipient',
      'auth.id == data.ref("recipient.id")',
    ],
  },
  todoAssignments: {
    allow: {
      view: 'isAssignee || isTodoCreator',
      create: 'isTodoCreator',
      update: 'isAssignee',
      delete: 'isTodoCreator',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isAssignee',
      'auth.id == data.ref("user.id")',
      'isTodoCreator',
      'auth.id == data.ref("todo.creator.id")',
    ],
  },
  todos: {
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'isAuthenticated && (isGroupMember || hasGroupTodoCreate)',
      update: 'isCreator || hasGroupTodoUpdate',
      delete: 'isCreator || hasGroupTodoDelete',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'isAssignee',
      'auth.id in data.ref("assignments.user.id")',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isCreator || isAssignee)) || data.visibility == null',
      'hasGroupTodoCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupTodoUpdate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupTodoDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  timelineEvents: {
    allow: {
      view: 'isRelevantUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isRelevantUser',
      'auth.id == data.ref("user.id") || ' +
        'auth.id == data.ref("actor.id") || ' +
        'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
    ],
  },
  amendments: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isAuthor',
      'auth.id == data.ref("user.id")',
      'isCollaborator',
      'auth.id in data.ref("collaborators.user.id")',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isAuthor || isCollaborator)) || data.visibility == null || data.status == "published"',
      'hasGroupAmendmentCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'amendments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupAmendmentDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'amendments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'isAuthenticated && hasGroupAmendmentCreate',
      update: 'isAuthor || isCollaborator',
      delete: 'isAuthor || hasGroupAmendmentDelete',
    },
  },
  amendmentVoteEntries: {
    allow: {
      view: 'canViewVote',
      create: 'isVoter && voteIsOpen',
      update: 'isVoter && voteIsOpen',
      delete: 'isVoter && voteIsOpen',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("voter.id")',
      'canViewVote',
      'data.ref("amendmentVote.agendaItem.event.group.id") in auth.ref("$user.memberships.group.id")',
      'voteIsOpen',
      '"open" in data.ref("amendmentVote.status")',
    ],
  },
  amendmentVotes: {
    allow: {
      view: 'isEventParticipant || isGroupMember',
      create: 'hasManageVotes',
      update: 'hasManageVotes',
      delete: 'hasManageVotes',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isEventParticipant',
      'auth.id in data.ref("agendaItem.event.participants.user.id")',
      'isGroupMember',
      'data.ref("agendaItem.event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasManageVotes',
      "data.ref('agendaItem.event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_votes' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  amendmentPaths: {
    allow: {
      view: 'isAmendmentVisible',
      create: 'isAmendmentAuthor',
      update: 'isAmendmentAuthor',
      delete: 'isAmendmentAuthor',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isAmendmentAuthor',
      'auth.id == data.ref("amendment.user.id")',
      'isGroupMember',
      'data.ref("amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isPublished',
      '"published" in data.ref("amendment.status")',
      'isAmendmentVisible',
      'isGroupMember || isPublished',
    ],
  },
  $files: {
    allow: {
      view: 'isAuthenticated',
      create: 'isAuthenticated',
      update: 'false',
      delete: 'isOwner',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isOwner',
      'auth.id == data.ref("userAvatar.id") || auth.id == data.ref("threads.creator.id")',
    ],
  },
  threadVotes: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("user.id")',
      'isGroupMember',
      'data.ref("thread.amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isPublished',
      '"published" in data.ref("thread.amendment.status")',
      'isThreadVisible',
      'isGroupMember || isPublished',
    ],
    allow: {
      view: 'isThreadVisible',
      create: 'isVoter && isThreadVisible',
      update: 'isVoter',
      delete: 'isVoter',
    },
  },
  commentVotes: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("user.id")',
      'isAmendmentGroupMember',
      'data.ref("comment.thread.amendment.group.id") in auth.ref("$user.memberships.group.id")',
      'isBlogPublished',
      'true in data.ref("comment.blog.published")',
      'isCommentVisible',
      'isAmendmentGroupMember || isBlogPublished',
    ],
    allow: {
      view: 'isCommentVisible',
      create: 'isVoter && isCommentVisible',
      update: 'isVoter',
      delete: 'isVoter',
    },
  },
  groups: {
    bind: [
      'isMember',
      "auth.id in data.ref('memberships.user.id')",
      'isOwner',
      "auth.id in data.ref('owner.id')",
      'isAdmin',
      "auth.id in data.ref('memberships.user.id') && ('admin' in data.ref('memberships.status') || 'admin' in data.ref('memberships.role'))",
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isAuthenticated',
      'auth.id != null',
      'isPublicOrAuthenticatedOrMember',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isMember) || data.visibility == null || data.isPublic == true',
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrMember',
      create: 'auth.id != null',
      delete: 'isOwner',
      update: 'isOwner || isAdmin',
    },
  },
  stats: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  meetingSlots: {
    bind: ['isOwner', "auth.id in data.ref('owner.id')"],
    allow: {
      view: 'data.isPublic == true || isOwner || auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner || auth.id != null', // Allow authenticated users to book slots
    },
  },
  meetingBookings: {
    bind: [
      'isBooker',
      "auth.id in data.ref('booker.id')",
      'isSlotOwner',
      "auth.id in data.ref('slot.owner.id')",
    ],
    allow: {
      view: 'isBooker || isSlotOwner',
      create: 'auth.id != null', // Allow any authenticated user to create a booking
      delete: 'isBooker || isSlotOwner',
      update: 'isBooker || isSlotOwner',
    },
  },
  links: {
    bind: [
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isUserOwner',
      "auth.id in data.ref('user.id')",
      'isSlotOwner',
      "auth.id in data.ref('meetingSlot.owner.id')",
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupLinkCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupLinkUpdate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupLinkDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'auth.id != null',
      create: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkCreate',
      delete: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkDelete',
      update: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkUpdate',
    },
  },
  stripeCustomers: {
    allow: {
      view: 'isSelf',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: ['isAuthenticated', 'auth.id != null', 'isSelf', 'auth.id == data.ref("user.id")'],
  },
  stripeSubscriptions: {
    allow: {
      view: 'isCustomerUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCustomerUser',
      'auth.id == data.ref("customer.user.id")',
    ],
  },
  stripePayments: {
    allow: {
      view: 'isCustomerUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCustomerUser',
      'auth.id == data.ref("customer.user.id")',
    ],
  },
  pushSubscriptions: {
    allow: {
      view: 'isSelf',
      create: 'isSelf',
      update: 'isSelf',
      delete: 'isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
    ],
  },
} satisfies InstantRules;

export default rules;
