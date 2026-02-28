import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface BlogStateOptions {
  blogId?: string
  groupId?: string
  userId?: string
  includeBloggers?: boolean
  includeManagement?: boolean
  includeDetails?: boolean
  includeHashtags?: boolean
  includeForEditor?: boolean
  includeVersions?: boolean
  includeSubscribers?: boolean
  includeComments?: boolean
}

/**
 * Reactive state hook for blog data.
 * Returns query-derived state — no mutations.
 */
export function useBlogState(options: BlogStateOptions = {}) {
  const {
    blogId,
    groupId,
    userId,
    includeBloggers,
    includeManagement,
    includeDetails,
    includeHashtags,
    includeForEditor,
    includeVersions,
    includeSubscribers,
    includeComments,
  } = options

  const [blog, blogResult] = useQuery(
    blogId ? queries.blogs.byId({ id: blogId }) : undefined
  )

  const [entries, entriesResult] = useQuery(
    blogId ? queries.blogs.entries({ blog_id: blogId }) : undefined
  )

  const [blogWithBloggers, blogWithBloggersResult] = useQuery(
    includeBloggers && blogId
      ? queries.blogs.byIdWithBloggers({ id: blogId })
      : undefined
  )

  const [blogWithManagement, blogWithManagementResult] = useQuery(
    includeManagement && blogId
      ? queries.blogs.byIdWithManagement({ id: blogId })
      : undefined
  )

  const [blogWithDetails, blogWithDetailsResult] = useQuery(
    includeDetails && blogId
      ? queries.blogs.byIdWithDetails({ id: blogId })
      : undefined
  )

  const [blogWithHashtags, blogWithHashtagsResult] = useQuery(
    includeHashtags && blogId
      ? queries.blogs.byIdWithHashtags({ id: blogId })
      : undefined
  )

  const [blogForEditor, blogForEditorResult] = useQuery(
    includeForEditor && blogId
      ? queries.blogs.byIdForEditor({ id: blogId })
      : undefined
  )

  const [versions, versionsResult] = useQuery(
    includeVersions && blogId
      ? queries.blogs.versionsByBlogId({ blog_id: blogId })
      : undefined
  )

  const [subscribers, subscribersResult] = useQuery(
    includeSubscribers && blogId
      ? queries.blogs.subscribers({ blog_id: blogId })
      : undefined
  )

  const [blogThread, blogThreadResult] = useQuery(
    includeComments && blogId
      ? queries.blogs.blogThread({ blog_id: blogId })
      : undefined
  )

  const comments = blogThread?.comments ?? []

  // ── Group blogs with hashtags (opt-in) ─────────────────────────────
  const [blogsByGroup, blogsByGroupResult] = useQuery(
    groupId
      ? queries.blogs.byGroupWithHashtags({ group_id: groupId })
      : undefined
  )

  // ── Bloggers by user (opt-in) ──────────────────────────────────────
  const [bloggersByUser, bloggersByUserResult] = useQuery(
    userId
      ? queries.blogs.bloggersByUser({ user_id: userId })
      : undefined
  )

  const isLoading =
    (blogId !== undefined && blogResult.type === 'unknown') ||
    (blogId !== undefined && entriesResult.type === 'unknown') ||
    (includeBloggers === true && blogId !== undefined && blogWithBloggersResult.type === 'unknown') ||
    (includeManagement === true && blogId !== undefined && blogWithManagementResult.type === 'unknown') ||
    (includeDetails === true && blogId !== undefined && blogWithDetailsResult.type === 'unknown') ||
    (includeHashtags === true && blogId !== undefined && blogWithHashtagsResult.type === 'unknown') ||
    (includeForEditor === true && blogId !== undefined && blogForEditorResult.type === 'unknown') ||
    (includeVersions === true && blogId !== undefined && versionsResult.type === 'unknown') ||
    (includeSubscribers === true && blogId !== undefined && subscribersResult.type === 'unknown') ||
    (includeComments === true && blogId !== undefined && blogThreadResult.type === 'unknown') ||
    (groupId !== undefined && blogsByGroupResult.type === 'unknown') ||
    (userId !== undefined && bloggersByUserResult.type === 'unknown')

  return {
    blog,
    entries: entries ?? [],
    blogWithBloggers,
    blogWithManagement,
    blogWithDetails,
    blogWithHashtags,
    blogForEditor,
    versions: versions ?? [],
    subscribers: subscribers ?? [],
    comments: comments ?? [],
    blogThread: blogThread ?? null,
    blogsByGroup: blogsByGroup ?? [],
    bloggersByUser: bloggersByUser ?? [],
    isLoading,
  }
}
