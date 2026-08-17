'use client';

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="admin-card animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        <div className="w-16 h-4 bg-slate-200 rounded"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
      <div className="h-4 bg-slate-100 rounded w-32"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="admin-table-container animate-pulse p-4">
      <div className="h-10 bg-slate-100 rounded mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-6 bg-slate-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="admin-card h-48 bg-slate-100"></div>
        <div className="admin-card h-64 bg-slate-100"></div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="admin-card h-40 bg-slate-100"></div>
        <div className="admin-card h-56 bg-slate-100"></div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'table' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (type === 'detail') return <DetailSkeleton />;
  return <TableSkeleton />;
}
