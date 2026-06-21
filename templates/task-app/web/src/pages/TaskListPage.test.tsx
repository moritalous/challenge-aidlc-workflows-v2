import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Task } from '../types.js';
import { TaskListPage } from './TaskListPage.js';

const tasks: Task[] = [
  {
    id: '1',
    title: 'First',
    status: 'Todo',
    createdAt: 'x',
    updatedAt: 'x',
  },
];

describe('TaskListPage', () => {
  it('renders tasks with an h1 and status badge (US-C3 AC1)', () => {
    render(
      <TaskListPage
        tasks={tasks}
        loading={false}
        onNew={() => {}}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Tasks',
    );
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Todo');
  });

  it('renders the EmptyState when there are no tasks', () => {
    render(
      <TaskListPage
        tasks={[]}
        loading={false}
        onNew={() => {}}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows a loading status while loading', () => {
    render(
      <TaskListPage tasks={[]} loading onNew={() => {}} onOpen={() => {}} />,
    );
    expect(screen.getByTestId('list-loading')).toBeInTheDocument();
  });

  it('invokes onOpen when a task is clicked', async () => {
    const onOpen = vi.fn();
    render(
      <TaskListPage
        tasks={tasks}
        loading={false}
        onNew={() => {}}
        onOpen={onOpen}
      />,
    );
    await userEvent.click(screen.getByTestId('task-item-1'));
    expect(onOpen).toHaveBeenCalledWith('1');
  });
});
