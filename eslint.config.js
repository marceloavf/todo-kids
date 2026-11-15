import { registerHooks } from 'node:module'
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

// typescript-eslint needs the TypeScript 6 JS API. The project's `typescript` is v7, which ships no JS API.
registerHooks({
  resolve: (specifier, context, next) => next(specifier === 'typescript' ? '@typescript/typescript6' : specifier, context),
})
const { default: tseslint } = await import('typescript-eslint')

export default tseslint.config(
  { ignores: ['dist', 'prototype'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], ...reactHooks.configs.flat['recommended-latest'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**', 'tests/**', 'e2e/**', '*.config.{js,ts}'], languageOptions: { globals: globals.node } },
)
