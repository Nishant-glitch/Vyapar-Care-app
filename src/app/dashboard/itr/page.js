'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllITRApplications } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';

export default function ITRListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllITRApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load ITR applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All ITR', count: apps.length },
    { key: 'review', label: 'Computation Prep', count: apps.filter((a) => ['under_review', 'submitted', 'computation_prepared'].includes(a.status)).length },
    { key: 'completed', label: 'E-Filed & Verified', count: apps.filter((a) => ['filed', 'completed'].includes(a.status)).length },
  ];

  const columns = [
    {
      key: 'application_id',
      label: 'Application ID',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{safeRender(val || row.id)}</span>
      ),
    },
    {
      key: 'applicant_name',
      label: 'Taxpayer Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{safeRender(val || row.profile?.fullName || row.profile?.name || 'Taxpayer')}</div>
          <div className="text-[11px] text-slate-500 font-mono">PAN: {safeRender(row.profile?.pan || row.pan || '—')}</div>
        </div>
      ),
    },
    {
      key: 'assessment_year',
      label: 'Assessment Year',
      render: (val) => <span className="font-semibold text-amber-700">{safeRender(val, 'AY 2026-27')}</span>,
    },
    {
      key: 'recommended_itr_form',
      label: 'ITR Form',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">
          {safeRender(val, 'ITR-1')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={safeRender(val, 'submitted')} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Link
          href={`/dashboard/itr/${row.id || row.application_id}`}
          className="px-3 py-1.5 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          View ➔
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Income Tax Return (ITR) Filing Applications</h2>
        <p className="text-xs text-slate-500">Manage ITR-1 to ITR-4 computations, Form 26AS AIS/TIS reconciliations, and IT Department e-filing acknowledgements</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search taxpayer name, application ID, PAN..."
        onRowClick={(row) => router.push(`/dashboard/itr/${row.id || row.application_id}`)}
      />
    </div>
  );
}
