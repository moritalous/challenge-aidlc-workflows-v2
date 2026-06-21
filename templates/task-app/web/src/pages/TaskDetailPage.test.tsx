import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Task } from '../types.js';
import { TaskDetailPage } from './TaskDetailPage.js';

const task: Task = {
  id: '1',
  title: 'Existing',
  status: 'Todo',
  createdAt: 'x',
  updatedAt: 'x',
};

describe('TaskDetailPage save flow (US-C3 AC3)', () => {
  it('shows a success StatusBanner after a successful save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TaskDetailPage task={task} onSave={onSave} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByTestId('detail-save'));
    await waitFor(() =>
      expect(screen.getByTestId('status-banner')).toHaveTextContent('Saved'),
    );
    expect(onSave).toHaveBeenCalled();
  });

  it('shows an AlertBanner and PRESERVES input on save failure', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network down'));
    render(<TaskDetailPage task={task} onSave={onSave} onDelete={vi.fn()} />);
    const input = screen.getByTestId('detail-title') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'My edited title');
    await userEvent.click(screen.getByTestId('detail-save'));

    await waitFor(() =>
      expect(screen.getByTestId('alert-banner')).toHaveTextContent(
        'network down',
      ),
    );
    // Input preserved (BR-A4): the edited value is still there.
    expect((screen.getByTestId('detail-title') as HTMLInputElement).value).toBe(
      'My edited title',
    );
  });
});

describe('TaskDetailPage delete confirmation (US-C3 AC2 / BR-A3)', () => {
  it('opens a ConfirmDialog and deletes on confirm', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<TaskDetailPage task={task} onSave={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByTestId('detail-delete'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('confirm-delete'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('cancel closes the dialog and does NOT delete', async () => {
    const onDelete = vi.fn();
    render(<TaskDetailPage task={task} onSave={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByTestId('detail-delete'));
    await userEvent.click(screen.getByTestId('confirm-cancel'));
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
