import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TaskCreateSchema, TaskUpdateSchema } from '../domain/task.js';
import type { TaskService } from '../service/task-service.js';
import { NotFoundError, ValidationError } from '../errors.js';

/**
 * Builds the `/tasks` router. zod validates every write at the boundary
 * (BR-A2 / SEC-A1): invalid input -> 400 with a structured error. The service is
 * injected so routes are testable without DynamoDB.
 *
 * changeStatus is realized via PUT /tasks/:id (status is part of the update
 * payload) — no dedicated transition route (U0 invariant / F2 note).
 */
export function buildTaskRoutes(service: TaskService): Hono {
  const app = new Hono();

  app.get('/tasks', async (c) => {
    const tasks = await service.list();
    return c.json({ tasks });
  });

  app.get('/tasks/:id', async (c) => {
    try {
      const task = await service.get(c.req.param('id'));
      return c.json(task);
    } catch (err) {
      return mapError(c, err);
    }
  });

  app.post('/tasks', zValidator('json', TaskCreateSchema), async (c) => {
    try {
      const task = await service.create(c.req.valid('json'));
      return c.json(task, 201);
    } catch (err) {
      return mapError(c, err);
    }
  });

  app.put('/tasks/:id', zValidator('json', TaskUpdateSchema), async (c) => {
    try {
      const task = await service.update(c.req.param('id'), c.req.valid('json'));
      return c.json(task);
    } catch (err) {
      return mapError(c, err);
    }
  });

  app.delete('/tasks/:id', async (c) => {
    try {
      await service.delete(c.req.param('id'));
      return c.body(null, 204);
    } catch (err) {
      return mapError(c, err);
    }
  });

  return app;
}

/** Maps domain errors to structured HTTP responses (no silent failures). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapError(c: any, err: unknown): Response {
  if (err instanceof ValidationError) {
    return c.json({ error: 'validation', message: err.message }, 400);
  }
  if (err instanceof NotFoundError) {
    return c.json({ error: 'not_found', message: err.message }, 404);
  }
  const message = err instanceof Error ? err.message : 'internal error';
  return c.json({ error: 'internal', message }, 500);
}
