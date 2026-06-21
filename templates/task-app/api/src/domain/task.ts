import { z } from 'zod';

/**
 * Task domain entity (generated-app, domain-entities.md section B).
 * - title: required, 1..200 chars
 * - status: Todo | Doing | Done (free-update attribute; changeStatus == update)
 * - dueDate: optional ISO date-time
 */
export const TaskStatusSchema = z.enum(['Todo', 'Doing', 'Done']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Create payload (zod-validated at the API boundary, BR-A1/BR-A2). */
export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  status: TaskStatusSchema.optional(),
  dueDate: z.string().datetime().optional(),
});
export type TaskCreate = z.infer<typeof TaskCreateSchema>;

/**
 * Update payload. `status` is included here, so changeStatus is realized as a
 * plain PUT update of status (U0 invariant; no dedicated transition rules).
 */
export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: TaskStatusSchema.optional(),
  dueDate: z.string().datetime().optional(),
});
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
