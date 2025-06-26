import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { NavigationView, NavigationType } from '../src/navigation/types/navigation.types';

interface NavigationState {
  navigationType: NavigationType;
  navigationView: NavigationView;
}

interface NavigationActions {
  setNavigationType: (navigationType: NavigationType) => void;
  setNavigationView: (navigationView: NavigationView) => void;
}

// Create the navigation store with zustand and immer
export const useNavigationStore = create<NavigationState & NavigationActions>()(
  immer(set => ({
    // Initial state
    navigationType: 'combined',
    navigationView: 'asButtonList',

    // Actions
    setNavigationType: navigationType => {
      set(state => {
        state.navigationType = navigationType;
      });
    },

    setNavigationView: navigationView => {
      set(state => {
        state.navigationView = navigationView;
      });
    },
  }))
);

import i18n from '../src/i18n/i18n';
import React, { useEffect } from 'react';
import { useAuthStore } from '../src/global-state/auth.store';

export const decorators = [
  (Story, context) => {
    // Set Tailwind dark mode class on html element
    const theme = context.globals.theme;
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    // Set i18n language from Storybook toolbar
    React.useEffect(() => {
      i18n.changeLanguage(context.globals.locale);
    }, [context.globals.locale]);
    // Set auth state from Storybook toolbar
    useEffect(() => {
      if (context.globals.auth === 'loggedIn') {
        useAuthStore.getState().login();
      } else {
        useAuthStore.getState().logout();
      }
    }, [context.globals.auth]);
    return Story();
  },
];
