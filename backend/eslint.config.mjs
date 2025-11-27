import js from '@eslint/js';
import airbnbBase from 'eslint-config-airbnb-base';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      ...airbnbBase.rules,
      
      // Node.js backend overrides
      'no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      'no-console': 'off', // Allow console in backend
      'no-process-exit': 'off', // Allow process.exit in Node.js
      'no-process-env': 'off', // Allow process.env in Node.js
      'import/no-dynamic-require': 'off', // Allow dynamic requires
      'consistent-return': 'off', // Express middleware doesn't always return
      'no-empty': 'off', // Allow empty catch blocks
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      '*.min.js',
      'dist/',
      'coverage/',
      'logs/',
    ],
  },
];