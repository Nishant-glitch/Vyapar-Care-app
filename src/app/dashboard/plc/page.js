'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllPLCApplications } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';

export default function PLCListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllPLCApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load PLC applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All PLC', count: apps.length },
    { key: 'review', label: 'In Progress / Review', count: apps.filter((a) => ['under_review', 'submitted', 'mca_filed'].includes(a.status)).length },
    { key: 'completed', label: 'Incorporated', count: apps.filter((a) => a.status === 'approved').length },
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
      key: 'company_name',
      label: 'Proposed Company Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val || row.company?.proposedName1 || 'PLC Incorporation'}</div>
          <div className="text-[11px] text-slate-500">Applicant: {row.applicant_name || row.applicant?.name}</div>
        </div>
      ),
    },
    {
      key: 'directors_count',
      label: 'Directors',
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          👥 {val || row.directors?.length || 2} Directors
        </span>
      ),
    },
    {
      key: 'authorized_capital',
      label: 'Auth Capital',
      render: (val, row) => (
        <span className="font-semibold text-slate-900">{val || row.company?.capital || '₹10,00,000'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Filing Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Link
          href={`/dashboard/plc/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">Private Limited Company (PLC) Incorporations</h2>
        <p className="text-xs text-slate-500">Manage MCA SPICe+ filings, RUN name approvals, Director DIN/DSC, and MOA/AOA submissions</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search company name, application ID, applicant..."
        onRowClick={(row) => router.push(`/dashboard/plc/${row.id || row.application_id}`)}
      />
    </div>
  );
}
