import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['**/*.test.ts', '**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                'graphify-out/',
                '**/*.d.ts',
                '**/*.config.*',
                'build.ts',
                'dev.ts'
            ]
        }
    }
})
