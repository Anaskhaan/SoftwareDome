'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-primary-navy p-4 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
      </div>

      <div className="p-8 space-y-6">
        {message && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Business Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
              required
            />
          </div>

          <button type="submit" className="w-full py-3 bg-primary-navy text-white rounded-lg font-bold text-sm hover:bg-accent-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg">
            Send Sign-in Link
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 font-medium">
            New to SoftwareDome?{' '}
            <Link href="/signup" className="text-primary-navy font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
