/**
 * Thread and comment operations
 */

import db, { id as generateId } from '../../../../../db/db';
import { toast } from 'sonner';

/**
 * Create a new discussion thread
 */
export async function createThread(
  amendmentId: string,
  title: string,
  description: string,
  userId: string,
  fileId?: string
): Promise<string> {
  const threadId = generateId();
  const now = Date.now();

  const transactions = [
    db.tx.threads[threadId].update({
      title,
      description: description || undefined,
      createdAt: now,
      updatedAt: now,
    }),
    db.tx.threads[threadId].link({
      amendment: amendmentId,
      creator: userId,
    }),
  ];

  // Link file if provided
  if (fileId) {
    transactions.push(db.tx.threads[threadId].link({ file: fileId }));
  }

  await db.transact(transactions);
  return threadId;
}

/**
 * Create a new comment on a thread
 */
export async function createComment(
  threadId: string,
  text: string,
  userId: string,
  parentCommentId?: string
): Promise<string> {
  const commentId = generateId();
  const transactions = [
    db.tx.comments[commentId].update({
      text,
      createdAt: Date.now(),
    }),
    db.tx.comments[commentId].link({
      thread: threadId,
      creator: userId,
    }),
  ];

  // Link to parent comment if this is a reply
  if (parentCommentId) {
    transactions.push(db.tx.comments[commentId].link({ parentComment: parentCommentId }));
  }

  await db.transact(transactions);
  return commentId;
}

/**
 * Upload file and return file ID
 */
export async function uploadThreadFile(file: File, uploadFn: (file: File) => Promise<any>): Promise<string | null> {
  try {
    const uploadResult = await uploadFn(file);
    if (uploadResult?.key) {
      return uploadResult.key;
    }
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Failed to upload file');
    return null;
  }
}
