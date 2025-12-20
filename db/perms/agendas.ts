import type { InstantRules } from '@instantdb/react';

const rules = {
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
} satisfies InstantRules;

export default rules;
