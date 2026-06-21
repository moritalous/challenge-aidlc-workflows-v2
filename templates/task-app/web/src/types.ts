/** Shared front-end types, mirroring the API's Task contract. */
export type TaskStatus = 'Todo' | 'Doing' | 'Done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  status?: TaskStatus;
  dueDate?: string;
}
