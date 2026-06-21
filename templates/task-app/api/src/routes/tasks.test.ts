import { describe, it, expect, beforeEach } from 'vitest';
import type { Task } from '../domain/task.js';
import type { TaskRepository } from '../repository/task-repository.js';
import { TaskService } from '../service/task-service.js';
import { buildApp } from '../app.js';

class FakeRepo implements TaskRepository {
  readonly store = new Map<string, Task>();
  async list(): Promise<Task[]> {
    return [...this.store.values()];
  }
  async get(id: string): Promise<Task | null> {
    return this.store.get(id) ?? null;
  }
  async put(task: Task): Promise<void> {
    this.store.set(task.id, task);
  }
  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

let app: ReturnType<typeof buildApp>;
let repo: FakeRepo;

beforeEach(() => {
  repo = new FakeRepo();
  app = buildApp(new TaskService(repo));
});

function post(body: unknown): Request {
  return new Request('http://local/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /health', () => {
  it('returns 200 with status ok (deploy-pillar smoke target)', async () => {
    const res = await app.request('http://local/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});

describe('POST /tasks', () => {
  it('creates a task and returns 201 (happy path)', async () => {
    const res = await app.request(post({ title: 'A task' }));
    expect(res.status).toBe(201);
    const body = (await res.json()) as Task;
    expect(body.title).toBe('A task');
    expect(body.status).toBe('Todo');
  });

  it('returns 400 on empty title (zod boundary validation)', async () => {
    const res = await app.request(post({ title: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on a title longer than 200 chars', async () => {
    const res = await app.request(post({ title: 'x'.repeat(201) }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on an invalid dueDate format', async () => {
    const res = await app.request(post({ title: 'ok', dueDate: 'not-a-date' }));
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks and /tasks/:id', () => {
  it('lists tasks', async () => {
    await app.request(post({ title: 'one' }));
    const res = await app.request('http://local/tasks');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tasks: Task[] };
    expect(body.tasks).toHaveLength(1);
  });

  it('returns 404 for a missing id', async () => {
    const res = await app.request('http://local/tasks/missing');
    expect(res.status).toBe(404);
  });
});

describe('PUT /tasks/:id (changeStatus via update)', () => {
  it('updates status via PUT', async () => {
    const created = (await (
      await app.request(post({ title: 't' }))
    ).json()) as Task;
    const res = await app.request(
      new Request(`http://local/tasks/${created.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'Done' }),
      }),
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as Task).status).toBe('Done');
  });

  it('returns 400 on an invalid status value', async () => {
    const created = (await (
      await app.request(post({ title: 't' }))
    ).json()) as Task;
    const res = await app.request(
      new Request(`http://local/tasks/${created.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'Nonsense' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when updating a missing id', async () => {
    const res = await app.request(
      new Request('http://local/tasks/missing', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'x' }),
      }),
    );
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes an existing task -> 204', async () => {
    const created = (await (
      await app.request(post({ title: 't' }))
    ).json()) as Task;
    const res = await app.request(
      new Request(`http://local/tasks/${created.id}`, { method: 'DELETE' }),
    );
    expect(res.status).toBe(204);
  });

  it('returns 404 deleting a missing id', async () => {
    const res = await app.request(
      new Request('http://local/tasks/missing', { method: 'DELETE' }),
    );
    expect(res.status).toBe(404);
  });
});
