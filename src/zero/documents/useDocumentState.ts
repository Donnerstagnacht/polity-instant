import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface DocumentStateOptions {
  documentId: string
  includeVersions?: boolean
  includeCollaborators?: boolean
}

/**
 * Reactive state hook for document data.
 * Returns all query-derived state — no mutations.
 */
export function useDocumentState(options: DocumentStateOptions) {
  const { documentId, includeVersions, includeCollaborators } = options

  const [document, documentResult] = useQuery(
    queries.documents.byId({ id: documentId })
  )

  const [threads, threadsResult] = useQuery(
    queries.documents.threads({ document_id: documentId })
  )

  const [versions, versionsResult] = useQuery(
    includeVersions
      ? queries.documents.versions({ document_id: documentId })
      : undefined
  )

  const [collaborators, collaboratorsResult] = useQuery(
    includeCollaborators
      ? queries.documents.collaborators({ document_id: documentId })
      : undefined
  )

  const isLoading =
    documentResult.type === 'unknown' ||
    threadsResult.type === 'unknown' ||
    (includeVersions === true && versionsResult.type === 'unknown') ||
    (includeCollaborators === true && collaboratorsResult.type === 'unknown')

  return {
    document,
    threads,
    versions: versions ?? [],
    collaborators: collaborators ?? [],
    isLoading,
  }
}
