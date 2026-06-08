/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [angular(), tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['projects/core/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.browser.test.ts',
        '**/*.example.test.ts',
        '**/index.ts',
        '**/public-api.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: { url: 'http://localhost:4200/' },
          },
          setupFiles: ['./vitest.setup.js'],
          include: ['projects/core/**/*.test.ts'],
          exclude: [
            '**/node_modules/**',
            '**/*.browser.test.ts',
            '**/*.example.test.ts',
            '**/*.server.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./vitest.setup.js'],
          include: ['projects/core/**/*.browser.test.ts', 'projects/core/**/*.example.test.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }, { browser: 'webkit' }, { browser: 'firefox' }],
          },
        },
      },
    ],
  },
});
