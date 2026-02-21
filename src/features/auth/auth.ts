// auth.ts
// Supabase authentication implementation using magic links
// Uses Supabase's built-in OTP/magic link system

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createClient } from '@/lib/supabase/client';

// Define the authentication store state interface
// Note: Auth session state is managed by Supabase + AuthProvider.
// This store handles imperative auth operations (send OTP, verify, sign out)
// and their associated loading/error UI state.
interface AuthState {
  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Magic link flow state
  pendingEmail: string | null;

  // Actions
  requestMagicCode: (email: string) => Promise<boolean>;
  verifyMagicCode: (email: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Create the authentication store (no persistence — Supabase manages auth tokens)
export const useAuthStore = create<AuthState>()(
  immer(set => ({
    // Initial state
    isLoading: false,
    error: null,
    pendingEmail: null,

    // Actions
    requestMagicCode: async (email: string) => {
      set(state => {
        state.isLoading = true;
        state.error = null;
        state.pendingEmail = email;
      });

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
          throw error;
        }

        set(state => {
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        console.error('Failed to send magic link:', error);
        set(state => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to send magic link';
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
        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'magiclink',
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          set(state => {
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

    signOut: async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
    },

    clearError: () =>
      set(state => {
        state.error = null;
      }),

    setLoading: (loading: boolean) =>
      set(state => {
        state.isLoading = loading;
      }),
  }))
);
