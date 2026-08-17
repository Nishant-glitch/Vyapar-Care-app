'use client';

import React from 'react';
import { STATUS_DEFINITIONS } from '@/lib/constants';

export default function StatusBadge({ status, className = '' }) {
  const normalizedKey = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_DEFINITIONS[normalizedKey] || {
    label: (status || 'Unknown').replace(/_/g, ' '),
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {config.label}
    </span>
  );
}
