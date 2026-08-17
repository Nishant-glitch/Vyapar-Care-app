'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllOtherServiceRequests } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';

export default function OtherServicesPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllOtherServiceRequests();
        setApps(data);
      } catch (err) {
        console.error('Failed to load other services:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All Requests', count: apps.length },
    { key: 'review', label: 'In Review', count: apps.filter((a) => ['under_review', 'submitted'].includes(a.status)).length },
    { key: 'completed', label: 'Completed / Closed', count: apps.filter((a) => ['completed', 'closed'].includes(a.status)).length },
  ];

  const columns = [
    {
      key: 'application_id',
      label: 'Request ID',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{val || row.id}</span>
      ),
    },
    {
      key: 'service_name',
      label: 'Consultancy Service',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val || row.selected_service?.title || 'Custom Requirement'}</div>
          <div className="text-[11px] text-slate-500">Applicant: {row.applicant_name || row.applicant_details?.fullName}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val) => <span className="text-xs text-slate-700 uppercase font-bold">{val || 'Legal / Tax'}</span>,
    },
    {
      key: 'urgency',
      label: 'Urgency',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${val === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
          {val || 'normal'}
        </span>
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
          href={`/dashboard/other/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">Other Consultancy & Legal Services</h2>
        <p className="text-xs text-slate-500">Custom business permits, ISO certifications, PCB approvals, legal contracts, and specialized filings</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search service requirement, request ID, client..."
        onRowClick={(row) => router.push(`/dashboard/other/${row.id || row.application_id}`)}
      />
    </div>
  );
}
