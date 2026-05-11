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
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['app/**', 'components/**', 'lib/**', 'services/**'],
      exclude: [
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
