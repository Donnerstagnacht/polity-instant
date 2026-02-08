// Export all auth-related components and hooks
export { AuthGuard, withAuth, withoutAuth } from './AuthGuard';
export { EnsureUser, useUser, useRequiredUser } from './EnsureUser';
export { useAuthStore, useInstantAuth } from './auth';
export { PermissionGuard } from './PermissionGuard';

// Export constants
export { ARIA_KAI_USER_ID, ARIA_KAI_EMAIL, ARIA_KAI_WELCOME_MESSAGE } from './constants';

// Export utilities
export {
  checkAriaKaiExists,
  buildAriaKaiConversationTransactions,
  ARIA_KAI_ERRORS,
} from './utils/aria-kai-helpers';
export {
  generateRandomHandle,
  buildUserInitializationTransactions,
} from './utils/user-initialization-helpers';

// Export hooks
export { useAuthVerification } from './utils/useAuthVerification';
export { useAuthLogin } from './utils/useAuthLogin';
export type { UseAuthLoginOptions } from './utils/useAuthLogin';