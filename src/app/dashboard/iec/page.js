'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllIECApplications } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';

export default function IECListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllIECApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load IEC applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All IEC', count: apps.length },
    { key: 'review', label: 'Under Review', count: apps.filter((a) => ['under_review', 'submitted'].includes(a.status)).length },
    { key: 'completed', label: 'IEC Issued', count: apps.filter((a) => ['approved', 'completed'].includes(a.status)).length },
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
      label: 'Entity / Firm Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{safeRender(val || row.business_details?.firmName || row.business_details?.businessName || 'Entity')}</div>
          <div className="text-[11px] text-slate-500 font-mono">PAN: {safeRender(row.pan || row.pan_details?.panNumber || '—')}</div>
        </div>
      ),
    },
    {
      key: 'entity_type',
      label: 'Entity Type',
      render: (val) => <span className="text-xs text-slate-700 capitalize">{safeRender(val, 'Proprietorship')}</span>,
    },
    {
      key: 'iec_number',
      label: 'DGFT IEC Code',
      render: (val) => (
        <span className="font-mono font-bold text-emerald-700 text-xs">{safeRender(val, 'Pending')}</span>
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
          href={`/dashboard/iec/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">Import Export Code (IEC) Applications</h2>
        <p className="text-xs text-slate-500">DGFT online issuance, PFMS bank pre-validation, export product profiles and e-IEC certificates</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search firm name, application ID, PAN..."
        onRowClick={(row) => router.push(`/dashboard/iec/${row.id || row.application_id}`)}
      />
    </div>
  );
}
