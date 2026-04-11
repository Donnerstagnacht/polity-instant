// Export all auth-related components and hooks
export { AuthGuard, withAuth, withoutAuth } from './AuthGuard';
export { EnsureUser, useUser, useRequiredUser } from './EnsureUser';
export { useAuthStore } from './auth';
export { PermissionGuard } from './PermissionGuard';

// Re-export assistant constants for backward compatibility
export { ARIA_KAI_USER_ID, ARIA_KAI_EMAIL, ARIA_KAI_WELCOME_MESSAGE, ENTITY_DESCRIPTIONS } from '@/features/assistant/constants';
export type { EntityTopic } from '@/features/assistant/constants';
export {
  generateRandomHandle,
  buildUserInitializationTransactions,
} from './logic/user-initialization-helpers';

// Export hooks
export { useAuthVerification } from './hooks/useAuthVerification';
export { useAuthLogin } from './hooks/useAuthLogin';
export type { UseAuthLoginOptions } from './hooks/useAuthLogin';
export { useAuthSignIn } from './hooks/useAuthSignIn';
export { useAuthSignUp } from './hooks/useAuthSignUp';
export { useGoogleAuth } from './hooks/useGoogleAuth';
export { useAccountActions } from './hooks/useAccountActions';