import { useMemo } from 'react';
import db from '../../../../../db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import { buildCommentTree, sortComments, sortCommentTree, type CommentWithReplies } from '../utils/comment-tree';

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
  // Fetch amendment data
  const { amendment, isLoading: amendmentLoading } = useAmendmentData(amendmentId);

  // Fetch threads with detailed nested data
  const { data: threadsData, isLoading: threadsLoading } = db.useQuery({
    threads: {
      $: { where: { 'amendment.id': amendmentId } },
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

  // Process threads with comment trees
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

  // Sort threads themselves
  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      if (sortBy === 'votes') {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.createdAt - a.createdAt;
      } else {
        return b.createdAt - a.createdAt;
      }
    });
  }, [threads, sortBy]);

  const isLoading = amendmentLoading || threadsLoading;

  return {
    amendment,
    threads: sortedThreads,
    isLoading,
  };
}
