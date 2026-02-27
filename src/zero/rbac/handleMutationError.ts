/**
 * Mutation Error Handler
 *
 * Utility for useXxxActions hooks to handle mutation errors,
 * with special handling for PermissionError to show a permission-denied toast.
 */

import { toast } from 'sonner'
import { isPermissionError } from './errors'

/**
 * Handle a mutation error. Shows a specific toast for PermissionError,
 * or a generic failure toast otherwise.
 *
 * @param error - The caught error
 * @param fallbackMessage - Generic failure message (used when error is not a PermissionError)
 * @param t - Translation function (optional, for i18n)
 */
export function handleMutationError(
  error: unknown,
  fallbackMessage: string,
  t?: (key: string) => string,
): void {
  if (isPermissionError(error)) {
    const msg = t
      ? t('errors.permissionDenied')
      : 'Permission denied'
    toast.error(msg, {
      description: error.message,
    })
  } else {
    toast.error(fallbackMessage)
  }
}
