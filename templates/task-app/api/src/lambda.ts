import { handle } from 'hono/aws-lambda';
import { buildApp } from './app.js';
import { TaskService } from './service/task-service.js';
import { DynamoTaskRepository } from './repository/dynamo-task-repository.js';

/**
 * AWS Lambda entry. Wires the real DynamoDB repository (TABLE_NAME / AWS_REGION
 * from env) into the service and app. No secrets in code.
 */
const repo = new DynamoTaskRepository();
const service = new TaskService(repo);
const app = buildApp(service);

export const handler = handle(app);
