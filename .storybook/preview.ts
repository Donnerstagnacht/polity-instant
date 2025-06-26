import i18n from '../src/i18n/i18n';
import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    // Add a toolbar for theme switching
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
      return Story();
    },
  ],
};

export default preview;
