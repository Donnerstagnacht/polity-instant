// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    // Define ignores for the flat config
    ignores: [
      'src/components/kit-platejs/**/*',
      'src/components/ui/**/*',
      'src/components/ui-platejs/**/*',
      '.github/**/*',
      '.storybook/**/*',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      storybook: storybook,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  storybook.configs['flat/recommended']
);
