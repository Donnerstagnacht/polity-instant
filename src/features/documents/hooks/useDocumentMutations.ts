/**
 * Document Mutations Hook
 *
 * Manages document CRUD operations (create, update, delete).
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { notifyDocumentCreated, notifyDocumentDeleted } from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';

interface UseDocumentMutationsResult {
  createDocument: (title: string, groupId: string, userId: string) => Promise<string | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  isCreating: boolean;
  isDeleting: boolean;
}

/**
 * Hook for managing document mutations
 *
 * @param groupId - ID of the group (for navigation after creation)
 * @returns Mutation functions and loading states
 *
 * @example
 * const { createDocument, isCreating } = useDocumentMutations(groupId);
 * const docId = await createDocument('My Document', groupId, userId);
 */
export function useDocumentMutations(groupId: string): UseDocumentMutationsResult {
  const navigate = useNavigate();
  const { createDocument: createDocAction, deleteDocument: deleteDocAction } = useDocumentActions();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new document
   */
  const createDocument = async (
    title: string,
    groupId: string,
    userId: string,
    groupName?: string,
    adminUserIds?: string[]
  ): Promise<string | null> => {
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return null;
    }

    setIsCreating(true);

    try {
      const docId = crypto.randomUUID();
      await createDocAction({
        id: docId,
        amendment_id: '',
        content: [
          {
            type: 'h1',
            children: [{ text: title }],
          },
          {
            type: 'p',
            children: [{ text: 'Start writing your document...' }],
          },
        ],
        editing_mode: 'single',
      });

      sendNotificationFn({ data: { helper: 'notifyDocumentCreated', params: { senderId: userId, groupId, groupName } } }).catch(console.error)
      toast.success('Document created successfully');

      // Navigate to the new document
      setTimeout(() => {
        navigate({ to: `/group/${groupId}/editor/${docId}` });
      }, 100);

      return docId;
    } catch (error) {
      console.error('Failed to create document:', error);
      toast.error('Failed to create document');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Delete a document
   */
  const deleteDocument = async (
    documentId: string,
    documentTitle?: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ): Promise<boolean> => {
    setIsDeleting(true);

    try {
      await deleteDocAction(documentId);

      sendNotificationFn({ data: { helper: 'notifyDocumentDeleted', params: { senderId, groupId, groupName } } }).catch(console.error)
      toast.success('Document deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createDocument,
    deleteDocument,
    isCreating,
    isDeleting,
  };
}
