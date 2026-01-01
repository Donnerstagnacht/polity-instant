import { i } from '@instantdb/react';

const _blog = {
  entities: {
    blogs: i.entity({
      commentCount: i.number(),
      date: i.string(),
      likeCount: i.number(),
      title: i.string(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
      upvotes: i.number().optional(),
      downvotes: i.number().optional(),
    }),
    blogBloggers: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, writer, owner
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    blogSupportVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.number().indexed(), // 1 for upvote, -1 for downvote
    }),
  },
  links: {
    blogsGroup: {
      forward: {
        on: 'blogs',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'blogs',
      },
    },
    blogBloggersRole: {
      forward: { on: 'blogBloggers', has: 'one', label: 'role' },
      reverse: { on: 'roles', has: 'many', label: 'bloggers' },
    },
    blogBloggersBlog: {
      forward: { on: 'blogBloggers', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'blogRoleBloggers' },
    },
    blogBloggersUser: {
      forward: { on: 'blogBloggers', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'many', label: 'bloggerRelations' },
    },
    roleBlog: {
      forward: { on: 'roles', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'roles' },
    },
    actionRightBlog: {
      forward: { on: 'actionRights', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'scopedActionRights' },
    },
    subscribersBlog: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'subscribers',
      },
    },
    hashtagBlogs: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'hashtags',
      },
    },
    timelineEventsBlog: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    blogSupportVotesUser: {
      forward: {
        on: 'blogSupportVotes',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'blogSupportVotes',
      },
    },
    blogSupportVotesBlog: {
      forward: {
        on: 'blogSupportVotes',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'votes',
      },
    },
  } as const,
};

export default _blog;
