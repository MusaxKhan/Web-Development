'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '../../lib/actions';

const initialState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">🔐</div>
          <h1>AuthSystem</h1>
          <p>Sign in to continue</p>
        </div>

        <form action={formAction} className="auth-form">
          {justRegistered && (
            <div className="success-box">✅ Account created! You can now sign in.</div>
          )}
          {state?.error && (
            <div className="error-box">{state.error}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={`btn-primary${isPending ? ' loading' : ''}`}
            disabled={isPending}
          >
            {isPending ? 'Signing In' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-link">
          No account yet? <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </main>
  );
}