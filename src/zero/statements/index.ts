// Table
export { statement } from './table'

// Zod Schemas
export {
  selectStatementSchema,
  createStatementSchema,
  updateStatementSchema,
  deleteStatementSchema,
  type Statement,
} from './schema'

// Queries & Mutators
export { statementQueries } from './queries'
export { statementSharedMutators } from './shared-mutators'

// Facade hooks
export { useStatementState } from './useStatementState'
export { useStatementActions } from './useStatementActions'
