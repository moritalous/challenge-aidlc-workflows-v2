import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Task } from '../domain/task.js';
import type { TaskRepository } from './task-repository.js';
import { RepositoryError } from '../errors.js';

/** GSI used by the list view (must match infra app-stack.ts). */
const LIST_INDEX_NAME = 'gsi1';
/** Constant partition value collecting all tasks under one queryable key. */
const LIST_PARTITION = 'TASK';

/** Persisted shape = Task + the GSI partition attribute. */
type StoredTask = Task & { gsi1pk: string };

/**
 * DynamoDB-backed {@link TaskRepository} (PK=`id`).
 *
 * Hot-path reads use GetItem (by id) — never Scan (infrastructure-services.md:
 * "スキャン操作は使用しない"). The list view Queries the `gsi1` index (constant
 * partition `TASK`, sorted by createdAt), consistent with the least-privilege
 * IAM role which grants Query (not Scan).
 *
 * TABLE_NAME and AWS_REGION come from the environment — NEVER hardcoded
 * (SEC-A3 / project Forbidden rule).
 */
export class DynamoTaskRepository implements TaskRepository {
  private readonly doc: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly listCap: number;

  constructor(opts?: {
    tableName?: string;
    region?: string;
    client?: DynamoDBDocumentClient;
    listCap?: number;
  }) {
    const tableName = opts?.tableName ?? process.env.TABLE_NAME;
    if (!tableName) {
      throw new RepositoryError('TABLE_NAME env var is required');
    }
    this.tableName = tableName;
    this.listCap = opts?.listCap ?? 100;
    this.doc =
      opts?.client ??
      DynamoDBDocumentClient.from(
        new DynamoDBClient({
          region: opts?.region ?? process.env.AWS_REGION,
        }),
      );
  }

  async get(id: string): Promise<Task | null> {
    try {
      const res = await this.doc.send(
        new GetCommand({ TableName: this.tableName, Key: { id } }),
      );
      const item = res.Item as StoredTask | undefined;
      if (!item) {
        return null;
      }
      const { gsi1pk: _gsi1pk, ...task } = item;
      return task;
    } catch (err) {
      throw new RepositoryError(`failed to get task ${id}`, err);
    }
  }

  async put(task: Task): Promise<void> {
    try {
      // Augment with the constant GSI partition so the item is queryable by
      // the list view. The attribute is internal — stripped on read.
      const item: StoredTask = { ...task, gsi1pk: LIST_PARTITION };
      await this.doc.send(
        new PutCommand({ TableName: this.tableName, Item: item }),
      );
    } catch (err) {
      throw new RepositoryError(`failed to put task ${task.id}`, err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.doc.send(
        new DeleteCommand({ TableName: this.tableName, Key: { id } }),
      );
    } catch (err) {
      throw new RepositoryError(`failed to delete task ${id}`, err);
    }
  }

  /**
   * Lists tasks via a bounded Query on the `gsi1` index (constant partition
   * `TASK`, sorted by createdAt). Never a Scan — consistent with the IAM role
   * that grants Query but not Scan. The internal `gsi1pk` attribute is stripped
   * from returned items.
   */
  async list(limit?: number): Promise<Task[]> {
    const cap = Math.min(limit ?? this.listCap, this.listCap);
    try {
      const res = await this.doc.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: LIST_INDEX_NAME,
          KeyConditionExpression: 'gsi1pk = :pk',
          ExpressionAttributeValues: { ':pk': LIST_PARTITION },
          // newest first (createdAt descending)
          ScanIndexForward: false,
          Limit: cap,
        }),
      );
      const items = (res.Items as StoredTask[] | undefined) ?? [];
      return items.map(({ gsi1pk: _gsi1pk, ...task }) => task);
    } catch (err) {
      throw new RepositoryError('failed to list tasks', err);
    }
  }
}
