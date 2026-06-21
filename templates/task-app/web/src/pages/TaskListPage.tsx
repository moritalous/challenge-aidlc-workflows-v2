import type { JSX } from 'react';
import type { Task } from '../types.js';
import { EmptyState } from '../components/EmptyState.js';
import { StatusBadge } from '../components/StatusBadge.js';

/**
 * TaskListPage — task list (frontend-components.md). h1="Tasks", header + main
 * landmarks, "+ New Task" in tab order, status shown as icon + label (color-
 * independent). Renders {@link EmptyState} when there are no tasks.
 */
export function TaskListPage({
  tasks,
  loading,
  onNew,
  onOpen,
}: {
  tasks: Task[];
  loading: boolean;
  onNew: () => void;
  onOpen: (id: string) => void;
}): JSX.Element {
  return (
    <main>
      <header>
        <h1>Tasks</h1>
        <button onClick={onNew} data-testid="new-task">
          + New Task
        </button>
      </header>

      {loading ? (
        <p role="status" data-testid="list-loading">
          Loading tasks…
        </p>
      ) : tasks.length === 0 ? (
        <EmptyState onCreate={onNew} />
      ) : (
        <ul data-testid="task-list">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => onOpen(t.id)}
                data-testid={`task-item-${t.id}`}
              >
                <span>{t.title}</span> <StatusBadge status={t.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
