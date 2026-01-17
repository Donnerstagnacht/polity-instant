/**
 * Extended permissions for amendments with workflow status support
 */

import type { InstantRules } from '@instantdb/react';

const amendmentPermsExtension = {
  amendments: {
    bind: [
      // ... existing binds ...
      'inCollaborativePhase',
      'data.workflowStatus in ["collaborative_editing", "internal_suggesting", "internal_voting", "viewing"]',
      'inEventPhase',
      'data.workflowStatus in ["event_suggesting", "event_voting"]',
      'isEventParticipant',
      'data.ref("currentEventId") in auth.ref("$user.eventParticipants.event.id")',
      'canCreateChangeRequestInEventPhase',
      'inEventPhase && isEventParticipant && data.workflowStatus == "event_suggesting"',
      'canVoteInEventPhase',
      'inEventPhase && isEventParticipant && data.workflowStatus == "event_voting"',
    ],
    allow: {
      // Update permission based on workflow status
      update:
        '(inCollaborativePhase && (isAuthor || isCollaborator)) || ' +
        '(data.workflowStatus == "event_suggesting" && isEventParticipant)',
    },
  },
  changeRequests: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'isAmendmentCollaborator',
      'auth.id in data.ref("amendment.collaborators.user.id")',
      'isAmendmentAuthor',
      'auth.id == data.ref("amendment.user.id")',
      'amendmentInCollaborativePhase',
      'data.ref("amendment.workflowStatus") in ["collaborative_editing", "internal_suggesting", "internal_voting"]',
      'amendmentInEventPhase',
      'data.ref("amendment.workflowStatus") in ["event_suggesting", "event_voting"]',
      'isEventParticipantForAmendment',
      'data.ref("amendment.currentEventId") in auth.ref("$user.eventParticipants.event.id")',
      'canCreateChangeRequest',
      '(amendmentInCollaborativePhase && (isAmendmentAuthor || isAmendmentCollaborator)) || ' +
        '(data.ref("amendment.workflowStatus") == "event_suggesting" && isEventParticipantForAmendment)',
      'canViewChangeRequest',
      'isAmendmentCollaborator || isAmendmentAuthor || isEventParticipantForAmendment || data.ref("amendment.visibility") == "public"',
    ],
    allow: {
      view: 'canViewChangeRequest',
      create: 'canCreateChangeRequest',
      update: 'isCreator || isAmendmentAuthor',
      delete: 'isCreator || isAmendmentAuthor',
    },
  },
  amendmentVotingSessions: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isEventOrganizer',
      'data.ref("event.id") in auth.ref("$user.eventParticipants.event.id") && ' +
        "data.ref('event.id') in auth.ref('$user.memberships.group.roles.actionRights.event.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'canViewSession',
      'isEventOrganizer || data.ref("event.id") in auth.ref("$user.eventParticipants.event.id")',
    ],
    allow: {
      view: 'canViewSession',
      create: 'isEventOrganizer',
      update: 'isEventOrganizer',
      delete: 'isEventOrganizer',
    },
  },
  amendmentVotingSessionVotes: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isVoter',
      'auth.id == data.ref("voter.id")',
      'isEventParticipantForSession',
      'data.ref("session.event.id") in auth.ref("$user.eventParticipants.event.id")',
      'sessionIsActive',
      'data.ref("session.status") == "active"',
      'canVoteInSession',
      'isEventParticipantForSession && sessionIsActive',
    ],
    allow: {
      view: 'isEventParticipantForSession',
      create: 'canVoteInSession',
      update: 'isVoter && sessionIsActive',
      delete: 'false',
    },
  },
};

export default amendmentPermsExtension;
