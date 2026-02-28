// Table
export {
  statement,
  statementSurvey,
  statementSurveyOption,
  statementSurveyVote,
} from './table'

// Zod Schemas
export {
  selectStatementSchema,
  createStatementSchema,
  updateStatementSchema,
  deleteStatementSchema,
  selectStatementSurveySchema,
  createStatementSurveySchema,
  deleteStatementSurveySchema,
  selectStatementSurveyOptionSchema,
  createStatementSurveyOptionSchema,
  deleteStatementSurveyOptionSchema,
  selectStatementSurveyVoteSchema,
  createStatementSurveyVoteSchema,
  deleteStatementSurveyVoteSchema,
  type Statement,
  type StatementSurvey,
  type StatementSurveyOption,
  type StatementSurveyVote,
} from './schema'

// Queries & Mutators
export { statementQueries } from './queries'
export { statementSharedMutators } from './shared-mutators'

// Facade hooks
export { useStatementState } from './useStatementState'
export { useStatementActions } from './useStatementActions'
