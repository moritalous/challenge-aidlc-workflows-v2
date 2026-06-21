import { useRef, useState, type FormEvent, type JSX } from 'react';
import { AlertBanner } from '../components/AlertBanner.js';

/**
 * LoginPage — seed-user login stub (BR-A5 / FR-7.1). h1 = app name, main
 * landmark, Email gets initial focus, invalid credentials surface via an
 * aria-live alert (US-C3 AC4). Real auth is a later Bolt.
 */
export function LoginPage({
  onLogin,
}: {
  onLogin: (email: string, password: string) => boolean;
}): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;
    if (!onLogin(email, password)) {
      setError('Invalid credentials. Please try again.');
      emailRef.current?.focus();
      return;
    }
    setError(null);
  }

  return (
    <main>
      <h1>Vibe Tasks</h1>
      <AlertBanner message={error} />
      <form onSubmit={submit} aria-label="Login">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          ref={emailRef}
          autoFocus
          data-testid="login-email"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          data-testid="login-password"
        />
        <button type="submit" data-testid="login-submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
