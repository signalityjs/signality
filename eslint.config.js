const nx = require('@nx/eslint-plugin');
const jsoncParser = require('jsonc-eslint-parser');

module.exports = [
  {
    ignores: ['**/dist', '**/projects/docs'],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
    },
  },
  {
    files: ['**/package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      '@nx/dependency-checks': 'error',
    },
  },
];
