/**
 * Supabase middleware utilities for TanStack Start.
 * 
 * Note: TanStack Start does not use Next.js middleware.
 * Auth protection is handled in route beforeLoad hooks (see src/routes/_authed.tsx).
 * This file provides helper utilities for server-side auth checking.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Verify a user session from a request's auth header.
 * Use in TanStack Start server functions when you need server-side auth.
 */
export async function verifySession(request: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7))
  return user
}
