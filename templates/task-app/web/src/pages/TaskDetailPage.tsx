import { useRef, useState, useEffect, type JSX } from 'react';
import type { Task, TaskInput, TaskStatus } from '../types.js';
import { StatusBanner } from '../components/StatusBanner.js';
import { AlertBanner } from '../components/AlertBanner.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';

type SaveState = 'editing' | 'saving';

/**
 * TaskDetailPage — detail/edit (frontend-components.md). Title gets initial
 * focus; save flow editing -> saving -> (success: StatusBanner / failure:
 * AlertBanner + input preserved). Delete goes through {@link ConfirmDialog}.
 *
 * `onSave` rejecting must NOT clear the user's input (BR-A4 / US-C3 AC3).
 */
export function TaskDetailPage({
  task,
  onSave,
  onDelete,
}: {
  task: Task | null;
  onSave: (input: TaskInput) => Promise<void>;
  onDelete: () => Promise<void>;
}): JSX.Element {
  const [title, setTitle] = useState(task?.title ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'Todo');
  const [saveState, setSaveState] = useState<SaveState>('editing');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function save(): Promise<void> {
    setError(null);
    setSuccess(null);
    setSaveState('saving');
    try {
      await onSave({ title, status });
      setSuccess('Saved');
    } catch (err) {
      // Preserve input on failure (do not reset title/status).
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaveState('editing');
    }
  }

  return (
    <main>
      <nav aria-label="Breadcrumb">
        <a href="#/tasks" data-testid="back-link">
          ← Back
        </a>
      </nav>
      <h1>{task?.title ?? 'New Task'}</h1>

      <StatusBanner message={success} />
      <AlertBanner message={error} />

      <label htmlFor="title">Title</label>
      <input
        id="title"
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-describedby="title-hint"
        data-testid="detail-title"
      />
      <span id="title-hint">Required, 1–200 characters.</span>

      <label htmlFor="status">Status</label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        data-testid="detail-status"
      >
        <option value="Todo">Todo</option>
        <option value="Doing">Doing</option>
        <option value="Done">Done</option>
      </select>

      <button
        onClick={save}
        disabled={saveState === 'saving'}
        data-testid="detail-save"
      >
        {saveState === 'saving' ? 'Saving…' : 'Save'}
      </button>
      <button onClick={() => setConfirmOpen(true)} data-testid="detail-delete">
        Delete
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this task?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void onDelete();
        }}
      />
    </main>
  );
}
