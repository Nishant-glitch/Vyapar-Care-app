'use client';

import React from 'react';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching information from the server.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50 border border-rose-200 rounded-xl my-4">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-3">
        ⚠️
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-600 max-w-md mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}
