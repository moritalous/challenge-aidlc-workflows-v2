import { defineConfig } from 'vitest/config';

/**
 * Root Vitest config. Discovers tests across all workspaces. The web
 * package overrides `environment` to `jsdom` via its own local config;
 * everything else runs in the default `node` environment.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/*.test.ts',
      'templates/task-app/api/**/*.test.ts',
      'templates/task-app/infra/**/*.test.ts',
    ],
    // The web package runs under jsdom via its own vite.config.ts (npm -w
    // @vibe-app/web test). It is excluded here because the root project uses the
    // node environment.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Cover only what the node-env root run actually exercises: the
      // scaffold-cli logic + the api + the infra. The web tree is covered by
      // its own jsdom config (npm -w @vibe-app/web test) and would otherwise
      // show false 0% rows here.
      include: [
        'packages/scaffold-cli/src/**',
        'templates/task-app/api/src/**',
        'templates/task-app/infra/src/**',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/dist/**',
        '**/*.d.ts',
        '**/index.ts',
        // Entry-point wiring / framework adapters: exercised by the CLI smoke
        // run and the Lambda/CDK runtimes, not unit-tested in the skeleton.
        '**/cli.ts',
        '**/runners.ts',
        '**/lambda.ts',
        '**/bin/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
