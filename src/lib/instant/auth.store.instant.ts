// auth.store.instant.ts
// Enhanced authentication store that integrates with Instant database
// This version can be used once @instantdb/react is installed

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';

// Import Instant client when available
// import db, { queries, mutations } from '@/lib/instant/db';

// Define the user interface matching Instant schema
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  handle?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt?: Date;
}

// Define the authentication store state interface
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Magic code flow state
  pendingEmail: string | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  requestMagicCode: (email: string) => Promise<boolean>;
  verifyMagicCode: (email: string, code: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to generate random magic code
const generateMagicCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to create user from email
const createUserFromEmail = (email: string): User => ({
  id: 'user_' + Date.now(),
  email,
  name: email.split('@')[0],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create the authentication store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    immer(set => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      pendingEmail: null,

      // Actions
      login: (user: User, token: string) =>
        set(state => {
          state.isAuthenticated = true;
          state.user = user;
          state.token = token;
          state.error = null;

          // Update last seen in Instant database
          // mutations.users.updateLastSeen(user.id);
        }),

      logout: () =>
        set(state => {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
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
          // Generate magic code
          const code = generateMagicCode();

          // Store magic code in Instant database
          // await mutations.magicCodes.create(email, code);

          // In development, just log the code
          console.log('Magic code for', email, ':', code);

          // In production, send email here
          // await sendMagicCodeEmail(email, code);

          set(state => {
            state.isLoading = false;
          });

          return true;
        } catch (error) {
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
          // Verify magic code with Instant database
          // const { data: magicCodes } = await queries.magicCodes.verify(email, code);

          // Mock verification for development
          if (code === '123456') {
            // Check if user exists
            // const { data: existingUsers } = await queries.users.byEmail(email);

            // if (existingUsers && existingUsers.length > 0) {
            //   // User exists, use existing user
            //   user = existingUsers[0];
            // } else {
            // Create new user
            const user = createUserFromEmail(email);

            // Save to Instant database
            // await mutations.users.create({
            //   email: user.email,
            //   name: user.name,
            //   handle: user.name?.toLowerCase().replace(/\s+/g, ''),
            // });
            // }

            const mockToken = 'instant_token_' + Date.now();

            // Mark magic code as used
            // await mutations.magicCodes.markAsUsed(magicCodes[0].id);

            set(state => {
              state.isAuthenticated = true;
              state.user = user;
              state.token = mockToken;
              state.isLoading = false;
              state.pendingEmail = null;
            });

            return true;
          } else {
            throw new Error('Invalid or expired code');
          }
        } catch (error) {
          set(state => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Failed to verify code';
          });
          return false;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;

        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Update in Instant database
          // await mutations.users.update(currentUser.id, updates);

          // Update local state
          set(state => {
            if (state.user) {
              Object.assign(state.user, updates, { updatedAt: new Date() });
            }
            state.isLoading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Failed to update profile';
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
      name: 'auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }), // persist authentication data
    }
  )
);

// Auth initializer hook to handle auth initialization and lifecycle
export const useAuthInitializer = (options?: {
  onInitialized?: (isAuthenticated: boolean) => void;
  autoLogin?: boolean;
  storageKey?: string;
}) => {
  const { isAuthenticated, login, logout } = useAuthStore();
  const storageKey = options?.storageKey || 'auth-storage';

  useEffect(() => {
    // Explicitly check persistent storage
    const storedAuth = localStorage.getItem(storageKey);

    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        const storedIsAuthenticated = authData?.state?.isAuthenticated;
        const storedUser = authData?.state?.user;
        const storedToken = authData?.state?.token;

        // If the stored authentication status differs from current state, update it
        if (storedIsAuthenticated !== undefined && storedIsAuthenticated !== isAuthenticated) {
          if (storedIsAuthenticated && storedUser && storedToken) {
            login(storedUser, storedToken);
          } else {
            logout();
          }
        }

        // Validate token with Instant database if needed
        // if (storedToken) {
        //   const isTokenValid = await validateTokenWithInstant(storedToken);
        //   if (!isTokenValid) {
        //     logout();
        //   }
        // }
      } catch (error) {
        console.error('Failed to parse auth storage', error);
        // If storage is corrupted, reset it
        localStorage.removeItem(storageKey);
      }
    }

    // Call the onInitialized callback if provided
    if (options?.onInitialized) {
      options.onInitialized(isAuthenticated);
    }

    // Auto-login functionality if enabled (for development or testing)
    if (options?.autoLogin && !isAuthenticated) {
      // Create a mock user for auto-login
      const mockUser: User = {
        id: 'dev_user',
        email: 'dev@polity.test',
        name: 'Development User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      login(mockUser, 'dev_token');
    }
  }, [isAuthenticated, login, logout, storageKey, options?.autoLogin, options?.onInitialized]);

  return { isAuthenticated };
};

// Export hooks for Instant integration
export const useInstantAuth = () => {
  // This would integrate with Instant's authentication system
  // const { user: instantUser, isLoading: instantLoading } = db.useAuth();

  // Return mock data for now
  return {
    user: null,
    isLoading: false,
    signInWithMagicCode: async (email: string) => {
      // Implementation would go here
      console.log('Sign in with magic code:', email);
    },
  };
};
