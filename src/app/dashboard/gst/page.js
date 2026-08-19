'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllGSTApplications } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';

export default function GSTListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllGSTApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load GST applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All GST', count: apps.length },
    { key: 'review', label: 'Under Review', count: apps.filter((a) => ['under_scrutiny', 'under_review', 'submitted'].includes(a.status)).length },
    { key: 'completed', label: 'GSTIN Issued', count: apps.filter((a) => ['gstin_issued', 'approved', 'completed'].includes(a.status)).length },
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
      label: 'Applicant',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{safeRender(val || row.applicant?.fullName || 'Applicant')}</div>
          <div className="text-[11px] text-slate-500">{safeRender(row.mobile || row.applicant?.mobile || '—')}</div>
        </div>
      ),
    },
    {
      key: 'business_name',
      label: 'Business Name',
      render: (val, row) => <span className="font-semibold text-slate-800">{safeRender(val || row.business_details?.tradeName || '—')}</span>,
    },
    {
      key: 'constitution',
      label: 'Constitution',
      render: (val, row) => <span className="text-xs text-slate-600">{safeRender(val || row.business_details?.constitution || 'Proprietorship')}</span>,
    },
    {
      key: 'docs_percentage',
      label: 'Docs %',
      render: (val) => {
        const pct = val || 100;
        return (
          <div className="w-24">
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span>{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Submitted Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Link
          href={`/dashboard/gst/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">GST Registration Applications</h2>
        <p className="text-xs text-slate-500">Manage Form GST REG-01 filings, business premises, promoter KYC, and GSTIN issuances</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search GST application ID, applicant, trade name..."
        onRowClick={(row) => router.push(`/dashboard/gst/${row.id || row.application_id}`)}
      />
    </div>
  );
}
