import i18n from '../src/i18n/i18n';
import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';
import { useAuthStore } from '../src/global-state/auth.store';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#18181b' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for Tailwind',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
    locale: {
      name: 'Language',
      description: 'i18n language',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'de', title: 'Deutsch' },
        ],
      },
    },
    auth: {
      name: 'Auth',
      description: 'Authentication state',
      defaultValue: 'loggedIn',
      toolbar: {
        icon: 'lock',
        items: [
          { value: 'loggedIn', title: 'Logged In' },
          { value: 'loggedOut', title: 'Logged Out' },
        ],
      },
    },
  },
  decorators: [
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
  ],
};

export default preview;
