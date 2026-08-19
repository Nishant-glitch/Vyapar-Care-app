'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllUdyamApplications } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';

export default function UdyamListPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUdyamApplications();
        setApps(data);
      } catch (err) {
        console.error('Failed to load Udyam applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All MSME', count: apps.length },
    { key: 'review', label: 'Under Review', count: apps.filter((a) => ['under_review', 'submitted'].includes(a.status)).length },
    { key: 'completed', label: 'Certificate Issued', count: apps.filter((a) => ['certificate_generated', 'completed'].includes(a.status)).length },
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
      key: 'enterprise_name',
      label: 'Enterprise Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">
            {safeRender(val || row.business_details?.enterpriseName || 'Enterprise')}
          </div>
          <div className="text-[11px] text-slate-500">
            Applicant: {safeRender(row.applicant_name || row.aadhaar_details?.applicantName || '—')}
          </div>
        </div>
      ),
    },
    {
      key: 'msme_classification',
      label: 'Classification',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 text-xs font-bold">
          {safeRender(val, 'Micro Enterprise')}
        </span>
      ),
    },
    {
      key: 'udyam_registration_number',
      label: 'Udyam Registration No.',
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
          href={`/dashboard/udyam/${row.id || row.application_id}`}
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
        <h2 className="text-xl font-bold text-slate-900">MSME / Udyam Registration Applications</h2>
        <p className="text-xs text-slate-500">Manage MSME classification (Micro/Small/Medium), NIC 2008 4-digit/5-digit codes, and Udyam Certificate issuances</p>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search enterprise name, application ID, Udyam number..."
        onRowClick={(row) => router.push(`/dashboard/udyam/${row.id || row.application_id}`)}
      />
    </div>
  );
}
