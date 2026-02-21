import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface ZeroAuthContext {
  userID: string
  email: string
}

/**
 * Extract the authenticated user from a request forwarded by zero-cache.
 * zero-cache forwards the auth token as an Authorization: Bearer header.
 * Falls back to anon if no valid auth is present.
 */
export async function getAuthFromRequest(request: Request): Promise<ZeroAuthContext> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[zero-auth] No Bearer token found in request — returning anon')
    return { userID: 'anon', email: '' }
  }

  const token = authHeader.slice(7)
  const supabase = createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.warn('[zero-auth] Token validation failed:', error?.message ?? 'no user returned')
    return { userID: 'anon', email: '' }
  }

  return {
    userID: user.id,
    email: user.email ?? '',
  }
}
