/**
 * Utility functions for building and managing comment trees
 */

/**
 * A comment row from Zero's threads query, augmented with a `replies` tree.
 * Fields match the Zero schema: `content`, `user`, `parent`, `created_at`, etc.
 */
export interface CommentWithReplies {
  id: string;
  thread_id: string;
  user_id: string;
  content: string | null;
  created_at: number;
  updated_at: number;
  parent_id: string | null;
  parent?: { id: string } | null;
  upvotes: number;
  downvotes: number;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    handle?: string | null;
    avatar?: string | null;
  } | null;
  votes?: ReadonlyArray<{
    id: string;
    vote: number | null;
    user?: {
      id: string;
    } | null;
  }>;
  replies?: CommentWithReplies[];
}

/**
 * Build a tree structure from flat comments array
 */
export function buildCommentTree(comments: ReadonlyArray<CommentWithReplies>): CommentWithReplies[] {
  const rootComments: CommentWithReplies[] = [];
  const commentMap = new Map<string, CommentWithReplies>();

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentNode = commentMap.get(comment.id);
    if (!commentNode) return;

    if (comment.parent_id) {
      const parentNode = commentMap.get(comment.parent_id);
      if (parentNode) {
        if (!parentNode.replies) {
          parentNode.replies = [];
        }
        parentNode.replies.push(commentNode);
      }
    } else {
      rootComments.push(commentNode);
    }
  });

  return rootComments;
}

/**
 * Sort comments by vote score or time
 */
export function sortComments(
  comments: CommentWithReplies[],
  sortBy: 'votes' | 'time'
): CommentWithReplies[] {
  return [...comments].sort((a, b) => {
    if (sortBy === 'votes') {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.created_at - a.created_at;
    } else {
      return b.created_at - a.created_at;
    }
  });
}

/**
 * Recursively sort a comment tree
 */
export function sortCommentTree(
  comment: CommentWithReplies,
  sortBy: 'votes' | 'time'
): CommentWithReplies {
  if (!comment.replies || comment.replies.length === 0) return comment;

  const sortedReplies = sortComments(comment.replies, sortBy).map(reply =>
    sortCommentTree(reply, sortBy)
  );

  return { ...comment, replies: sortedReplies };
}
