/**
 * Utility functions for building and managing comment trees
 */

export interface CommentWithReplies {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  parentComment?: any;
  upvotes?: number;
  downvotes?: number;
  creator?: {
    id?: string;
    name?: string;
    handle?: string;
  };
  votes?: {
    id: string;
    vote: number;
    user?: {
      id: string;
    };
  }[];
  replies?: CommentWithReplies[];
}

/**
 * Build a tree structure from flat comments array
 */
export function buildCommentTree(comments: any[]): CommentWithReplies[] {
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

    if (comment.parentComment?.id) {
      const parentNode = commentMap.get(comment.parentComment.id);
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
      return b.createdAt - a.createdAt;
    } else {
      return b.createdAt - a.createdAt;
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
