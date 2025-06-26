import React from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '../src/i18n/i18n';
import type { Preview } from '@storybook/react-vite';

const withI18next = (Story: React.FC, context: any) => {
  return React.createElement(I18nextProvider, { i18n }, React.createElement(Story, context));
};

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
  },

  decorators: [withI18next],
};

export default preview;
