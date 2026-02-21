import postgres from 'postgres'
import { zeroPostgresJS } from '@rocicorp/zero/server/adapters/postgresjs'
import { schema } from './schema'

const sql = postgres(process.env.DATABASE_URL!)

export const dbProvider = zeroPostgresJS(schema, sql as any)
