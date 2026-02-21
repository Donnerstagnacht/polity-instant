// Table
export {
  document,
  documentVersion,
  documentCollaborator,
  documentCursor,
} from './table'
export { thread, comment } from '../discussions/table'
export { threadVote, commentVote } from '../votes/table'

// Zod Schemas
export {
  selectDocumentSchema,
  updateDocumentSchema,
  createDocumentVersionSchema,
  createDocumentCollaboratorSchema,
  type Document,
  type DocumentVersion,
  type DocumentCollaborator,
  type DocumentCursor,
} from './schema'
export {
  createThreadSchema,
  createCommentSchema,
  type Thread,
  type Comment,
} from '../discussions/schema'
export {
  createThreadVoteSchema,
  createCommentVoteSchema,
  type ThreadVote,
  type CommentVote,
} from '../votes/schema'

// Queries & Mutators
export { documentQueries } from './queries'
export { documentMutators } from './mutators'

// Facade Hooks
export { useDocumentState } from './useDocumentState'
export { useDocumentActions } from './useDocumentActions'
