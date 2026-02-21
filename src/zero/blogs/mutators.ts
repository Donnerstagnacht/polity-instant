import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  createBlogBloggerSchema,
  updateBlogBloggerSchema,
  deleteBlogBloggerSchema,
} from './schema'
import {
  createBlogSupportVoteSchema,
  updateBlogSupportVoteSchema,
  deleteBlogSupportVoteSchema,
} from '../votes/schema'

export const blogMutators = {
  // Create a blog
  create: defineMutator(
    createBlogSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.blog.insert({
        ...args,
        like_count: 0,
        comment_count: 0,
        upvotes: 0,
        downvotes: 0,
        updated_at: now,
        created_at: now,
      })
    }
  ),

  // Update a blog
  update: defineMutator(
    updateBlogSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Delete a blog
  delete: defineMutator(
    deleteBlogSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog.delete({ id: args.id })
    }
  ),

  // Create a blog_blogger entry
  createEntry: defineMutator(
    createBlogBloggerSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.blog_blogger.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Update a blog_blogger entry
  updateEntry: defineMutator(
    updateBlogBloggerSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog_blogger.update(args)
    }
  ),

  // Delete a blog_blogger entry
  deleteEntry: defineMutator(
    deleteBlogBloggerSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog_blogger.delete({ id: args.id })
    }
  ),

  // Blog Support Vote mutators
  createSupportVote: defineMutator(
    createBlogSupportVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.blog_support_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  updateSupportVote: defineMutator(
    updateBlogSupportVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog_support_vote.update(args)
    }
  ),

  deleteSupportVote: defineMutator(
    deleteBlogSupportVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog_support_vote.delete({ id: args.id })
    }
  ),
}
