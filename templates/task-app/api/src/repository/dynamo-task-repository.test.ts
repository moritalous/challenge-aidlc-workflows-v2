import { describe, it, expect, vi } from 'vitest';
import {
  QueryCommand,
  PutCommand,
  GetCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { DynamoTaskRepository } from './dynamo-task-repository.js';
import type { Task } from '../domain/task.js';
import { RepositoryError } from '../errors.js';

const task: Task = {
  id: 't1',
  title: 'A',
  status: 'Todo',
  createdAt: '2026-06-21T00:00:00.000Z',
  updatedAt: '2026-06-21T00:00:00.000Z',
};

function repoWith(send: ReturnType<typeof vi.fn>): DynamoTaskRepository {
  return new DynamoTaskRepository({
    tableName: 'Tasks',
    client: { send } as unknown as DynamoDBDocumentClient,
  });
}

describe('DynamoTaskRepository (no-Scan invariant)', () => {
  it('list() Queries the gsi1 index — never a Scan', async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ Items: [{ ...task, gsi1pk: 'TASK' }] });
    const res = await repoWith(send).list();

    expect(send).toHaveBeenCalledTimes(1);
    const cmd = send.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(QueryCommand);
    expect(cmd.input.IndexName).toBe('gsi1');
    expect(cmd.input.KeyConditionExpression).toContain('gsi1pk');
    // internal partition attribute stripped from the returned task
    expect(res[0]).not.toHaveProperty('gsi1pk');
    expect(res[0]?.id).toBe('t1');
  });

  it('list() respects the page cap', async () => {
    const send = vi.fn().mockResolvedValue({ Items: [] });
    await repoWith(send).list(5);
    expect(send.mock.calls[0][0].input.Limit).toBe(5);
  });

  it('put() writes the constant gsi1pk partition attribute', async () => {
    const send = vi.fn().mockResolvedValue({});
    await repoWith(send).put(task);
    const cmd = send.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(PutCommand);
    expect(cmd.input.Item.gsi1pk).toBe('TASK');
    expect(cmd.input.Item.id).toBe('t1');
  });

  it('get() reads by id with GetItem and strips gsi1pk', async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ Item: { ...task, gsi1pk: 'TASK' } });
    const res = await repoWith(send).get('t1');
    const cmd = send.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(GetCommand);
    expect(res?.id).toBe('t1');
    expect(res).not.toHaveProperty('gsi1pk');
  });

  it('get() returns null when the item is absent', async () => {
    const send = vi.fn().mockResolvedValue({});
    expect(await repoWith(send).get('missing')).toBeNull();
  });

  it('wraps client failures in RepositoryError (no silent failure)', async () => {
    const send = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(repoWith(send).list()).rejects.toBeInstanceOf(RepositoryError);
  });
});
