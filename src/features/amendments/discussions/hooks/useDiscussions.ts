import { useMemo, useState } from 'react';
import db from '../../../../../db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import {
  buildCommentTree,
  sortComments,
  sortCommentTree,
  type CommentWithReplies,
} from '../utils/comment-tree';

export interface Thread {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  upvotes?: number;
  downvotes?: number;
  creator?: {
    id: string;
    name?: string;
    handle?: string;
    avatar?: string;
    imageURL?: string;
  };
  file?: {
    url?: string;
    path?: string;
  };
  votes?: {
    id: string;
    vote: number;
    user?: {
      id: string;
    };
  }[];
  comments?: CommentWithReplies[];
}

export function useDiscussions(amendmentId: string, sortBy: 'votes' | 'time' = 'votes') {
  // Cursor state for pagination
  const [cursor, setCursor] = useState<{ after?: any; first: number }>({ first: 10 });

  // Fetch amendment data
  const { amendment, isLoading: amendmentLoading } = useAmendmentData(amendmentId);

  // Fetch threads with detailed nested data
  const {
    data: threadsData,
    isLoading: threadsLoading,
    pageInfo,
  } = db.useQuery({
    threads: {
      $: {
        where: { 'amendment.id': amendmentId },
        order: sortBy === 'votes' ? { upvotes: 'desc' as const } : { createdAt: 'desc' as const },
        ...cursor,
      },
      creator: {},
      file: {},
      votes: {
        user: {},
      },
      comments: {
        creator: {},
        votes: {
          user: {},
        },
        parentComment: {},
      },
    },
  });

  const rawThreads = (threadsData?.threads || []) as Thread[];

  // Process threads with comment trees (no sorting needed since query handles it)
  const threads = useMemo(() => {
    return rawThreads.map(thread => {
      // Build comment tree
      const comments = thread.comments || [];
      const rootComments = buildCommentTree(comments);

      // Sort root comments and their replies recursively
      const sortedComments = sortComments(rootComments, sortBy).map(comment =>
        sortCommentTree(comment, sortBy)
      );

      return {
        ...thread,
        comments: sortedComments,
      };
    });
  }, [rawThreads, sortBy]);

  const isLoading = amendmentLoading || threadsLoading;

  const loadMore = () => {
    const endCursor = pageInfo?.threads?.endCursor;
    if (endCursor) {
      setCursor({ after: endCursor, first: 10 });
    }
  };

  return {
    amendment,
    threads,
    isLoading,
    hasMore: pageInfo?.threads?.hasNextPage ?? false,
    loadMore,
  };
}
