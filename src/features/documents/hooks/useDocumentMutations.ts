/**
 * Document Mutations Hook
 *
 * Manages document CRUD operations (create, update, delete).
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { notifyDocumentCreated, notifyDocumentDeleted } from '@/features/notifications/utils/notification-helpers.ts';

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
  const { createDocument: createDocAction, deleteDocument: deleteDocAction, addCollaborator } = useDocumentActions();
  const { createAmendment } = useAmendmentActions();
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
      // Create an amendment as the group-linking container for this document.
      // Documents are associated with groups through amendment.group_id, so we
      // must create a minimal amendment first, then attach the document to it.
      const amendmentId = crypto.randomUUID();
      await createAmendment({
        id: amendmentId,
        title,
        group_id: groupId,
        status: 'draft',
        workflow_status: null,
        visibility: 'group',
        is_public: false,
        editing_mode: 'single',
        code: null,
        reason: null,
        category: null,
        preamble: null,
        event_id: null,
        clone_source_id: null,
        tags: null,
        discussions: null,
        image_url: null,
        x: null,
        youtube: null,
        linkedin: null,
        website: null,
      });

      const docId = crypto.randomUUID();
      await createDocAction({
        id: docId,
        amendment_id: amendmentId,
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

      // Add creator as collaborator so the document is user-attributed.
      await addCollaborator({
        id: crypto.randomUUID(),
        document_id: docId,
        user_id: userId,
        role_id: null,
        status: 'active',
        visibility: 'group',
      });

      toast.success('Document created successfully');

      // Navigate to the new document
      navigate({ to: `/group/${groupId}/editor/${docId}` });

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
