import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Dead code is a CI-blocking defect after stabilization cleanup.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^(?:[A-Z_].*|motion)$',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      // Intentional synchronization effects are suppressed only in the exact files that own that contract.
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
    },
  },
  {
    files: ['api/**/*.{js,ts}', 'scripts/**/*.{js,ts}', 'playwright.config.js', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // These modules intentionally co-locate providers with hooks/shared exports.
    // Fast Refresh restrictions are development ergonomics, not a runtime contract.
    files: [
      'src/contexts/**/*.{js,jsx}',
      'src/components/incidencias/IncidenciasShared.jsx',
      'src/components/presupuestos/PresupuestosContext.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
