/**
 * Thread and comment operations
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { notifyAmendmentCommentAdded } from '@/utils/notification-helpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Create a new discussion thread
 */
export async function createThread(
  amendmentId: string,
  title: string,
  description: string,
  userId: string,
  fileId?: string,
  notificationContext?: { senderName: string; amendmentTitle: string }
): Promise<string> {
  const threadId = crypto.randomUUID();
  const now = new Date().toISOString();

  await supabase.from('thread').insert({
    id: threadId,
    title,
    description: description || undefined,
    created_at: now,
    updated_at: now,
    amendment_id: amendmentId,
    creator_id: userId,
    file_id: fileId || null,
  });

  if (notificationContext) {
    await notifyAmendmentCommentAdded({
      senderId: userId,
      senderName: notificationContext.senderName,
      amendmentId,
      amendmentTitle: notificationContext.amendmentTitle,
    });
  }

  return threadId;
}

/**
 * Create a new comment on a thread
 */
export async function createComment(
  threadId: string,
  text: string,
  userId: string,
  parentCommentId?: string,
  notificationContext?: { senderName: string; amendmentId: string; amendmentTitle: string }
): Promise<string> {
  const commentId = crypto.randomUUID();

  await supabase.from('comment').insert({
    id: commentId,
    text,
    created_at: new Date().toISOString(),
    thread_id: threadId,
    creator_id: userId,
    parent_comment_id: parentCommentId || null,
  });

  if (notificationContext) {
    await notifyAmendmentCommentAdded({
      senderId: userId,
      senderName: notificationContext.senderName,
      amendmentId: notificationContext.amendmentId,
      amendmentTitle: notificationContext.amendmentTitle,
    });
  }

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
