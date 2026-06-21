import { useEffect, useState, type JSX } from 'react';
import type { Task } from './types.js';
import { createApiClient, type ApiClient } from './api/client.js';
import { TaskListPage } from './pages/TaskListPage.js';
import { TaskDetailPage } from './pages/TaskDetailPage.js';

/**
 * Minimal app shell wiring the list/detail pages to the API client. Routing is a
 * trivial in-memory toggle for the skeleton (a router is a later concern).
 */
export function App({
  api = createApiClient(),
}: {
  api?: ApiClient;
}): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Task | null | 'new'>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      setTasks(await api.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (selected === 'new') {
    return (
      <TaskDetailPage
        task={null}
        onSave={async (input) => {
          await api.create(input);
          setSelected(null);
          await refresh();
        }}
        onDelete={async () => setSelected(null)}
      />
    );
  }

  if (selected) {
    const current = selected;
    return (
      <TaskDetailPage
        task={current}
        onSave={async (input) => {
          await api.update(current.id, input);
          setSelected(null);
          await refresh();
        }}
        onDelete={async () => {
          await api.remove(current.id);
          setSelected(null);
          await refresh();
        }}
      />
    );
  }

  return (
    <TaskListPage
      tasks={tasks}
      loading={loading}
      onNew={() => setSelected('new')}
      onOpen={(id) => setSelected(tasks.find((t) => t.id === id) ?? null)}
    />
  );
}
