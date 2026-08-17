'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllTMApplications } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';

export default function TrademarkListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllTMApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load Trademark applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All Trademarks', count: apps.length },
    { key: 'review', label: 'Under Review / Examination', count: apps.filter((a) => ['under_review', 'submitted', 'examination'].includes(a.status)).length },
    { key: 'completed', label: 'Registered', count: apps.filter((a) => ['registered', 'published', 'completed'].includes(a.status)).length },
  ];

  const columns = [
    {
      key: 'application_id',
      label: 'Application ID',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{val || row.id}</span>
      ),
    },
    {
      key: 'trademark_name',
      label: 'Trademark Mark / Brand',
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val || row.mark_details?.trademarkName || 'Brand Mark'}</div>
          <div className="text-[11px] text-slate-500">Applicant: {row.applicant_name || row.applicant_details?.legalName}</div>
        </div>
      ),
    },
    {
      key: 'applicant_type',
      label: 'Applicant Type',
      render: (val) => <span className="text-xs text-slate-700 capitalize">{val || 'Individual'}</span>,
    },
    {
      key: 'selected_classes',
      label: 'Classes',
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val || [9]).map((cls) => (
            <span key={cls} className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
              Class {cls}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
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
          href={`/dashboard/trademark/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">Trademark (Form TM-A) Applications</h2>
        <p className="text-xs text-slate-500">Manage IP India brand registrations, device mark logos, NICE classifications, and Form TM-48 authorizations</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search trademark name, application ID, classes..."
        onRowClick={(row) => router.push(`/dashboard/trademark/${row.id || row.application_id}`)}
      />
    </div>
  );
}
