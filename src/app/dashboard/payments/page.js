'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getAllPayments, getPaymentStats } from '@/lib/adminDatabase';
import { formatCurrency, formatDate, downloadCSV } from '@/lib/utils';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const [pData, sData] = await Promise.all([
          getAllPayments(),
          getPaymentStats(),
        ]);
        setPayments(pData);
        setStats(sData);
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All Transactions', count: payments.length },
    { key: 'success', label: 'Successful', count: payments.filter((p) => p.status === 'success').length },
    { key: 'pending', label: 'Pending', count: payments.filter((p) => p.status === 'pending').length },
    { key: 'failed', label: 'Failed', count: payments.filter((p) => p.status === 'failed').length },
  ];

  const handleExportCSV = () => {
    const exportRows = payments.map((p) => ({
      Transaction_ID: p.transaction_id,
      Customer_Name: p.user_name,
      Customer_ID: p.customer_id,
      Service: p.service_name,
      Amount: p.amount,
      Payment_Type: p.type,
      Method: p.method,
      Status: p.status,
      Date: formatDate(p.created_at),
    }));
    downloadCSV(exportRows, `VyaparCare_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const columns = [
    {
      key: 'transaction_id',
      label: 'Txn ID',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-[#1B2B5E]">{val}</span>
      ),
    },
    {
      key: 'user_name',
      label: 'Customer / Client',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.customer_id}</div>
        </div>
      ),
    },
    {
      key: 'service_name',
      label: 'Service',
      render: (val) => <span className="font-medium text-slate-800">{val}</span>,
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: 'type',
      label: 'Stage',
      render: (val) => (
        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Payment Mode',
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Collected (All Time)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B2B5E]">
            {formatCurrency(stats?.totalCollected || 0)}
          </div>
        </div>

        <div className="admin-card">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            This Month Collections
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            {formatCurrency(stats?.thisMonth || 0)}
          </div>
        </div>

        <div className="admin-card">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Pending Collections
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">
            {formatCurrency(stats?.pendingAmount || 0)}
          </div>
        </div>

        <div className="admin-card">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            Failed Transactions
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-800">
            {stats?.failedPayments || 0}
          </div>
        </div>
      </div>

      {/* Transactions DataTable */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Payment Transactions</h2>
            <p className="text-xs text-slate-500">Live payment reconciliations from UPI, Net Banking, and Cards</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          filterTabs={filterTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchPlaceholder="Search Txn ID, customer name, service..."
          actionButton={
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
            >
              📥 Export CSV
            </button>
          }
        />
      </div>
    </div>
  );
}
