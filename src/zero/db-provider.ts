import postgres from 'postgres'
import { zeroPostgresJS } from '@rocicorp/zero/server/adapters/postgresjs'
import { schema } from './schema'

const sql = postgres(process.env.ZERO_UPSTREAM_DB!)

export const dbProvider = zeroPostgresJS(schema, sql)

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    dbProvider: typeof dbProvider
  }
}