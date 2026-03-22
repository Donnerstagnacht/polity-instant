// Table
export {
  amendment,
  amendmentCollaborator,
  amendmentPath,
  amendmentPathSegment,
  supportConfirmation,
} from './table'
export {
  amendmentSupportVote,
  changeRequestVote,
} from '../votes/table'
export { changeRequest } from '../change-requests/table'

// Zod Schemas
export {
  selectAmendmentSchema,
  createAmendmentSchema,
  updateAmendmentSchema,
  deleteAmendmentSchema,
  type Amendment,
  type AmendmentCollaborator,
  type AmendmentPath,
  type AmendmentPathSegment,
  type SupportConfirmation,
} from './schema'
export type {
  AmendmentSupportVote,
  ChangeRequestVote,
} from '../votes/schema'
export type { ChangeRequest } from '../change-requests/schema'

// Queries & Mutators
export { amendmentQueries } from './queries'
export { amendmentSharedMutators } from './shared-mutators'

// Facade Hooks
export { useAmendmentState } from './useAmendmentState'
export { useAmendmentActions } from './useAmendmentActions'
