import type { Task } from '../domain/task.js';

/**
 * TaskRepository port. The service depends on this interface, not on DynamoDB
 * directly, so it is trivially mockable in tests (no AWS in unit tests).
 */
export interface TaskRepository {
  list(limit?: number): Promise<Task[]>;
  get(id: string): Promise<Task | null>;
  put(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
