'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllOrders } from '@/lib/adminDatabase';
import { formatCurrency, formatDate, safeRender } from '@/lib/utils';

export default function OrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'pending', label: 'Pending', count: orders.filter((o) => ['pending', 'payment_pending', 'documents_pending'].includes(o.status)).length },
    { key: 'processing', label: 'Processing', count: orders.filter((o) => ['processing', 'under_review', 'verification'].includes(o.status)).length },
    { key: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'completed').length },
  ];

  const columns = [
    {
      key: 'order_id',
      label: 'Order ID',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{safeRender(val || row.id)}</span>
      ),
    },
    {
      key: 'user_name',
      label: 'Customer Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{safeRender(val || row.applicant_name || 'Customer')}</div>
          <div className="text-[11px] text-slate-500">{safeRender(row.user_phone || row.customer_id || '—')}</div>
        </div>
      ),
    },
    {
      key: 'service_name',
      label: 'Service',
      render: (val, row) => <span className="font-medium text-slate-800">{safeRender(val || row.service_type || 'Service')}</span>,
    },
    {
      key: 'fee',
      label: 'Total Fee',
      render: (val) => <span className="font-semibold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: 'paid',
      label: 'Paid Amount',
      render: (val) => <span className="font-bold text-emerald-600">{formatCurrency(val)}</span>,
    },
    {
      key: 'remaining',
      label: 'Remaining',
      render: (val) => (
        <span className={val > 0 ? 'font-semibold text-amber-600' : 'text-slate-400'}>
          {formatCurrency(val)}
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
      label: 'Order Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Link
          href={`/dashboard/orders/${row.id || row.order_id}`}
          className="px-3 py-1.5 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          View ➔
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders & Service Bookings</h2>
          <p className="text-xs text-slate-500">Monitor all customer orders, fee schedules, and processing stages</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search order ID, customer name, service..."
        onRowClick={(row) => router.push(`/dashboard/orders/${row.id || row.order_id}`)}
      />
    </div>
  );
}
