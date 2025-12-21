/**
 * Document Mutations Hook
 *
 * Manages document CRUD operations (create, update, delete).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import db, { tx, id } from '../../../../db/db';

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
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new document
   */
  const createDocument = async (
    title: string,
    groupId: string,
    userId: string
  ): Promise<string | null> => {
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return null;
    }

    setIsCreating(true);

    try {
      const docId = id();
      await db.transact([
        tx.documents[docId]
          .update({
            title,
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
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isPublic: false,
          })
          .link({ owner: userId, group: groupId }),
      ]);

      toast.success('Document created successfully');

      // Navigate to the new document
      setTimeout(() => {
        router.push(`/group/${groupId}/editor/${docId}`);
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
  const deleteDocument = async (documentId: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      await db.transact([tx.documents[documentId].delete()]);

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
