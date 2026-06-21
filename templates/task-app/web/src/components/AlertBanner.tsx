import type { JSX } from 'react';

/**
 * AlertBanner — failure/error notification (BR-A4 / frontend-components.md).
 * role=alert + aria-live=assertive so errors are announced immediately. The icon
 * + text ensure status is not conveyed by color alone (WCAG AA).
 */
export function AlertBanner({
  message,
}: {
  message: string | null;
}): JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <div role="alert" aria-live="assertive" data-testid="alert-banner">
      <span aria-hidden="true">⚠ </span>
      {message}
    </div>
  );
}
