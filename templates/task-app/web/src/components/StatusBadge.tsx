import type { JSX } from 'react';
import type { TaskStatus } from '../types.js';

/** Icon per status so meaning is not conveyed by color alone (WCAG AA). */
const ICON: Record<TaskStatus, string> = {
  Todo: '○',
  Doing: '◐',
  Done: '●',
};

/** Renders a status as icon + label (color-independent). */
export function StatusBadge({ status }: { status: TaskStatus }): JSX.Element {
  return (
    <span data-testid="status-badge" data-status={status}>
      <span aria-hidden="true">{ICON[status]} </span>
      {status}
    </span>
  );
}
