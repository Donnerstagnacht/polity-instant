// auth.ts
// Real InstantDB authentication implementation using InstantDB's built-in auth
// This uses InstantDB's native magic code system

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from './db';

// Define the user interface
interface User {
  id: string;
  email: string;
  [key: string]: any; // InstantDB user can have additional fields
}

// Define the authentication store state interface
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Magic code flow state
  pendingEmail: string | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  requestMagicCode: (email: string) => Promise<boolean>;
  verifyMagicCode: (email: string, code: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Create the authentication store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    immer(set => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      pendingEmail: null,

      // Actions
      login: (user: User) =>
        set(state => {
          state.isAuthenticated = true;
          state.user = user;
          state.error = null;
        }),

      logout: () =>
        set(state => {
          state.isAuthenticated = false;
          state.user = null;
          state.pendingEmail = null;
          state.error = null;
        }),

      requestMagicCode: async (email: string) => {
        set(state => {
          state.isLoading = true;
          state.error = null;
          state.pendingEmail = email;
        });

        try {
          // Use InstantDB's built-in magic code system
          await db.auth.sendMagicCode({ email });

          console.log('🔐 Magic code sent to:', email);

          set(state => {
            state.isLoading = false;
          });

          return true;
        } catch (error) {
          console.error('Failed to send magic code:', error);
          set(state => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Failed to send magic code';
          });
          return false;
        }
      },

      verifyMagicCode: async (email: string, code: string) => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Use InstantDB's built-in magic code verification
          const result = await db.auth.signInWithMagicCode({ email, code });

          if (result.user) {
            const user: User = {
              id: result.user.id,
              email: result.user.email || '',
              // Include any additional user fields
              ...Object.fromEntries(
                Object.entries(result.user).filter(([key]) => key !== 'id' && key !== 'email')
              ),
            };

            set(state => {
              state.isAuthenticated = true;
              state.user = user;
              state.isLoading = false;
              state.pendingEmail = null;
            });

            return true;
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Failed to verify magic code:', error);
          set(state => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Invalid or expired code';
          });
          return false;
        }
      },

      clearError: () =>
        set(state => {
          state.error = null;
        }),

      setLoading: (loading: boolean) =>
        set(state => {
          state.isLoading = loading;
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

// Hook to use InstantDB auth state directly
export const useInstantAuth = () => {
  const { user, isLoading } = db.useAuth();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
