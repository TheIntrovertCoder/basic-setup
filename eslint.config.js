import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
    {
        files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Bun: 'readonly'
            }
        }
    },
    {
        ignores: ['dist/**', 'node_modules/**']
    },
    eslintConfigPrettier
)
