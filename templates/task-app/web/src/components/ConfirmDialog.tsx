import { useEffect, useRef, type JSX } from 'react';

/**
 * ConfirmDialog — delete confirmation (BR-A3 / FR-5.2). role=dialog with initial
 * focus on the *Cancel* button (safe default). Cancelling makes no change.
 */
export function ConfirmDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}): JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      data-testid="confirm-dialog"
    >
      <h2 id="confirm-title">{title}</h2>
      <p>This action cannot be undone.</p>
      <button ref={cancelRef} onClick={onCancel} data-testid="confirm-cancel">
        Cancel
      </button>
      <button onClick={onConfirm} data-testid="confirm-delete">
        Delete
      </button>
    </div>
  );
}
