import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage.js';

describe('LoginPage (seed-user stub, US-C3 AC4)', () => {
  it('renders an h1, main landmark, and a labelled login form', () => {
    render(<LoginPage onLogin={() => true} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Vibe Tasks',
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
  });

  it('submits entered credentials to onLogin', async () => {
    const onLogin = vi.fn().mockReturnValue(true);
    render(<LoginPage onLogin={onLogin} />);
    await userEvent.type(screen.getByTestId('login-email'), 'a@b.com');
    await userEvent.type(screen.getByTestId('login-password'), 'secret');
    await userEvent.click(screen.getByTestId('login-submit'));
    expect(onLogin).toHaveBeenCalledWith('a@b.com', 'secret');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces an aria-live error on invalid credentials', async () => {
    const onLogin = vi.fn().mockReturnValue(false);
    render(<LoginPage onLogin={onLogin} />);
    await userEvent.type(screen.getByTestId('login-email'), 'bad@b.com');
    await userEvent.type(screen.getByTestId('login-password'), 'wrong');
    await userEvent.click(screen.getByTestId('login-submit'));
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
  });
});
