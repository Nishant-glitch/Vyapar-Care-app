'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopBar({ onToggleSidebar }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Determine dynamic title based on current pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Executive Dashboard';
    if (pathname.startsWith('/dashboard/orders')) return 'Orders & Processing';
    if (pathname.startsWith('/dashboard/gst')) return 'GST Registration Applications';
    if (pathname.startsWith('/dashboard/plc')) return 'Private Limited Company (PLC)';
    if (pathname.startsWith('/dashboard/trademark')) return 'Trademark (TM-A) Applications';
    if (pathname.startsWith('/dashboard/fssai')) return 'FSSAI Food License Applications';
    if (pathname.startsWith('/dashboard/iec')) return 'Import Export Code (IEC)';
    if (pathname.startsWith('/dashboard/itr')) return 'ITR Tax Filing Applications';
    if (pathname.startsWith('/dashboard/udyam')) return 'MSME / Udyam Applications';
    if (pathname.startsWith('/dashboard/other')) return 'Other Consultancy Requests';
    if (pathname.startsWith('/dashboard/users')) return 'Users & Clients Directory';
    if (pathname.startsWith('/dashboard/payments')) return 'Financial Transactions & Revenue';
    if (pathname.startsWith('/dashboard/notifications')) return 'Notification Center';
    if (pathname.startsWith('/dashboard/settings')) return 'Admin Panel Settings';
    return 'Admin Workspace';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-slate-200 shadow-sm">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Vyapar Care Consultancy Services Management
          </p>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications, PAN, GSTIN, customer name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Notification Bell & Admin Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white">
            3
          </span>
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#1B2B5E] text-[#C5991A] font-extrabold flex items-center justify-center text-xs shadow-sm border border-[#C5991A]/30">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">Admin User</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Online</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
