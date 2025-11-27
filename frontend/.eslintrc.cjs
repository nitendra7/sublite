module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'airbnb', 
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {

    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    'react/prop-types': 'off', // Using TypeScript-style prop validation
    'react/jsx-props-no-spreading': 'off', // Allow prop spreading for UI components
    'no-console': 'warn',
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': ['vite.config.js', 'tailwind.config.js', '**/*.test.js']
    }],
  },
  overrides: [
    {
      files: ['*.config.js', 'tailwind.config.js', 'postcss.config.js', 'vite.config.js'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-undef': 'off', 
      },
    },
  ],
}
