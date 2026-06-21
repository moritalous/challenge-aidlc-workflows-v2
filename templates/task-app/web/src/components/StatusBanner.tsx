import type { JSX } from 'react';

/**
 * StatusBanner — success notification (BR-A4 / frontend-components.md).
 * role=status + aria-live=polite so success is announced non-disruptively.
 */
export function StatusBanner({
  message,
}: {
  message: string | null;
}): JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <div role="status" aria-live="polite" data-testid="status-banner">
      <span aria-hidden="true">✓ </span>
      {message}
    </div>
  );
}
