'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('FSSAI Detail Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50 border border-rose-200 rounded-2xl my-6 max-w-xl mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h2 className="text-lg font-bold text-rose-950 mb-1">Something went wrong</h2>
      <p className="text-xs text-rose-600 max-w-md mb-6 font-medium">
        {error?.message || 'An unexpected error occurred while loading this FSSAI application.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          Try Again
        </button>
        <Link
          href="/dashboard/fssai"
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all"
        >
          ← Back to FSSAI Applications
        </Link>
      </div>
    </div>
  );
}
