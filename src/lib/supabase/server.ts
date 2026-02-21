import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase server client for use in TanStack Start server functions.
 * Uses service role key for admin operations.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get session from request headers (for TanStack Start server functions).
 */
export async function getSession(request: Request) {
  const supabase = createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user } } = await supabase.auth.getUser(token)
    return user ? { user } : null
  }

  return null
}
