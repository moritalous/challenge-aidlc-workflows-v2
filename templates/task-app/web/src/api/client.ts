import type { Task, TaskInput } from '../types.js';

/** Thrown when an API call returns a non-2xx response. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Minimal fetch wrapper. Base URL is injected (env or default same-origin). */
export interface ApiClient {
  list(): Promise<Task[]>;
  get(id: string): Promise<Task>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, input: TaskInput): Promise<Task>;
  remove(id: string): Promise<void>;
}

/** Creates an {@link ApiClient}. `fetchImpl` is injectable for tests. */
export function createApiClient(
  baseUrl = '/api',
  fetchImpl: typeof fetch = fetch,
): ApiClient {
  async function req<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetchImpl(`${baseUrl}${path}`, {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      throw new ApiError(res.status, `request failed: ${res.status}`);
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }

  return {
    async list() {
      const body = await req<{ tasks: Task[] }>('/tasks');
      return body.tasks;
    },
    get: (id) => req<Task>(`/tasks/${id}`),
    create: (input) =>
      req<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
    update: (id, input) =>
      req<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    remove: (id) =>
      req<void>(`/tasks/${id}`, { method: 'DELETE' }).then(() => undefined),
  };
}
