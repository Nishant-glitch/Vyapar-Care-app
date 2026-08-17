'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { getAllUsers } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';

export default function UsersListPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    {
      key: 'customer_id',
      label: 'Customer ID',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{val || row.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Client / User Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val || 'Vyapar User'}</div>
          <div className="text-[11px] text-slate-500">{row.email || '—'}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (val) => <span className="font-semibold text-slate-800">{val || '—'}</span>,
    },
    {
      key: 'orders_count',
      label: 'Booked Services',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
          {val || 1} Applications
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Registration Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Link
          href={`/dashboard/users/${row.id || row.customer_id}`}
          className="px-3 py-1.5 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          View Profile ➔
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Users & Clients Directory</h2>
        <p className="text-xs text-slate-500">Manage registered client profiles, multi-service portfolios, and communication records</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search customer ID, name, mobile, email..."
        onRowClick={(row) => router.push(`/dashboard/users/${row.id || row.customer_id}`)}
      />
    </div>
  );
}
