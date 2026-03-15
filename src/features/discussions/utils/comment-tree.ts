/**
 * Utility functions for building and managing comment trees
 */

import type { AmendmentCommentRow } from '@/zero/amendments/queries';

/**
 * A comment row from Zero's threads query, augmented with a recursive `replies` tree.
 */
export type CommentWithReplies = AmendmentCommentRow & { replies?: CommentWithReplies[] };

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
