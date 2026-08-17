'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', href: '/dashboard' },
  { label: 'Orders', icon: '📋', href: '/dashboard/orders' },
  { label: 'GST Applications', icon: '🔖', href: '/dashboard/gst' },
  { label: 'Company (PLC)', icon: '🏢', href: '/dashboard/plc' },
  { label: 'Trademark', icon: '™️', href: '/dashboard/trademark' },
  { label: 'FSSAI Food License', icon: '🍽️', href: '/dashboard/fssai' },
  { label: 'IEC Code', icon: '🌐', href: '/dashboard/iec' },
  { label: 'ITR Filing', icon: '📄', href: '/dashboard/itr' },
  { label: 'MSME / Udyam', icon: '🏭', href: '/dashboard/udyam' },
  { label: 'Other Services', icon: '⚙️', href: '/dashboard/other' },
  { label: 'Users Directory', icon: '👥', href: '/dashboard/users' },
  { label: 'Payments', icon: '💳', href: '/dashboard/payments' },
  { label: 'Notifications', icon: '🔔', href: '/dashboard/notifications' },
  { label: 'Settings', icon: '🔧', href: '/dashboard/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    // clear any admin session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vyapar_admin_session');
    }
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#1B2B5E] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#111C3E] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5991A] to-[#DFB53B] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-[#C5991A]/20">
              V
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white group-hover:text-amber-200 transition-colors">
                VYAPAR CARE
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[#C5991A] uppercase">
                ADMIN PANEL
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Management
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                  active
                    ? 'bg-white/15 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#C5991A]" />
                )}
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#111C3E]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C5991A] text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                VC
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Vyapar Admin</div>
                <div className="text-[10px] text-slate-400 truncate">Super Administrator</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors font-semibold"
              title="Sign Out"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
