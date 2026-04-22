'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signupAction } from '../../lib/actions';

const initialState = { error: null };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const searchParams = useSearchParams();

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">🔐</div>
          <h1>AuthSystem</h1>
          <p>Create your secure account</p>
        </div>

        <form action={formAction} className="auth-form">
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
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={`btn-primary${isPending ? ' loading' : ''}`}
            disabled={isPending}
          >
            {isPending ? 'Creating Account' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}