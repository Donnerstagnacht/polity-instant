/**
 * Shared voting utilities for amendments
 * Handles vote operations for threads, comments, and change requests
 */

import db, { id as generateId } from '../../../../db/db';
import { toast } from 'sonner';

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
      // Update or remove existing vote
      if (currentVote.vote === voteValue) {
        // Remove vote
        await db.transact([
          db.tx.threadVotes[currentVote.id].delete(),
          db.tx.threads[threadId].update({
            upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
            downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
          }),
        ]);
      } else {
        // Change vote
        await db.transact([
          db.tx.threadVotes[currentVote.id].update({ vote: voteValue }),
          db.tx.threads[threadId].update({
            upvotes:
              voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
            downvotes:
              voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
          }),
        ]);
      }
    } else {
      // Create new vote
      if (!userId) {
        toast.error('Please log in to vote');
        return;
      }
      const voteId = generateId();
      
      await db.transact([
        db.tx.threadVotes[voteId].update({
          vote: voteValue,
          createdAt: Date.now(),
        }),
        db.tx.threadVotes[voteId].link({
          thread: threadId,
          user: userId,
        }),
        db.tx.threads[threadId].update({
          upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
          downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
        }),
      ]);
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
      // Update or remove existing vote
      if (currentVote.vote === voteValue) {
        // Remove vote
        await db.transact([
          db.tx.commentVotes[currentVote.id].delete(),
          db.tx.comments[commentId].update({
            upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
            downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
          }),
        ]);
      } else {
        // Change vote
        await db.transact([
          db.tx.commentVotes[currentVote.id].update({ vote: voteValue }),
          db.tx.comments[commentId].update({
            upvotes:
              voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
            downvotes:
              voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
          }),
        ]);
      }
    } else {
      // Create new vote
      if (!userId) {
        toast.error('Please log in to vote');
        return;
      }
      const voteId = generateId();
      
      await db.transact([
        db.tx.commentVotes[voteId].update({
          vote: voteValue,
          createdAt: Date.now(),
        }),
        db.tx.commentVotes[voteId].link({
          comment: commentId,
          user: userId,
        }),
        db.tx.comments[commentId].update({
          upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
          downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
        }),
      ]);
    }
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw error;
  }
}
