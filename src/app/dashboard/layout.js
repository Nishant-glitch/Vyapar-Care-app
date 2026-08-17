'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { supabase } from '@/lib/supabase-client';
import { ADMIN_EMAILS } from '@/lib/constants';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('vyapar_admin_session') : null;
        if (!stored) {
          router.replace('/login');
          return;
        }

        const session = JSON.parse(stored);
        const now = Date.now();

        // 1. Check 24-Hour Expiry
        if (!session.expiresAt || now > session.expiresAt) {
          localStorage.removeItem('vyapar_admin_session');
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        // 2. Check Whitelist
        const isWhitelisted = ADMIN_EMAILS.some(
          (adm) => adm.toLowerCase() === (session.email || '').toLowerCase()
        );
        if (!isWhitelisted) {
          localStorage.removeItem('vyapar_admin_session');
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        setAuthChecked(true);
      } catch (err) {
        localStorage.removeItem('vyapar_admin_session');
        router.replace('/login');
      }
    }

    verifyAdminSession();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1B2B5E]/30 border-t-[#1B2B5E] rounded-full animate-spin"></div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verifying Admin Access...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
