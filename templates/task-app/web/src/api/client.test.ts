import { describe, it, expect, vi } from 'vitest';
import { createApiClient, ApiError } from './client.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApiClient', () => {
  it('list() unwraps the tasks array', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ tasks: [{ id: '1', title: 't' }] }));
    const api = createApiClient('/api', fetchImpl as unknown as typeof fetch);
    const tasks = await api.list();
    expect(tasks).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
  });

  it('throws ApiError on a non-2xx response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 400));
    const api = createApiClient('/api', fetchImpl as unknown as typeof fetch);
    await expect(api.create({ title: '' })).rejects.toBeInstanceOf(ApiError);
  });

  it('remove() tolerates a 204 No Content', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const api = createApiClient('/api', fetchImpl as unknown as typeof fetch);
    await expect(api.remove('1')).resolves.toBeUndefined();
  });
});
