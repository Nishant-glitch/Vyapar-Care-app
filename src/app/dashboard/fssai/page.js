'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllFSSAIApplications } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';

export default function FSSAIPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllFSSAIApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load FSSAI applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All FSSAI', count: apps.length },
    { key: 'review', label: 'Under Review', count: apps.filter((a) => ['under_review', 'submitted'].includes(a.status)).length },
    { key: 'completed', label: 'License Issued', count: apps.filter((a) => ['approved', 'completed'].includes(a.status)).length },
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
      key: 'business_name',
      label: 'Food Business (FBO)',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{safeRender(val || row.business_details?.foodBusinessName || 'FBO')}</div>
          <div className="text-[11px] text-slate-500">Applicant: {safeRender(row.applicant_name || row.applicant_details?.name || row.applicant_details?.fullName || '—')}</div>
        </div>
      ),
    },
    {
      key: 'license_type',
      label: 'License Tier',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold capitalize">
          {safeRender(val, 'State License')}
        </span>
      ),
    },
    {
      key: 'kob',
      label: 'Kind of Business (KOB)',
      render: (val) => <span className="text-xs text-slate-700">{safeRender(val, 'Restaurant / Bakery')}</span>,
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
          href={`/dashboard/fssai/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">FSSAI Food License / Registration (FoSCoS)</h2>
        <p className="text-xs text-slate-500">Manage FSSAI Basic Registrations, State Licenses, and Central Food Licenses</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search food business name, application ID, KOB..."
        onRowClick={(row) => router.push(`/dashboard/fssai/${row.id || row.application_id}`)}
      />
    </div>
  );
}
