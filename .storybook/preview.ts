import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';
import { decorators } from './decorators';

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
  decorators,
};

export default preview;
