import { i } from '@instantdb/react';

const _groups = {
  entities: {
    groups: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      isPublic: i.boolean().indexed(),
      memberCount: i.number().indexed(),
      name: i.string().indexed(),
      updatedAt: i.date().indexed(),
      location: i.string().optional(),
      region: i.string().optional(),
      country: i.string().optional(),
      imageURL: i.string().optional(),
      whatsapp: i.string().optional(),
      instagram: i.string().optional(),
      twitter: i.string().optional(),
      facebook: i.string().optional(),
      snapchat: i.string().optional(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    groupMemberships: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    groupRelationships: i.entity({
      createdAt: i.date().indexed(),
      relationshipType: i.string().indexed(),
      updatedAt: i.date().indexed(),
      withRight: i.string().indexed(),
      status: i.string().indexed().optional(), // 'active', 'requested', 'rejected', etc.
      initiatorGroupId: i.string().indexed().optional(),
    }),
    roles: i.entity({
      name: i.string(),
      description: i.string().optional(),
      scope: i.string().indexed(), // 'group', 'event', 'amendment', or 'blog'
      createdAt: i.date().indexed().optional(),
      updatedAt: i.date().indexed().optional(),
    }),
    actionRights: i.entity({
      resource: i.string().indexed(),
      action: i.string().indexed(),
    }),
    positions: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      firstTermStart: i.date().indexed(),
      term: i.number(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      scheduledRevoteDate: i.date().indexed().optional(), // When the next revote is scheduled
    }),
    positionHolderHistory: i.entity({
      startDate: i.date().indexed(),
      endDate: i.date().indexed().optional(),
      reason: i.string().indexed(), // 'elected', 'appointed', 'resigned', 'term_ended', 'removed'
      createdAt: i.date().indexed(),
    }),
  },
  links: {
    groupsOwner: {
      forward: {
        on: 'groups',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedGroups',
      },
    },
    groupMembershipsGroup: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'memberships',
      },
    },
    groupMembershipsUser: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'memberships',
      },
    },
    groupMembershipRole: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'role',
      },
      reverse: {
        on: 'roles',
        has: 'many',
        label: 'groupMemberships',
      },
    },
    roleGroup: {
      forward: { on: 'roles', has: 'one', label: 'group' },
      reverse: { on: 'groups', has: 'many', label: 'roles' },
    },
    actionRightRole: {
      forward: { on: 'actionRights', has: 'many', label: 'roles' },
      reverse: { on: 'roles', has: 'many', label: 'actionRights' },
    },
    actionRightGroup: {
      forward: { on: 'actionRights', has: 'one', label: 'group' },
      reverse: { on: 'groups', has: 'many', label: 'scopedActionRights' },
    },
    groupRelationshipsChildGroup: {
      forward: {
        on: 'groupRelationships',
        has: 'one',
        label: 'childGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'parentRelationships',
      },
    },
    groupRelationshipsParentGroup: {
      forward: {
        on: 'groupRelationships',
        has: 'one',
        label: 'parentGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'childRelationships',
      },
    },
    positionsCurrentHolder: {
      forward: {
        on: 'positions',
        has: 'one',
        label: 'currentHolder',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'currentPositions',
      },
    },
    positionsGroup: {
      forward: {
        on: 'positions',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'positions',
      },
    },
    positionHolderHistoryPosition: {
      forward: {
        on: 'positionHolderHistory',
        has: 'one',
        label: 'position',
      },
      reverse: {
        on: 'positions',
        has: 'many',
        label: 'holderHistory',
      },
    },
    positionHolderHistoryHolder: {
      forward: {
        on: 'positionHolderHistory',
        has: 'one',
        label: 'holder',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'positionHistory',
      },
    },
  } as const,
};

export default _groups;
