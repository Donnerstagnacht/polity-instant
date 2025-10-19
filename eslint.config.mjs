// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';

export default tseslint.config(
  {
    // Define ignores for the flat config
    ignores: [
      'src/ui/kit-platejs/**/*',
      'src/ui/ui/**/*',
      'src/ui/ui-platejs/**/*',
      '.github/**/*',
      '.storybook/**/*',
      '.next/**/*',
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
  {
    // Allow CommonJS in config files
    files: ['*.config.js', '*.config.mjs', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  storybook.configs['flat/recommended']
);
