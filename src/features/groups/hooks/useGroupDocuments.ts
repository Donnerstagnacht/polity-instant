/**
 * Group Documents Hook
 *
 * Manages fetching and querying documents for a specific group.
 * Includes ownership verification and document metadata.
 */

import db from '../../../../db/db';

export interface DocumentWithMetadata {
  id: string;
  title: string;
  content?: any[];
  discussions?: any[];
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
  owner?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    imageURL?: string;
  };
  group?: {
    id: string;
    name?: string;
  };
  collaborators?: Array<{
    id: string;
    user?: {
      id: string;
      name?: string;
      email?: string;
      avatar?: string;
    };
    roleName?: string;
  }>;
}

interface UseGroupDocumentsResult {
  documents: DocumentWithMetadata[];
  isLoading: boolean;
  error?: Error;
}

/**
 * Hook for fetching documents belonging to a specific group
 *
 * @param groupId - ID of the group to fetch documents for
 * @returns Documents data, loading state, and error if any
 *
 * @example
 * const { documents, isLoading } = useGroupDocuments(groupId);
 */
export function useGroupDocuments(groupId: string): UseGroupDocumentsResult {
  const { data, isLoading, error } = db.useQuery({
    documents: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      owner: {},
      group: {},
      collaborators: {
        user: {},
      },
    },
  });

  const documents = (data?.documents || []) as DocumentWithMetadata[];

  return {
    documents,
    isLoading,
    error: error as Error | undefined,
  };
}

/**
 * Check if user is the owner of a document
 *
 * @param document - The document to check
 * @param userId - ID of the user to check
 * @returns true if user owns the document
 */
export function isDocumentOwner(
  document: DocumentWithMetadata | undefined,
  userId: string | undefined
): boolean {
  if (!document?.owner || !userId) return false;
  return document.owner.id === userId;
}

/**
 * Check if user has access to a document (owner or collaborator)
 *
 * @param document - The document to check
 * @param userId - ID of the user to check
 * @returns true if user has access
 */
export function hasDocumentAccess(
  document: DocumentWithMetadata | undefined,
  userId: string | undefined
): boolean {
  if (!document || !userId) return false;
  
  // Check if owner
  if (document.owner?.id === userId) return true;
  
  // Check if collaborator
  if (document.collaborators?.some(c => c.user?.id === userId)) return true;
  
  // Check if public
  if (document.isPublic) return true;
  
  return false;
}
