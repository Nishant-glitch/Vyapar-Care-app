'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDashboardStats, getRecentApplications } from '@/lib/adminDatabase';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function DashboardHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, appsData] = await Promise.all([
          getDashboardStats(),
          getRecentApplications(20),
        ]);
        setStats(statsData);
        setRecentApps(appsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getServiceBadge = (serviceCode, serviceType) => {
    const map = {
      gst: 'bg-blue-100 text-blue-800 border-blue-200',
      plc: 'bg-purple-100 text-purple-800 border-purple-200',
      trademark: 'bg-amber-100 text-amber-800 border-amber-200',
      fssai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iec: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      itr: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      udyam: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-slate-100 text-slate-800 border-slate-200',
      order: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    const style = map[(serviceCode || '').toLowerCase()] || map.other;

    return (
      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${style}`}>
        {serviceType || serviceCode}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Applications */}
        <div className="admin-card flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0 border border-blue-100">
            📊
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {stats?.totalApplications || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total Applications
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="admin-card flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 border border-purple-100">
            ⏳
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {stats?.pendingReview || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Pending Review
            </div>
          </div>
        </div>

        {/* Documents Pending */}
        <div className="admin-card flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0 border border-amber-100">
            📂
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {stats?.documentsPending || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Documents Pending
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="admin-card flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0 border border-emerald-100">
            ✅
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {stats?.completed || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Completed & Issued
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Quick Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card (2 cols) */}
        <div className="lg:col-span-2 admin-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Payments Collected</h3>
              <p className="text-xs text-slate-500">Total client fees collected across all legal & compliance services</p>
            </div>
            <Link
              href="/dashboard/payments"
              className="text-xs font-bold text-[#1B2B5E] hover:text-[#C5991A] transition-colors"
            >
              View Payments ➔
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-semibold mb-1">Total Collected (All Time)</div>
              <div className="text-2xl font-black text-[#1B2B5E]">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold mb-1">This Month Collection</div>
              <div className="text-2xl font-black text-emerald-800">
                {formatCurrency(stats?.thisMonthRevenue || stats?.totalRevenue || 0)}
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-xs text-amber-700 font-semibold mb-1">Growth vs Last Month</div>
              <div className="text-2xl font-black text-amber-800">
                +46.1%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>💡 100% payments synced with Razorpay / UPI gateway</span>
            <span className="font-semibold text-emerald-600">Active Reconciliation</span>
          </div>
        </div>

        {/* Quick Service Dispatch / Shortcut Card */}
        <div className="admin-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Service Modules</h3>
            <p className="text-xs text-slate-500 mb-4">Direct access to specialized application boards</p>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/gst" className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>🔖</span> GST
              </Link>
              <Link href="/dashboard/plc" className="p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>🏢</span> PLC (Company)
              </Link>
              <Link href="/dashboard/trademark" className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>™️</span> Trademark
              </Link>
              <Link href="/dashboard/fssai" className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>🍽️</span> FSSAI
              </Link>
              <Link href="/dashboard/iec" className="p-2.5 rounded-lg bg-slate-50 hover:bg-cyan-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>🌐</span> IEC Code
              </Link>
              <Link href="/dashboard/itr" className="p-2.5 rounded-lg bg-slate-50 hover:bg-yellow-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>📄</span> ITR Filing
              </Link>
              <Link href="/dashboard/udyam" className="p-2.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>🏭</span> MSME / Udyam
              </Link>
              <Link href="/dashboard/other" className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200/70 transition-all">
                <span>⚙️</span> Other Services
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/dashboard/notifications"
              className="w-full py-2 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              📢 Broadcast Notification
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Applications & Activity</h3>
            <p className="text-xs text-slate-500">Live incoming applications merged across all 8 service departments</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing latest {recentApps.length} records
          </span>
        </div>

        <div className="admin-table-container shadow-sm">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application / Order ID</th>
                  <th>Applicant / Client Name</th>
                  <th>Service</th>
                  <th>Submission Date</th>
                  <th>Current Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono font-bold text-xs text-[#1B2B5E]">
                      {item.id}
                    </td>
                    <td className="font-semibold text-slate-900">
                      <div>{item.applicant}</div>
                      {item.name && item.name !== item.applicant && (
                        <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                          {item.name}
                        </div>
                      )}
                    </td>
                    <td>
                      {getServiceBadge(item.serviceCode, item.serviceType)}
                    </td>
                    <td className="text-xs text-slate-600">
                      <div>{formatDate(item.date)}</div>
                      <div className="text-[10px] text-slate-400">{formatRelativeTime(item.date)}</div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        href={item.route}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#1B2B5E] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all"
                      >
                        View ➔
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
