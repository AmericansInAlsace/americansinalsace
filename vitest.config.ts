import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.{test.ts,test.tsx}'],
    setupFiles: ['./vitest.setup.tsx'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
    fileParallelism: !process.argv.some(arg => arg.includes('tests/integration')),
    globalSetup: process.argv.some(arg => arg.includes('tests/integration')) 
      ? ['./tests/integration/setup.ts'] 
      : [],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: process.argv.some(arg => arg.includes('tests/ui'))
        ? ['app/**', 'components/**']
        : ['app/**', 'components/**', 'lib/**', 'services/**'],
      exclude: process.argv.some(arg => arg.includes('tests/ui'))
        ? [
            'node_modules/**',
            'lib/generated/**',
            'app/api/**',
            'app/actions/**',
            '**/*actions.ts',
            '**/*actions.tsx',
            '**/*Actions.ts',
            '**/*Actions.tsx',
          ]
        : [
            'node_modules/**',
            'lib/generated/**',
            'app/api/auth/[...nextauth]/**',
          ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
