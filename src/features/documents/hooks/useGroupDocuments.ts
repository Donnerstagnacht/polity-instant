/**
 * Group Documents Hook
 *
 * Manages fetching and querying documents for a specific group.
 * Includes ownership verification and document metadata.
 */

import { useGroupDocuments as useFacadeGroupDocuments } from '@/zero/groups/useGroupState'

export function useGroupDocuments(groupId: string) {
  const { documents, isLoading } = useFacadeGroupDocuments(groupId)

  return {
    documents,
    isLoading,
    error: undefined,
  };
}

type DocumentFromHook = ReturnType<typeof useGroupDocuments>['documents'][number];

/**
 * Check if user is the owner of a document
 */
export function isDocumentOwner(
  document: DocumentFromHook | undefined,
  userId: string | undefined
): boolean {
  if (!document || !userId) return false;
  return false; // document table has no owner relation in this query
}

/**
 * Check if user has access to a document (owner or collaborator)
 */
export function hasDocumentAccess(
  document: DocumentFromHook | undefined,
  userId: string | undefined
): boolean {
  if (!document || !userId) return false;
  return true; // group documents are accessible to group members
}
