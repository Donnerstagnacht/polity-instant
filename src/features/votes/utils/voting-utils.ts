/**
 * Shared voting utilities for amendments
 * Handles vote operations for threads, comments, and change requests
 */

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export interface VoteResult {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: number;
}

/**
 * Calculate vote score from vote counts
 */
export function calculateScore(upvotes: number = 0, downvotes: number = 0): number {
  return upvotes - downvotes;
}

/**
 * Get user's vote from a list of votes
 */
export function getUserVote(votes: any[], userId: string | undefined): number | undefined {
  if (!userId) return undefined;
  const userVote = votes?.find(v => v.user?.id === userId);
  return userVote?.vote;
}

/**
 * Handle voting on threads
 */
export async function voteOnThread(
  threadId: string,
  voteValue: number,
  currentVote: any | undefined,
  currentUpvotes: number = 0,
  currentDownvotes: number = 0,
  userId?: string
): Promise<void> {
  try {
    if (currentVote) {
      if (currentVote.vote === voteValue) {
        // Remove vote
        await supabase.from('thread_vote').delete().eq('id', currentVote.id);
        await supabase.from('thread').update({
          upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
          downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
        }).eq('id', threadId);
      } else {
        // Change vote
        await supabase.from('thread_vote').update({ vote: voteValue }).eq('id', currentVote.id);
        await supabase.from('thread').update({
          upvotes: voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
          downvotes: voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
        }).eq('id', threadId);
      }
    } else {
      if (!userId) {
        toast.error('Please log in to vote');
        return;
      }
      const voteId = crypto.randomUUID();
      await supabase.from('thread_vote').insert({
        id: voteId,
        vote: voteValue,
        created_at: new Date().toISOString(),
        thread_id: threadId,
        user_id: userId,
      });
      await supabase.from('thread').update({
        upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
        downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
      }).eq('id', threadId);
    }
  } catch (error) {
    console.error('Error voting on thread:', error);
    throw error;
  }
}

/**
 * Handle voting on comments
 */
export async function voteOnComment(
  commentId: string,
  voteValue: number,
  currentVote: any | undefined,
  currentUpvotes: number = 0,
  currentDownvotes: number = 0,
  userId?: string
): Promise<void> {
  try {
    if (currentVote) {
      if (currentVote.vote === voteValue) {
        // Remove vote
        await supabase.from('comment_vote').delete().eq('id', currentVote.id);
        await supabase.from('comment').update({
          upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
          downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
        }).eq('id', commentId);
      } else {
        // Change vote
        await supabase.from('comment_vote').update({ vote: voteValue }).eq('id', currentVote.id);
        await supabase.from('comment').update({
          upvotes: voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
          downvotes: voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
        }).eq('id', commentId);
      }
    } else {
      if (!userId) {
        toast.error('Please log in to vote');
        return;
      }
      const voteId = crypto.randomUUID();
      await supabase.from('comment_vote').insert({
        id: voteId,
        vote: voteValue,
        created_at: new Date().toISOString(),
        comment_id: commentId,
        user_id: userId,
      });
      await supabase.from('comment').update({
        upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
        downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
      }).eq('id', commentId);
    }
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw error;
  }
}
