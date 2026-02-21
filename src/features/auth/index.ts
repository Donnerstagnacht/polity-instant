// Export all auth-related components and hooks
export { AuthGuard, withAuth, withoutAuth } from './AuthGuard';
export { EnsureUser, useUser, useRequiredUser } from './EnsureUser';
export { useAuthStore } from './auth';
export { PermissionGuard } from './PermissionGuard';

// Export constants
export { ARIA_KAI_USER_ID, ARIA_KAI_EMAIL, ARIA_KAI_WELCOME_MESSAGE, ENTITY_DESCRIPTIONS } from './constants';
export type { EntityTopic } from './constants';

// Export utilities
export {
  checkAriaKaiExists,
  ARIA_KAI_ERRORS,
} from './utils/aria-kai-helpers';
export {
  generateRandomHandle,
  buildUserInitializationTransactions,
} from './logic/user-initialization-helpers';

// Export hooks
export { useAuthVerification } from './hooks/useAuthVerification';
export { useAuthLogin } from './hooks/useAuthLogin';
export type { UseAuthLoginOptions } from './hooks/useAuthLogin';