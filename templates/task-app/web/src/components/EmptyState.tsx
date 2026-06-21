import type { JSX } from 'react';

/**
 * EmptyState — empty-list CTA (frontend-components.md). Text CTA, color-
 * independent.
 */
export function EmptyState({
  onCreate,
}: {
  onCreate: () => void;
}): JSX.Element {
  return (
    <div data-testid="empty-state">
      <p>No tasks yet.</p>
      <button onClick={onCreate} data-testid="empty-create">
        Create your first task
      </button>
    </div>
  );
}
