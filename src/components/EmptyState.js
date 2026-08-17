'use client';

import React from 'react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  icon = '📂',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#1B2B5E] hover:bg-[#283E80] rounded-lg transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
