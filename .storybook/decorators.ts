import { useNavigationStore } from '../src/navigation/state/navigation.store';
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
    // Set navigation state from Storybook toolbar (if present)
    React.useEffect(() => {
      if (context.globals.navigationType) {
        useNavigationStore.getState().setNavigationType(context.globals.navigationType);
      }
      if (context.globals.navigationView) {
        useNavigationStore.getState().setNavigationView(context.globals.navigationView);
      }
    }, [context.globals.navigationType, context.globals.navigationView]);
    return Story();
  },
];
