/**
 * Server-side notification dispatcher.
 *
 * Thin wrapper around notification-helpers that is called fire-and-forget
 * from server mutator overrides.  Runs outside the DB transaction so the
 * mutation stays fast. Errors are logged but never bubble up to the caller.
 */
import * as helpers from '@/features/notifications/utils/notification-helpers.ts'

const LOG = '[ServerNotify]'

type Params = Record<string, string | null | undefined>

// Dynamic dispatch: helpers have varying signatures, but fireNotification
// only passes Record<string, string | undefined> params from server mutators.
type HelperFn = (...args: never[]) => Promise<unknown>

/**
 * Fire-and-forget: calls the named notification helper.
 * Swallows all errors so it never affects the mutation.
 */
export function fireNotification(helperName: string, params: Params): void {
  const fn = (helpers as Record<string, HelperFn | undefined>)[helperName]
  if (typeof fn !== 'function') {
    console.error(LOG, `Unknown helper: ${helperName}`)
    return
  }
  ;(fn as (p: Params) => Promise<void>)(params)
    .then(() => console.log(LOG, `${helperName} sent`))
    .catch((err: unknown) => console.error(LOG, `${helperName} failed:`, err))
}
