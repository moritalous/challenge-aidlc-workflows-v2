import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { buildTaskRoutes } from './routes/tasks.js';
import type { TaskService } from './service/task-service.js';

/**
 * Composes the Hono app: a dependency-free GET /health (deploy-pillar smoke
 * target, always 200) plus the `/tasks` CRUD routes. The service is injected so
 * the app can be built with a mock repository in tests.
 *
 * CORS is restricted to the configured origin (env CORS_ORIGIN), defaulting to a
 * same-origin-only policy for the skeleton.
 */
export function buildApp(service: TaskService): Hono {
  const app = new Hono();

  const origin = process.env.CORS_ORIGIN ?? '*';
  app.use('/tasks/*', cors({ origin }));
  app.use('/tasks', cors({ origin }));

  // Health check: no deps, always 200. Used by the deploy-pillar smoke check.
  app.get('/health', (c) => c.json({ status: 'ok' }, 200));

  app.route('/', buildTaskRoutes(service));

  return app;
}
