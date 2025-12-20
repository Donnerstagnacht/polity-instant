import type { InstantRules } from '@instantdb/react';

const rules = {
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
} satisfies InstantRules;

export default rules;
