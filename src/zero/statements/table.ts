import { table, string, number } from '@rocicorp/zero'

export const statement = table('statement')
  .columns({
    id: string(),
    user_id: string(),
    group_id: string().optional(),
    text: string().optional(),
    image_url: string().optional(),
    video_url: string().optional(),
    visibility: string(),
    upvotes: number(),
    downvotes: number(),
    comment_count: number(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const statementSurvey = table('statement_survey')
  .columns({
    id: string(),
    statement_id: string(),
    question: string(),
    ends_at: number(),
    created_at: number(),
  })
  .primaryKey('id')

export const statementSurveyOption = table('statement_survey_option')
  .columns({
    id: string(),
    survey_id: string(),
    label: string(),
    vote_count: number(),
    position: number(),
    created_at: number(),
  })
  .primaryKey('id')

export const statementSurveyVote = table('statement_survey_vote')
  .columns({
    id: string(),
    option_id: string(),
    user_id: string(),
    created_at: number(),
  })
  .primaryKey('id')
