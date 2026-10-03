'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { signInAdmin } from '@/app/admin/actions';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(params.get('error') === 'forbidden' ? 'This account does not have admin access.' : '');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const email = String(f.get('email') ?? '');
    const password = String(f.get('password') ?? '');
    const res = await signInAdmin(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    window.location.href = '/admin';
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-line bg-card p-6 sm:p-8">
      <div className="mb-2 flex justify-center"><Logo /></div>
      <h1 className="text-center text-lg font-semibold">Admin sign in</h1>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {error && <p role="alert" className="text-sm text-brand">{error}</p>}
      <button disabled={busy} className="btn-red w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}
