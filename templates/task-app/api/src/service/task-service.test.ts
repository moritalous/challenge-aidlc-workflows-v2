import { describe, it, expect, beforeEach } from 'vitest';
import type { Task } from '../domain/task.js';
import type { TaskRepository } from '../repository/task-repository.js';
import { TaskService } from './task-service.js';
import { NotFoundError, ValidationError } from '../errors.js';

/** In-memory fake repository — no DynamoDB in unit tests. */
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

const fixedClock = () => new Date('2026-06-21T00:00:00.000Z');

let repo: FakeRepo;
let service: TaskService;

beforeEach(() => {
  repo = new FakeRepo();
  service = new TaskService(repo, fixedClock);
});

describe('TaskService.create (BR-A1)', () => {
  it('creates a task with default status Todo and timestamps', async () => {
    const task = await service.create({ title: 'Write tests' });
    expect(task.title).toBe('Write tests');
    expect(task.status).toBe('Todo');
    expect(task.createdAt).toBe('2026-06-21T00:00:00.000Z');
    expect(task.id).toBeTruthy();
  });

  it('rejects an over-long title at the service layer', async () => {
    await expect(
      service.create({ title: 'x'.repeat(201) }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('accepts an explicit status and dueDate', async () => {
    const task = await service.create({
      title: 'Ship',
      status: 'Doing',
      dueDate: '2026-07-01T00:00:00.000Z',
    });
    expect(task.status).toBe('Doing');
    expect(task.dueDate).toBe('2026-07-01T00:00:00.000Z');
  });
});

describe('TaskService.get / update / delete', () => {
  it('get throws NotFoundError for a missing id', async () => {
    await expect(service.get('nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update changes status (changeStatus realized as update)', async () => {
    const created = await service.create({ title: 'Task' });
    const updated = await service.update(created.id, { status: 'Done' });
    expect(updated.status).toBe('Done');
    expect(updated.id).toBe(created.id);
  });

  it('update throws NotFoundError for a missing id', async () => {
    await expect(service.update('nope', { title: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('delete removes an existing task', async () => {
    const created = await service.create({ title: 'Task' });
    await service.delete(created.id);
    expect(await repo.get(created.id)).toBeNull();
  });

  it('delete throws NotFoundError for a missing id (no silent no-op)', async () => {
    await expect(service.delete('nope')).rejects.toBeInstanceOf(NotFoundError);
  });
});
