import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App.js';
import type { ApiClient } from './api/client.js';
import type { Task } from './types.js';

const sample: Task = {
  id: '1',
  title: 'First',
  status: 'Todo',
  createdAt: 'x',
  updatedAt: 'x',
};

function fakeApi(overrides: Partial<ApiClient> = {}): ApiClient {
  return {
    list: vi.fn().mockResolvedValue([sample]),
    get: vi.fn().mockResolvedValue(sample),
    create: vi.fn().mockResolvedValue(sample),
    update: vi.fn().mockResolvedValue(sample),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('App shell', () => {
  it('loads and renders the task list on mount', async () => {
    const api = fakeApi();
    render(<App api={api} />);
    await waitFor(() =>
      expect(screen.getByTestId('task-list')).toBeInTheDocument(),
    );
    expect(api.list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
  });

  it('opens the new-task form and creates a task, then refreshes', async () => {
    const api = fakeApi();
    render(<App api={api} />);
    await waitFor(() => screen.getByTestId('new-task'));
    await userEvent.click(screen.getByTestId('new-task'));

    await userEvent.type(screen.getByTestId('detail-title'), 'Write more');
    await userEvent.click(screen.getByTestId('detail-save'));

    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    // refresh() re-lists after create (mount + post-create)
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('opens an existing task for editing and updates it', async () => {
    const api = fakeApi();
    render(<App api={api} />);
    await waitFor(() => screen.getByTestId('task-item-1'));
    await userEvent.click(screen.getByTestId('task-item-1'));

    expect(screen.getByTestId('detail-title')).toHaveValue('First');
    await userEvent.click(screen.getByTestId('detail-save'));
    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith('1', expect.anything()),
    );
  });
});
