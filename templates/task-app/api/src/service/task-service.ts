import { randomUUID } from 'node:crypto';
import type { Task } from '../domain/task.js';
import type { TaskCreate, TaskUpdate } from '../domain/task.js';
import type { TaskRepository } from '../repository/task-repository.js';
import { NotFoundError, ValidationError } from '../errors.js';

/** Injectable clock so timestamps are deterministic in tests. */
export type Clock = () => Date;

/**
 * TaskService (generated-app domain layer). Implements BR-A1..BR-A4:
 * - create: title required 1..200, default status Todo, optional valid dueDate.
 * - update: partial; status is freely updatable (changeStatus == update).
 * - delete: removal (confirmation is a UI concern, BR-A3).
 *
 * It depends on the {@link TaskRepository} port, so unit tests inject a fake.
 */
export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly clock: Clock = () => new Date(),
  ) {}

  async list(): Promise<Task[]> {
    return this.repo.list();
  }

  async get(id: string): Promise<Task> {
    const task = await this.repo.get(id);
    if (!task) {
      throw new NotFoundError(`task ${id} not found`);
    }
    return task;
  }

  async create(input: TaskCreate): Promise<Task> {
    // Defense in depth: the route validates with zod, the service re-checks the
    // core invariant so the domain layer is safe even if called directly.
    if (input.title.length < 1 || input.title.length > 200) {
      throw new ValidationError('title must be 1..200 characters');
    }
    const now = this.clock().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      status: input.status ?? 'Todo',
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.put(task);
    return task;
  }

  async update(id: string, patch: TaskUpdate): Promise<Task> {
    const existing = await this.get(id);
    const updated: Task = {
      ...existing,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
      updatedAt: this.clock().toISOString(),
    };
    await this.repo.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Ensure it exists so we return 404 rather than silently no-op'ing.
    await this.get(id);
    await this.repo.delete(id);
  }
}
